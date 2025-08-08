const config = require('@/config.js');

async function kick(data) {
    let response = await fetch(`${config.path}/guilds/${data.guild}/members/${data.user.id}`, {
        method: 'DELETE',
        headers: config.defaultHeadersNoContent,
    });
    return response;
}

module.exports = kick;
