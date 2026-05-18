const db = require('../../config/db');

const create = async (data) => {
    const { firstName, lastName, email, userName, phone, password, service_id, role_id } = data;
    const [result] = await db.execute(
        `INSERT INTO employees (firstName, lastName, email, userName, phone, password, service_id, role_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [firstName, lastName, email, userName, phone, password, service_id, role_id]
    );
    return result;
};

const update = async (id, data) => {
    const fields = [];
    const values = [];
    
    if (data.firstName) { fields.push('firstName = ?'); values.push(data.firstName); }
    if (data.lastName) { fields.push('lastName = ?'); values.push(data.lastName); }
    if (data.email) { fields.push('email = ?'); values.push(data.email); }
    if (data.userName) { fields.push('userName = ?');  values.push(data.userName)}
    if (data.phone) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.service_id) { fields.push('service_id = ?'); values.push(data.service_id); }
    if (data.role_id) { fields.push('role_id = ?'); values.push(data.role_id); }
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
        `SELECT e.*, s.name as service_name, r.name as role_name 
         FROM employees e
         LEFT JOIN services s ON e.service_id = s.id
         LEFT JOIN roles r ON e.role_id = r.id`
    );
    return rows;
};

const Delete = async (id) => {
    const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result;
};

module.exports = { create, update, isUser, findAll, Delete };