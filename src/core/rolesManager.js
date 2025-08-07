const logger = require('@core/logger');
const config = require('@/config.js');

class RolesManager {
    constructor() {
        this.rolesCache = new Map(); // guildId -> Map(roleId -> role)
        this.memberRolesCache = new Map(); // guildId -> Map(userId -> roleIds[])
    }

    // === GUILD ROLES MANAGEMENT ===

    cacheGuildRoles(guildId, rolesArray) {
        const rolesMap = new Map();
        rolesArray.forEach((role) => {
            rolesMap.set(role.id, role);
        });
        this.rolesCache.set(guildId, rolesMap);
    }

    async getGuildRoles(guildId) {
        if (this.rolesCache.has(guildId)) {
            return this.rolesCache.get(guildId);
        }

        // Trigger guild fetch which will cache roles
        const guildCache = require('@core/guildCache');
        await guildCache.getGuild(guildId);
        return this.rolesCache.get(guildId) || null;
    }

    async getRole(guildId, roleId) {
        const roles = await this.getGuildRoles(guildId);
        return roles ? roles.get(roleId) : null;
    }

    updateRoleCache(guildId, roleId, roleData) {
        if (!this.rolesCache.has(guildId)) {
            this.rolesCache.set(guildId, new Map());
        }
        this.rolesCache.get(guildId).set(roleId, roleData);
    }

    updateSingleRole(guildId, roleData) {
        if (!roleData || !roleData.id) return false;

        // Update the role in cache if guild roles are already cached
        if (this.rolesCache.has(guildId)) {
            this.rolesCache.get(guildId).set(roleData.id, roleData);
            return true;
        }

        return false; // Guild roles not cached yet
    }

    removeRoleFromCache(guildId, roleId) {
        if (this.rolesCache.has(guildId)) {
            const guildRoles = this.rolesCache.get(guildId);
            const existed = guildRoles.has(roleId);
            guildRoles.delete(roleId);
            return existed;
        }

        return false; // Guild roles not cached
    }

    // === MEMBER ROLES MANAGEMENT ===

    async fetchMemberRoles(guildId, userId) {
        try {
            const response = await fetch(`https://zyntra.gg/api/v1/guilds/${guildId}/members/${userId}/roles`, {
                headers: config.defaultHeaders,
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // Member not found
                }
                logger.error(`Failed to fetch member roles for ${userId} in guild ${guildId}: ${response.status}`);
                return null;
            }

            const data = await response.json();

            // Extract only role IDs to match messageReceived format
            const roleIds = data.roles ? data.roles.map((role) => role.id) : [];

            if (!this.memberRolesCache.has(guildId)) {
                this.memberRolesCache.set(guildId, new Map());
            }

            this.memberRolesCache.get(guildId).set(userId, roleIds);
            return roleIds;
        } catch (error) {
            logger.error(`Failed to fetch member roles for ${userId} in guild ${guildId}:`, error.message);
            return null;
        }
    }

    async getMemberRoles(guildId, userId) {
        if (this.memberRolesCache.has(guildId) && this.memberRolesCache.get(guildId).has(userId)) {
            return this.memberRolesCache.get(guildId).get(userId);
        }

        return await this.fetchMemberRoles(guildId, userId);
    }

    // === CACHE MANAGEMENT ===

    clearRolesCache(guildId) {
        if (guildId) {
            this.rolesCache.delete(guildId);
            this.memberRolesCache.delete(guildId);
        } else {
            this.rolesCache.clear();
            this.memberRolesCache.clear();
        }
    }

    clearMemberPermissionsCache(guildId, userId = null) {
        if (!guildId) {
            this.memberRolesCache.clear();
            return;
        }

        if (!userId) {
            this.memberRolesCache.delete(guildId);
            return;
        }

        if (this.memberRolesCache.has(guildId)) {
            this.memberRolesCache.get(guildId).delete(userId);
        }
    }
}

module.exports = new RolesManager();
