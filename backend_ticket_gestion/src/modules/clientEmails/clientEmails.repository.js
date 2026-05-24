const db = require('../../config/db');

const EMAIL_FIELDS = `
    e.id,
    e.contact_id,
    e.sender_email,
    e.recipient_service,
    e.source_message_id,
    e.subject,
    e.content,
    e.received_at,
    (email_read.read_at IS NOT NULL) AS is_read,
    c.name AS contact_name,
    c.phone,
    c.organization_id,
    o.name AS organization
`;

async function findContactByEmail(email) {
    const [rows] = await db.execute(
        `SELECT c.id, c.name, c.email, c.phone, c.organization_id, o.name AS organization
         FROM contacts c
         LEFT JOIN organizations o ON o.id = c.organization_id
         WHERE LOWER(c.email) = LOWER(?)
         LIMIT 1`,
        [email]
    );
    return rows[0];
}

async function getAttachments(emailIds) {
    if (!emailIds.length) return [];
    const placeholders = emailIds.map(() => '?').join(', ');
    const [rows] = await db.execute(
        `SELECT id, email_id, file_name, mime_type, file_url, size_bytes
         FROM client_email_attachments
         WHERE email_id IN (${placeholders})
         ORDER BY id ASC`,
        emailIds
    );
    return rows;
}

async function getAllEmails(employeeId, recipientService) {
    const [emails] = await db.execute(
        `SELECT ${EMAIL_FIELDS}
         FROM client_emails e
         INNER JOIN contacts c ON c.id = e.contact_id
         LEFT JOIN organizations o ON o.id = c.organization_id
         LEFT JOIN client_email_reads email_read
            ON email_read.email_id = e.id AND email_read.employee_id = ?
         WHERE LOWER(e.sender_email) = LOWER(c.email)
           AND e.recipient_service = ?
         ORDER BY e.received_at DESC, e.id DESC`
        ,
        [employeeId, recipientService]
    );
    const attachments = await getAttachments(emails.map((email) => email.id));
    return { emails, attachments };
}

async function getEmailById(id, employeeId, recipientService) {
    const [emails] = await db.execute(
        `SELECT ${EMAIL_FIELDS}
         FROM client_emails e
         INNER JOIN contacts c ON c.id = e.contact_id
         LEFT JOIN organizations o ON o.id = c.organization_id
         LEFT JOIN client_email_reads email_read
            ON email_read.email_id = e.id AND email_read.employee_id = ?
         WHERE e.id = ?
           AND LOWER(e.sender_email) = LOWER(c.email)
           AND e.recipient_service = ?`,
        [employeeId, id, recipientService]
    );
    if (!emails[0]) return null;
    const attachments = await getAttachments([emails[0].id]);
    return { email: emails[0], attachments };
}

async function existsBySourceMessageId(sourceMessageId) {
    if (!sourceMessageId) return false;
    const [rows] = await db.execute(
        'SELECT id FROM client_emails WHERE source_message_id = ? LIMIT 1',
        [sourceMessageId]
    );
    return Boolean(rows[0]);
}

async function createEmail(contactId, data) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.execute(
            `INSERT INTO client_emails
                (contact_id, sender_email, recipient_service, source_message_id, subject, content, received_at)
             VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
            [
                contactId,
                data.senderEmail,
                data.recipientService,
                data.sourceMessageId || null,
                data.subject,
                data.content,
                data.receivedAt || null
            ]
        );

        for (const attachment of data.attachments) {
            await connection.execute(
                `INSERT INTO client_email_attachments
                    (email_id, file_name, mime_type, file_url, size_bytes)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    result.insertId,
                    attachment.fileName,
                    attachment.mimeType || null,
                    attachment.fileUrl,
                    attachment.sizeBytes || null
                ]
            );
        }
        await connection.commit();
        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function markAsRead(id, employeeId) {
    const [result] = await db.execute(
        `INSERT INTO client_email_reads (email_id, employee_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
        [id, employeeId]
    );
    return result;
}

module.exports = {
    findContactByEmail,
    getAllEmails,
    getEmailById,
    existsBySourceMessageId,
    createEmail,
    markAsRead
};
