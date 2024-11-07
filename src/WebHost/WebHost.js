import path from 'node:path'
import { Logger } from '../Logger.js'
import fs from 'node:fs'
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import DiscordUtils from './DiscordUtils.js'
import { TextChannel } from 'discord.js'

const config = JSON.parse(String(fs.readFileSync(path.resolve('config/config.json'))))

export default class WebHost {
  constructor (client, app) {
    this.client = client
    this.app = app
    this.app.use(express.json())
    this.app.use(cors())
  }

  async start () {
    // start the application on the hosting port
    this.app.listen(config.api.port, () => {
      Logger.info(`WebHost listening on port ${config.api.port}`)
      this.initializeEndpoints()
    })
  }

  initializeEndpoints () {
    // TODO; Refactor this to a more unit testable format
    this.app.post('/api/token', async (req, res) => {
      const { code } = req.body
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
      if (!(code || typeof (code) === 'string')) return res.status(402).send({ success: false, message: 'Request malformed.' })

      const token = await DiscordUtils.convertAccessCode(code)
      if (!token) return res.status(403).send({ success: false, message: 'Token failed to authenticate.' })

      const user = await DiscordUtils.getUser(token)
      const valid = await DiscordUtils.validate(user, ip)

      const channel = await this.client.channels.fetch('1199533703852994751')

      if (!valid) {
        if (channel instanceof TextChannel) {
          Logger.info('Failed')
          await channel.send(`${user.username} has failed validation due to having a VPN.`)
        }

        return res.status(403).send({
          success: false,
          message: 'You are not allowed to access this service.'
        })
      }
      res.status(200).send({ success: true, token, data: user })
    })

    this.app.post('/api/captcha', async (req, res) => {
      const { token, auth } = req.body

      // Make sure the request is not malformed
      if (!(token || typeof (token) === 'string') || !(auth || typeof (auth) === 'string')) return res.status(402).send({ success: false, message: 'Request malformed.' })
      const user = await DiscordUtils.getUser(auth)

      // Make sure the Discord token is valid
      if (!user) return res.status(403).send({ success: false, message: 'Token failed to authenticate.' })

      const captchaRes = await axios.get(`https://api.hcaptcha.com/siteverify?secret=${config.api.captchaSecret}&response=${token}`)

      if (!captchaRes.data.success) {
        const channel = await this.client.channels.fetch('1199533703852994751')
        if (channel instanceof TextChannel) {
          Logger.info('Failed')
          await channel.send(`${user.username} has failed validation due to failing the captcha.`)
        }

        return res.status(403).send({ success: false, message: 'Captcha failed to authenticate.' })
      }

      await (await this.client.guilds.cache.get(config.server_id).members.fetch(user.id)).roles.remove(config.role_id)
      res.status(200).send({ success: true })
    })
  }
}
