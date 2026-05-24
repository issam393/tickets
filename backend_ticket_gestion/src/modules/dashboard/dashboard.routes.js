const express = require('express');
const auth = require('../../middleware/auth');
const { requireManager, requireServiceDelivery } = require('../../middleware/roleCheck');
const dashboardController = require('./dashboard.controllers');

const router = express.Router();

router.get('/manager', auth, requireManager, dashboardController.getManagerDashboard);
router.get('/manager/analytics', auth, requireManager, dashboardController.getManagerAnalytics);
router.get('/sd', auth, requireServiceDelivery, dashboardController.getSDDashboard);

module.exports = router;
