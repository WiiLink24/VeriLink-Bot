const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('st000')
    .setDescription('For issues with st000.pac not found errors.')
    .setDefaultMemberPermissions(0x2000),
  async execute (interaction) {
    interaction.reply(`This error means that the server you are connecting to does not have the requested quest file for your quest. This is not an issue with Erupe, but rather the server you are connecting to.
If you are the server owner, please extract the quests onto the bin folder of your server, linked on the official Erupe repository: https://github.com/zerulight/erupe

このエラーは、接続しているサーバーがクエストファイルを持っていないことを意味します。これはErupeの問題ではなく、接続しているサーバーの問題です。
サーバーのオーナーの場合、ErupeのGitHubからにクエストをダウンロードしてサーバーのbinに入れてください。 クエストが https://github.com/zerulight/erupe からです
    `)
  }
}
