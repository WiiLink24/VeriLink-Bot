const { EmbedBuilder } = require('discord.js')

class Poll {
  client = null
  id = 0
  channel_id = ''
  message_id = ''
  title = ''
  options = []
  votes = []
  is_published = false
  is_closed = false
  allow_multiple = false

  constructor (client, data) {
    this.client = client
    Object.assign(this, data)
  }

  get channel () {
    return this.client.channels.cache.get(this.channel_id)
  }

  get message () {
    return this.channel.messages.cache.get(this.message_id)
  }

  Vote (member, option) {
    if (this.HasVote(member, option)) {
      return new Error('You have already voted for this poll.')
    }

    this.ApplyVote(member, option)
  }

  UpdateEmbed () {
    this.message.edit({ embeds: [this.Prepare()] })
  }

  Close () {
    this.is_closed = true
    this.UpdateEmbed()
    this.message.edit({ components: [] })
  }

  ApplyVote (member, option) {
    this.votes.push({ member, option })
  }

  HasVote (member, option) {
    return this.votes.find(vote => {
      if (!this.allow_multiple) {
        return vote.member === member
      } else {
        return vote.member === member && vote.option === option
      }
    })
  }

  GetVotes (option) {
    return this.votes.filter(vote => vote.option === option).length
  }

  Prepare () {
    const embed = new EmbedBuilder()
    embed.setTitle(this.title)
    this.options.forEach(option => embed.addFields({ name: option, value: `${this.GetVotes(option)} votes` }))
    embed.setTimestamp()

    if (this.is_closed) {
      embed.setTitle(`(Closed) ${this.title}`)
    }

    return embed.data
  }
}

module.exports = Poll
