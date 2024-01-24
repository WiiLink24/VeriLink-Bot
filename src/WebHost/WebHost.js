import path from 'node:path'
import { Logger } from '../Logger.js'
import fs from 'node:fs'

const config = JSON.parse(String(fs.readFileSync(path.resolve('config/config.json'))))

export default class WebHost {
  constructor (client, app) {
    this.client = client
    this.app = app
  }

  async start () {
    // start the application on the hosting port
    this.app.listen(config.api.port, () => {
      Logger.info(`WebHost listening on port ${config.api.port}`)
      this.initializeEndpoints()
    })
  }

  initializeEndpoints () {
    // end points go here. Use proper REST API design
  }
}
