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

    if (!canRoleAccessRoom(service, room.allowed_services)) {
        throw new Error('Access denied');
    }
}

async function listRoomsForRole(service) {
    const rooms = await roomRepository.getAccessibleRoomsByRole();
    return rooms
        .map(normalizeRoom)
        .filter((room) => canRoleAccessRoom(service, room.allowed_services));
}

async function getRoomHistory(roomId, service) {
    const room = await getRoomById(roomId);
    assertRoomAccess(room, service);

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