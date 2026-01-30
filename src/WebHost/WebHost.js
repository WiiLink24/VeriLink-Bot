import path from 'node:path'
import { Logger } from '../Logger.js'
import fs from 'node:fs'
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import DiscordUtils from './DiscordUtils.js'
import { TextChannel } from 'discord.js'

const config = JSON.parse(String(fs.readFileSync(path.resolve('config/config.json'))))
const ip_mappings = JSON.parse(String(fs.readFileSync(path.resolve('config/ip_mapping.json'))))

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
    this.app.post('/api/token', async (req, res) => {
      const { code } = req.body
      console.log(req.headers)
      const ip = req.headers['cf-connecting-ip']
      if (!(code || typeof (code) === 'string')) return res.status(402).send({ success: false, message: 'Request malformed.' })

      const token = await DiscordUtils.convertAccessCode(code)
      if (typeof(token) != "string") {
        console.error(token)
        return res.status(403).send({ success: false, message: 'Token failed to authenticate.' })
      }

      const user = await DiscordUtils.getUser(token)
      const valid = await DiscordUtils.validate(user, ip)

      const channel = await this.client.channels.fetch('1199533703852994751')

      if (ip !== '::1') {
        const isVPN = await axios.get(`https://vpnapi.io/api/${ip}?key=${config.api.vpnKey}`)
        if (isVPN?.data?.security?.vpn) {
          channel.send(`${user.username} is most likely using a VPN. They will be restricted awaiting manual review.`)
          await (await this.client.guilds.cache.get(config.server_id).members.fetch(user.id)).roles.add("1407125507581153467")
        }
      }

      if (ip_mappings[ip] !== undefined && ip_mappings[ip].id !== user.id) {
        channel.send(`<@${user.id}> (${user.username})'s IP matches ${ip_mappings[ip].username} (${ip_mappings[ip].id}).`)

        const member = await this.client.guilds.cache.get(config.server_id).members.fetch(user.id)
        this.client.guilds.cache.get(config.server_id).bans.fetch(ip_mappings[ip].id)
          .then(() => { console.log("Banned"); member.roles.add("1344054695471218769") })
          .catch(() => { console.log("Alt account"); member.roles.add("288058293669330944") })
      }

      if (typeof(valid) === "string") {
        if (channel instanceof TextChannel) {
          Logger.info('Failed')
          await channel.send(valid)
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
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

      // Make sure the request is not malformed
      if (!(token || typeof (token) === 'string') || !(auth || typeof (auth) === 'string')) return res.status(402).send({ success: false, message: 'Request malformed.' })
      const user = await DiscordUtils.getUser(auth)

      // Make sure the Discord token is valid
      if (!user) return res.status(403).send({ success: false, message: 'Token failed to authenticate.' })
      console.log(`${user.username}: ${ip}`)

      if (ip_mappings[ip] === undefined) {
        ip_mappings[ip] = { username: user.username, id: user.id, ip, alts: [] }
      } else {
        if (ip_mappings[ip].alts === undefined) ip_mappings[ip].alts = []
        ip_mappings[ip].alts.push({ username: user.username, id: user.id })
      }
      fs.writeFileSync("config/ip_mapping.json", JSON.stringify(ip_mappings))

      const captchaRes = await axios.post(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, { secret: config.api.captchaSecret, response: token }, { headers: { "Content-Type": "application/json" } })
      if (!captchaRes.data.success) {
        const channel = await this.client.channels.fetch('1199533703852994751')
        if (channel instanceof TextChannel) {
          Logger.info('Failed')
          await channel.send(`${user.username} has failed validation due to failing the captcha.`)
        }
        res.status(403).send({ success: false, message: 'Captcha failed to authenticate.' })
        return
      }

      await (await this.client.guilds.cache.get(config.server_id).members.fetch(user.id)).roles.remove(config.role_id)
      res.status(200).send({ success: true })
    })
  }
}
