module.exports = {
    prefix: '/',
    botName: 'LumaBot',
    path: 'https://zyntra.gg/api/v1',
    defaultHeaders: {
        Authorization: `${process.env.BOT_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LumaBot/1.0 (+https://szymekk.pl/luma)',
    },
    defaultHeadersNoContent: {
        Authorization: `${process.env.BOT_TOKEN}`,
        'User-Agent': 'LumaBot/1.0 (+https://szymekk.pl/luma)',
    },
};
