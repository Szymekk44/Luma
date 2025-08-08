const helpEmbed = require('@core/helpEmbed.js');
const guildCache = require('@core/guildCache.js');
const rolesManager = require('@core/rolesManager.js');
const { sendMessage } = require('../api/messages.js');
const { getUserHighestPriority, requirePermission, isRoleProtected, Permissions } = require('../core/permissions.js');

module.exports = {
    name: 'autorole',
    description: 'Configure auto role (automatic role upon joining guild)',
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
            if (!guildData.autoroleConfig.role) {
                await sendMessage(data.channel, {
                    content: `First, set the role you want to assign\n\`${guildData.botConfig.prefix}autorole role <role_id>\``,
                });
                return;
            } else
                await guildCache.updateGuild(data.guild, {
                    $set: { 'autoroleConfig.enabled': true },
                });
            await sendMessage(data.channel, { content: `Autorole is now enabled.` });
            break;
        case 'disable':
            await guildCache.updateGuild(data.guild, {
                $set: { 'autoroleConfig.enabled': false },
            });
            await sendMessage(data.channel, { content: `Autorole is now disabled.` });
            break;
        case 'role':
            const role = args[1];
            if (!role || role.length != 19) {
                await sendMessage(data.channel, {
                    content: `${guildData.autoroleConfig.role || 'unset'}`,
                });
            } else {
                if (await isRoleProtected(role, data.guild)) {
                    await sendMessage(data.channel, {
                        content: `You do not have sufficient permissions to manage this role. (Role protected)`,
                    });
                    return;
                }
                const userPriority = await getUserHighestPriority(data.user.id, data.guild);
                const roleToGive = await rolesManager.getRole(data.guild, role);

                if (!roleToGive) {
                    return sendMessage(data.channel, {
                        content: `Role with ID \`${role}\` not found in this server!`,
                    });
                }

                const rolePriority = roleToGive.priority || 0;

                if (rolePriority >= userPriority) {
                    await sendMessage(data.channel, {
                        content: `You do not have sufficient permissions to manage this role.`,
                    });
                    return;
                }

                await guildCache.updateGuild(data.guild, {
                    $set: { 'autoroleConfig.role': role },
                });
                await sendMessage(data.channel, { content: `Autorole role is now set to ${role}` });
            }
            break;

        default:
            const commands = [
                { name: 'enable', description: 'Enables the autorole system' },
                { name: 'disable', description: 'Disables the autorole system' },
                { name: 'role', description: 'Sets which role Luma will automatically assign to new users' },
            ];
            helpEmbed(data, commands, commandName);
    }
}
