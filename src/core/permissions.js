const { sendMessage } = require('../api/messages.js');
const { permissionsManager, Permissions } = require('@core/permissionsManager');
const rolesManager = require('@core/rolesManager');

function getPermissionName(permissionId) {
    const permissionKey = Object.keys(Permissions).find((key) => Permissions[key] === permissionId);
    if (!permissionKey) return `Permission ${permissionId}`;

    // Convert ROLE_MANAGE -> Role Manage
    return permissionKey
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

async function checkPermissions(userIdOrData, guildId, permission) {
    return await permissionsManager.hasPermission(userIdOrData, guildId, permission);
}

async function getUserHighestPriority(userId, guildId) {
    return await permissionsManager.getUserHighestPriority(userId, guildId);
}

async function hasHigherPriority(userId1, userId2, guildId) {
    return await permissionsManager.hasHigherPriority(userId1, userId2, guildId);
}

async function canManageUser(managerId, targetUserId, guildId) {
    return await permissionsManager.canManageUser(managerId, targetUserId, guildId);
}

async function isRoleProtected(roleId, guildId) {
    return await permissionsManager.isRoleProtected(roleId, guildId);
}

async function requirePermission(data, permission, customErrorMessage = null) {
    const hasPerms = await checkPermissions(data, data.guild, permission);

    if (!hasPerms) {
        if (customErrorMessage) {
            await sendMessage(data.channel, { content: customErrorMessage });
        } else {
            const permissionName = getPermissionName(permission);
            await sendMessage(data.channel, {
                content: `You need \`${permissionName}\` to use this command!`,
            });
        }
        return false;
    }

    return true;
}

async function requireHigherPriority(data, targetUserId, customErrorMessage = null) {
    const canManage = await canManageUser(data.user.id, targetUserId, data.guild);

    if (!canManage) {
        const errorMessage =
            customErrorMessage || 'You cannot manage this user - they have higher or equal role priority!';
        await sendMessage(data.channel, { content: errorMessage });
        return false;
    }

    return true;
}

module.exports = {
    checkPermissions,
    getUserHighestPriority,
    hasHigherPriority,
    canManageUser,
    requirePermission,
    requireHigherPriority,
    isRoleProtected,
    Permissions,
    clearRolesCache: rolesManager.clearRolesCache.bind(rolesManager),
    clearMemberPermissionsCache: rolesManager.clearMemberPermissionsCache.bind(rolesManager),
};
