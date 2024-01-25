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
    this.app.post('/api/captcha', async (req, res, next) => {
      const token = req.body.token
      const captchaRes = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${config.api.captchaSecret}&response=${token}`)

      if (!captchaRes.data.success) res.status(403).send({ success: false, message: 'Captcha failed to authenticate.' })
      res.status(200).send({ success: true })
    })
  }
}
