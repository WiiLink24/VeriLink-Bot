const Command = require('../src/Command')

class St000Command extends Command {
  name = 'st000'
  description = 'For issues with st000.pac not found errors.'
  permission = 'MANAGE_MESSAGES'

  onRun = (interaction) => {
    interaction.reply(`This error means that the server you are connecting to does not have the requested quest file for your quest. This is not an issue with Erupe, but rather the server you are connecting to.
    If you are the server owner, please extract the quests onto the bin folder of your server, linked on the official Erupe repository: https://github.com/zerulight/erupe

    このエラーは、接続しているサーバーがクエストファイルを持っていないことを意味します。これはErupeの問題ではなく、接続しているサーバーの問題です。
    サーバーのオーナーの場合、ErupeのGitHubからにクエストをダウンロードしてサーバーのbinに入れてください。 クエストが https://github.com/zerulight/erupe からです
    `)
  }
}

module.exports = St000Command
