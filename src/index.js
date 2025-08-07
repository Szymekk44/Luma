require('module-alias/register');
require('dotenv').config({ silent: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('@core/logger');
const { connectToGateway } = require('@core/gateway');

async function startup() {
    await mongoose.connect(process.env.MONGODB_URI, {
        autoIndex: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    logger.ok('Connected with MongoDB!');
    initialize();
}

function initialize() {
    const socket = connectToGateway(process.env.BOT_TOKEN);
    const commands = new Map();

    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        commands.set(command.name, command);
    }

    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        socket.on(event.name, (...args) => event.execute(socket, commands, ...args));
    }
    logger.ok('Bot started!');
}

startup();
