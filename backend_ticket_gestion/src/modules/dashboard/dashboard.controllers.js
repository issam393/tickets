const dashboardService = require('./dashboard.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');

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

async function getManagerAnalytics(req, res) {
    try {
        const data = await dashboardService.getManagerAnalytics(req.query.period, {
            year: req.query.year,
            month: req.query.month,
            week: req.query.week,
            date: req.query.date
        });
        sendSuccess(res, 200, 'Manager analytics loaded successfully', data);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

module.exports = {
    getManagerDashboard,
    getSDDashboard,
    getManagerAnalytics
};
