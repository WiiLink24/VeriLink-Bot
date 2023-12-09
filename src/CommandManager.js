import path from 'node:path'
import fs from 'node:fs'
import InstallCommand from '../commands/GuideCommand.js'
import PollCommand from '../commands/PollCommand.js'

const commands = path.resolve('commands')

export default class CommandManager {
  constructor (client) {
    this.client = client
    this._commands = [
      InstallCommand,
      PollCommand
    ]
  }

  files () {
    return fs.readdirSync(commands)
  }

  get (name) {
    return this._commands.find(command => command.name === name)
  }

  all () {
    return this._commands
  }
}
