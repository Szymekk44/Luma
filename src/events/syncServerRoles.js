const rolesManager = require('@core/rolesManager');
const logger = require('@core/logger');

module.exports = {
    name: 'syncServerRoles',
    async execute(socket, commands, data) {
        if (data.reason === 'role-update') {
            if (data.serverId && data.syncData) {
                const updated = rolesManager.updateSingleRole(data.serverId, data.syncData);

                if (updated) {
                    logger.debug(
                        `Updated role "${data.syncData.name}" (${data.syncData.id}) in cache for guild ${data.serverId}`,
                    );
                } else {
                    logger.debug(`Guild ${data.serverId} roles not cached yet, skipping role update`);
                }
            } else if (data.serverId) {
                rolesManager.clearRolesCache(data.serverId);
                logger.debug(`Cleared guild roles cache for guild ${data.serverId} (role updated - no syncData)`);
            }
        }
    },
};
