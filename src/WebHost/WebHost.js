import path from 'node:path'
import { Logger } from '../Logger.js'
import fs from 'node:fs'
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import DiscordUtils from './DiscordUtils.js'

const config = JSON.parse(String(fs.readFileSync(path.resolve('config/config.json'))))

export default class WebHost {
  constructor (client, app) {
    this.client = client
    this.app = app
    this.app.use(express.json())
    this.app.use(cors())

    this.filteredEmailDomains = fs.readFileSync(path.resolve('config/banneddomains.txt')).toString().split('\n')
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

      if (!(code || typeof (code) === 'string')) return res.status(402).send({ success: false, message: 'Request malformed.' })

      // Parameters for token request
      const params = new URLSearchParams()
      params.append('grant_type', 'authorization_code')
      params.append('code', code)
      params.append('redirect_uri', config.api.redirectUri)
      params.append('client_id', config.api.clientId)
      params.append('client_secret', config.api.clientSecret)

      const token = await axios.post('https://discord.com/api/oauth2/token', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

      if (token.data.error) res.status(403).send({ success: false, message: 'Token failed to authenticate.' })

      const user = await DiscordUtils.getUser(token.data.access_token)
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
      const valid = DiscordUtils.validate(user, this.filteredEmailDomains, ip)

      if (!valid) return res.status(403).send({ success: false, message: 'Token failed to authenticate.' })
      res.status(200).send({ success: true, token: token.data.access_token, data: user.data })
    })

    this.app.post('/api/captcha', async (req, res) => {
      const { token, auth } = req.body

      // Make sure the request is not malformed
      if (!(token || typeof (token) === 'string') || !(auth || typeof (auth) === 'string')) return res.status(402).send({ success: false, message: 'Request malformed.' })
      const user = await DiscordUtils.getUser(auth)

      // Make sure the Discord token is valid
      if (!user) return res.status(403).send({ success: false, message: 'Token failed to authenticate.' })

      const captchaRes = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${config.api.captchaSecret}&response=${token}`)

      if (!captchaRes.data.success) return res.status(403).send({ success: false, message: 'Captcha failed to authenticate.' })
      res.status(200).send({ success: true })
    })
  }
}
