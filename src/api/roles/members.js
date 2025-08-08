const config = require('@/config.js');

async function assignRole(data) {
    const response = await fetch(`${config.path}/guilds/${data.guild}/members/${data.user.id}/roles/${data.role}`, {
        method: 'PUT',
        headers: config.defaultHeadersNoContent,
    });

    if (!response.ok) {
        let result = await response.json();
        throw new Error(`Failed to assign role: ${response.statusText} - ${result.message || 'Unknown error'}`);
    }
}

module.exports = { assignRole };
