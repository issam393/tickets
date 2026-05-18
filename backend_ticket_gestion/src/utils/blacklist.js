// Simple in-memory blacklist (for development)
// For production, use Redis or database

const blacklistedTokens = new Set();

function addToBlacklist(token) {
    blacklistedTokens.add(token);
}

function isBlacklisted(token) {
    return blacklistedTokens.has(token);
}

module.exports = { addToBlacklist, isBlacklisted };