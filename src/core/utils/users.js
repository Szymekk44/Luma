function extractUserIdFromPing(mention) {
    const match = mention.match(/^<@!?(\d+)>$/);
    return match ? match[1] : null;
}

module.exports = { extractUserIdFromPing };
