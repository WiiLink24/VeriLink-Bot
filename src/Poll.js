import { EmbedBuilder } from 'discord.js'
import PollOptions from './PollOptions.js'
import VoteManager from './VoteManager.js'

export default class Poll {
  client = null
  id = new Date().getTime()
  guild_id = ''
  channel_id = ''
  message_id = ''
  title = ''
  options = new PollOptions([])
  votes = new VoteManager(this, [])
  is_published = false
  is_closed = false
  allow_multiple = false

  constructor (client, data) {
    this.client = client
    data.options = new PollOptions(Array.isArray(data.options) ? data.options : [])
    data.votes = new VoteManager(this, Array.isArray(data.votes) ? data.votes : [])
    Object.assign(this, data)
  }

  get guild () {
    return this.client.guilds.cache.get(this.guild_id)
  }

  get channel () {
    return this.client.channels.cache.get(this.channel_id)
  }

  get message () {
    return this.channel.messages.cache.get(this.message_id)
  }

  get embed () {
    const embed = new EmbedBuilder()
    embed.setTitle(this.title)
    embed.addFields(this.options.all().map(option => ({ name: option, value: `${this.votes.total(option)} ${this.votes.total(option) === 1 ? 'vote' : 'votes'}` })))
    embed.setTimestamp()

    // Change the title to show closed if the poll is closed
    if (this.is_closed) embed.setTitle(`(Closed) ${this.title}`)

    return embed.data
  }

  update () {
    this.message.edit(Object.assign({ embeds: [this.embed] }, { components: !this.is_closed ? this.message.components : [] }))
  }

  close () {
    this.is_closed = true
  }

  /// Database tasks
  /**
   * Save the entire poll object in its current state to the database.
   */
  save () {
    this.client.db.session.query('INSERT INTO polls ("id", "guild_id", "channel_id", "message_id", "title", "options", "votes", "is_published", "is_closed", "allow_multiple") VALUES ($1, $2, $3, $4, $5, $6::text[], $7::json, $8, $9, $10) ON CONFLICT (id) DO UPDATE SET options = excluded.options, channel_id = excluded.channel_id, message_id = excluded.message_id, votes = excluded.votes, is_published = excluded.is_published, is_closed = excluded.is_closed, allow_multiple = excluded.allow_multiple', [this.id, this.guild_id, this.channel_id, this.message_id, this.title, this.options, JSON.stringify(this.votes), this.is_published, this.is_closed, this.allow_multiple])
  }

  /**
   * Remove the object from the database and close the poll.
   */
  remove () {
    this.close()
    this.client.db.session.query('DELETE FROM polls WHERE id = $1', [this.id])
  }
}
