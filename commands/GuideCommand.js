import { SlashCommandBuilder } from 'discord.js'
import { GetGuides } from '../src/utils/GuideHelper.js'

function MakeCommands (builder) {
  GetGuides().forEach(command => {
    builder.addSubcommand(subCommand =>
      subCommand.setName(command.name)
        .setDescription(command.description))
  })

  return builder
}

const GuideCommand = {
  data: MakeCommands(new SlashCommandBuilder()
    .setName('guide')
    .setDescription('Instruct the user on how to install Erupe.')
    .setDefaultMemberPermissions(0x2000)),
  async execute (interaction) {
    const command = GetGuides().find(command => command.name === interaction.options.getSubcommand())
    interaction.reply(command.response)
  }
}

export default GuideCommand
