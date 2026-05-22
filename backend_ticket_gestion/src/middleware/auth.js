const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../utils/blacklist');
const { sendError } = require('../utils/apiResponse');
const dotenv = require("dotenv");


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET ;

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
   
    
    if (!token) {
        return sendError(res, 401, "Access token required");
    }
    
    if (isBlacklisted(token)) {
        return sendError(res, 401, "Token invalidated. Please login again.");
    }
 
    jwt.verify(token, JWT_SECRET, (err, user) => {

        if (err) {
            return sendError(res, 403, "Invalid or expired token");
        }
        req.user = user;
        next();
    });
};

module.exports = auth;
