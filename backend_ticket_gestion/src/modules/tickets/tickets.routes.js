const express = require('express');
const auth = require('../../middleware/auth');
const ticketController = require('./tickets.controllers');

const router = express.Router();

router.post('/', auth, ticketController.createTicket);
router.get('/', auth, ticketController.listTickets);
router.get('/:ticketId', auth, ticketController.getTicket);
router.put('/:ticketId/assign', auth, ticketController.assignTicket);
router.put('/:ticketId/status', auth, ticketController.updateTicketStatus);

module.exports = router;
