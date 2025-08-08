const guildCache = require('@core/guildCache.js');
const userManager = require('@core/userManager.js');
const kick = require('@api/moderation/kick.js');
const { sendMessage } = require('@api/messages.js');
const { extractUserIdFromPing } = require('@core/utils/users.js');
const { getUserHighestPriority, requirePermission, Permissions } = require('@core/permissions.js');

module.exports = {
    name: 'kick',
    description: 'Kick users from server',
    async execute(data, args, socket) {
        if (!(await requirePermission(data, Permissions.MEMBER_KICK))) {
            return;
        }
        const guildData = await guildCache.getGuild(data.guild);
        if (args.length == 0)
            return sendMessage(data.channel, {
                content: `Use: \`${guildData.botConfig.prefix}kick @user [reason]\``,
            });
        const mentionedUserId = extractUserIdFromPing(args[0]);
        if (!mentionedUserId) {
            const guildData = await guildCache.getGuild(data.guild);
            return sendMessage(data.channel, {
                content: `Invalid user mention! Use: \`${guildData.botConfig.prefix}kick @user [reason]\``,
            });
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        const userPriority = await getUserHighestPriority(data.user.id, data.guild);
        const mentionedUserPriority = await getUserHighestPriority(mentionedUserId, data.guild);

        if (mentionedUserPriority >= userPriority || guildData.owner == mentionedUserId)
            return sendMessage(data.channel, {
                content: `This user has the same or higher role priority than you.`,
            });

        let response = await kick({ user: { id: mentionedUserId }, guild: data.guild });
        let embed;
        if (response.ok) {
            targetUserData = await userManager.getUser(mentionedUserId);
            const avatarUrl = userManager.getAvatarUrl(targetUserData);
            embed = {
                title: `${targetUserData.username} was kicked from the server`,
                image: avatarUrl,
                color: '#db0000',
                description: `Reason: ${reason}`,
                footer: `User id: ${mentionedUserId}`,
            };
        } else {
            let result = await response.json();
            embed = {
                title: `Error - ${response.statusText}`,
                description: result.message,
                color: '#db0000',
            };
        }
        await sendMessage(data.channel, {
            embeds: [embed],
        });
    },
};
