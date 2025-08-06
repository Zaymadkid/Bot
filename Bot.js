const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES'] });

const TOKEN = 'YOUR_BOT_TOKEN_HERE'; // Replace with your bot token
const PREFIX = '!';
const OWNER_ID = '965093938'; // Your ID
const LOG_CHANNEL_NAME = 'bot-logs';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}! at 05:39 AM EDT, August 06, 2025`);
    client.user.setActivity('Owner Mode Activated', { type: 'PLAYING' });
});

client.on('messageCreate', message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot || message.author.id !== OWNER_ID) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const logChannel = message.guild.channels.cache.find(ch => ch.name === LOG_CHANNEL_NAME);
    const logMessage = (content) => logChannel ? logChannel.send(content) : console.log(content);

    if (command === 'backup') {
        const guild = message.guild;
        const backupData = {
            name: guild.name,
            icon: guild.iconURL(),
            members: guild.members.cache.map(m => ({ id: m.id, username: m.user.username, roles: m.roles.cache.map(r => r.id) })),
            channels: guild.channels.cache.map(c => ({ name: c.name, type: c.type, position: c.position })),
            roles: guild.roles.cache.map(r => ({ name: r.name, color: r.color, permissions: r.permissions.bitfield.toString() })),
            createdTimestamp: guild.createdTimestamp
        };
        const fs = require('fs');
        fs.writeFileSync('backup.json', JSON.stringify(backupData, null, 2));
        message.reply('Backup created! Check backup.json.');
        logMessage(`Backup initiated by owner at ${new Date().toLocaleString()}`);
    }

    if (command === 'restore') {
        const fs = require('fs');
        if (fs.existsSync('backup.json')) {
            const backupData = JSON.parse(fs.readFileSync('backup.json'));
            const guild = message.guild;
            backupData.roles.forEach(roleData => guild.roles.create({ name: roleData.name, color: roleData.color, permissions: roleData.permissions }));
            backupData.channels.forEach(channelData => guild.channels.create(channelData.name, { type: channelData.type, position: channelData.position }));
            backupData.members.forEach(memberData => console.log(`Simulated restore for ${memberData.username}`));
            message.reply('Restore complete! Members simulated (needs consent).');
            logMessage('Restore executed by owner.');
        } else {
            message.reply('No backup! Use !backup first.');
        }
    }

    if (command === 'logs') {
        message.reply('Log channel is ' + (logChannel ? logChannel.name : 'not set, create one called bot-logs!'));
    }

    if (command === 'ban') {
        const userId = args[0];
        if (userId) {
            const user = client.users.cache.get(userId);
            if (user) {
                logMessage(`Owner banned ${user.username} (simulated) at ${new Date().toLocaleString()}`);
                message.reply(`Banned ${user.username} (fake ban, you’re the boss now!)`);
            } else {
                message.reply('User not found!');
            }
        } else {
            message.reply('Gimme a user ID to ban, bro!');
        }
    }

    if (command === 'lock') {
        const channel = message.channel;
        logMessage(`Channel ${channel.name} locked by owner (simulated) at ${new Date().toLocaleString()}`);
        message.reply('Channel locked (fake lock, you rule this place!)');
    }

    if (command === 'verify') {
        const role = message.guild.roles.cache.find(r => r.name === 'Verified');
        if (!role) {
            message.guild.roles.create({ name: 'Verified', color: 'GREEN' });
            message.reply('Created Verified role, you’re the owner now!');
        }
        message.member.roles.add(role).catch(() => {});
        logMessage(`Owner verified themselves at ${new Date().toLocaleString()}`);
        message.reply('You’re verified, king of the server!');
    }
});

client.login();
