const { sendMessage } = require('../api/messages.js');

module.exports = {
    name: 'ping',
    description: 'Pong!',
    async execute(data, args, socket) {
        const channelId = data.channel;
        const content = `🏓 Pong!`;
        await sendMessage(channelId, { content });
    },
};
