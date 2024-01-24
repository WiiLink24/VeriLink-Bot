import Discord, { Client } from 'discord.js'
import Database from './Database.js'
import { Logger } from './Logger.js'
import fs from 'fs'

const config = JSON.parse(String(fs.readFileSync('./config/config.json')))

export default class VeriLinkClient extends Client {
  constructor (data) {
    super(data)
    if (config.database.enabled) this.db = new Database()
  }

  async load () {
    Logger.info('Loading VeriLinkClient')
    Logger.info('Initalizing commands')
    await this.rest.put(Discord.Routes.applicationCommands(this.user.id), { body: this.commands.all().map((command) => command.data) })
    Logger.info(`Commands loaded (${this.commands.all().length})`)
  }
}
