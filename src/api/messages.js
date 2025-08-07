const logger = require('@core/logger');
const config = require('@/config.js');

async function sendMessage(channelId, data) {
    const res = await fetch(`${config.path}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: config.defaultHeaders,
        body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok) {
        logger.error(`Failed to send message: ${res.status} - ${result.error}`);
    }

    return result;
}

module.exports = { sendMessage };
