const ticketRepository = require('./tickets.repository');
const roomRepository = require('../rooms/rooms.repository');
const { validateCreateTicket } = require('./tickets.validation');
const { getAllowedRolesForTicket, canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');
const db = require('../../config/db');
const commentsRepository = require('../comments/comments.repository');

const VALID_STATUSES = ['Pending', 'In Progress', 'Warning', 'Critical', 'Resolved'];

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

function isServiceDeliveryTicket(ticket) {
    return String(ticket?.issue_level || '').trim().toLowerCase() === 'level 1 assistance';
}

function getAssignedService(ticket) {
    const allowedServices = ticket.allowed_services || [];
    if (isServiceDeliveryTicket(ticket)) return 'SD';
    if (allowedServices.includes('IT')) return 'IT';
    if (allowedServices.includes('PKI')) return 'PKI';
    if (ticket.status === 'Resolved' && allowedServices.length === 1 && allowedServices.includes('SD')) return 'SD';
    return null;
}

function normalizeAssignmentHistory(rows = []) {
    return rows.map((row) => ({
        id: row.id,
        ticketId: row.ticket_id,
        previousService: row.previous_service,
        newService: row.new_service,
        assignedBy: row.assigned_by,
        assignedByName: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.userName,
        assignedByUsername: row.userName,
        assignerService: row.assigner_service,
        assignedAt: row.assigned_at
    }));
}

async function createTicket(userId, payload) {
    validateCreateTicket(payload);

    const requestCode = payload.requestId || buildRequestCode();
    const ticketId = await ticketRepository.createTicket({
        requestCode,
        clientId: payload.clientId,
        organization_id: payload.organization_id,
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
        .map((ticket) => ({
            ...ticket,
            assigned_service: getAssignedService(ticket)
        }))
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

    const assignmentHistory = service === 'Manager'
        ? await ticketRepository.getAssignmentHistoryByTicketId(ticketId)
        : [];

    return {
        ...ticket,
        assigned_service: getAssignedService(ticket),
        ...(service === 'Manager' ? { assignment_history: normalizeAssignmentHistory(assignmentHistory) } : {})
    };
}

async function assignTicket(ticketId, team, assignedBy) {
    if (team !== 'IT' && team !== 'PKI') {
        throw new Error('Invalid team assignment. Allowed teams are IT or PKI.');
    }

    const existing = normalizeTicketRow(await ticketRepository.getTicketById(ticketId));
    if (!existing) {
        throw new Error('Ticket not found');
    }
    if (isServiceDeliveryTicket(existing)) {
        throw new Error('Level 1 Assistance tickets are handled by Service Delivery and cannot be assigned.');
    }
    if (existing.status === 'Resolved') {
        throw new Error('Ticket already resolved. It is permanently locked.');
    }

    const previousService = getAssignedService(existing);
    
    const allowedServices = ['SD', team];
    await db.execute(
        `UPDATE rooms SET allowed_services = ? WHERE ticket_id = ?`,
        [JSON.stringify(allowedServices), ticketId]
    );

    await ticketRepository.createAssignmentHistory({
        ticketId,
        previousService,
        newService: team,
        assignedBy
    });

    return getTicketById(ticketId, 'SD');
}

async function updateTicketStatus(ticketId, status) {
    if (status === 'Open' || status === 'Opened') {
        throw new Error('Invalid status value');
    }

    if (status === 'Resolved') {
        throw new Error('A resolution comment is required to resolve a ticket.');
    }

    if (!VALID_STATUSES.includes(status)) {
        throw new Error('Invalid status value');
    }

    const existing = normalizeTicketRow(await ticketRepository.getTicketById(ticketId));
    if (!existing) {
        throw new Error('Ticket not found');
    }
    if (existing.status === 'Resolved') {
        throw new Error('Impossible to reopen or modify a resolved ticket.');
    }
    
    await db.execute(
        `UPDATE tickets SET status = ? WHERE id = ?`,
        [status, ticketId]
    );

    return getTicketById(ticketId, 'SD');
}

async function resolveTicket(ticketId, commentId, resolvedBy, service) {
    if (!commentId) {
        throw new Error('A comment must be selected as the resolution.');
    }

    const existing = normalizeTicketRow(await ticketRepository.getTicketById(ticketId));
    if (!existing) {
        throw new Error('Ticket not found');
    }
    if (existing.status === 'Resolved') {
        throw new Error('Ticket already resolved. It is permanently locked.');
    }

    const selectedComment = await commentsRepository.getCommentById(commentId);
    if (!selectedComment || Number(selectedComment.ticket_id) !== Number(ticketId)) {
        throw new Error('Selected resolution comment does not belong to this ticket.');
    }

    await db.execute(
        `UPDATE tickets
         SET status = 'Resolved', resolution = ?, resolution_comment_id = ?
         WHERE id = ?`,
        [selectedComment.text, selectedComment.id, ticketId]
    );

    return getTicketById(ticketId, service);
}

async function getAssignmentHistory(ticketId, service) {
    await getTicketById(ticketId, service);
    const rows = await ticketRepository.getAssignmentHistoryForApi(ticketId);
    return normalizeAssignmentHistory(rows);
}

module.exports = {
    createTicket,
    listTickets,
    getTicketById,
    assignTicket,
    updateTicketStatus,
    resolveTicket,
    getAssignmentHistory,
    getNextRequestCode
};
