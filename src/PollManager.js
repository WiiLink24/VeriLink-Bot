export default class PollManager {
  constructor (client) {
    this.client = client
    this._polls = []
  }

  add (poll) {
    this._polls.push(poll)
  }

  all (guild) {
    return this._polls.filter(poll => poll.guild_id === guild)
  }

  /**
   * Get a poll from the collection based on an identifier (title/id) and guildID
   * @param identifier title/id
   * @param guild guildId
   * @returns {*}
   */
  get (identifier, guild) {
    return this.all(guild).find(poll => poll.title === identifier || poll.id === identifier || poll.message_id === identifier)
  }

  /**
   * Get all the published polls within the guild.
   * @param guild
   * @returns {*}
   */
  published (guild) {
    return this.all(guild).filter(poll => poll.is_published)
  }

  /**
   * Get all the unpublished polls within the guild
   * @param guild
   * @returns {*}
   */
  unpublished (guild) {
    return this.all(guild).filter(poll => !poll.is_published)
  }

  /**
   * Remove an identifier (title/id) from the polls
   * @param identifier
   */
  remove (identifier) {
    this._polls.splice(this._polls.findIndex(poll => poll.title === identifier || poll.id === identifier), 1)
  }
}
