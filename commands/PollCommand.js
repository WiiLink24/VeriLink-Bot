import Poll from '../src/Poll.js'
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js'

const PollCommand = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a new poll.')
    .setDefaultMemberPermissions(0x2000)
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new poll')
        .addStringOption(option =>
          option.setName('title')
            .setRequired(true)
            .setDescription('The title of the poll')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('publish')
        .setDescription('Publish a poll')
        .addStringOption(option =>
          option
            .setName('poll')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('unpublish')
        .setDescription('Unpublish a poll and remove the embed.')
        .addStringOption(option =>
          option
            .setName('poll')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close a poll')
        .addStringOption(option =>
          option
            .setName('poll')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll')))
    .addSubcommandGroup(subcommandGroup =>
      subcommandGroup.setName('options')
        .setDescription('Manage subcommand options')
        .addSubcommand(subcommand =>
          subcommand.setName('add')
            .setDescription('Add a poll option')
            .addStringOption(option =>
              option
                .setName('poll')
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription('The poll to modify'))
            .addStringOption(option =>
              option
                .setName('option')
                .setRequired(true)
                .setDescription('The new option')))
        .addSubcommand(subcommand =>
          subcommand.setName('remove')
            .setDescription('Remove a poll option')
            .addStringOption(option =>
              option
                .setName('poll')
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription('The poll to modify'))
            .addStringOption(option =>
              option
                .setName('option')
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription('The option to remove')))
        .addSubcommand(subcommand =>
          subcommand.setName('multiple')
            .setDescription('Allow for multiple choices to be selected.')
            .addStringOption(option =>
              option
                .setName('poll')
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription('The poll to modify')))
    ),
  async execute (interaction) {
    const subcommand = interaction.options.getSubcommand()
    let poll, actionRow
    switch (subcommand) {
      case 'create': // /poll create <title>
        if (interaction.client.polls.find(p => p.guild_id === interaction.guild.id && p.title === interaction.options.getString('title'))) {
          interaction.reply({
            content: 'There\'s already a poll with this name.',
            ephemeral: true
          })
          return
        }
        poll = new Poll(interaction.client, { guild_id: interaction.channel.guild.id })
        poll.guild_id = interaction.guild.id
        poll.title = interaction.options.getString('title')
        poll.Save()
        interaction.client.polls.push(poll)
        interaction.reply({
          content: 'Your poll has been created. It will not be shown until you publish it.',
          ephemeral: true
        })
        break
      case 'close': // /poll close <poll>
        poll = interaction.client.GetPoll(interaction.options.getString('poll'), interaction.guild.id)
        if (!poll) {
          interaction.reply({
            content: 'No poll with that name exists.',
            ephemeral: true
          })
          return
        }
        poll.Close()
        poll.Remove()
        interaction.client.polls.splice(interaction.client.polls.indexOf(poll), 1)
        interaction.reply({
          content: 'The poll has been closed.',
          ephemeral: true
        })
        break
      case 'publish': // /poll publish <poll>
        poll = interaction.client.GetPoll(interaction.options.getString('poll'), interaction.guild.id)
        if (!poll) {
          interaction.reply({
            content: 'No poll with that name exists.',
            ephemeral: true
          })
          return
        }
        actionRow = new ActionRowBuilder()
          .addComponents(poll.options.map(option =>
            new ButtonBuilder()
              .setCustomId(`vote_${option}`)
              .setLabel(option)
              .setStyle(1)
          ))

        poll.message_id = (await interaction.channel.send({ embeds: [poll.Prepare()], components: [actionRow] })).id
        poll.channel_id = interaction.channel.id
        poll.is_published = true
        poll.Save()
        interaction.reply({
          content: 'Your poll has been published. It can now be interacted with.',
          ephemeral: true
        })
        break
      case 'unpublish': // /poll publish <poll>
        poll = interaction.client.polls.find(p => p.title === interaction.options.getString('poll'))
        poll.message.delete()
        poll.is_published = false
        poll.message_id = ''
        poll.channel_id = ''
        poll.Save()
        interaction.reply({
          content: 'This poll has been unpublished and the embed removed.',
          ephemeral: true
        })
        break
      case 'add': // /poll option add <poll> <option>
        poll = interaction.client.GetPoll(interaction.options.getString('poll'), interaction.guild.id)
        if (!poll) {
          interaction.reply({
            content: 'No poll with that name exists.',
            ephemeral: true
          })
          return
        }
        poll.AddOption(interaction.options.getString('option'))
        interaction.reply({
          content: `Poll option \`${interaction.options.getString('option')}\` has been added to the poll.`,
          ephemeral: true
        })
        break
      case 'remove': // /poll option remove <poll> <option>
        poll = interaction.client.GetPoll(interaction.options.getString('poll'), interaction.guild.id)
        if (!poll) {
          interaction.reply({
            content: 'No poll with that name exists.',
            ephemeral: true
          })
          return
        }
        poll.RemoveOption(interaction.options.getString('option'))
        interaction.reply({
          content: `Poll option \`${interaction.options.getString('option')}\` has been removed from the poll.`,
          ephemeral: true
        })
        break
      case 'multiple': // /poll option multiple <poll>
        poll = interaction.client.GetPoll(interaction.options.getString('poll'), interaction.guild.id)
        if (!poll) {
          interaction.reply({
            content: 'No poll with that name exists.',
            ephemeral: true
          })
          return
        }
        poll.allow_multiple = !poll.allow_multiple
        interaction.reply({
          content: poll.allow_multiple ? 'Users can submit multiple responses.' : 'Users can only submit one responses.',
          ephemeral: true
        })
        break
    }
  },
  async autocomplete (interaction) {
    const subcommand = interaction.options.getSubcommand()
    const focused = interaction.options.getFocused(true)
    let poll

    switch (subcommand) {
      case 'remove':
        if (focused.name === 'option') {
          poll = interaction.client.GetPoll(interaction.options.getString('poll'), interaction.guild.id)
          await interaction.respond(poll.options.map(option => ({ name: option, value: option })))
        } else if (focused.name === 'poll') {
          await interaction.respond(interaction.client.polls.filter(poll => poll.guild_id === interaction.guild.id && !poll.is_published).map(poll => ({ name: poll.title, value: String(poll.id) })))
        }
        break
      case 'close':
        await interaction.respond(interaction.client.polls.filter(poll => poll.guild_id === interaction.guild.id && poll.is_published).map(poll => ({ name: poll.title, value: String(poll.id) })))
        break
      case 'add':
      case 'multiple':
      case 'publish':
        await interaction.respond(interaction.client.polls.filter(poll => poll.guild_id === interaction.guild.id && !poll.is_published).map(poll => ({ name: poll.title, value: String(poll.id) })))
        break
    }
  }
}

export default PollCommand
