const meetingRepository = require('./meetings.repository');
const { canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');

const VALID_STATUSES = ['Pending', 'Accepted', 'Rejected'];

function toUtcIso(input) {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error('Invalid date/time format');
    }

    return parsed.toISOString();
}

function normalizeMeetingRecord(record, currentUser) {
    const canManage = currentUser.role === 'ADMIN' || Number(record.organizer_id) === Number(currentUser.id);
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
    const canRead = user.role === 'ADMIN'
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

    const startTimeUtc = toUtcIso(payload.startTime);
    const endTimeUtc = toUtcIso(payload.endTime);

    if (new Date(endTimeUtc).getTime() <= new Date(startTimeUtc).getTime()) {
        throw new Error('endTime must be after startTime');
    }

    const meetingId = await meetingRepository.createMeeting({
        title: payload.title.trim(),
        startTimeUtc,
        endTimeUtc,
        organizerId: user.id,
        inviteeId: payload.inviteeId ? Number(payload.inviteeId) : null,
        ticketId: payload.ticketId ? Number(payload.ticketId) : null,
        location: payload.location ? String(payload.location).trim() : null,
        description: payload.description ? String(payload.description).trim() : null,
        status: 'Pending',
        rejectionReason: null
    });

    const created = await meetingRepository.findMeetingById(meetingId);
    return normalizeMeetingRecord(created, user);
}

async function listMeetings(user) {
    const rows = await meetingRepository.listMeetingsForUser(user.id, user.role);
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

    const canManage = user.role === 'ADMIN' || Number(existing.organizer_id) === Number(user.id);
    const canRespond = Number(existing.invitee_id) === Number(user.id);
    const updateData = {};

    if (canManage) {
        if (payload.title !== undefined) updateData.title = String(payload.title).trim();
        if (payload.startTime !== undefined) updateData.startTimeUtc = toUtcIso(payload.startTime);
        if (payload.endTime !== undefined) updateData.endTimeUtc = toUtcIso(payload.endTime);
        if (payload.inviteeId !== undefined) updateData.inviteeId = payload.inviteeId ? Number(payload.inviteeId) : null;
        if (payload.ticketId !== undefined) updateData.ticketId = payload.ticketId ? Number(payload.ticketId) : null;
        if (payload.location !== undefined) updateData.location = payload.location ? String(payload.location).trim() : null;
        if (payload.description !== undefined) updateData.description = payload.description ? String(payload.description).trim() : null;
    } else if (canRespond) {
        const keys = Object.keys(payload);
        const allowedKeys = ['status', 'rejectionReason'];
        const hasForbiddenKey = keys.some((key) => !allowedKeys.includes(key));
        if (hasForbiddenKey) {
            throw new Error('Access denied');
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

    const computedStartTime = updateData.startTimeUtc || existing.start_time_utc;
    const computedEndTime = updateData.endTimeUtc || existing.end_time_utc;
    if (new Date(computedEndTime).getTime() <= new Date(computedStartTime).getTime()) {
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

    const canManage = user.role === 'ADMIN' || Number(existing.organizer_id) === Number(user.id);
    if (!canManage) {
        throw new Error('Access denied');
    }

    await meetingRepository.deleteMeeting(meetingId);
}

async function getMeetingMeta(user) {
    const users = await meetingRepository.listMeetingUsers();
    const tickets = await meetingRepository.listMeetingTickets();

    const accessibleTickets = tickets.filter((ticket) => {
        const allowedRoles = parseAllowedRoles(ticket.allowed_roles);
        return canRoleAccessRoom(user.role, allowedRoles);
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
