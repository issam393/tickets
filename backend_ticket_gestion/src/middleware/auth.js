const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../utils/blacklist');
const { sendError } = require('../utils/apiResponse');
const authRepository = require('../modules/auth/auth.repository');
const { INACTIVE_ACCOUNT_MESSAGE } = require('../modules/auth/auth.services');
const dotenv = require("dotenv");
const { requireEnv } = require('../config/env');


dotenv.config();
const JWT_SECRET = requireEnv('JWT_SECRET');

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
   
    
    if (!token) {
        return sendError(res, 401, "Access token required");
    }
    
    if (isBlacklisted(token)) {
        return sendError(res, 401, "Token invalidated. Please login again.");
    }
 
    let user;
    try {
        user = jwt.verify(token, JWT_SECRET);
    } catch {
        return sendError(res, 403, "Invalid or expired token");
    }

    try {
        const employee = await authRepository.getUserAccessById(user.id);
        if (!employee) {
            return sendError(res, 401, "User account no longer exists. Please login again.");
        }
        if (String(employee.status || '').trim().toLowerCase() !== 'active') {
            return sendError(res, 403, INACTIVE_ACCOUNT_MESSAGE);
        }

        req.user = { ...user, service: employee.service_name };
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = auth;
