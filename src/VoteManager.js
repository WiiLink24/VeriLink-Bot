export default class VoteManager {
  constructor (poll, votes) {
    this._votes = votes
  }

  all () {
    return this._votes.length
  }

  total (option) {
    return this._votes.filter(v => v.option === option).length
  }

  add (vote) {
    if (this.has(vote)) return new Error('You have already voted for this option.')
    if (this.hasAny(vote)) return this.replace(vote)
    this._votes.push(vote)
  }

  remove (vote) {
    if (!this.has(vote)) return new Error('There is no vote with this option.')
    this._votes.splice(this._votes.findIndex(v => v.member === vote.member && v.option === vote.option), 1)
  }

  has (vote) {
    return this._votes.find(v => v.member === vote.member && v.option === vote.option) != null
  }

  hasAny (vote) {
    return this._votes.find(v => v.member === vote.member) != null
  }

  replace (vote) {
    this._votes.find(v => v.member === vote.member).option = vote.option
  }
}
