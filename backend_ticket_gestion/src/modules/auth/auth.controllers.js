const authService = require("./auth.services");
const { sendError } = require('../../utils/apiResponse');

async function login(req, res) {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        const status = error.message === authService.INACTIVE_ACCOUNT_MESSAGE ? 403 : 401;
        sendError(res, status, error.message);
    }
}

async function logout(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return sendError(res, 400, "Token required");
        }
        const result = await authService.logout(token);
        res.status(200).json({ success: true, message: result.message || 'Logout successful' });
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

module.exports = {  login , logout};
