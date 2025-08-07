const logger = require('@core/logger');
const config = require('@/config.js');

class UserManager {
    constructor() {
        this.userCache = new Map(); // userId -> userData
    }

    // === USER DATA MANAGEMENT ===

    async fetchUser(userId) {
        try {
            const response = await fetch(`https://zyntra.gg/api/v1/users/${userId}`, {
                headers: config.defaultHeaders,
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // User not found
                }
                logger.error(`Failed to fetch user data for ${userId}: ${response.status}`);
                return null;
            }

            const userData = await response.json();

            // Add ID to user data since API doesn't return it
            const userWithId = {
                id: userId,
                ...userData,
            };

            this.userCache.set(userId, userWithId);
            return userWithId;
        } catch (error) {
            logger.error(`Failed to fetch user ${userId}:`, error.message);
            return null;
        }
    }

    async getUser(userId) {
        if (this.userCache.has(userId)) {
            return this.userCache.get(userId);
        }

        return await this.fetchUser(userId);
    }

    // Cache user data from WebSocket events
    cacheUserFromEvent(userData) {
        if (!userData || !userData.id) return;

        // Add timestamp for cleanup purposes
        const userWithTimestamp = {
            ...userData,
            cachedAt: Date.now(),
        };

        // WebSocket data is more complete, so prefer it over cached API data
        this.userCache.set(userData.id, userWithTimestamp);
    }

    // Get avatar URL for user
    getAvatarUrl(userData) {
        if (!userData) return null;

        if (userData.avatar) {
            return `https://cdn.zyntra.gg/avatar/${userData.id}/${userData.avatar}.webp`;
        } else return `https://cdn.zyntra.gg/avatar/${userData.id}/`;
    }

    // === CACHE MANAGEMENT ===

    updateUser(userId, userData) {
        this.userCache.set(userId, userData);
    }

    removeUser(userId) {
        this.userCache.delete(userId);
    }

    clearCache() {
        this.userCache.clear();
    }

    getCachedUser(userId) {
        return this.userCache.get(userId);
    }

    // Cleanup old cache entries
    cleanupCache(maxAge = 300000) {
        const now = Date.now();
        const cutoff = now - maxAge;

        for (const [userId, userData] of this.userCache.entries()) {
            // Remove users cached longer than maxAge (if they have a timestamp)
            if (userData.cachedAt && userData.cachedAt < cutoff) {
                this.userCache.delete(userId);
            }
        }
    }
}

module.exports = new UserManager();
