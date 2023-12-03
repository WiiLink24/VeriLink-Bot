const { Client } = require('pg')
const config = require('../config/config.json')

class Database {
  constructor () {
    this.session = null
  }

  async Connect () {
    this.session = new Client(config.database)
    this.session.connect()
    console.log('Database connected')
  }
}

module.exports = Database
