const db = require('../../config/db');

async function saveMessage(roomId, senderId, text) {
    const [insertResult] = await db.execute(
        `INSERT INTO messages (room_id, sender_id, text)
         VALUES (?, ?, ?)`,
        [roomId, senderId, text]
    );

    const [rows] = await db.execute(
        `SELECT m.id, m.room_id, m.sender_id, m.text, m.createdAt,
                e.userName AS sender_name
         FROM messages m
         JOIN employees e ON e.id = m.sender_id
         WHERE m.id = ?`,
        [insertResult.insertId]
    );

    return rows[0];
}

async function getRoomHistory(roomId, limit = 200) {
    const safeLimit = Number(limit) > 0 ? Number(limit) : 200;

    const [rows] = await db.execute(
        `SELECT m.id, m.room_id, m.sender_id, m.text, m.createdAt,
                e.userName AS sender_name
         FROM messages m
         JOIN employees e ON e.id = m.sender_id
         WHERE m.room_id = ?
         ORDER BY m.createdAt ASC
         LIMIT ${safeLimit}`,
        [roomId]
    );

    return rows;
}

module.exports = {
    saveMessage,
    getRoomHistory
};
