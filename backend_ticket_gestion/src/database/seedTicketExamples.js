const db = require('../config/db');

const SAMPLE_TICKETS = [
    {
        requestCode: 'DEMO-TKT-001',
        clientName: 'Client 01',
        clientEmail: 'client01@agce.dz',
        clientPhone: '0550000001',
        organization: 'Entrprise01',
        organizationEmail: 'contact@entreprise01.dz',
        organizationPhone: '0551000001',
        application: 'Web RA',
        issueType: 'Bug in Application',
        issueLevel: 'Important',
        description: 'The LRAO could not view the list of certificates.',
        resolution: 'Patch 2.6.3 of Web RA.',
        allowedServices: ['SD', 'PKI']
    },
    {
        requestCode: 'DEMO-TKT-002',
        clientName: 'Client 02',
        clientEmail: 'client02@agce.dz',
        clientPhone: '0550000002',
        organization: 'Entrprise02',
        organizationEmail: 'contact@entreprise02.dz',
        organizationPhone: '0551000002',
        application: 'AGCE RS Plugin (VCSP)',
        issueType: 'Functionality problem / deletion',
        issueLevel: 'Urgent',
        description: 'Incorrect certificate used for signing: "Failed: certificate is expired". Error related to the client user ID: Client02@entreprise02.dz.',
        resolution: 'In VCSP 3.3.5, the old expired certificate was used even when the new certificate was selected. The solution was to upgrade to VCSP 3.4.0, which correctly detects certificate status and automatically excludes expired certificates from signing.',
        allowedServices: ['SD']
    },
    {
        requestCode: 'DEMO-TKT-003',
        clientName: 'Client 03',
        clientEmail: 'client03@agce.dz',
        clientPhone: '0550000003',
        organization: 'Entrprise03',
        organizationEmail: 'contact@entreprise03.dz',
        organizationPhone: '0551000003',
        application: 'FortiClient',
        issueType: 'Accessibility',
        issueLevel: 'Important',
        description: '"FortiClient Endpoint Management Server (EMS) not found".',
        resolution: 'The IT team identified that the IP address was not properly whitelisted and corrected the whitelist configuration.',
        allowedServices: ['SD', 'IT']
    }
];

async function getServiceDeliveryEmployeeId() {
    const [rows] = await db.execute(
        `SELECT e.id
         FROM employees e
         JOIN services s ON s.id = e.service_id
         WHERE UPPER(s.name) IN ('SD', 'SERVICE DELIVERY')
           AND e.status = 'Active'
         ORDER BY e.id ASC
         LIMIT 1`
    );
    return rows[0]?.id || null;
}

async function ensureOrganization(sample) {
    const [existing] = await db.execute(
        'SELECT id FROM organizations WHERE name = ? LIMIT 1',
        [sample.organization]
    );
    if (existing.length) return existing[0].id;

    const [result] = await db.execute(
        `INSERT INTO organizations (name, industry, email, phone, address, status)
         VALUES (?, 'Technology', ?, ?, NULL, 'Active')`,
        [sample.organization, sample.organizationEmail, sample.organizationPhone]
    );
    return result.insertId;
}

async function ensureContact(sample, organizationId) {
    const [existing] = await db.execute(
        'SELECT id FROM contacts WHERE email = ? LIMIT 1',
        [sample.clientEmail]
    );
    if (existing.length) return existing[0].id;

    const [result] = await db.execute(
        `INSERT INTO contacts (name, type, email, phone, job_title, status, organization_id)
         VALUES (?, 'Applicant', ?, ?, 'Client contact', 'Active', ?)`,
        [sample.clientName, sample.clientEmail, sample.clientPhone, organizationId]
    );
    return result.insertId;
}

async function ensureTicket(sample, organizationId, contactId, creatorId) {
    const [existing] = await db.execute(
        'SELECT id FROM tickets WHERE request_code = ? LIMIT 1',
        [sample.requestCode]
    );
    if (existing.length) return existing[0].id;

    const [result] = await db.execute(
        `INSERT INTO tickets (
            request_code, organization_id, client_id, application, issue_type,
            issue_level, issue_description, resolution, status, created_by
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Resolved', ?)`,
        [
            sample.requestCode,
            organizationId,
            String(contactId),
            sample.application,
            sample.issueType,
            sample.issueLevel,
            sample.description,
            sample.resolution,
            creatorId
        ]
    );

    await db.execute(
        `INSERT INTO rooms (ticket_id, name, room_type, allowed_services)
         VALUES (?, ?, ?, ?)`,
        [
            result.insertId,
            `${sample.issueType} - ${sample.issueLevel} - ${sample.requestCode}`,
            sample.issueType,
            JSON.stringify(sample.allowedServices)
        ]
    );
    return result.insertId;
}

async function seedTicketExamples() {
    const creatorId = await getServiceDeliveryEmployeeId();
    if (!creatorId) {
        console.warn('Sample tickets were not inserted: no active Service Delivery employee was found.');
        return;
    }

    for (const sample of SAMPLE_TICKETS) {
        const organizationId = await ensureOrganization(sample);
        const contactId = await ensureContact(sample, organizationId);
        await ensureTicket(sample, organizationId, contactId, creatorId);
    }
}

module.exports = seedTicketExamples;
