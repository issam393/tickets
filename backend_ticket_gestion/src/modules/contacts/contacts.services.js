const contactRepository = require('./contacts.repository');

const VALID_TYPES    = ['Applicant', 'Representative', 'LRAO', 'Consultant', 'Government Official', 'Legal Representative', 'Technical Expert'];
const VALID_STATUSES = ['Active', 'Inactive', 'Pending'];

function validateContactPayload(payload) {
    if (!payload.name  || !String(payload.name).trim())  throw new Error('name is required');
    if (!payload.type)                                    throw new Error('type is required');
    if (!payload.email || !String(payload.email).trim()) throw new Error('email is required');
    
    const types = String(payload.type).split(',').map(t => t.trim());
    for (const t of types) {
        if (!VALID_TYPES.includes(t)) {
            throw new Error(`Invalid contact type: ${t}`);
        }
    }
}

function validateStatus(status) {
    if (status && !VALID_STATUSES.includes(status)) throw new Error('Invalid status value');
}

function normalizeContact(record) {
    return {
        id:             record.id,
        name:           record.name,
        type:           record.type,
        email:          record.email,
        phone:          record.phone   || null,
        jobTitle:       record.job_title || null,
        status:         record.status,
        organizationId: record.organization_id,
        organization:   record.organization || null,
        createdAt:      record.createdAt,
        updatedAt:      record.updatedAt
    };
}

async function listContacts() {
    const rows = await contactRepository.getAllContacts();
    return rows.map(normalizeContact);
}

async function listContactsByOrganization(organizationId) {
    const rows = await contactRepository.getContactsByOrganization(organizationId);
    return rows.map(normalizeContact);
}

async function getContact(id) {
    const record = await contactRepository.getContactById(id);
    if (!record) throw new Error('Contact not found');
    return normalizeContact(record);
}

async function createContact(payload, forcedOrganizationId = null) {
    validateContactPayload(payload);
    validateStatus(payload.status);

    const organizationId = forcedOrganizationId
        ? Number(forcedOrganizationId)
        : (payload.organizationId ? Number(payload.organizationId) : null);

    const id = await contactRepository.createContact({
        name:           String(payload.name).trim(),
        type:           payload.type,
        email:          String(payload.email).trim(),
        phone:          payload.phone    ? String(payload.phone).trim()    : null,
        jobTitle:       payload.jobTitle ? String(payload.jobTitle).trim() : null,
        status:         payload.status || 'Active',
        organizationId
    });

    const created = await contactRepository.getContactById(id);
    return normalizeContact(created);
}

async function updateContact(id, payload) {
    const existing = await contactRepository.getContactById(id);
    if (!existing) throw new Error('Contact not found');

    if (payload.type)   { if (!VALID_TYPES.includes(payload.type)) throw new Error('Invalid contact type'); }
    if (payload.status) validateStatus(payload.status);

    const updateData = {};
    if (payload.name !== undefined)           updateData.name           = String(payload.name).trim();
    if (payload.type !== undefined)           updateData.type           = payload.type;
    if (payload.email !== undefined)          updateData.email          = String(payload.email).trim();
    if (payload.phone !== undefined)          updateData.phone          = payload.phone    ? String(payload.phone).trim()    : null;
    if (payload.jobTitle !== undefined)       updateData.jobTitle       = payload.jobTitle ? String(payload.jobTitle).trim() : null;
    if (payload.status !== undefined)         updateData.status         = payload.status;
    if (payload.organizationId !== undefined) updateData.organizationId = payload.organizationId ? Number(payload.organizationId) : null;

    await contactRepository.updateContact(id, updateData);
    const updated = await contactRepository.getContactById(id);
    return normalizeContact(updated);
}

async function deleteContact(id) {
    const existing = await contactRepository.getContactById(id);
    if (!existing) throw new Error('Contact not found');
    await contactRepository.deleteContact(id);
}

module.exports = {
    listContacts,
    listContactsByOrganization,
    getContact,
    createContact,
    updateContact,
    deleteContact
};
