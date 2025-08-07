const rolesManager = require('@core/rolesManager');
const guildCache = require('@core/guildCache');
const logger = require('@core/logger');
const { sendMessage } = require('@api/messages.js');
const { assignRole } = require('@api/roles/members.js');

module.exports = {
    name: 'syncServerMember',
    async execute(socket, commands, data) {
        if (data.reason === 'user-join') {
            const guildData = await guildCache.getGuild(data.serverId);
            if (!guildData) return;
            if (guildData.welcomeConfig.enabled) handleWelcomeMessage(data, guildData);
            if (guildData.autoroleConfig.enabled) handleAutorole(data, guildData);
        } else if (data.reason === 'role-add' || data.reason === 'role-remove' || data.reason === 'roles-update') {
            if (data.serverId) {
                rolesManager.clearMemberPermissionsCache(data.serverId, data.syncData.id);
                logger.debug(`Cleared guild roles cache for guild ${data.serverId} (member's role updated)`);
            }
        }
    },
};

async function handleAutorole(data, guildData) {
    try {
        await assignRole({ user: { id: data.syncData.id }, guild: data.serverId, role: guildData.autoroleConfig.role });
    } catch (err) {
        console.error('Role assignment failed:', err);
    }
}

async function handleWelcomeMessage(data, guildData) {
    const formattedDescription = guildData.welcomeConfig.description.replace(/{member}/g, data.syncData.username);
    const formattedTitle = guildData.welcomeConfig.title.replace(/{member}/g, data.syncData.username);
    const embeds = [
        {
            title: formattedTitle,
            description: formattedDescription,
            color: guildData.welcomeConfig.color,
            author: guildData.welcomeConfig.author,
            thumbnail: `https://cdn.zyntra.gg/avatar/${data.syncData.id}/${data.syncData.avatar}`,
        },
    ];
    await sendMessage(guildData.welcomeConfig.channel, {
        embeds,
    });
}
