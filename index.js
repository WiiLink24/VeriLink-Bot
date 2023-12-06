import Discord from 'discord.js'
import PartnyaClient from './src/PartnyaClient.js'
import InstallCommand from './commands/GuideCommand.js'
import PollCommand from './commands/PollCommand.js'
import Poll from './src/Poll.js'
import { Logger } from './src/Logger.js'
import fs from 'node:fs'

const config = JSON.parse(String(fs.readFileSync('./config/config.json')))
const flags = process.argv.length > 2 ? process.argv[2] : ''

const client = new PartnyaClient({ intents: [Discord.IntentsBitField.Flags.Guilds] })
const rest = new Discord.REST({ version: '9' }).setToken(config.token)

const GLOBAL_COMMANDS = [
  InstallCommand,
  PollCommand
]

client.on(Discord.Events.ClientReady, async _ => {
  Logger.info(`Client logged in as user: ${client.user.tag}!`)

  await rest.put(Discord.Routes.applicationCommands(client.user.id), { body: GLOBAL_COMMANDS.map((command) => command.data) })
  const polls = (await client.db.session.query('SELECT * FROM polls')).rows
  client.polls = polls.map(poll => new Poll(client, poll))
})

client.on(Discord.Events.InteractionCreate, async interaction => {
  if (interaction.isCommand()) {
    const command = GLOBAL_COMMANDS.find(command => command.data.name === interaction.commandName)
    if (!command) return

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  } else if (interaction.isAutocomplete()) {
    const command = GLOBAL_COMMANDS.find(command => command.data.name === interaction.commandName)
    if (!command) return

    try {
      await command.autocomplete(interaction)
    } catch (error) {
      console.error(error)
    }
  } else if (interaction.isButton()) {
    const type = interaction.customId.split('_')
    let poll, err
    switch (type[0]) {
      case 'vote':
        poll = interaction.client.polls.find(poll => poll.message_id === interaction.message.id)
        err = poll.Vote(interaction.member.id, type[1])
        if (err) {
          interaction.reply({ content: err.message, ephemeral: true })
          return
        }
        poll.UpdateEmbed()
        interaction.reply({ content: `You have answered \`${type[1]}\` to the poll!`, ephemeral: true })
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
