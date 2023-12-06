import { Client } from 'discord.js'
import Database from './Database.js'

export default class PartnyaClient extends Client {
  constructor (data) {
    super(data)
    this.polls = []
    this.db = new Database()
  }

  GetPoll (id, guildId) {
    return this.polls.filter(poll => poll.guild_id === guildId).find(poll => String(poll.id) === String(id))
  }
}
