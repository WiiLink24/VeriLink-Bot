import pg from 'pg'
import path from 'node:path'
import fs from 'node:fs'
import { Logger } from './Logger.js'

const config = fs.existsSync('./config/config.json') ? JSON.parse(String(fs.readFileSync('./config/config.json'))) : null
const { Client } = pg
const migrations = path.resolve('migrations')

export default class Database {
  constructor () {
    this.session = null
  }

  async migrate () {
    const migrationFiles = fs.readdirSync(migrations)

    for (const migration of migrationFiles) {
      Logger.debug(`Applying: ${migration}`)
      const sql = String(fs.readFileSync(path.resolve(migrations, migration)))
      await this.session.query(sql)
    }
  }

  async connect () {
    this.session = new Client(config.database)
    Logger.info('Database connection begun.')
    await this.session.connect()
    Logger.info('Successfully connected to database.')
  }
}
