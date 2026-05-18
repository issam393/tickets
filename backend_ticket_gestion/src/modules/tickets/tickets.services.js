const ticketRepository = require('./tickets.repository');
const roomRepository = require('../rooms/rooms.repository');
const { validateCreateTicket } = require('./tickets.validation');
const { getAllowedRolesForTicket, canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');

function buildRequestCode() {
    const now = new Date();
    const year = now.getFullYear();
    const randomChunk = Math.floor(1000 + Math.random() * 9000);
    return `REQ-${year}-${randomChunk}`;
}

function normalizeTicketRow(ticket) {
    if (!ticket) return null;

    return {
        ...ticket,
        allowed_roles: parseAllowedRoles(ticket.allowed_roles)
    };
}

async function createTicket(userId, payload) {
    validateCreateTicket(payload);

    const requestCode = payload.requestId || buildRequestCode();
    const ticketId = await ticketRepository.createTicket({
        requestCode,
        clientId: payload.clientId,
        application: payload.application,
        issueType: payload.issueType,
        issueLevel: payload.issueLevel,
        issueDescription: payload.issueDescription,
        createdBy: userId
    });

    const allowedRoles = getAllowedRolesForTicket(payload.issueLevel, payload.issueType);
    const roomName = `${payload.issueType} · ${payload.issueLevel} · ${requestCode}`;

    const roomId = await roomRepository.createRoom({
        ticketId,
        name: roomName,
        roomType: payload.issueType,
        severity: payload.issueLevel,
        allowedRoles
    });

    const ticket = await ticketRepository.getTicketById(ticketId);

    return {
        ...normalizeTicketRow(ticket),
        room_id: roomId
    };
}

async function listTickets(role) {
    const tickets = await ticketRepository.getTicketsByRole();
    return tickets
        .map(normalizeTicketRow)
        .filter((ticket) => canRoleAccessRoom(role, ticket.allowed_roles));
}

async function getTicketById(ticketId, role) {
    const ticket = normalizeTicketRow(await ticketRepository.getTicketById(ticketId));

    if (!ticket) {
        throw new Error('Ticket not found');
    }

    if (ticket.allowed_roles && !canRoleAccessRoom(role, ticket.allowed_roles)) {
        throw new Error('Access denied');
    }

    return ticket;
}

module.exports = {
    createTicket,
    listTickets,
    getTicketById
};
