const { Client } = require('pg')
const path = require('node:path')
const fs = require('node:fs')
const config = require('../config/config.json')
const migrations = path.resolve(__dirname, '../', 'migrations')

class Database {
  constructor () {
    this.session = null
  }

  async Migrate () {
    const migrationFiles = fs.readdirSync(migrations).map(migration => String(fs.readFileSync(path.resolve(migrations, migration))))

    for (const migration of migrationFiles) {
      this.session.query(migration)
    }
  }

  async Connect () {
    this.session = new Client(config.database)
    this.session.connect()
    console.log('Database connected')
  }
}

module.exports = Database
