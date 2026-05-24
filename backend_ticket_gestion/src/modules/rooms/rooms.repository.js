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
        `SELECT r.*, t.request_code, t.issue_type, t.issue_level, t.status AS ticket_status
         FROM rooms r
         JOIN tickets t ON t.id = r.ticket_id
         WHERE r.id = ?`,
        [roomId]
    );
    return rows[0];
}

async function getRoomByTicketId(ticketId) {
    const [rows] = await db.execute(
        `SELECT r.*, t.request_code, t.issue_type, t.issue_level, t.status AS ticket_status
        FROM rooms r
        JOIN tickets t ON t.id = r.ticket_id
        WHERE r.ticket_id = ?`,
        [ticketId]
    );
    return rows[0];
}

async function getAccessibleRoomsByRole(employeeId) {
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
            t.status AS ticket_status,
            lm.text AS last_message_text,
            lm.createdAt AS last_message_time,
            (
                SELECT COUNT(*)
                FROM messages unread_message
                WHERE unread_message.room_id = r.id
                  AND unread_message.sender_id <> ?
                  AND unread_message.id > COALESCE(room_read.last_read_message_id, 0)
            ) AS unread_count
         FROM rooms r
         JOIN tickets t ON t.id = r.ticket_id
         LEFT JOIN room_message_reads room_read
            ON room_read.room_id = r.id AND room_read.employee_id = ?
         LEFT JOIN messages lm ON lm.id = (
             SELECT m2.id
             FROM messages m2
             WHERE m2.room_id = r.id
             ORDER BY m2.createdAt DESC
             LIMIT 1
         )
         ORDER BY COALESCE(lm.createdAt, r.createdAt) DESC`,
        [employeeId, employeeId]
    );

    return rows;
}

async function markRoomAsRead(roomId, employeeId) {
    await db.execute(
        `INSERT INTO room_message_reads (room_id, employee_id, last_read_message_id)
         SELECT ?, ?, MAX(m.id)
         FROM messages m
         WHERE m.room_id = ?
         ON DUPLICATE KEY UPDATE
            last_read_message_id = VALUES(last_read_message_id),
            read_at = CURRENT_TIMESTAMP`,
        [roomId, employeeId, roomId]
    );
}

module.exports = {
    createRoom,
    getRoomById,
    getRoomByTicketId,
    getAccessibleRoomsByRole,
    markRoomAsRead
};
