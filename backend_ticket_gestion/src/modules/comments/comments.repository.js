const db = require('../../config/db');
async function createComment(ticketId, userId, text, isResolutionProposal = false) {
    const [result] = await db.execute(
        `INSERT INTO comments (ticket_id, user_id, text, is_resolution_proposal) VALUES (?, ?, ?, ?)`,
        [ticketId, userId, text, Boolean(isResolutionProposal)]
    );
    return result.insertId;
}
async function getCommentById(commentId) {
    const [rows] = await db.execute(
        `SELECT c.*, e.firstName, e.lastName, s.name as service_name, e.userName
         FROM comments c
         JOIN employees e ON c.user_id = e.id
         LEFT JOIN services s ON e.service_id = s.id
         WHERE c.id = ?`,
         [commentId]
    );
    return rows[0];
}
async function getCommentsByTicketId(ticketId) {
    const [rows] = await db.execute(
        `SELECT c.*, e.firstName, e.lastName, s.name as service_name, e.userName
         FROM comments c
         JOIN employees e ON c.user_id = e.id
         LEFT JOIN services s ON e.service_id = s.id
         WHERE c.ticket_id = ?
         ORDER BY c.createdAt ASC`,
        [ticketId]
    );
    return rows;
}
module.exports = {
    createComment,
    getCommentById,
    getCommentsByTicketId
};
