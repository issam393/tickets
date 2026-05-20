const db = require('../../config/db');

async function getAllOrganizations() {
    const [rows] = await db.execute(
        `SELECT
            o.id,
            o.name,
            o.industry,
            o.email,
            o.phone,
            o.address,
            o.status,
            o.createdAt,
            o.updatedAt,
            COUNT(c.id) AS contactsCount
         FROM organizations o
         LEFT JOIN contacts c ON c.organization_id = o.id
         GROUP BY o.id
         ORDER BY o.name ASC`
    );
    return rows;
}

async function getOrganizationById(id) {
    const [rows] = await db.execute(
        `SELECT
            o.id,
            o.name,
            o.industry,
            o.email,
            o.phone,
            o.address,
            o.status,
            o.createdAt,
            o.updatedAt,
            COUNT(c.id) AS contactsCount
         FROM organizations o
         LEFT JOIN contacts c ON c.organization_id = o.id
         WHERE o.id = ?
         GROUP BY o.id`,
        [id]
    );
    return rows[0];
}

async function createOrganization(data) {
    const { name, industry, email, phone, address, status } = data;
    const [result] = await db.execute(
        `INSERT INTO organizations (name, industry, email, phone, address, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, industry, email, phone || null, address || null, status || 'Active']
    );
    return result.insertId;
}

async function updateOrganization(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined)     { fields.push('name = ?');     values.push(data.name); }
    if (data.industry !== undefined) { fields.push('industry = ?'); values.push(data.industry); }
    if (data.email !== undefined)    { fields.push('email = ?');    values.push(data.email); }
    if (data.phone !== undefined)    { fields.push('phone = ?');    values.push(data.phone || null); }
    if (data.address !== undefined)  { fields.push('address = ?');  values.push(data.address || null); }
    if (data.status !== undefined)   { fields.push('status = ?');   values.push(data.status); }

    if (!fields.length) throw new Error('No fields to update');

    values.push(id);
    await db.execute(
        `UPDATE organizations SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
}

async function deleteOrganization(id) {
    await db.execute('DELETE FROM organizations WHERE id = ?', [id]);
}

async function hasContacts(id) {
    const [rows] = await db.execute(
        `SELECT COUNT(*) AS count FROM contacts WHERE organization_id = ?`,
        [id]
    );
    return rows[0].count > 0;
}

module.exports = {
    getAllOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    hasContacts
};