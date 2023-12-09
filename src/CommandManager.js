import InstallCommand from '../commands/GuideCommand.js'
import PollCommand from '../commands/PollCommand.js'

export default class CommandManager {
  constructor (client) {
    this.client = client
    this._commands = [
      InstallCommand,
      PollCommand
    ]
  }

  get (name) {
    return this._commands.find(command => command.data.name === name)
  }

  all () {
    return this._commands
  }
}
