const express = require('express');
const auth = require('../../middleware/auth');
const meetingController = require('./meetings.controllers');

const router = express.Router();

router.get('/meta', auth, meetingController.getMeetingMeta);
router.get('/', auth, meetingController.listMeetings);
router.get('/:meetingId', auth, meetingController.getMeeting);
router.post('/', auth, meetingController.createMeeting);
router.put('/:meetingId', auth, meetingController.updateMeeting);
router.delete('/:meetingId', auth, meetingController.deleteMeeting);

module.exports = router;
