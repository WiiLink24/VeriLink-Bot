const { SlashCommandBuilder } = require('discord.js')
const { GetGuides } = require('../src/utils/GuideHelper')

function MakeCommands (builder) {
  GetGuides().forEach(command => {
    builder.addSubcommand(subCommand =>
      subCommand.setName(command.name)
        .setDescription(command.description))
  })

  return builder
}

module.exports = {
  data: MakeCommands(new SlashCommandBuilder()
    .setName('guide')
    .setDescription('Instruct the user on how to install Erupe.')
    .setDefaultMemberPermissions(0x2000)),
  async execute (interaction) {
    const command = GetGuides().find(command => command.name === interaction.options.getSubcommand())
    interaction.reply(command.response)
  }
}
