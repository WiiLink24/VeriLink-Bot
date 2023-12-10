export default class PollOptions {
  constructor (options) {
    this._options = options
  }

  serialize () {
    return this._options
  }

  /**
   * Returns all the options currently within a poll
   * @returns {String[]}
   */
  all () {
    return this._options
  }

  /**
   * Add an option to the poll.
   * @param option {String}
   * @returns {Error|undefined}
   */
  add (option) {
    if (this.has(option)) return new Error('An option with this name already exists!')
    this._options.push(option)
  }

  /**
   * Remove an option for the pol
   * @param option {String}
   * @returns {Error|undefined}
   */
  remove (option) {
    if (!this.has(option)) return new Error('There is no option by this name!')
    this._options.splice(this._options.findIndex(opt => opt === option), 1)
  }

  /**
   * Return if the poll currently has an option with the name.
   * @param option {String}
   * @returns {Boolean}
   */
  has (option) {
    return this._options.includes(option)
  }
}
