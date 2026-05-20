const db = require('../../config/db');

const SELECT_FIELDS = `
    c.id,
    c.name,
    c.type,
    c.email,
    c.phone,
    c.job_title,
    c.status,
    c.organization_id,
    o.name AS organization,
    c.createdAt,
    c.updatedAt
`;

async function getAllContacts() {
    const [rows] = await db.execute(
        `SELECT ${SELECT_FIELDS}
         FROM contacts c
         LEFT JOIN organizations o ON o.id = c.organization_id
         ORDER BY c.name ASC`
    );
    return rows;
}

async function getContactById(id) {
    const [rows] = await db.execute(
        `SELECT ${SELECT_FIELDS}
         FROM contacts c
         LEFT JOIN organizations o ON o.id = c.organization_id
         WHERE c.id = ?`,
        [id]
    );
    return rows[0];
}

async function getContactsByOrganization(organizationId) {
    const [rows] = await db.execute(
        `SELECT ${SELECT_FIELDS}
         FROM contacts c
         LEFT JOIN organizations o ON o.id = c.organization_id
         WHERE c.organization_id = ?
         ORDER BY c.name ASC`,
        [organizationId]
    );
    return rows;
}

async function createContact(data) {
    const { name, type, email, phone, jobTitle, status, organizationId } = data;
    const [result] = await db.execute(
        `INSERT INTO contacts (name, type, email, phone, job_title, status, organization_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, type, email, phone || null, jobTitle || null, status || 'Active', organizationId || null]
    );
    return result.insertId;
}

async function updateContact(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined)           { fields.push('name = ?');            values.push(data.name); }
    if (data.type !== undefined)           { fields.push('type = ?');            values.push(data.type); }
    if (data.email !== undefined)          { fields.push('email = ?');           values.push(data.email); }
    if (data.phone !== undefined)          { fields.push('phone = ?');           values.push(data.phone || null); }
    if (data.jobTitle !== undefined)       { fields.push('job_title = ?');       values.push(data.jobTitle || null); }
    if (data.status !== undefined)         { fields.push('status = ?');          values.push(data.status); }
    if (data.organizationId !== undefined) { fields.push('organization_id = ?'); values.push(data.organizationId || null); }

    if (!fields.length) throw new Error('No fields to update');

    values.push(id);
    await db.execute(`UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`, values);
}

async function deleteContact(id) {
    await db.execute('DELETE FROM contacts WHERE id = ?', [id]);
}

module.exports = {
    getAllContacts,
    getContactById,
    getContactsByOrganization,
    createContact,
    updateContact,
    deleteContact
};
