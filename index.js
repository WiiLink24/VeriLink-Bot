const Discord = require('discord.js')
const PartnyaClient = require('./src/PartnyaClient.js')
const config = require('./config/config.json')
const flags = process.argv.length > 2 ? process.argv[2] : ''

const InstallCommand = require('./commands/InstallCommand')
const St000Command = require('./commands/St000')
const PollCommand = require('./commands/PollCommand')
const Poll = require('./src/Poll')

const client = new PartnyaClient({ intents: [Discord.IntentsBitField.Flags.Guilds] })
const rest = new Discord.REST({ version: '9' }).setToken(config.token)

const GLOBAL_COMMANDS = [
  InstallCommand,
  St000Command,
  PollCommand
]

client.on(Discord.Events.ClientReady, async _ => {
  console.log(`Logged in as ${client.user.tag}!`)
  if (flags === '-migrate') {
    console.log('Migrating database.')
    await client.db.Migrate()
  }

  await rest.put(Discord.Routes.applicationGuildCommands(client.user.id, "606926504424767488"), { body: GLOBAL_COMMANDS.map((command) => command.data) })
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

client.login(config.token)
