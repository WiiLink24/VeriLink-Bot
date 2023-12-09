import Discord, { Client } from 'discord.js'
import Database from './Database.js'
import CommandManager from './CommandManager.js'
import PollManager from './PollManager.js'

export default class PartnyaClient extends Client {
  constructor (data) {
    super(data)
    this.db = new Database()
    this.polls = new PollManager(this)
    this.commands = new CommandManager(this)
  }

  async load () {
    await this.rest.put(Discord.Routes.applicationCommands(this.user.id), { body: this.commands.all().map((command) => command.data) })
  }

  GetPoll (id, guildId) {
    return this.polls.filter(poll => poll.guild_id === guildId).find(poll => String(poll.id) === String(id))
  }
}
