const express = require('express');
const auth = require('../../middleware/auth');
const organizationController = require('./organizations.controllers');
const contactController      = require('../contacts/contacts.controllers');

const router = express.Router();

// Routes organisations
router.get('/',    auth, organizationController.listOrganizations);
router.get('/:id', auth, organizationController.getOrganization);
router.post('/',   auth, organizationController.createOrganization);
router.put('/:id', auth, organizationController.updateOrganization);
router.delete('/:id', auth, organizationController.deleteOrganization);

// Routes contacts rattachés à une organisation  ← clé du besoin frontend
router.get('/:orgId/contacts',  auth, contactController.listContactsByOrganization);
router.post('/:orgId/contacts', auth, contactController.createContactForOrganization);

module.exports = router;
