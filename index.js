import Discord, { TextChannel } from 'discord.js'
import VeriLinkClient from './src/VeriLinkClient.js'
import { Logger } from './src/Logger.js'
import fs from 'node:fs'
import express from 'express'
import WebHost from './src/WebHost/WebHost.js'

const config = JSON.parse(String(fs.readFileSync('./config/config.json')))
const flags = process.argv.length > 2 ? process.argv[2] : ''
const client = new VeriLinkClient({ intents: ['Guilds', 'GuildMembers'] })
const app = express()
const webHost = new WebHost(client, app)

client.on(Discord.Events.ClientReady, async _ => {
  // Load client data
  await client.load()
  Logger.info(`Client logged in as user: ${client.user.tag}!`)
})

client.on(Discord.Events.GuildMemberAdd, async member => {
  Logger.info('Member joined the server')
  await member.roles.add(config.role_id)
})

if (flags === '-migrate') {
  Logger.info('Starting database migration...')
  // Import and migration the database
  await client.db.Migrate()
  Logger.info('Database migration has completed.')
  process.exit() // Exit once migration is complete
} else {
  if (config.token) await client.login(config.token)
  await webHost.start()
}
