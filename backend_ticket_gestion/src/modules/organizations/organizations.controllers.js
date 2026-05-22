const organizationService = require('./organizations.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');

async function listOrganizations(req, res) {
    try {
        const data = await organizationService.listOrganizations();
        sendSuccess(res, 200, 'Organizations loaded successfully', data);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function getOrganization(req, res) {
    try {
        const data = await organizationService.getOrganization(req.params.id);
        sendSuccess(res, 200, 'Organization loaded successfully', data);
    } catch (error) {
        const status = error.message === 'Organization not found' ? 404 : 500;
        sendError(res, status, error.message);
    }
}

async function createOrganization(req, res) {
    try {
        const data = await organizationService.createOrganization(req.body);
        sendSuccess(res, 201, 'Organization created successfully', data);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

async function updateOrganization(req, res) {
    try {
        const data = await organizationService.updateOrganization(req.params.id, req.body);
        sendSuccess(res, 200, 'Organization updated successfully', data);
    } catch (error) {
        const status = error.message === 'Organization not found' ? 404 : 400;
        sendError(res, status, error.message);
    }
}

async function deleteOrganization(req, res) {
    try {
        await organizationService.deleteOrganization(req.params.id);
        sendSuccess(res, 200, 'Organization deleted successfully');
    } catch (error) {
        let status = 500;
        if (error.message === 'Organization not found') status = 404;
        if (error.message === 'Cannot delete organization with existing contacts') status = 409;
        sendError(res, status, error.message);
    }
}

module.exports = { listOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization };
