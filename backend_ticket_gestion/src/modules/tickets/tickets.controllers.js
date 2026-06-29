const ticketService = require('./tickets.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');

async function createTicket(req, res) {
    try {
        const result = await ticketService.createTicket(req.user.id, req.body);
        sendSuccess(res, 201, 'Ticket created successfully with status Pending', result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

async function listTickets(req, res) {
    try {
        const result = await ticketService.listTickets(req.user.service);
        sendSuccess(res, 200, 'Tickets loaded successfully', result);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function getTicket(req, res) {
    try {
        const result = await ticketService.getTicketById(req.params.ticketId, req.user.service);
        sendSuccess(res, 200, 'Ticket loaded successfully', result);
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        sendError(res, status, error.message);
    }
}

async function assignTicket(req, res) {
    try {
        const { team } = req.body;
        const result = await ticketService.assignTicket(req.params.ticketId, team, req.user.id);
        sendSuccess(res, 200, `Ticket assigned successfully to ${team}`, result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

async function updateTicketStatus(req, res) {
    try {
        const { status } = req.body;
        const result = await ticketService.updateTicketStatus(req.params.ticketId, status);
        sendSuccess(res, 200, 'Ticket status updated successfully', result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

async function resolveTicket(req, res) {
    try {
        const result = await ticketService.resolveTicket(
            req.params.ticketId,
            req.body.commentId,
            req.user.id,
            req.user.service
        );
        sendSuccess(res, 200, 'Resolution comment approved. Ticket resolved successfully', result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

async function getNextRequestCode(req, res) {
    try {
        const requestCode = await ticketService.getNextRequestCode();
        sendSuccess(res, 200, 'Next request code generated', requestCode);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function getAssignmentHistory(req, res) {
    try {
        const result = await ticketService.getAssignmentHistory(req.params.ticketId, req.user.service);
        sendSuccess(res, 200, 'Assignment history loaded successfully', result);
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        sendError(res, status, error.message);
    }
}

module.exports = {
    createTicket,
    listTickets,
    getTicket,
    assignTicket,
    updateTicketStatus,
    resolveTicket,
    getAssignmentHistory,
    getNextRequestCode
};
