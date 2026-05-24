const express = require('express');
const auth = require('../../middleware/auth');
const { requireServiceDelivery } = require('../../middleware/roleCheck');
const clientEmailController = require('./clientEmails.controllers');

const router = express.Router();

router.get('/', auth, requireServiceDelivery, clientEmailController.listEmails);
router.post('/sync', auth, requireServiceDelivery, clientEmailController.syncInbox);
router.post('/inbound', auth, requireServiceDelivery, clientEmailController.receiveEmail);
router.patch('/:emailId/read', auth, requireServiceDelivery, clientEmailController.markEmailRead);

module.exports = router;
