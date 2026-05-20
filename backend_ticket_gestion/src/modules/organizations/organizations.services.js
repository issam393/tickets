const organizationRepository = require('./organizations.repository');

const VALID_STATUSES  = ['Active', 'Inactive'];
const VALID_INDUSTRIES = [
    'Financial Services', 'Management Consulting', 'Government',
    'Legal Services', 'Technology', 'Healthcare', 'Retail', 'Manufacturing'
];

function validateOrganizationPayload(payload) {
    if (!payload.name     || !String(payload.name).trim())     throw new Error('name is required');
    if (!payload.industry || !String(payload.industry).trim()) throw new Error('industry is required');
    if (!payload.email    || !String(payload.email).trim())    throw new Error('email is required');
    if (!payload.phone    || !String(payload.phone).trim())    throw new Error('phone is required');
}

function validateStatus(status) {
    if (status && !VALID_STATUSES.includes(status)) throw new Error('Invalid status value');
}

function normalizeOrganization(record) {
    return {
        id:            record.id,
        name:          record.name,
        industry:      record.industry,
        email:         record.email,
        phone:         record.phone,
        address:       record.address || null,
        status:        record.status,
        contactsCount: Number(record.contactsCount) || 0,
        createdAt:     record.createdAt,
        updatedAt:     record.updatedAt
    };
}

async function listOrganizations() {
    const rows = await organizationRepository.getAllOrganizations();
    return rows.map(normalizeOrganization);
}

async function getOrganization(id) {
    const record = await organizationRepository.getOrganizationById(id);
    if (!record) throw new Error('Organization not found');
    return normalizeOrganization(record);
}

async function createOrganization(payload) {
    validateOrganizationPayload(payload);
    validateStatus(payload.status);

    const id = await organizationRepository.createOrganization({
        name:     String(payload.name).trim(),
        industry: String(payload.industry).trim(),
        email:    String(payload.email).trim(),
        phone:    String(payload.phone).trim(),
        address:  payload.address ? String(payload.address).trim() : null,
        status:   payload.status || 'Active'
    });

    const created = await organizationRepository.getOrganizationById(id);
    return normalizeOrganization(created);
}

async function updateOrganization(id, payload) {
    const existing = await organizationRepository.getOrganizationById(id);
    if (!existing) throw new Error('Organization not found');

    if (payload.status) validateStatus(payload.status);

    const updateData = {};
    if (payload.name !== undefined)     updateData.name     = String(payload.name).trim();
    if (payload.industry !== undefined) updateData.industry = String(payload.industry).trim();
    if (payload.email !== undefined)    updateData.email    = String(payload.email).trim();
    if (payload.phone !== undefined)    updateData.phone    = payload.phone ? String(payload.phone).trim() : null;
    if (payload.address !== undefined)  updateData.address  = payload.address ? String(payload.address).trim() : null;
    if (payload.status !== undefined)   updateData.status   = payload.status;

    await organizationRepository.updateOrganization(id, updateData);
    const updated = await organizationRepository.getOrganizationById(id);
    return normalizeOrganization(updated);
}

async function deleteOrganization(id) {
    const existing = await organizationRepository.getOrganizationById(id);
    if (!existing) throw new Error('Organization not found');

    // Bloc suppression si des contacts sont encore liés
    const blocked = await organizationRepository.hasContacts(id);
    if (blocked) throw new Error('Cannot delete organization with existing contacts');

    await organizationRepository.deleteOrganization(id);
}

module.exports = { listOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization };