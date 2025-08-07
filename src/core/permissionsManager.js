const logger = require('@core/logger');

const Permissions = Object.freeze({
    CHANNEL_VIEW: 0,
    CHANNEL_MANAGE: 1,
    ROLE_MANAGE: 2,
    AUDITLOG_VIEW: 3,
    SERVER_MANAGE: 4,
    INVITE_CREATE: 5,
    MEMBER_KICK: 6,
    MEMBER_BAN: 7,
    MESSAGE_SEND: 8,
    FILE_SEND: 9,
    MESSAGE_MANAGE: 10,
    MESSAGE_READ: 11,
    VC_CONNECT: 12,
    VC_SPEAK: 13,
    VC_MUTE: 14,
    ADMINISTRATOR: 15,
    DISPLAY_SEPARATELY: 16,
    SLOWMODE_BYPASS: 17,
});

class PermissionsManager {
    constructor() {
        this.guildCache = require('@core/guildCache');
        this.rolesManager = require('@core/rolesManager');
    }

    // === PERMISSION CHECKING ===

    async hasPermission(userIdOrData, guildId, permissionId) {
        let userId;
        let memberRoles = null;

        if (typeof userIdOrData === 'string') {
            userId = userIdOrData;
        } else if (userIdOrData && userIdOrData.user && userIdOrData.user.id) {
            userId = userIdOrData.user.id;
            guildId = guildId || userIdOrData.guild;
            // Use WebSocket data if available (more reliable for current user)
            memberRoles = userIdOrData.member?.roles;
        } else {
            return false;
        }

        if (!guildId) {
            return false;
        }

        try {
            const guildData = await this.guildCache.getGuild(guildId);

            if (guildData && guildData.owner === userId) {
                return true;
            }

            // Use WebSocket data if available, otherwise fetch from API
            if (!memberRoles) {
                memberRoles = await this.rolesManager.getMemberRoles(guildId, userId);
            }

            if (!memberRoles || !Array.isArray(memberRoles)) {
                return false;
            }

            const roles = await this.rolesManager.getGuildRoles(guildId);
            if (!roles) return false;

            const permBit = 1 << permissionId;
            const adminBit = 1 << Permissions.ADMINISTRATOR;

            for (const roleId of memberRoles) {
                const role = roles.get(roleId);
                if (role && typeof role.permissions === 'number') {
                    if ((role.permissions & permBit) !== 0 || (role.permissions & adminBit) !== 0) {
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            logger.error(`Failed to check permission for user ${userId} in guild ${guildId}:`, error.message);
            return false;
        }
    }

    async isRoleProtected(roleId, guildId) {
        try {
            const role = await this.rolesManager.getRole(guildId, roleId);
            if (!role) return -1;
            return role.protected;
        } catch (error) {
            logger.error(`Failed to check role protection status ${roleId} in guild ${guildId}:`, error.message);
            return -1;
        }
    }

    // === PRIORITY SYSTEM ===

    async getUserHighestPriority(userId, guildId) {
        try {
            const guildData = await this.guildCache.getGuild(guildId);

            // Owner has infinite priority
            if (guildData && guildData.owner === userId) {
                return Infinity;
            }

            const memberRoles = await this.rolesManager.getMemberRoles(guildId, userId);
            if (!memberRoles || !Array.isArray(memberRoles)) {
                return -1; // No roles
            }

            const roles = await this.rolesManager.getGuildRoles(guildId);
            if (!roles) return -1;

            let highestPriority = -1;

            for (const roleId of memberRoles) {
                const role = roles.get(roleId);
                if (role && typeof role.priority === 'number') {
                    if (role.priority > highestPriority) {
                        highestPriority = role.priority;
                    }
                }
            }

            return highestPriority;
        } catch (error) {
            logger.error(`Failed to get highest priority for user ${userId} in guild ${guildId}:`, error.message);
            return -1;
        }
    }

    async hasHigherPriority(userId1, userId2, guildId) {
        try {
            const priority1 = await this.getUserHighestPriority(userId1, guildId);
            const priority2 = await this.getUserHighestPriority(userId2, guildId);

            return priority1 > priority2;
        } catch (error) {
            logger.error(
                `Failed to compare priorities for users ${userId1} and ${userId2} in guild ${guildId}:`,
                error.message,
            );
            return false;
        }
    }

    async canManageUser(managerId, targetUserId, guildId) {
        try {
            // Same user cannot manage themselves
            if (managerId === targetUserId) {
                return false;
            }

            return await this.hasHigherPriority(managerId, targetUserId, guildId);
        } catch (error) {
            logger.error(
                `Failed to check if ${managerId} can manage ${targetUserId} in guild ${guildId}:`,
                error.message,
            );
            return false;
        }
    }
}

module.exports = {
    permissionsManager: new PermissionsManager(),
    Permissions,
};
