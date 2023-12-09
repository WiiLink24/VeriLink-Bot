import Discord from 'discord.js'
import PartnyaClient from './src/PartnyaClient.js'
import Poll from './src/Poll.js'
import { Logger } from './src/Logger.js'
import fs from 'node:fs'

const config = JSON.parse(String(fs.readFileSync('./config/config.json')))
const flags = process.argv.length > 2 ? process.argv[2] : ''
const client = new PartnyaClient({ intents: [Discord.IntentsBitField.Flags.Guilds] })

client.on(Discord.Events.ClientReady, async _ => {
  Logger.info(`Client logged in as user: ${client.user.tag}!`)

  // Load client data (Commands, Polls, etc)
  await client.load()
})

client.on(Discord.Events.InteractionCreate, async interaction => {
  let command
  if (interaction.isCommand()) {
    command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
      interaction.reply((await command.execute(interaction)).data)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  } else if (interaction.isAutocomplete()) {
    command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
      await command.autocomplete(interaction)
    } catch (error) {
      console.error(error)
    }
  } else if (interaction.isButton()) {
    const id = interaction.customId.split('_')
    switch (id[0]) {
      case 'vote':
        command = client.commands.get('poll')

        try {
          await command.button(interaction, id)
        } catch (error) {
          Logger.error(error)
        }
        break
    }
  }
})

await client.db.Connect()

if (flags === '-migrate') {
  Logger.info('Starting database migration...')
  // Import and migration the database
  await client.db.Migrate()

  process.exit() // Exit once migration is complete
} else {
  client.login(config.token)
}
