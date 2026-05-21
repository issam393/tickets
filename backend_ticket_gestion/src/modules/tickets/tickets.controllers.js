const ticketService = require('./tickets.services');

async function createTicket(req, res) {
    try {
        const result = await ticketService.createTicket(req.user.id, req.body);
        res.status(201).json({ message: 'Ticket created', data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function listTickets(req, res) {
    try {
        const result = await ticketService.listTickets(req.user.service);
        res.status(200).json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getTicket(req, res) {
    try {
        const result = await ticketService.getTicketById(req.params.ticketId, req.user.service);
        res.status(200).json({ data: result });
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        res.status(status).json({ error: error.message });
    }
}

async function assignTicket(req, res) {
    try {
        const { team } = req.body;
        const result = await ticketService.assignTicket(req.params.ticketId, team);
        res.status(200).json({ message: 'Ticket assigned successfully', data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function updateTicketStatus(req, res) {
    try {
        const { status } = req.body;
        const result = await ticketService.updateTicketStatus(req.params.ticketId, status);
        res.status(200).json({ message: 'Ticket status updated successfully', data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createTicket,
    listTickets,
    getTicket,
    assignTicket,
    updateTicketStatus
};