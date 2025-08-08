const helpEmbed = require('@core/helpEmbed.js');
const guildCache = require('@core/guildCache.js');
const { sendMessage } = require('../api/messages.js');
const { requirePermission, Permissions } = require('../core/permissions.js');

module.exports = {
    name: 'welcome',
    description: 'Configure welcome message',
    async execute(data, args, socket) {
        if (!(await requirePermission(data, Permissions.ADMINISTRATOR))) {
            return;
        }
        handleConfig(data, args, this.name);
    },
};

async function handleConfig(data, args, commandName) {
    const guildData = await guildCache.getGuild(data.guild);
    if (!guildData)
        return sendMessage(data.channel, {
            content: 'Failed to fetch guild data',
        });
    switch (args[0]) {
        case 'enable':
            if (!guildData.welcomeConfig.channel) {
                await sendMessage(data.channel, {
                    content: `First, set the channel where welcome messages should be sent.\n\`${guildData.botConfig.prefix}welcome channel <channel_id>\``,
                });
                return;
            } else
                await guildCache.updateGuild(data.guild, {
                    $set: { 'welcomeConfig.enabled': true },
                });
            await sendMessage(data.channel, { content: `Welcome message is now enabled.` });
            break;

        case 'disable':
            await guildCache.updateGuild(data.guild, {
                $set: { 'welcomeConfig.enabled': false },
            });
            await sendMessage(data.channel, { content: `Welcome message is now disabled.` });
            break;

        case 'channel':
            const channel = args[1];
            if (!channel || channel.length != 19) {
                await sendMessage(data.channel, {
                    content: `${guildData.welcomeConfig.channel || 'unset'}`,
                });
            } else {
                await guildCache.updateGuild(data.guild, {
                    $set: { 'welcomeConfig.channel': channel },
                });
                await sendMessage(data.channel, { content: `Welcome message channel is now set to ${channel}` });
            }
            break;

        case 'title':
            const title = args.slice(1).join(' ');
            if (!title) {
                await sendMessage(data.channel, {
                    content: `${guildData.welcomeConfig.title}`,
                });
            } else {
                await guildCache.updateGuild(data.guild, {
                    $set: { 'welcomeConfig.title': title },
                });
                await sendMessage(data.channel, { content: `Welcome message title is now set to ${title}` });
            }
            break;

        case 'description':
            const description = args.slice(1).join(' ').replace(/\\n/g, '\n');
            if (!description) {
                await sendMessage(data.channel, {
                    content: `${guildData.welcomeConfig.description}`,
                });
            } else {
                await guildCache.updateGuild(data.guild, {
                    $set: { 'welcomeConfig.description': description },
                });
                await sendMessage(data.channel, {
                    content: `Welcome message description is now set to ${description}`,
                });
            }
            break;

        case 'author':
            const author = args.slice(1).join(' ');
            if (!author) {
                await sendMessage(data.channel, {
                    content: `${guildData.welcomeConfig.author}`,
                });
            } else {
                await guildCache.updateGuild(data.guild, {
                    $set: { 'welcomeConfig.author': author },
                });
                await sendMessage(data.channel, {
                    content: `Welcome message author is now set to ${author}`,
                });
            }
            break;

        case 'color':
            const color = args[1];
            if (!color) {
                await sendMessage(data.channel, {
                    content: `${guildData.welcomeConfig.color}`,
                });
            } else {
                await guildCache.updateGuild(data.guild, {
                    $set: { 'welcomeConfig.color': color },
                });
                await sendMessage(data.channel, { content: `Welcome message color is now set to ${color}` });
            }
            break;

        default:
            const commands = [
                { name: 'enable', description: 'Enables welcome message (Set channel id first)' },
                { name: 'disable', description: 'Disables welcome message' },
                { name: 'channel', description: 'Sets the channel to which welcome messages will be sent' },
                { name: 'title', description: 'Sets the welcome embed title' },
                { name: 'description', description: 'Sets the welcome embed description' },
                { name: 'author', description: 'Sets the welcome embed author' },
                { name: 'color', description: 'Sets the welcome embed color (HEX)' },
            ];
            helpEmbed(data, commands, commandName, `Tip: You can use {member} in title and description!`);
    }
}
