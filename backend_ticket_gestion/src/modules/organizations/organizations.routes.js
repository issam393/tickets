const express = require('express');
const auth = require('../../middleware/auth');
const { requireServiceDelivery, requireServiceDeliveryOrManager } = require('../../middleware/roleCheck');
const organizationController = require('./organizations.controllers');
const contactController      = require('../contacts/contacts.controllers');

const router = express.Router();

// Routes organisations
router.get('/',    auth, requireServiceDeliveryOrManager, organizationController.listOrganizations);
router.get('/:id', auth, requireServiceDeliveryOrManager, organizationController.getOrganization);
router.post('/',   auth, requireServiceDelivery, organizationController.createOrganization);
router.put('/:id', auth, requireServiceDelivery, organizationController.updateOrganization);
router.delete('/:id', auth, requireServiceDelivery, organizationController.deleteOrganization);

// Routes contacts rattachés à une organisation  ← clé du besoin frontend
router.get('/:orgId/contacts',  auth, requireServiceDeliveryOrManager, contactController.listContactsByOrganization);
router.post('/:orgId/contacts', auth, requireServiceDelivery, contactController.createContactForOrganization);

module.exports = router;
