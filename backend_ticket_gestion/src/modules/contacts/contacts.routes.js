const express = require('express');
const auth = require('../../middleware/auth');
const contactController = require('./contacts.controllers');

const router = express.Router();

// Routes contacts globales
router.get('/',    auth, contactController.listContacts);
router.get('/:id', auth, contactController.getContact);
router.post('/',   auth, contactController.createContact);
router.put('/:id', auth, contactController.updateContact);
router.delete('/:id', auth, contactController.deleteContact);

module.exports = router;