const express = require('express');
const auth = require('../../middleware/auth');
const { requireServiceDelivery, requireServiceDeliveryOrManager } = require('../../middleware/roleCheck');
const contactController = require('./contacts.controllers');

const router = express.Router();

// Read – SD and Manager
router.get('/',    auth, requireServiceDeliveryOrManager, contactController.listContacts);
router.get('/:id', auth, requireServiceDeliveryOrManager, contactController.getContact);

// Write – Service Delivery only
router.post('/',   auth, requireServiceDelivery, contactController.createContact);
router.put('/:id', auth, requireServiceDelivery, contactController.updateContact);
router.delete('/:id', auth, requireServiceDelivery, contactController.deleteContact);

module.exports = router;
