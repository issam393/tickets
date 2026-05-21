const express = require('express');
const auth = require('../../middleware/auth');
const { requireServiceDelivery, requireServiceDeliveryOrManager } = require('../../middleware/roleCheck');
const roomRepo = require('./meetingRooms.repository');

const router = express.Router();

// Read – SD and Manager
router.get('/', auth, requireServiceDeliveryOrManager, async (req, res) => {
    try {
        const rooms = await roomRepo.getAllRooms();
        res.json({ data: rooms });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Write – Service Delivery only
router.post('/', auth, requireServiceDelivery, async (req, res) => {
    try {
        const id = await roomRepo.createRoom(req.body);
        const room = await roomRepo.getRoomById(id);
        res.status(201).json({ data: room });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', auth, requireServiceDelivery, async (req, res) => {
    try {
        await roomRepo.updateRoom(req.params.id, req.body);
        const room = await roomRepo.getRoomById(req.params.id);
        res.json({ data: room });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', auth, requireServiceDelivery, async (req, res) => {
    try {
        await roomRepo.deleteRoom(req.params.id);
        res.json({ message: 'Room deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

