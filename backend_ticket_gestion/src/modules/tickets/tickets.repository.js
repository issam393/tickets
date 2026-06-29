const db = require('../../config/db');

async function createTicket(data) {
    const { requestCode, clientId, organization_id, application, issueType, issueLevel, issueDescription, resolution, createdBy } = data;

    const [result] = await db.execute(
        `INSERT INTO tickets (
            request_code, client_id, organization_id, application, issue_type, issue_level, issue_description, resolution, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [requestCode, clientId || null, organization_id || null, application, issueType, issueLevel, issueDescription, resolution || null, createdBy]
    );

    return result.insertId;
}

async function getTicketById(ticketId) {
    const [rows] = await db.execute(
        `SELECT
            t.*,
            e.userName AS created_by_username,
            c.name AS client_name,
            c.email AS client_email,
            o.name AS organization_name,
            r.id AS room_id,
            r.name AS room_name,
            r.allowed_services
         FROM tickets t
         LEFT JOIN employees e ON e.id = t.created_by
         LEFT JOIN contacts c ON c.id = t.client_id
         LEFT JOIN organizations o ON o.id = t.organization_id
         LEFT JOIN rooms r ON r.ticket_id = t.id
         WHERE t.id = ?`,
        [ticketId]
    );

    return rows[0];
}

async function createAssignmentHistory(data) {
    const { ticketId, previousService, newService, assignedBy } = data;
    const [result] = await db.execute(
        `INSERT INTO ticket_assignment_history (
            ticket_id, previous_service, new_service, assigned_by
        ) VALUES (?, ?, ?, ?)`,
        [ticketId, previousService || null, newService, assignedBy]
    );
    return result.insertId;
}

async function getAssignmentHistoryByTicketId(ticketId) {
    const [rows] = await db.execute(
        `SELECT
            h.id,
            h.ticket_id,
            h.previous_service,
            h.new_service,
            h.assigned_by,
            h.assigned_at,
            e.firstName,
            e.lastName,
            e.userName,
            s.name AS assigner_service
         FROM ticket_assignment_history h
         JOIN employees e ON e.id = h.assigned_by
         LEFT JOIN services s ON s.id = e.service_id
         WHERE h.ticket_id = ?
         ORDER BY h.assigned_at ASC`,
        [ticketId]
    );
    return rows;
}

async function getAssignmentHistoryForApi(ticketId) {
    return getAssignmentHistoryByTicketId(ticketId);
}

async function getTicketsByRole() {
    const [rows] = await db.execute(
        `SELECT
            t.id,
            t.request_code,
            t.client_id,
            t.application,
            t.issue_type,
            t.issue_level,
            t.issue_description,
            t.resolution,
            t.status,
            t.created_by,
            t.createdAt,
            t.updatedAt,
            c.name AS client_name,
            c.email AS client_email,
            o.name AS organization_name,
            r.id AS room_id,
            r.allowed_services
         FROM tickets t
         LEFT JOIN contacts c ON c.id = t.client_id
         LEFT JOIN organizations o ON o.id = t.organization_id
         JOIN rooms r ON r.ticket_id = t.id
         ORDER BY t.createdAt DESC`,
        []
    );

    return rows;
}

async function getTicketCountForYear(year) {
    const [rows] = await db.execute(
        `SELECT COUNT(*) AS count FROM tickets
         WHERE YEAR(createdAt) = ?`,
        [year]
    );
    return rows[0].count;
}

module.exports = {
    createTicket,
    getTicketById,
    getTicketsByRole,
    getTicketCountForYear,
    createAssignmentHistory,
    getAssignmentHistoryByTicketId,
    getAssignmentHistoryForApi
};
