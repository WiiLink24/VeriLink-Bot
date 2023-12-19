import Poll from '../src/Poll.js'
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js'
import CommandResponse from '../src/CommandResponse.js'
import Vote from '../src/Vote.js'

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
            .setName('title')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('unpublish')
        .setDescription('Unpublish a poll and remove the embed.')
        .addStringOption(option =>
          option
            .setName('title')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a poll.')
        .addStringOption(option =>
          option
            .setName('title')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close a poll')
        .addStringOption(option =>
          option
            .setName('title')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('title')
        .setDescription('Change the title of a poll.')
        .addStringOption(option =>
          option
            .setName('title')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll'))
        .addStringOption(option =>
          option
            .setName('new-title')
            .setRequired(true)
            .setDescription('The new title of the poll')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('description')
        .setDescription('Change the description of a poll.')
        .addStringOption(option =>
          option
            .setName('title')
            .setAutocomplete(true)
            .setRequired(true)
            .setDescription('The title of the poll'))
        .addStringOption(option =>
          option
            .setName('description')
            .setRequired(true)
            .setDescription('The new description of the poll')))
    .addSubcommandGroup(subcommandGroup =>
      subcommandGroup.setName('options')
        .setDescription('Manage subcommand options')
        .addSubcommand(subcommand =>
          subcommand.setName('add')
            .setDescription('Add a poll option')
            .addStringOption(option =>
              option
                .setName('title')
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
                .setName('title')
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
                .setName('title')
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription('The poll to modify')))
    ),
  async execute (interaction) {
    const subcommand = interaction.options.getSubcommand()
    let poll = interaction.client.polls.get(interaction.options.getString('title'), interaction.guild.id)
    let actionRow, err
    // Decide what action to take based on the sub command
    switch (subcommand) {
      case 'create': // /poll create <title>
        if (poll) return new CommandResponse('There\'s already a poll with that name.')
        poll = new Poll(interaction.client, { title: interaction.options.getString('title'), guild_id: interaction.guild.id })
        interaction.client.polls.add(poll)

        poll.save()
        return new CommandResponse('Your poll has been created. It will not be shown until you publish it.')
      case 'close': // /poll close <title>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        // prefetch messages for deletion, this is specifically an issue since the cache doesn't persist restarts.
        await poll.channel.messages.fetch(poll.message_id)
        interaction.client.polls.remove(poll.title)

        poll.remove()
        poll.update()
        return new CommandResponse('The poll has been closed.')
      case 'publish': // /poll publish <title>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        if (poll.is_published) return new CommandResponse('That poll is already published!')
        if (poll.options.all().length === 0) return new CommandResponse('You cannot publish an empty poll.')
        actionRow = new ActionRowBuilder().addComponents(poll.options.all().map(option => new ButtonBuilder().setCustomId(`poll_${option}`).setLabel(option).setStyle(1)))
        poll.message_id = (await interaction.channel.send({ embeds: [poll.embed], components: [actionRow] })).id
        poll.channel_id = interaction.channel.id
        poll.is_published = true

        poll.save()
        return new CommandResponse('Your poll has been published!')
      case 'unpublish': // /poll publish <title>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        // polls which haven't been published shouldn't be unpublished.
        if (!poll.is_published) return new CommandResponse('That poll has not yet been published!')
        // prefetch messages for deletion, this is specifically an issue since the cache doesn't persist restarts.
        await poll.channel.messages.fetch(poll.message_id)
        poll.message.delete()
        poll.message_id = ''
        poll.channel_id = ''
        poll.is_published = false

        poll.save()
        return new CommandResponse('Your poll has been unpublished, and the embed removed.')
      case 'delete': // /poll publish <title>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        interaction.client.polls.remove(poll.title)

        poll.remove()
        return new CommandResponse('Your poll has been deleted.')
      case 'add': // /poll option add <title> <option>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        // if an error occurs whilst adding an option, list the error.
        if ((err = poll.options.add(interaction.options.getString('option'))) !== undefined) return new CommandResponse(err.message)

        poll.save()
        return new CommandResponse(`Poll option \`${interaction.options.getString('option')}\` has been added to the poll.`)
      case 'remove': // /poll option remove <title> <option>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        // if an error occurs whilst adding an option, list the error.
        if ((err = poll.options.remove(interaction.options.getString('option'))) !== undefined) return new CommandResponse(err.message)

        poll.save()
        return new CommandResponse(`Poll option \`${interaction.options.getString('option')}\` has been removed from the poll.`)
      case 'multiple': // /poll option multiple <poll>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        // toggle the allow_multiple flag between true and false
        poll.allow_multiple = !poll.allow_multiple

        poll.save()
        return new CommandResponse(poll.allow_multiple ? 'Users can now submit multiple responses to this poll.' : 'Users can now only submit one response to this poll.')
      case 'title': // /poll title <title> <new-title>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        poll.title = interaction.options.getString('new-title')

        poll.save()
        return new CommandResponse(`The title of the poll has been changed to \`${interaction.options.getString('new-title')}\`.`)
      case 'description': // /poll description <title> <description>
        if (!poll) return new CommandResponse('No poll with that name exists.')
        poll.description = interaction.options.getString('description')

        poll.save()
        return new CommandResponse(`The description of the poll has been changed to \`${interaction.options.getString('description')}\`.`)
    }
  },
  async autocomplete (interaction) {
    const subcommand = interaction.options.getSubcommand()
    const focused = interaction.options.getFocused(true)
    let poll

    switch (subcommand) {
      case 'remove':
        if (focused.name === 'option') {
          poll = interaction.client.polls.get(interaction.options.getString('title'), interaction.guild.id)
          if (!poll) return interaction.respond([])
          await interaction.respond(poll.options.all().map(option => ({ name: option, value: option })))
        } else if (focused.name === 'title') {
          await interaction.respond(interaction.client.polls.unpublished(interaction.guild.id).map(poll => ({ name: poll.title, value: String(poll.id) })))
        }
        break
      case 'close':
      case 'unpublish':
        await interaction.respond(interaction.client.polls.published(interaction.guild.id).map(poll => ({ name: poll.title, value: String(poll.id) })))
        break
      case 'delete':
      case 'add':
      case 'multiple':
      case 'publish':
      case 'title':
      case 'description':
        await interaction.respond(interaction.client.polls.unpublished(interaction.guild.id).map(poll => ({ name: poll.title, value: String(poll.id) })))
        break
    }
  },
  async button (interaction, id) {
    const poll = interaction.client.polls.get(interaction.message.id, interaction.guild.id)
    const vote = new Vote(interaction.member.id, id[1])

    if (poll.votes.has(vote)) {
      poll.votes.remove(vote)
      poll.save()
      poll.update()
      return new CommandResponse(`You have removed your poll response from \`${id[1]}\`.`)
    }
    poll.votes.add(vote)

    poll.save()
    poll.update()
    return new CommandResponse(`You have answered \`${id[1]}\` to the poll!`)
  }
}

export default PollCommand
