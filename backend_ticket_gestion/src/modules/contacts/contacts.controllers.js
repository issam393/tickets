const contactService = require('./contacts.services');

async function listContacts(req, res) {
    try {
        const data = await contactService.listContacts();
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// GET /api/organizations/:orgId/contacts
async function listContactsByOrganization(req, res) {
    try {
        const data = await contactService.listContactsByOrganization(req.params.orgId);
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getContact(req, res) {
    try {
        const data = await contactService.getContact(req.params.id);
        res.status(200).json({ data });
    } catch (error) {
        const status = error.message === 'Contact not found' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
}

async function createContact(req, res) {
    try {
        const data = await contactService.createContact(req.body);
        res.status(201).json({ data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// POST /api/organizations/:orgId/contacts  — organization_id forcé
async function createContactForOrganization(req, res) {
    try {
        const data = await contactService.createContact(req.body, req.params.orgId);
        res.status(201).json({ data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function updateContact(req, res) {
    try {
        const data = await contactService.updateContact(req.params.id, req.body);
        res.status(200).json({ data });
    } catch (error) {
        const status = error.message === 'Contact not found' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
}

async function deleteContact(req, res) {
    try {
        await contactService.deleteContact(req.params.id);
        res.status(200).json({ message: 'Contact deleted' });
    } catch (error) {
        const status = error.message === 'Contact not found' ? 404 : 500;
        res.status(status).json({ error: error.message });
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
