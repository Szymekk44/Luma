const { sendMessage } = require('../api/messages.js');
const guildCache = require('@core/guildCache');

async function createHelpEmbed(data, commands, command, footer) {
    const prefix = data.guild ? await guildCache.getGuildPrefix(data.guild) : '/';

    const helpText = commands
        .filter((cmd) => cmd.description)
        .map((cmd) => {
            const commandName = command ? `${command} ${cmd.name}` : cmd.name;
            return `**${prefix}${commandName}** - ${cmd.description}`;
        });

    let embed = {
        title: 'Available Commands',
        description: helpText.join('\n'),
        color: '#00db84',
        footer,
    };

    await sendMessage(data.channel, { embeds: [embed] });
}
module.exports = createHelpEmbed;
