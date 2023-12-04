const { Client } = require('discord.js')
const Database = require('./Database')

class PartnyaClient extends Client {
  constructor (data) {
    super(data)
    this.polls = []
    this.db = new Database()
    this.db.Connect()
  }

  GetPoll (id, guildId) {
    return this.polls.filter(poll => poll.guild_id === guildId).find(poll => String(poll.id) === String(id))
  }
}

module.exports = PartnyaClient
