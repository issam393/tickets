const organizationService = require('./organizations.services');

async function listOrganizations(req, res) {
    try {
        const data = await organizationService.listOrganizations();
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getOrganization(req, res) {
    try {
        const data = await organizationService.getOrganization(req.params.id);
        res.status(200).json({ data });
    } catch (error) {
        const status = error.message === 'Organization not found' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
}

async function createOrganization(req, res) {
    try {
        const data = await organizationService.createOrganization(req.body);
        res.status(201).json({ data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function updateOrganization(req, res) {
    try {
        const data = await organizationService.updateOrganization(req.params.id, req.body);
        res.status(200).json({ data });
    } catch (error) {
        const status = error.message === 'Organization not found' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
}

async function deleteOrganization(req, res) {
    try {
        await organizationService.deleteOrganization(req.params.id);
        res.status(200).json({ message: 'Organization deleted' });
    } catch (error) {
        let status = 500;
        if (error.message === 'Organization not found') status = 404;
        if (error.message === 'Cannot delete organization with existing contacts') status = 409;
        res.status(status).json({ error: error.message });
    }
}

module.exports = { listOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization };