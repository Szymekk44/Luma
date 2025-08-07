const { io } = require('socket.io-client');
const { setStatus } = require('@api/status');
const logger = require('@core/logger');

function connectToGateway(token) {
    const socket = io('https://zyntra.gg', {
        path: '/ws/',
        transports: ['websocket'],
        extraHeaders: {
            'User-Agent': 'LumaBot/1.0 (+https://szymekk.pl)',
        },
    });

    socket.on('connect', () => {
        socket.emit('join', { token });
    });

    socket.on('welcome', (data) => {
        logger.ok('Authentication successful!');
        logger.info('Server version:', data.version);
        logger.info('Connected to instance:', data.instance);
    });

    socket.on('connect_error', (err) => {
        console.error('Gateway error: ', err.message);
    });
    setStatus(1);
    return socket;
}

module.exports = { connectToGateway };
