const authService = require("./auth.services");

async function login(req, res) {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

async function logout(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ error: "Token required" });
        }
        const result = await authService.logout(token);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {  login , logout};