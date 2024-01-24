import Discord, { Client } from 'discord.js'
import Database from './Database.js'
import Poll from './Poll.js'
import { Logger } from './Logger.js'

export default class PartnyaClient extends Client {
  constructor (data) {
    super(data)
    this.db = new Database()
  }

  async load () {
    Logger.info('Loading PartnyaClient')
    Logger.info('Initalizing commands')
    await this.rest.put(Discord.Routes.applicationCommands(this.user.id), { body: this.commands.all().map((command) => command.data) })
    Logger.info(`Commands loaded (${this.commands.all().length})`)
  }
}
