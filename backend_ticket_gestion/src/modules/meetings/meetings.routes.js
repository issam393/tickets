const express = require('express');
const auth = require('../../middleware/auth');
const { requireServiceDelivery, requireServiceDeliveryOrManager } = require('../../middleware/roleCheck');
const meetingController = require('./meetings.controllers');

const router = express.Router();

// Read – SD and Manager (PKI/IT filtered in controller by ticket access)
router.get('/meta', auth, meetingController.getMeetingMeta);
router.get('/', auth, meetingController.listMeetings);
router.get('/:meetingId', auth, meetingController.getMeeting);

// Write – Service Delivery only
router.post('/', auth, requireServiceDelivery, meetingController.createMeeting);
router.put('/:meetingId', auth, requireServiceDelivery, meetingController.updateMeeting);
router.delete('/:meetingId', auth, requireServiceDelivery, meetingController.deleteMeeting);

module.exports = router;