const guild = require('@models/guild');
const logger = require('@core/logger');
const config = require('@/config.js');

class GuildCache {
    constructor() {
        this.cache = new Map();
    }

    async getGuild(guildId) {
        if (this.cache.has(guildId)) {
            return this.cache.get(guildId);
        }

        try {
            let guildDoc = await guild.findOne({ id: guildId });

            if (!guildDoc) {
                guildDoc = new guild({ id: guildId });
                await guildDoc.save();
            }

            const response = await fetch(`${config.path}/guilds/${guildId}`, {
                headers: config.defaultHeaders,
            });

            if (!response.ok) {
                logger.error(`Failed to fetch guild data for ${guildId}: ${response.status}`);
                this.cache.set(guildId, guildDoc.toObject());
                return this.cache.get(guildId);
            }

            const guildApiData = await response.json();

            const mergedData = {
                ...guildDoc.toObject(),
                ...guildApiData,
            };

            this.cache.set(guildId, mergedData);

            // Cache roles if available
            if (guildApiData.roles && Array.isArray(guildApiData.roles)) {
                const rolesManager = require('@core/rolesManager');
                rolesManager.cacheGuildRoles(guildId, guildApiData.roles);
            }

            return mergedData;
        } catch (error) {
            logger.error(`Failed to get guild ${guildId}:`, error.message);

            let guildDoc = await guild.findOne({ id: guildId });
            if (!guildDoc) {
                guildDoc = new guild({ id: guildId });
                await guildDoc.save();
            }

            this.cache.set(guildId, guildDoc.toObject());
            return this.cache.get(guildId);
        }
    }

    async getGuildPrefix(guildId) {
        const guildDoc = await this.getGuild(guildId);
        return guildDoc?.botConfig?.prefix || '/';
    }

    async updateGuild(guildId, updateData) {
        try {
            const updatedGuild = await guild.findOneAndUpdate({ id: guildId }, updateData, {
                upsert: true,
                new: true,
                runValidators: true,
            });

            this.cache.set(guildId, updatedGuild.toObject());
            return updatedGuild.toObject();
        } catch (error) {
            logger.error(`Failed to update guild ${guildId}:`, error.message);
            return null;
        }
    }

    updateCache(guildId, guildData) {
        this.cache.set(guildId, guildData);
    }

    removeFromCache(guildId) {
        this.cache.delete(guildId);
    }

    clearCache() {
        this.cache.clear();
    }

    getCachedGuild(guildId) {
        return this.cache.get(guildId);
    }
}

module.exports = new GuildCache();
