const Discord = require('discord.js')
const config = require('./config/config.json')
const InstallCommand = require('./commands/InstallCommand')

const client = new Discord.Client({ intents: [Discord.IntentsBitField.Flags.Guilds] })
const rest = new Discord.REST({ version: '9' }).setToken(config.token)

const GLOBAL_COMMANDS = [
  new InstallCommand()
]

client.on(Discord.Events.ClientReady, _ => {
  console.log(`Logged in as ${client.user.tag}!`)
  rest.put(Discord.Routes.applicationCommands(client.user.id), { body: GLOBAL_COMMANDS })
})

client.on(Discord.Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return

  const command = GLOBAL_COMMANDS.find(command => command.name === interaction.commandName)
  if (!command) return

  try {
    await command.onRun(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

client.login(config.token)
