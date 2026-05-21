const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../utils/blacklist');
const dotenv = require("dotenv");


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET ;

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
   
    
    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }
    
    if (isBlacklisted(token)) {
        return res.status(401).json({ error: "Token invalidated. Please login again." });
    }
 
    jwt.verify(token, JWT_SECRET, (err, user) => {

        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

module.exports = auth;