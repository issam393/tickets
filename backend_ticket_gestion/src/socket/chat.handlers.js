const roomService = require('../modules/rooms/rooms.services');
const messageRepository = require('../modules/messages/messages.repository');
const authRepository = require('../modules/auth/auth.repository');
const { INACTIVE_ACCOUNT_MESSAGE } = require('../modules/auth/auth.services');
const { toSocketRoom } = require('../utils/roomAccess');

function sendAck(ack, payload) {
    if (typeof ack === 'function') {
        ack(payload);
    }
}

async function assertActiveEmployee(socket) {
    const employee = await authRepository.getUserAccessById(socket.user.id);
    if (!employee || String(employee.status || '').trim().toLowerCase() !== 'active') {
        throw new Error(INACTIVE_ACCOUNT_MESSAGE);
    }
    socket.user.service = employee.service_name;
}

function registerChatHandlers(io, socket) {
    socket.on('join_room', async (payload = {}, ack) => {
        try {
            await assertActiveEmployee(socket);
            const roomId = Number(payload.roomId);
            if (!roomId) {
                throw new Error('Valid roomId is required');
            }

            const room = await roomService.getRoomById(roomId);
            roomService.assertRoomAccess(room, socket.user.service);

            const history = await roomService.getRoomHistory(roomId, socket.user.service, socket.user.id);

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
            if (error.message === INACTIVE_ACCOUNT_MESSAGE) socket.disconnect(true);
        }
    });

    socket.on('mark_room_read', async (payload = {}, ack) => {
        try {
            await assertActiveEmployee(socket);
            const roomId = Number(payload.roomId);
            if (!roomId) {
                throw new Error('Valid roomId is required');
            }

            await roomService.markRoomAsRead(roomId, socket.user.service, socket.user.id);
            sendAck(ack, { success: true });
        } catch (error) {
            sendAck(ack, { success: false, error: error.message });
            if (error.message === INACTIVE_ACCOUNT_MESSAGE) socket.disconnect(true);
        }
    });

    socket.on('send_message', async (payload = {}, ack) => {
        try {
            await assertActiveEmployee(socket);
            const roomId = Number(payload.roomId);
            const messageText = String(payload.messageText || '').trim();

            if (!roomId) {
                throw new Error('Valid roomId is required');
            }

            if (!messageText) {
                throw new Error('messageText is required');
            }

            const room = await roomService.getRoomById(roomId);
            roomService.assertRoomAccess(room, socket.user.service);

            if (socket.user.service === 'Manager' || String(socket.user.service).toUpperCase() === 'MANAGER') {
                throw new Error('Action non autorisée');
            }

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
            io.emit('rooms_updated');
            sendAck(ack, { success: true, data: broadcastPayload });
        } catch (error) {
            sendAck(ack, { success: false, error: error.message });
            if (error.message === INACTIVE_ACCOUNT_MESSAGE) socket.disconnect(true);
        }
    });
}

module.exports = registerChatHandlers;
