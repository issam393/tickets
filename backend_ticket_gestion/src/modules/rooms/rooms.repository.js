const db = require('../../config/db');

async function createRoom(data) {
    const { ticketId, name, roomType, allowedServices } = data;

    const [result] = await db.execute(
        `INSERT INTO rooms (ticket_id, name, room_type, allowed_services)
         VALUES (?, ?, ?, ?)`,
        [ticketId, name, roomType, JSON.stringify(allowedServices)]
    );

    return result.insertId;
}

async function getRoomById(roomId) {
    const [rows] = await db.execute(
        `SELECT r.*, t.request_code, t.issue_type, t.issue_level
         FROM rooms r
         JOIN tickets t ON t.id = r.ticket_id
         WHERE r.id = ?`,
        [roomId]
    );
    return rows[0];
}

async function getRoomByTicketId(ticketId) {
    const [rows] = await db.execute(
        `SELECT r.*, t.request_code, t.issue_type, t.issue_level
         FROM rooms r
         JOIN tickets t ON t.id = r.ticket_id
         WHERE r.ticket_id = ?`,
        [ticketId]
    );
    return rows[0];
}

async function getAccessibleRoomsByRole() {
    const [rows] = await db.execute(
        `SELECT
            r.id,
            r.ticket_id,
            r.name,
            r.room_type,
            r.allowed_services,
            r.createdAt,
            t.request_code,
            t.application,
            t.issue_type,
            t.issue_level,
            lm.text AS last_message_text,
            lm.createdAt AS last_message_time
         FROM rooms r
         JOIN tickets t ON t.id = r.ticket_id
         LEFT JOIN messages lm ON lm.id = (
             SELECT m2.id
             FROM messages m2
             WHERE m2.room_id = r.id
             ORDER BY m2.createdAt DESC
             LIMIT 1
         )
         ORDER BY COALESCE(lm.createdAt, r.createdAt) DESC`,
        []
    );

    return rows;
}

module.exports = {
    createRoom,
    getRoomById,
    getRoomByTicketId,
    getAccessibleRoomsByRole
};