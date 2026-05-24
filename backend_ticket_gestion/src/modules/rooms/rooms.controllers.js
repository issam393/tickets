const roomService = require('./rooms.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');

async function listRooms(req, res) {
    try {
        const rooms = await roomService.listRoomsForRole(req.user.service, req.user.id);
        sendSuccess(res, 200, 'Rooms loaded successfully', rooms);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function getRoomByTicket(req, res) {
    try {
        const room = await roomService.getRoomByTicketId(req.params.ticketId);
        roomService.assertRoomAccess(room, req.user.service);
        sendSuccess(res, 200, 'Room loaded successfully', room);
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        sendError(res, getErrorStatus(error, status), error.message);
    }
}

async function getRoomHistory(req, res) {
    try {
        const history = await roomService.getRoomHistory(req.params.roomId, req.user.service, req.user.id);
        sendSuccess(res, 200, 'Messages loaded successfully', history);
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        sendError(res, getErrorStatus(error, status), error.message);
    }
}

async function markRoomAsRead(req, res) {
    try {
        await roomService.markRoomAsRead(req.params.roomId, req.user.service, req.user.id);
        sendSuccess(res, 200, 'Room marked as read');
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        sendError(res, getErrorStatus(error, status), error.message);
    }
}

module.exports = {
    listRooms,
    getRoomByTicket,
    getRoomHistory,
    markRoomAsRead
};
