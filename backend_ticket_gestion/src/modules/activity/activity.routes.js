const express = require('express');
const auth = require('../../middleware/auth');
const { requireServiceDeliveryOrManager } = require('../../middleware/roleCheck');
const activityController = require('./activity.controllers');

const router = express.Router();

router.get('/recent', auth, requireServiceDeliveryOrManager, activityController.getRecentActivity);

module.exports = router;
