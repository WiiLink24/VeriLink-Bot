/**
 * Represents a vote from a user.
 * This can be any combination of a member + option
 */
export default class Vote {
  constructor (member, option) {
    this.member = member
    this.option = option
  }
}
