function requireEnv(name) {
    const value = String(process.env[name] || '').trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function optionalEnv(name, fallback = '') {
    const value = String(process.env[name] || '').trim();
    return value || fallback;
}

module.exports = {
    requireEnv,
    optionalEnv
};
