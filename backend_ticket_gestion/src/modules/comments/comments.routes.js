const express = require('express');
const auth = require('../../middleware/auth');
const { requireTicketAccess, blockResolvedTicket } = require('../../middleware/roleCheck');
const ticketRepository = require('../tickets/tickets.repository');
const commentsController = require('./comments.controllers');

const router = express.Router({ mergeParams: true });

// List comments – must have ticket access (resolved tickets are visible, just read-only)
router.get(
    '/:ticketId/comments',
    auth,
    requireTicketAccess(ticketRepository),
    commentsController.listComments
);

// Add comment – must have ticket access + ticket must not be resolved
router.post(
    '/:ticketId/comments',
    auth,
    requireTicketAccess(ticketRepository),
    blockResolvedTicket(),
    commentsController.addComment
);

module.exports = router;