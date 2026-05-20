const express = require('express');
const auth = require('../../middleware/auth');
const roomRepo = require('./meetingRooms.repository');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const rooms = await roomRepo.getAllRooms();
        res.json({ data: rooms });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const id = await roomRepo.createRoom(req.body);
        const room = await roomRepo.getRoomById(id);
        res.status(201).json({ data: room });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        await roomRepo.updateRoom(req.params.id, req.body);
        const room = await roomRepo.getRoomById(req.params.id);
        res.json({ data: room });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await roomRepo.deleteRoom(req.params.id);
        res.json({ message: 'Room deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;