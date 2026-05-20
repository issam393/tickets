const db = require('../../config/db');

async function getUserByUsername(username) {
    const [rows] = await db.execute(
        `SELECT e.*, s.name as service_name 
         FROM employees e 
         JOIN services s ON e.service_id = s.id 
         WHERE e.userName = ?`,
        [username]
    );
    return rows[0];
}

module.exports = {
    getUserByUsername
}