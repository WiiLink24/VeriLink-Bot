export default class PollOptions {
  constructor (options) {
    this._options = options
  }

  all () {
    return this._options
  }

  add (option) {
    if (this.has(option)) return new Error('An option with this name already exists!')
    this._options.push(option)
  }

  remove (option) {
    if (!this.has(option)) return new Error('There is no option by this name!')
    this._options.splice(this._options.findIndex(opt => opt === option), 1)
  }

  has (option) {
    return this._options.includes(option)
  }
}
