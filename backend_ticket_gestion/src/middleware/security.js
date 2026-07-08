const rateLimit = require('express-rate-limit');
const { optionalEnv } = require('../config/env');

function parseNumberEnv(name, fallback) {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function parseAllowedOrigins() {
    return optionalEnv('FRONTEND_URL', 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}

const corsOptions = {
    origin(origin, callback) {
        const allowedOrigins = parseAllowedOrigins();
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
};

const globalLimiter = rateLimit({
    windowMs: parseNumberEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    limit: parseNumberEnv('RATE_LIMIT_MAX_REQUESTS', 300),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
});

const loginLimiter = rateLimit({
    windowMs: parseNumberEnv('LOGIN_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    limit: parseNumberEnv('LOGIN_RATE_LIMIT_MAX_REQUESTS', 10),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.'
    }
});

module.exports = {
    corsOptions,
    globalLimiter,
    loginLimiter,
    parseAllowedOrigins
};
