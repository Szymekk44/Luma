const helpEmbed = require('@core/helpEmbed');

module.exports = {
    name: 'help',
    description: 'Shows available commands',
    async execute(data, args, socket) {
        const commands = [
            { name: 'autorole', description: 'Configure automatic role assignment for new members' },
            { name: 'help', description: 'Show all available bot commands' },
            { name: 'perms', description: "View a user's permissions in the server" },
            { name: 'prefix', description: 'Change the command prefix for this server' },
            { name: 'welcome', description: 'Set up a custom welcome message for new members' },
        ];

        helpEmbed(data, commands);
    },
};
