const { sendMessage } = require('../api/messages.js');
const { requirePermission, Permissions } = require('../core/permissions.js');
const guildCache = require('@core/guildCache');

module.exports = {
    name: 'prefix',
    description: 'Change bot prefix for this server',
    async execute(data, args, socket) {
        const guildId = data.guild;

        if (!guildId) {
            return sendMessage(data.channel, {
                content: 'This command only works in servers!',
            });
        }

        if (args.length === 0) {
            const currentPrefix = await guildCache.getGuildPrefix(guildId);
            return sendMessage(data.channel, {
                content: `Current prefix: \`${currentPrefix}\``,
            });
        }

        if (!(await requirePermission(data, Permissions.ADMINISTRATOR))) {
            return;
        }

        const newPrefix = args[0];

        if (newPrefix.length > 3) {
            return sendMessage(data.channel, {
                content: 'Prefix cannot be longer than 3 characters!',
            });
        }

        const updatedGuild = await guildCache.updateGuild(guildId, {
            $set: { 'botConfig.prefix': newPrefix },
        });

        if (updatedGuild) {
            sendMessage(data.channel, {
                content: `Prefix changed to: \`${newPrefix}\``,
            });
        } else {
            sendMessage(data.channel, {
                content: 'Error changing prefix!',
            });
        }
    },
};
