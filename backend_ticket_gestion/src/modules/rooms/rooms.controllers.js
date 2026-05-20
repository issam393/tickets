const roomService = require('./rooms.services');

async function listRooms(req, res) {
    try {
        const rooms = await roomService.listRoomsForRole(req.user.service);
        res.status(200).json({ data: rooms });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getRoomByTicket(req, res) {
    try {
        const room = await roomService.getRoomByTicketId(req.params.ticketId);
        roomService.assertRoomAccess(room, req.user.service);
        res.status(200).json({ data: room });
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        res.status(status).json({ error: error.message });
    }
}

async function getRoomHistory(req, res) {
    try {
        const history = await roomService.getRoomHistory(req.params.roomId, req.user.service);
        res.status(200).json({ data: history });
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        res.status(status).json({ error: error.message });
    }
}

module.exports = {
    listRooms,
    getRoomByTicket,
    getRoomHistory
};