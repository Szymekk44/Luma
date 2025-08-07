const { sendMessage } = require('../api/messages.js');
const userManager = require('@core/userManager');

function extractUserIdFromPing(mention) {
    const match = mention.match(/^<@!?(\d+)>$/);
    return match ? match[1] : null;
}

module.exports = {
    name: 'avatar',
    description: 'Show avatar of yourself or mentioned user',
    async execute(data, args, socket) {
        const channelId = data.channel;
        let targetUserId = data.user.id;
        let targetUserData = data.user;
        let isCurrentUser = true;

        if (args.length > 0) {
            const mentionedUserId = extractUserIdFromPing(args[0]);

            if (mentionedUserId) {
                targetUserId = mentionedUserId;
                isCurrentUser = false;

                targetUserData = await userManager.getUser(targetUserId);

                if (!targetUserData) {
                    return sendMessage(channelId, {
                        content: `User <@${targetUserId}> not found!`,
                    });
                }
            } else {
                return sendMessage(channelId, {
                    content: `Invalid user mention! Use: \`${guildData.botConfig.prefix}avatar @user\` or just \`${guildData.botConfig.prefix}avatar\``,
                });
            }
        } else {
            userManager.cacheUserFromEvent(data.user);
        }

        const avatarUrl = userManager.getAvatarUrl(targetUserData);
        const user = await userManager.getUser(targetUserId);

        const embed = {
            title: `${user.username}'s Avatar`,
            image: avatarUrl,
            color: '#00db84',
            text: `User ID: ${targetUserId}`,
        };

        await sendMessage(channelId, {
            embeds: [embed],
        });
    },
};
