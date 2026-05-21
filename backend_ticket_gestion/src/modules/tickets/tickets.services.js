const ticketRepository = require('./tickets.repository');
const roomRepository = require('../rooms/rooms.repository');
const { validateCreateTicket } = require('./tickets.validation');
const { getAllowedRolesForTicket, canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');
const db = require('../../config/db');

async function getNextRequestCode() {
    const year = new Date().getFullYear();
    const count = await ticketRepository.getTicketCountForYear(year);
    const seq = String(Number(count) + 1).padStart(4, '0');
    return `REQ-${year}-${seq}`;
}

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

async function assignTicket(ticketId, team) {
    if (team !== 'IT' && team !== 'PKI') {
        throw new Error('Invalid team assignment. Allowed teams are IT or PKI.');
    }
    
    const allowedServices = ['ADMIN', team];
    await db.execute(
        `UPDATE rooms SET allowed_services = ? WHERE ticket_id = ?`,
        [JSON.stringify(allowedServices), ticketId]
    );
    
    return normalizeTicketRow(await ticketRepository.getTicketById(ticketId));
}

async function updateTicketStatus(ticketId, status) {
    const VALID_STATUSES = ['Pending', 'Resolved', 'Critical', 'Warning'];
    if (!VALID_STATUSES.includes(status)) {
        throw new Error('Invalid status value');
    }
    
    await db.execute(
        `UPDATE tickets SET status = ? WHERE id = ?`,
        [status, ticketId]
    );
    
    return normalizeTicketRow(await ticketRepository.getTicketById(ticketId));
}

module.exports = {
    createTicket,
    listTickets,
    getTicketById,
    assignTicket,
    updateTicketStatus,
    getNextRequestCode
};