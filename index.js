import Discord from 'discord.js'
import VeriLinkClient from './src/VeriLinkClient.js'
import { Logger } from './src/Logger.js'
import fs from 'node:fs'
import express from 'express'

const config = JSON.parse(String(fs.readFileSync('./config/config.json')))
const flags = process.argv.length > 2 ? process.argv[2] : ''
const client = new VeriLinkClient({ intents: [Discord.IntentsBitField.Flags.Guilds] })
const app = express()

client.on(Discord.Events.ClientReady, async _ => {
  // Load client data
  await client.load()
  Logger.info(`Client logged in as user: ${client.user.tag}!`)
})

client.on(Discord.Events.InteractionCreate, async interaction => {
  let command
  if (interaction.isCommand()) { // Handle slash commands
    command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
      interaction.reply((await command.execute(interaction)).data)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  } else if (interaction.isAutocomplete()) { // Handles responses for command auto completes
    command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
      await command.autocomplete(interaction)
    } catch (error) {
      console.error(error)
    }
  } else if (interaction.isButton()) { // Handles button input and forwards it to a command based on prefix
    // Since buttons don't know about commands, we can use a name identifer
    const id = interaction.customId.split('_')
    command = client.commands.get(id[0])
    try {
      await interaction.reply((await command.button(interaction, id)).data)
    } catch (error) {
      Logger.error(error)
    }
  }
})

if (client.db && config.database.enabled) await client.db.Connect()

if (flags === '-migrate') {
  Logger.info('Starting database migration...')
  // Import and migration the database
  await client.db.Migrate()
  Logger.info('Database migration has completed.')
  process.exit() // Exit once migration is complete
} else {
  // await client.login(config.token)
  app.listen(config.api.port, () => {
    Logger.info(`REST API listening on port ${config.api.port}`);
  })
}
