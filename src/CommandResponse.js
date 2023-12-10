export default class CommandResponse {
  constructor (content) {
    this.content = content
  }

  get data () {
    return {
      content: this.content,
      ephemeral: true
    }
  }
}
