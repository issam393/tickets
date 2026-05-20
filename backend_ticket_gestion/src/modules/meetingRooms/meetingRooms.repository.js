const db = require('../../config/db');

async function getAllRooms() {
    const [rows] = await db.execute(
        `SELECT * FROM meeting_rooms ORDER BY name ASC`
    );
    return rows;
}

async function getRoomById(id) {
    const [rows] = await db.execute(
        `SELECT * FROM meeting_rooms WHERE id = ?`,
        [id]
    );
    return rows[0];
}

async function createRoom(data) {
    const { name, capacity, location } = data;
    const [result] = await db.execute(
        `INSERT INTO meeting_rooms (name, capacity, location) VALUES (?, ?, ?)`,
        [name, capacity || 10, location || null]
    );
    return result.insertId;
}

async function updateRoom(id, data) {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.capacity !== undefined) { fields.push('capacity = ?'); values.push(data.capacity); }
    if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
    
    if (!fields.length) throw new Error('No fields to update');
    values.push(id);
    await db.execute(`UPDATE meeting_rooms SET ${fields.join(', ')} WHERE id = ?`, values);
}

async function deleteRoom(id) {
    await db.execute('DELETE FROM meeting_rooms WHERE id = ?', [id]);
}

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom };