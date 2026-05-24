const express = require('express');
const auth = require('../../middleware/auth');
const roomController = require('./rooms.controllers');

const router = express.Router();

router.get('/', auth, roomController.listRooms);
router.get('/by-ticket/:ticketId', auth, roomController.getRoomByTicket);
router.get('/:roomId/messages', auth, roomController.getRoomHistory);
router.patch('/:roomId/read', auth, roomController.markRoomAsRead);

module.exports = router;
