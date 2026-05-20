const roleCheck = (allowedServices) => {
    return (req, res, next) => {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        if (!allowedServices.includes(user.service)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        next();
    };
};

module.exports = roleCheck;