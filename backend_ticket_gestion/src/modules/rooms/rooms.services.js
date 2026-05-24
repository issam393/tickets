const roomRepository = require('./rooms.repository');
const messageRepository = require('../messages/messages.repository');
const { canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');

function normalizeRoom(room) {
    if (!room) return null;

    return {
        ...room,
        allowed_services: parseAllowedRoles(room.allowed_services)
    };
}

async function getRoomById(roomId) {
    const room = await roomRepository.getRoomById(roomId);
    return normalizeRoom(room);
}

async function getRoomByTicketId(ticketId) {
    const room = await roomRepository.getRoomByTicketId(ticketId);
    return normalizeRoom(room);
}

function assertRoomAccess(room, service) {
    if (!room) {
        throw new Error('Room not found');
    }

    if (room.ticket_status === 'Resolved') {
        throw new Error('Ticket already resolved. Messages are read-only and hidden.');
    }

    if (!canRoleAccessRoom(service, room.allowed_services)) {
        throw new Error('Access denied');
    }
}

async function listRoomsForRole(service, employeeId) {
    const rooms = await roomRepository.getAccessibleRoomsByRole(employeeId);
    return rooms
        .map(normalizeRoom)
        .filter((room) => room.ticket_status !== 'Resolved')
        .filter((room) => canRoleAccessRoom(service, room.allowed_services));
}

async function markRoomAsRead(roomId, service, employeeId) {
    const room = await getRoomById(roomId);
    assertRoomAccess(room, service);
    await roomRepository.markRoomAsRead(roomId, employeeId);
}

async function getRoomHistory(roomId, service, employeeId) {
    const room = await getRoomById(roomId);
    assertRoomAccess(room, service);

    const history = await messageRepository.getRoomHistory(roomId);
    if (employeeId) {
        await roomRepository.markRoomAsRead(roomId, employeeId);
    }
    return history.map((message) => ({
        id: message.id,
        roomId: message.room_id,
        senderId: message.sender_id,
        senderName: message.sender_name,
        text: message.text,
        timestamp: message.createdAt
    }));
}

module.exports = {
    getRoomById,
    getRoomByTicketId,
    listRoomsForRole,
    getRoomHistory,
    markRoomAsRead,
    assertRoomAccess
};
