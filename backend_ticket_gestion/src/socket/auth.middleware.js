const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { isBlacklisted } = require('../utils/blacklist');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';

function socketAuthMiddleware(socket, next) {
    try {
        const rawToken = socket.handshake?.auth?.token;

        if (!rawToken) {
            return next(new Error('Authentication token is required'));
        }

        const token = rawToken.startsWith('Bearer ')
            ? rawToken.split(' ')[1]
            : rawToken;

        if (isBlacklisted(token)) {
            return next(new Error('Token invalidated. Please login again.'));
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        socket.user = {
            id: decoded.id,
            service: decoded.service,
            username: decoded.username
        };

        next();
    } catch (error) {
        next(new Error('Invalid or expired token'));
    }
}

module.exports = socketAuthMiddleware;