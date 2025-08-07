const chalk = require('chalk');

const labelColors = {
    info: chalk.blueBright,
    warn: chalk.yellowBright,
    error: chalk.redBright,
    ok: chalk.greenBright,
    debug: chalk.magentaBright,
};

function timestamp() {
    return chalk.gray(`[${new Date().toISOString()}]`);
}

function log(level, ...args) {
    const colorFn = labelColors[level] || chalk.whiteBright;
    const tag = (level || 'log').toUpperCase().padEnd(5);
    const coloredTag = colorFn(`[${tag}]`);
    console.log(`${timestamp()} ${coloredTag}`, ...args);
}

const logger = {
    info: (...args) => log('info', ...args),
    warn: (...args) => log('warn', ...args),
    error: (...args) => log('error', ...args),
    ok: (...args) => log('ok', ...args),
    debug: (...args) => log('debug', ...args),
};

module.exports = logger;
