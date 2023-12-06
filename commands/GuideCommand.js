const { SlashCommandBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const guidePath = path.resolve(__dirname, '../', 'guides')

let commands = []

function MakeCommand (builder) {
  commands.forEach(command => {
    builder.addSubcommand(subCommand =>
      subCommand.setName(command.name)
        .setDescription(command.description))
  })

  return builder
}

function MakeCommands () {
  commands = fs.readdirSync(guidePath).map(guide => JSON.parse(String(fs.readFileSync(path.resolve(guidePath, guide)))))
}

MakeCommands()

module.exports = {
  data: MakeCommand(new SlashCommandBuilder()
    .setName('guide')
    .setDescription('Instruct the user on how to install Erupe.')
    .setDefaultMemberPermissions(0x2000)),
  async execute (interaction) {
    const command = commands.find(command => command.name === interaction.options.getSubcommand())
    interaction.reply(command.response)
  }
}
