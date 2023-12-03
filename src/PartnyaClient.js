const { Client } = require('discord.js')
const Database = require('./Database')

class PartnyaClient extends Client {
  constructor (data) {
    super(data)
    this.polls = []
    this.db = new Database()
    this.db.Connect()
  }
}

module.exports = PartnyaClient
