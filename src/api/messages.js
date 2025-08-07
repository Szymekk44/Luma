require('dotenv').config();
const config = require('@/config.js');

async function sendMessage(channelId, data) {
    const res = await fetch(`${config.path}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: config.defaultHeaders,
        body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok) {
        console.error('Failed to send message:', res.status);
    }

    return result;
}

module.exports = { sendMessage };
