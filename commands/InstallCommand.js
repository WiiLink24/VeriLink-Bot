const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('install')
    .setDescription('Instruct the user on how to install Erupe.')
    .setDefaultMemberPermissions(0x2000),
  async execute (interaction) {
    interaction.reply(`For instructions on how to install Erupe, follow the guide here: https://discord.com/channels/1001547680637530253/1142729449251549317/1142729449251549317
Erupeをインストールするのため、このガイドを読んでください: https://discord.com/channels/1001547680637530253/1166954398216364124/1166954398216364124

For issues during installation, please consult <#1123857078876917801>.
インストール中の問題がある場合、「<#1169359221633069076>」サポートはこちらです
----------------------------------------

For instructions on how to install the game, follow the guide here: https://discord.com/channels/1001547680637530253/1142729449251549317/1142729449251549317
＊ 日本語のガイドがまだないです。ごめんなさい。
    `)
  }
}
