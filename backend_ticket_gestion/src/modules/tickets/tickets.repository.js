const db = require('../../config/db');

async function createTicket(data) {
    const { requestCode, clientId, organization_id, application, issueType, issueLevel, issueDescription, createdBy } = data;

    const [result] = await db.execute(
        `INSERT INTO tickets (
            request_code, client_id, organization_id, application, issue_type, issue_level, issue_description, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [requestCode, clientId || null, organization_id || null, application, issueType, issueLevel, issueDescription, createdBy]
    );

    return result.insertId;
}

async function getTicketById(ticketId) {
    const [rows] = await db.execute(
        `SELECT
            t.*,
            e.userName AS created_by_username,
            r.id AS room_id,
            r.name AS room_name,
            r.allowed_services
         FROM tickets t
         LEFT JOIN employees e ON e.id = t.created_by
         LEFT JOIN rooms r ON r.ticket_id = t.id
         WHERE t.id = ?`,
        [ticketId]
    );

    return rows[0];
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
            t.status,
            t.createdAt,
            t.updatedAt,
            r.id AS room_id,
            r.allowed_services
         FROM tickets t
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
    getTicketCountForYear
};