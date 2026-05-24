const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { isBlacklisted } = require('../utils/blacklist');
const authRepository = require('../modules/auth/auth.repository');
const { INACTIVE_ACCOUNT_MESSAGE } = require('../modules/auth/auth.services');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ;

async function socketAuthMiddleware(socket, next) {
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
        const employee = await authRepository.getUserAccessById(decoded.id);

        if (!employee) {
            return next(new Error('User account no longer exists. Please login again.'));
        }

        if (String(employee.status || '').trim().toLowerCase() !== 'active') {
            return next(new Error(INACTIVE_ACCOUNT_MESSAGE));
        }

        socket.user = {
            id: decoded.id,
            service: employee.service_name,
            username: decoded.username
        };

        next();
    } catch (error) {
        next(new Error(error.message === INACTIVE_ACCOUNT_MESSAGE ? error.message : 'Invalid or expired token'));
    }
}

module.exports = socketAuthMiddleware;
