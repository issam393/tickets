const express = require('express');
const auth = require('../../middleware/auth');
const {
    requireServiceDelivery,
    requireServiceDeliveryOrManager,
    requireTicketAccess,
    blockResolvedTicket,
} = require('../../middleware/roleCheck');
const ticketRepository = require('./tickets.repository');
const ticketController = require('./tickets.controllers');

const router = express.Router();

// Create ticket – Service Delivery only
router.post('/', auth, requireServiceDelivery, ticketController.createTicket);

// List tickets – SD/Manager see all, PKI/IT filtered in controller
router.get('/', auth, ticketController.listTickets);

// Next request code – Service Delivery only
router.get('/next-request-code', auth, requireServiceDelivery, ticketController.getNextRequestCode);

// Get single ticket – check access first
router.get(
    '/:ticketId',
    auth,
    requireTicketAccess(ticketRepository),
    ticketController.getTicket
);

// Assign ticket – Service Delivery only, ticket must not be resolved
router.put(
    '/:ticketId/assign',
    auth,
    requireServiceDelivery,
    requireTicketAccess(ticketRepository),
    blockResolvedTicket(),
    ticketController.assignTicket
);

// Update ticket status – Service Delivery only, ticket must not be resolved
router.put(
    '/:ticketId/status',
    auth,
    requireServiceDelivery,
    requireTicketAccess(ticketRepository),
    blockResolvedTicket(),
    ticketController.updateTicketStatus
);


module.exports = router;