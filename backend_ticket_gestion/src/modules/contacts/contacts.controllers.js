const contactService = require('./contacts.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');

async function listContacts(req, res) {
    try {
        const data = await contactService.listContacts();
        sendSuccess(res, 200, 'Contacts loaded successfully', data);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

// GET /api/organizations/:orgId/contacts
async function listContactsByOrganization(req, res) {
    try {
        const data = await contactService.listContactsByOrganization(req.params.orgId);
        sendSuccess(res, 200, 'Contacts loaded successfully', data);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function getContact(req, res) {
    try {
        const data = await contactService.getContact(req.params.id);
        sendSuccess(res, 200, 'Contact loaded successfully', data);
    } catch (error) {
        const status = error.message === 'Contact not found' ? 404 : 500;
        sendError(res, status, error.message);
    }
}

async function createContact(req, res) {
    try {
        const data = await contactService.createContact(req.body);
        sendSuccess(res, 201, 'Contact created successfully', data);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

// POST /api/organizations/:orgId/contacts  — organization_id forcé
async function createContactForOrganization(req, res) {
    try {
        const data = await contactService.createContact(req.body, req.params.orgId);
        sendSuccess(res, 201, 'Contact created successfully', data);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

async function updateContact(req, res) {
    try {
        const data = await contactService.updateContact(req.params.id, req.body);
        sendSuccess(res, 200, 'Contact updated successfully', data);
    } catch (error) {
        const status = error.message === 'Contact not found' ? 404 : 400;
        sendError(res, status, error.message);
    }
}

async function deleteContact(req, res) {
    try {
        await contactService.deleteContact(req.params.id);
        sendSuccess(res, 200, 'Contact deleted successfully');
    } catch (error) {
        const status = error.message === 'Contact not found' ? 404 : 500;
        sendError(res, status, error.message);
    }
}

module.exports = {
    listContacts,
    listContactsByOrganization,
    getContact,
    createContact,
    createContactForOrganization,
    updateContact,
    deleteContact
};
