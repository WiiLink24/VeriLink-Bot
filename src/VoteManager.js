export default class VoteManager {
  constructor (poll, votes) {
    this._poll = poll
    this._votes = votes
  }

  serialize () {
    return this._votes
  }

  /**
   * Return the total number of votes for this poll.
   * @returns {*}
   */
  all () {
    return this._votes.length
  }

  /**
   * Count the total number of votes for an option.
   * This returns an array of votes.
   * @param option
   * @returns {Vote[]}
   */
  total (option) {
    return this._votes.filter(v => v.option === option).length
  }

  /**
   * Insert a new vote for this poll by a user.
   * @param vote
   * @returns {Error|void}
   */
  add (vote) {
    if (this.hasAny(vote) && !this._poll.allow_multiple) return this.replace(vote)
    this._votes.push(vote)
  }

  /**
   * Remove an exact vote from a user in the poll.
   * @param vote
   * @returns {Error}
   */
  remove (vote) {
    if (!this.has(vote)) return new Error('There is no vote with this option.')
    this._votes.splice(this._votes.findIndex(v => v.member === vote.member && v.option === vote.option), 1)
  }

  /**
   * Check if the exact vote already exists by this user in the poll.
   * @param vote
   * @returns {boolean}
   */
  has (vote) {
    return this._votes.find(v => v.member === vote.member && v.option === vote.option) != null
  }

  /**
   * Check if the user in the vote object has any kind of vote in this poll
   * @param vote
   * @returns {boolean}
   */
  hasAny (vote) {
    return this._votes.find(v => v.member === vote.member) != null
  }

  /**
   * Replace the vote of the user specified in the vote with the new option
   * Ex. { member: 123, option: hi } -> { member: 123, option: bye }
   * @param vote
   */
  replace (vote) {
    this._votes.find(v => v.member === vote.member).option = vote.option
  }
}
