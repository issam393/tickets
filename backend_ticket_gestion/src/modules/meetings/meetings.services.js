const meetingRepository = require('./meetings.repository');
const { canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');

const VALID_STATUSES = ['Pending', 'Accepted', 'Rejected'];

// Converts a datetime-local string ("YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS")
// into a MySQL-compatible DATETIME string ("YYYY-MM-DD HH:MM:SS").
// We deliberately do NOT call new Date() on bare local strings — that would
// apply a UTC interpretation and shift the time by the server's timezone offset.
function toMysqlDatetime(input) {
    if (!input) throw new Error('Invalid date/time format');
    const s = String(input).trim();

    // Accept "YYYY-MM-DDTHH:MM", "YYYY-MM-DDTHH:MM:SS", "YYYY-MM-DD HH:MM:SS"
    // Also handle full ISO with Z ("...T...Z") by stripping the Z/ms suffix
    const normalised = s.replace('T', ' ').replace('Z', '').split('.')[0];
    const parts = normalised.split(' ');
    if (parts.length !== 2) throw new Error('Invalid date/time format');

    const datePart = parts[0];
    // Ensure HH:MM:SS — pad missing seconds
    const timeParts = parts[1].split(':');
    if (timeParts.length < 2) throw new Error('Invalid date/time format');
    const timePart = [
        timeParts[0].padStart(2, '0'),
        timeParts[1].padStart(2, '0'),
        (timeParts[2] || '00').padStart(2, '0')
    ].join(':');

    const result = `${datePart} ${timePart}`;

    // Validate the date is real
    const check = new Date(result.replace(' ', 'T'));
    if (Number.isNaN(check.getTime())) throw new Error('Invalid date/time format');

    return result;
}

function normalizeMeetingRecord(record, currentUser) {
    const canManage = currentUser.service === 'SD';
    const canRespond = Number(record.invitee_id) === Number(currentUser.id);

    return {
        id: record.id,
        title: record.title,
        startTime: record.start_time_utc,
        endTime: record.end_time_utc,
        organizerId: record.organizer_id,
        organizer: record.organizer_username,
        inviteeId: record.invitee_id,
        invitee: record.invitee_username,
        ticketId: record.ticket_id,
        ticketCode: record.ticket_code,
        location: record.location,
        description: record.description,
        status: record.status,
        rejectionReason: record.rejection_reason,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        canManage,
        canRespond
    };
}

function assertReadAccess(record, user) {
    const canRead = user.service === 'SD'
        || user.service === 'Manager'
        || Number(record.organizer_id) === Number(user.id)
        || Number(record.invitee_id) === Number(user.id);

    if (!canRead) {
        throw new Error('Access denied');
    }
}

function validateMeetingPayload(payload) {
    if (!payload.title || !String(payload.title).trim()) {
        throw new Error('title is required');
    }

    if (!payload.startTime) {
        throw new Error('startTime is required');
    }

    if (!payload.endTime) {
        throw new Error('endTime is required');
    }
}

function validateStatus(status) {
    if (status && !VALID_STATUSES.includes(status)) {
        throw new Error('Invalid status value');
    }
}

async function createMeeting(payload, user) {
    validateMeetingPayload(payload);

    const startTimeUtc = toMysqlDatetime(payload.startTime);
    const endTimeUtc = toMysqlDatetime(payload.endTime);

    if (new Date(endTimeUtc.replace(' ', 'T')).getTime() <= new Date(startTimeUtc.replace(' ', 'T')).getTime()) {
        throw new Error('endTime must be after startTime');
    }

    const meetingId = await meetingRepository.createMeeting({
        title: payload.title.trim(),
        startTimeUtc,
        endTimeUtc,
        organizerId: user.id,
        inviteeId: payload.inviteeId ? Number(payload.inviteeId) : null,
        ticketId: payload.ticketId ? Number(payload.ticketId) : null,
        meetingRoomId: payload.meetingRoomId ? Number(payload.meetingRoomId) : null,
        location: payload.location ? String(payload.location).trim() : null,
        description: payload.description ? String(payload.description).trim() : null,
        status: 'Pending',
        rejectionReason: null
    });

    const created = await meetingRepository.findMeetingById(meetingId);
    return normalizeMeetingRecord(created, user);
}

async function listMeetings(user) {
    const rows = await meetingRepository.listMeetingsForUser(user.id, user.service);
    return rows.map((row) => normalizeMeetingRecord(row, user));
}

async function getMeetingById(meetingId, user) {
    const record = await meetingRepository.findMeetingById(meetingId);

    if (!record) {
        throw new Error('Meeting not found');
    }

    assertReadAccess(record, user);
    return normalizeMeetingRecord(record, user);
}

async function updateMeeting(meetingId, payload, user) {
    const existing = await meetingRepository.findMeetingById(meetingId);

    if (!existing) {
        throw new Error('Meeting not found');
    }

    assertReadAccess(existing, user);

    const canManage = user.service === 'SD';
    const canRespond = Number(existing.invitee_id) === Number(user.id);
    const updateData = {};

    if (canManage) {
        if (payload.title !== undefined) updateData.title = String(payload.title).trim();
        if (payload.startTime !== undefined) updateData.startTimeUtc = toMysqlDatetime(payload.startTime);
        if (payload.endTime !== undefined) updateData.endTimeUtc = toMysqlDatetime(payload.endTime);
        if (payload.inviteeId !== undefined) updateData.inviteeId = payload.inviteeId ? Number(payload.inviteeId) : null;
        if (payload.ticketId !== undefined) updateData.ticketId = payload.ticketId ? Number(payload.ticketId) : null;
        if (payload.location !== undefined) updateData.location = payload.location ? String(payload.location).trim() : null;
        if (payload.description !== undefined) updateData.description = payload.description ? String(payload.description).trim() : null;
        if (payload.meetingRoomId !== undefined) updateData.meetingRoomId = payload.meetingRoomId ? Number(payload.meetingRoomId) : null;
    } else if (canRespond) {
        const keys = Object.keys(payload);
        const allowedKeys = ['status', 'rejectionReason'];
        const hasForbiddenKey = keys.some((key) => !allowedKeys.includes(key));
        if (hasForbiddenKey) {
            throw new Error('Access denied');
        }
        if (payload.status && !['Accepted', 'Rejected'].includes(payload.status)) {
            throw new Error('Invalid status value');
        }
    } else {
        throw new Error('Access denied');
    }

    if (payload.status !== undefined) {
        validateStatus(payload.status);
        updateData.status = payload.status;
        if (payload.status !== 'Rejected') {
            updateData.rejectionReason = null;
        }
    }

    if (payload.rejectionReason !== undefined) {
        updateData.rejectionReason = payload.rejectionReason ? String(payload.rejectionReason).trim() : null;
    }

    if (updateData.status === 'Rejected' && !updateData.rejectionReason) {
        throw new Error('Rejection reason is required');
    }

    const computedStartTime = updateData.startTimeUtc || existing.start_time_utc;
    const computedEndTime = updateData.endTimeUtc || existing.end_time_utc;
    if (new Date(String(computedEndTime).replace(' ', 'T')).getTime() <= new Date(String(computedStartTime).replace(' ', 'T')).getTime()) {
        throw new Error('endTime must be after startTime');
    }

    await meetingRepository.updateMeeting(meetingId, updateData);
    const updated = await meetingRepository.findMeetingById(meetingId);
    return normalizeMeetingRecord(updated, user);
}

async function deleteMeeting(meetingId, user) {
    const existing = await meetingRepository.findMeetingById(meetingId);

    if (!existing) {
        throw new Error('Meeting not found');
    }

    const canManage = user.service === 'SD';
    if (!canManage) {
        throw new Error('Access denied');
    }

    await meetingRepository.deleteMeeting(meetingId);
}

async function getMeetingMeta(user) {
    const users = await meetingRepository.listMeetingUsers();
    const tickets = await meetingRepository.listMeetingTickets();

    const accessibleTickets = tickets.filter((ticket) => {
        const allowedRoles = parseAllowedRoles(ticket.allowed_services);
        return canRoleAccessRoom(user.service, allowedRoles);
    });

    return {
        invitees: users.map((userRow) => ({
            id: userRow.id,
            label: `${userRow.firstName} ${userRow.lastName} (${userRow.userName})`,
            userName: userRow.userName
        })),
        tickets: accessibleTickets.map((ticketRow) => ({
            id: ticketRow.id,
            requestCode: ticketRow.request_code
        }))
    };
}

module.exports = {
    createMeeting,
    listMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    getMeetingMeta
};
