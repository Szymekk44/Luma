require('dotenv').config();
const config = require('@/config.js');

async function setStatus(status) {
    await fetch(`${config.path}/updatePresence`, {
        method: 'POST',
        headers: config.defaultHeaders,
        body: JSON.stringify({ status }),
    });
}

module.exports = { setStatus };
