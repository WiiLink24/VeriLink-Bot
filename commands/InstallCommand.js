const Command = require('../src/Command')

class InstallCommand extends Command {
  name = 'install'
  description = 'Instruct user on how to install'
  permission = 'MANAGE_MESSAGES'

  onRun = (interaction) => {
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

module.exports = InstallCommand
