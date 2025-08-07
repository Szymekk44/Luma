const mongoose = require('mongoose');

const botConfig = new mongoose.Schema(
    {
        prefix: { type: String, required: true, default: '/' },
    },
    { _id: false },
);

const welcomeConfig = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: false },
        channel: { type: String },
        title: { type: String, default: 'Welcome, {member}!' },
        description: { type: String, default: 'Welcome to my server!' },
        author: { type: String, default: 'Luma' },
        color: { type: String, default: '#00db84' },
    },
    { _id: false },
);

const autoroleConfig = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: false },
        role: { type: String },
    },
    { _id: false },
);

const guildSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true, index: true },
        botConfig: { type: botConfig, default: () => ({}) },
        welcomeConfig: { type: welcomeConfig, default: () => ({}) },
        autoroleConfig: { type: autoroleConfig, default: () => ({}) },
    },
    {
        versionKey: false,
    },
);

const guild = mongoose.model('guild', guildSchema);

module.exports = guild;
