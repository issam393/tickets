const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const { addToBlacklist } = require('../../utils/blacklist');
dotenv.config();

const authRepository = require('./auth.repository');
const { validateLogin } = require('./auth.validation');

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';


async function login(userData) {
    validateLogin(userData);
    
    const { username, password } = userData;
    
    const user = await authRepository.getUserByUsername(username);
    if (!user) {
        throw new Error('Invalid credential');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credential');
    }
    
   
    const token = jwt.sign(
        { id: user.id, username: user.userName, service: user.service_name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    return { 
        message: "Login successful", 
        userId: user.id,
        username: user.userName,
        token: token  
    };
}

async function logout(token) {
    addToBlacklist(token);
    return { message: "Logout successful" };
}

module.exports = {

    login,
    logout
};
