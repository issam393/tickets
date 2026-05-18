// this folder is for database queries 

const db = require('../../config/db');

async function getUserByUsername(username) {
    const [rows] = await db.execute(
        `SELECT e.*, r.name as role 
         FROM employees e 
         JOIN roles r ON e.role_id = r.id 
         WHERE e.userName = ?`,
        [username]
    );
    return rows[0];
}

module.exports = {
    getUserByUsername
 }