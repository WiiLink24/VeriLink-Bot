const { Client } = require('discord.js')

class PartnyaClient extends Client {
  constructor (data) {
    super(data)
    this.polls = []
  }
}

module.exports = PartnyaClient
