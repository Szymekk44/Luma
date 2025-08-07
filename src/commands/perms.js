const { sendMessage } = require('../api/messages.js');
const { checkPermissions, getUserHighestPriority, Permissions } = require('../core/permissions.js');
const guildCache = require('@core/guildCache');
const rolesManager = require('@core/rolesManager');

function extractUserIdFromPing(mention) {
    const match = mention.match(/^<@!?(\d+)>$/);
    return match ? match[1] : null;
}

module.exports = {
    name: 'perms',
    description: 'Check permissions in current server',
    async execute(data, args, socket) {
        const guildId = data.guild;

        if (!guildId) {
            return sendMessage(data.channel, {
                content: 'This command only works in servers!',
            });
        }

        let targetUserId = data.user.id;
        let isCurrentUser = true;

        const guildData = await guildCache.getGuild(guildId);
        if (args.length > 0) {
            const mentionedUserId = extractUserIdFromPing(args[0]);

            if (mentionedUserId) {
                targetUserId = mentionedUserId;
                isCurrentUser = mentionedUserId === data.user.id;
            } else {
                return sendMessage(data.channel, {
                    content: `Invalid user mention! Use: \`${guildData.botConfig.prefix}perms @user\` or just \`${guildData.botConfig.prefix}perms\``,
                });
            }
        }

        const isOwner = guildData && guildData.owner === targetUserId;
        const userPriority = await getUserHighestPriority(targetUserId, guildId);

        const permissionNames = Object.keys(Permissions);
        const userPermissions = [];

        for (const permName of permissionNames) {
            const permId = Permissions[permName];
            let hasPerms;

            if (isCurrentUser) {
                hasPerms = await checkPermissions(data, guildId, permId);
            } else {
                hasPerms = await checkPermissions(targetUserId, guildId, permId);
            }

            if (hasPerms) {
                userPermissions.push(permName);
            }
        }

        const permsList = userPermissions.length > 0 ? userPermissions.map((p) => `\`${p}\``).join(', ') : 'None';

        let rolesInfo = '**Roles:** None';

        if (isCurrentUser && data.member?.roles) {
            rolesInfo = `**Roles:** ${data.member.roles.length} roles (IDs: ${data.member.roles
                .slice(0, 3)
                .join(', ')}${data.member.roles.length > 3 ? '...' : ''})`;
        } else if (!isCurrentUser) {
            const memberRoles = await rolesManager.getMemberRoles(guildId, targetUserId);
            if (memberRoles === null) {
                return sendMessage(data.channel, {
                    content: `Cannot check permissions for <@${targetUserId}> - member not found in this server!`,
                });
            } else if (memberRoles && memberRoles.length > 0) {
                rolesInfo = `**Roles:** ${memberRoles.length} roles (IDs: ${memberRoles.slice(0, 3).join(', ')}${
                    memberRoles.length > 3 ? '...' : ''
                })`;
            }
        }

        const priorityDisplay = userPriority === Infinity ? 'Owner (∞)' : userPriority.toString();

        await sendMessage(data.channel, {
            content: [
                `**Permission Check for** <@${targetUserId}>`,
                ``,
                rolesInfo,
                `**Highest Priority:** ${priorityDisplay}`,
                `**Permissions:** ${permsList}`,
                ``,
                `**Is Owner:** ${isOwner ? 'Yes' : 'No'}`,
            ].join('\n'),
        });
    },
};
