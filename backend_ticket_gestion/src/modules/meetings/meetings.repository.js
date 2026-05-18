const db = require('../../config/db');

async function createMeeting(data) {
    const {
        title,
        startTimeUtc,
        endTimeUtc,
        organizerId,
        inviteeId,
        ticketId,
        location,
        description,
        status,
        rejectionReason
    } = data;

    const [result] = await db.execute(
        `INSERT INTO meetings (
            title,
            start_time_utc,
            end_time_utc,
            organizer_id,
            invitee_id,
            ticket_id,
            location,
            description,
            status,
            rejection_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title,
            startTimeUtc,
            endTimeUtc,
            organizerId,
            inviteeId || null,
            ticketId || null,
            location || null,
            description || null,
            status || 'Pending',
            rejectionReason || null
        ]
    );

    return result.insertId;
}

async function findMeetingById(meetingId) {
    const [rows] = await db.execute(
        `SELECT
            m.*,
            org.userName AS organizer_username,
            inv.userName AS invitee_username,
            t.request_code AS ticket_code
         FROM meetings m
         JOIN employees org ON org.id = m.organizer_id
         LEFT JOIN employees inv ON inv.id = m.invitee_id
         LEFT JOIN tickets t ON t.id = m.ticket_id
         WHERE m.id = ?`,
        [meetingId]
    );

    return rows[0];
}

async function listMeetingsForUser(userId, role) {
    if (role === 'ADMIN') {
        const [rows] = await db.execute(
            `SELECT
                m.*,
                org.userName AS organizer_username,
                inv.userName AS invitee_username,
                t.request_code AS ticket_code
             FROM meetings m
             JOIN employees org ON org.id = m.organizer_id
             LEFT JOIN employees inv ON inv.id = m.invitee_id
             LEFT JOIN tickets t ON t.id = m.ticket_id
             ORDER BY m.start_time_utc ASC`
        );
        return rows;
    }

    const [rows] = await db.execute(
        `SELECT
            m.*,
            org.userName AS organizer_username,
            inv.userName AS invitee_username,
            t.request_code AS ticket_code
         FROM meetings m
         JOIN employees org ON org.id = m.organizer_id
         LEFT JOIN employees inv ON inv.id = m.invitee_id
         LEFT JOIN tickets t ON t.id = m.ticket_id
         WHERE m.organizer_id = ? OR m.invitee_id = ?
         ORDER BY m.start_time_utc ASC`,
        [userId, userId]
    );

    return rows;
}

async function updateMeeting(meetingId, updates) {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
    if (updates.startTimeUtc !== undefined) { fields.push('start_time_utc = ?'); values.push(updates.startTimeUtc); }
    if (updates.endTimeUtc !== undefined) { fields.push('end_time_utc = ?'); values.push(updates.endTimeUtc); }
    if (updates.inviteeId !== undefined) { fields.push('invitee_id = ?'); values.push(updates.inviteeId || null); }
    if (updates.ticketId !== undefined) { fields.push('ticket_id = ?'); values.push(updates.ticketId || null); }
    if (updates.location !== undefined) { fields.push('location = ?'); values.push(updates.location || null); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description || null); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.rejectionReason !== undefined) { fields.push('rejection_reason = ?'); values.push(updates.rejectionReason || null); }

    if (!fields.length) {
        throw new Error('No valid fields to update');
    }

    values.push(meetingId);
    await db.execute(
        `UPDATE meetings
         SET ${fields.join(', ')}
         WHERE id = ?`,
        values
    );
}

async function deleteMeeting(meetingId) {
    await db.execute('DELETE FROM meetings WHERE id = ?', [meetingId]);
}

async function listMeetingUsers() {
    const [rows] = await db.execute(
        `SELECT e.id, e.userName, e.firstName, e.lastName, r.name AS role_name
         FROM employees e
         LEFT JOIN roles r ON r.id = e.role_id
         WHERE e.status = 'Active'
         ORDER BY e.userName ASC`
    );

    return rows;
}

async function listMeetingTickets() {
    const [rows] = await db.execute(
        `SELECT
            t.id,
            t.request_code,
            r.allowed_roles
         FROM tickets t
         LEFT JOIN rooms r ON r.ticket_id = t.id
         ORDER BY t.createdAt DESC`
    );

    return rows;
}

module.exports = {
    createMeeting,
    findMeetingById,
    listMeetingsForUser,
    updateMeeting,
    deleteMeeting,
    listMeetingUsers,
    listMeetingTickets
};
