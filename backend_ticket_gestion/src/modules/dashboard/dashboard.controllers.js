const dashboardService = require('./dashboard.services');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getManagerDashboard(req, res) {
    try {
        const data = await dashboardService.getManagerDashboard(req.user);
        sendSuccess(res, 200, 'Manager dashboard loaded successfully', data);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function getSDDashboard(req, res) {
    try {
        const data = await dashboardService.getSDDashboard(req.user);
        sendSuccess(res, 200, 'Service Delivery dashboard loaded successfully', data);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

module.exports = {
    getManagerDashboard,
    getSDDashboard
};
