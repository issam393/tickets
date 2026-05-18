function validateLogin(userData) {
    const { username, password } = userData;
    
    if (!username || !password) {
        throw new Error("Username and password are required");
    }
    
    return true;
}

module.exports = {
    validateLogin,
};