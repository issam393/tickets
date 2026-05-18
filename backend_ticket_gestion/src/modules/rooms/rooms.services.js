const roomRepository = require('./rooms.repository');
const messageRepository = require('../messages/messages.repository');
const { canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');

function normalizeRoom(room) {
    if (!room) return null;

    return {
        ...room,
        allowed_roles: parseAllowedRoles(room.allowed_roles)
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

function assertRoomAccess(room, role) {
    if (!room) {
        throw new Error('Room not found');
    }

    if (!canRoleAccessRoom(role, room.allowed_roles)) {
        throw new Error('Access denied');
    }
}

async function listRoomsForRole(role) {
    const rooms = await roomRepository.getAccessibleRoomsByRole();
    return rooms
        .map(normalizeRoom)
        .filter((room) => canRoleAccessRoom(role, room.allowed_roles));
}

async function getRoomHistory(roomId, role) {
    const room = await getRoomById(roomId);
    assertRoomAccess(room, role);

    const history = await messageRepository.getRoomHistory(roomId);
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
    assertRoomAccess
};
