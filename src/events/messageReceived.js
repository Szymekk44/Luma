const config = require('@/config.js');
const guildCache = require('@core/guildCache');
const userManager = require('@core/userManager');
const logger = require('@core/logger');

const cooldown = 1000; // cooldown in MS
const maxCommandsPerMinute = 20;
const userCooldowns = new Map();
const userCommandHistory = new Map(); // userId -> array of timestamps

module.exports = {
    name: 'messageReceived',
    async execute(socket, commands, data) {
        const content = data.content?.trim();
        if (!content) return;

        const guildId = data.guild;
        let prefix = config.prefix;

        if (guildId) {
            prefix = await guildCache.getGuildPrefix(guildId);
        }

        if (!content.startsWith(prefix)) return;

        const args = content.slice(prefix.length).split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (!command) return;

        const userId = data.user.id;
        const now = Date.now();

        // 1. Check 1-second cooldown
        const cooldownEnd = userCooldowns.get(userId);
        if (cooldownEnd && now < cooldownEnd) {
            return;
        }

        // 2. Check commands per minute limit
        if (!userCommandHistory.has(userId)) {
            userCommandHistory.set(userId, []);
        }

        const userHistory = userCommandHistory.get(userId);
        const oneMinuteAgo = now - 60000; // 60 seconds ago

        // Filter out commands older than 1 minute
        const recentCommands = userHistory.filter((timestamp) => timestamp > oneMinuteAgo);

        if (recentCommands.length >= maxCommandsPerMinute) {
            return; // User has exceeded rate limit
        }

        // Update history with current command
        recentCommands.push(now);
        userCommandHistory.set(userId, recentCommands);

        // Set 1-second cooldown
        userCooldowns.set(userId, now + cooldown);

        // Cleanup when maps get too large
        if (userCooldowns.size > 1000) {
            const cutoff = now - cooldown;
            for (const [id, timestamp] of userCooldowns.entries()) {
                if (timestamp < cutoff) {
                    userCooldowns.delete(id);
                }
            }
        }

        if (userCommandHistory.size > 1000) {
            const cutoff = now - 60000;
            for (const [id, timestamps] of userCommandHistory.entries()) {
                const recentTimestamps = timestamps.filter((t) => t > cutoff);
                if (recentTimestamps.length === 0) {
                    userCommandHistory.delete(id);
                } else {
                    userCommandHistory.set(id, recentTimestamps);
                }
            }
        }

        // Cleanup user cache when it gets too large
        if (userManager.userCache.size > 500) {
            userManager.cleanupCache(300000); // 5 minutes
        }

        try {
            // Cache user data from WebSocket event (more reliable than API)
            userManager.cacheUserFromEvent(data.user);

            await command.execute(data, args, socket);
        } catch (error) {
            logger.error(`Command ${commandName} failed:`, error.message);
        }
    },
};
