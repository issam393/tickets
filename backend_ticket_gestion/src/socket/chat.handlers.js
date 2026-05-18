const roomService = require('../modules/rooms/rooms.services');
const messageRepository = require('../modules/messages/messages.repository');
const { toSocketRoom } = require('../utils/roomAccess');

function sendAck(ack, payload) {
    if (typeof ack === 'function') {
        ack(payload);
    }
}

function registerChatHandlers(io, socket) {
    socket.on('join_room', async (payload = {}, ack) => {
        try {
            const roomId = Number(payload.roomId);
            if (!roomId) {
                throw new Error('Valid roomId is required');
            }

            const room = await roomService.getRoomById(roomId);
            roomService.assertRoomAccess(room, socket.user.role);

            const history = await roomService.getRoomHistory(roomId, socket.user.role);

            socket.join(toSocketRoom(roomId));

            sendAck(ack, {
                success: true,
                room: {
                    id: room.id,
                    ticketId: room.ticket_id,
                    name: room.name
                },
                history
            });
        } catch (error) {
            sendAck(ack, { success: false, error: error.message });
        }
    });

    socket.on('send_message', async (payload = {}, ack) => {
        try {
            const roomId = Number(payload.roomId);
            const messageText = String(payload.messageText || '').trim();

            if (!roomId) {
                throw new Error('Valid roomId is required');
            }

            if (!messageText) {
                throw new Error('messageText is required');
            }

            const room = await roomService.getRoomById(roomId);
            roomService.assertRoomAccess(room, socket.user.role);

            const savedMessage = await messageRepository.saveMessage(roomId, socket.user.id, messageText);

            const broadcastPayload = {
                id: savedMessage.id,
                roomId: savedMessage.room_id,
                senderId: savedMessage.sender_id,
                senderName: savedMessage.sender_name,
                text: savedMessage.text,
                timestamp: savedMessage.createdAt
            };

            io.to(toSocketRoom(roomId)).emit('receive_message', broadcastPayload);
            sendAck(ack, { success: true, data: broadcastPayload });
        } catch (error) {
            sendAck(ack, { success: false, error: error.message });
        }
    });
}

module.exports = registerChatHandlers;
