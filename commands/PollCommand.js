const Poll = require('../src/Poll')
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a new poll.')
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
    let poll
    let actionRow
    switch (subcommand) {
      case 'create':
        poll = new Poll(interaction.client, {})
        poll.title = interaction.options.getString('title')
        interaction.client.polls.push(poll)
        interaction.reply({
          content: 'Your poll has been created. It will not be shown until you publish it.',
          ephemeral: true
        })
        break
      case 'close':
        poll = interaction.client.polls.find(p => p.title === interaction.options.getString('poll'))
        poll.Close()
        interaction.reply({
          content: 'The poll has been closed.',
          ephemeral: true
        })
        break
      case 'publish':
        poll = interaction.client.polls.find(p => p.title === interaction.options.getString('poll'))

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

        interaction.reply({
          content: 'Your poll has been published. It can now be interacted with.',
          ephemeral: true
        })
        break
      case 'add':
        poll = interaction.client.polls.find(p => p.title === interaction.options.getString('poll'))
        poll.options.push(interaction.options.getString('option'))
        interaction.reply({
          content: `Poll option \`${interaction.options.getString('option')}\` has been added to the poll.`,
          ephemeral: true
        })
        break
      case 'remove':
        poll = interaction.client.polls.find(p => p.title === interaction.options.getString('poll'))
        poll.options.splice(poll.options.findIndex(option => option === interaction.options.getString('option')), 1)
        interaction.reply({
          content: `Poll option \`${interaction.options.getString('option')}\` has been removed from the poll.`,
          ephemeral: true
        })
        break
      case 'multiple':
        poll = interaction.client.polls.find(p => p.title === interaction.options.getString('poll'))
        poll.allow_multiple = !poll.allow_multiple

        if (poll.allow_multiple) {
          interaction.reply({
            content: 'Users can submit multiple responses.',
            ephemeral: true
          })
        } else {
          interaction.reply({
            content: 'Users can only submit one responses.',
            ephemeral: true
          })
        }
        break
    }
  },
  async autocomplete (interaction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case 'add':
      case 'close':
      case 'remove':
      case 'multiple':
      case 'publish':
        await interaction.respond(interaction.client.polls.map(poll => ({ name: poll.title, value: poll.title })))
        break
    }
  }
}
