export default class CommandManager {
  constructor (client) {
    this.client = client
    this._commands = [
    ]
  }

  /**
   * Get a loaded command by its' name
   * @param name
   * @returns {{data: *, execute(*): Promise<void>} | {button(*, *): Promise<CommandResponse|undefined>, data: SlashCommandSubcommandsOnlyBuilder, autocomplete(*): Promise<void>, execute(*): Promise<CommandResponse>}}
   */
  get (name) {
    return this._commands.find(command => command.data.name === name)
  }

  /**
   * Get every a list of command currently loaded
   * @returns {[{data: *, execute(*): Promise<void>},{button(*, *): Promise<CommandResponse|undefined>, data: SlashCommandSubcommandsOnlyBuilder, autocomplete(*): Promise<void>, execute(*): Promise<CommandResponse>}]}
   */
  all () {
    return this._commands
  }
}
