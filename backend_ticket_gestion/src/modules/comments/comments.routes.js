const express = require('express');
const auth = require('../../middleware/auth');
const {
    requireTicketAccess,
    blockResolvedTicket,
    roleCheck,
    requireServiceDeliveryOrManagerOrSupport,
} = require('../../middleware/roleCheck');
const ticketRepository = require('../tickets/tickets.repository');
const commentsController = require('./comments.controllers');

const router = express.Router({ mergeParams: true });

// List comments – must have ticket access (resolved tickets are visible, just read-only)
router.get(
    '/tickets/:ticketId/comments',
    auth,
    requireServiceDeliveryOrManagerOrSupport,
    requireTicketAccess(ticketRepository),
    commentsController.listComments
);

// Add comment – must have ticket access + ticket must not be resolved
router.post(
    '/tickets/:ticketId/comments',
    auth,
    roleCheck(['SD', 'PKI', 'IT']),
    requireTicketAccess(ticketRepository),
    blockResolvedTicket(),
    commentsController.addComment
);

// Legacy aliases kept for older frontend calls.
router.get(
    '/:ticketId/comments',
    auth,
    requireServiceDeliveryOrManagerOrSupport,
    requireTicketAccess(ticketRepository),
    commentsController.listComments
);

router.post(
    '/:ticketId/comments',
    auth,
    roleCheck(['SD', 'PKI', 'IT']),
    requireTicketAccess(ticketRepository),
    blockResolvedTicket(),
    commentsController.addComment
);

module.exports = router;
