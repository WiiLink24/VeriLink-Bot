import path from 'node:path'
import { Logger } from '../Logger.js'
import fs from 'node:fs'
import express from 'express'
import axios from 'axios'
import cors from 'cors'

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
    this.app.post('/api/token', async (req, res) => {
      const token = req.body.code

      // Parameters for token request
      const params = new URLSearchParams()
      params.append('grant_type', 'authorization_code')
      params.append('code', token)
      params.append('redirect_uri', config.api.redirectUri)
      params.append('client_id', config.api.clientId)
      params.append('client_secret', config.api.clientSecret)

      const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

      if (tokenResponse.data.error) res.status(403).send({ success: false, message: 'Token failed to authenticate.' })

      const userResponse = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } })

      res.status(200).send({ success: true, token: tokenResponse.data.access_token, data: userResponse.data })
    })

    this.app.post('/api/captcha', async (req, res) => {
      const token = req.body.token
      const captchaRes = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${config.api.captchaSecret}&response=${token}`)

      if (!captchaRes.data.success) res.status(403).send({ success: false, message: 'Captcha failed to authenticate.' })
      res.status(200).send({ success: true })
    })
  }
}
