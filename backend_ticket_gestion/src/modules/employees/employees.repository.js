const db = require('../../config/db');

const create = async (data) => {
    const { firstName, lastName, email, userName, password, service_id } = data;
    const [result] = await db.execute(
        `INSERT INTO employees (firstName, lastName, email, userName, password, service_id, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
        [firstName, lastName, email, userName, password, service_id]
    );
    return result;
};

const update = async (id, data) => {
    const fields = [];
    const values = [];
    
    if (data.firstName) { fields.push('firstName = ?'); values.push(data.firstName); }
    if (data.lastName) { fields.push('lastName = ?'); values.push(data.lastName); }
    if (data.email) { fields.push('email = ?'); values.push(data.email); }
    if (data.userName) { fields.push('userName = ?'); values.push(data.userName); }
    if (data.service_id) { fields.push('service_id = ?'); values.push(data.service_id); }
    if (data.status) { fields.push('status = ?'); values.push(data.status); }
    if (data.password) { fields.push('password = ?'); values.push(data.password); }
    
    if (fields.length === 0) throw new Error('No fields to update');
    
    values.push(id);
    const [result] = await db.execute(
        `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
    return result;
};

const isUser = async (userName) => {
    const [res] = await db.execute(
        'SELECT * FROM employees WHERE userName = ?', [userName]
    );
    return res[0];
};

const findAll = async () => {
    const [rows] = await db.execute(
        `SELECT e.*, s.name as service_name 
         FROM employees e
         LEFT JOIN services s ON e.service_id = s.id`
    );
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.execute(
        `SELECT e.*, s.name as service_name 
         FROM employees e
         LEFT JOIN services s ON e.service_id = s.id
         WHERE e.id = ?`,
        [id]
    );
    return rows[0];
};

const updatePassword = async (id, password) => {
    const [result] = await db.execute(
        'UPDATE employees SET password = ? WHERE id = ?',
        [password, id]
    );
    return result;
};

const Delete = async (id) => {
    const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result;
};

module.exports = { create, update, updatePassword, isUser, findAll, findById, Delete };
