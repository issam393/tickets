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
        allowed_services: parseAllowedRoles(ticket.allowed_services)
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

    const allowedServices = getAllowedRolesForTicket(payload.issueLevel, payload.issueType);
    const roomName = `${payload.issueType} · ${payload.issueLevel} · ${requestCode}`;

    const roomId = await roomRepository.createRoom({
        ticketId,
        name: roomName,
        roomType: payload.issueType,
        allowedServices
    });

    const ticket = await ticketRepository.getTicketById(ticketId);

    return {
        ...normalizeTicketRow(ticket),
        room_id: roomId
    };
}

async function listTickets(service) {
    const tickets = await ticketRepository.getTicketsByRole();
    return tickets
        .map(normalizeTicketRow)
        .filter((ticket) => canRoleAccessRoom(service, ticket.allowed_services));
}

async function getTicketById(ticketId, service) {
    const ticket = normalizeTicketRow(await ticketRepository.getTicketById(ticketId));

    if (!ticket) {
        throw new Error('Ticket not found');
    }

    if (ticket.allowed_services && !canRoleAccessRoom(service, ticket.allowed_services)) {
        throw new Error('Access denied');
    }

    return ticket;
}

module.exports = {
    createTicket,
    listTickets,
    getTicketById
};