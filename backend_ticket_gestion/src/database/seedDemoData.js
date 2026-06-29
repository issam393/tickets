const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const db = require('../config/db');

const PASSWORD = 'Demo@2026!';
const TICKET_COUNT = 100;
const SERVICE_ROLES = ['IT', 'SD', 'MANAGER', 'ADMIN', 'PKI'];

function createRng(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

const rng = createRng(20260531);

function choice(items) {
    return items[Math.floor(rng() * items.length)];
}

function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(rng() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

function slugify(value) {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function emailName(firstName, lastName) {
    return `${slugify(firstName).replace(/_/g, '.')}.${slugify(lastName).replace(/_/g, '.')}`;
}

function formatMysqlDate(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

const EMPLOYEES = [
    ['Amine', 'Benali'],
    ['Sarah', 'Mekki'],
    ['Yasmine', 'Haddad'],
    ['Karim', 'Bouchareb'],
    ['Nadia', 'Saidi'],
    ['Mohamed', 'Zeroual'],
    ['Lina', 'Mansouri'],
    ['Riad', 'Belkacem'],
    ['Ines', 'Rahmani'],
    ['Samir', 'Ait Ali'],
    ['Leila', 'Bouzid'],
    ['Sofiane', 'Khelifi'],
    ['Meriem', 'Ouali'],
    ['Walid', 'Hamdi'],
    ['Aya', 'Cherif'],
    ['Hichem', 'Bensaid'],
    ['Farah', 'Taleb'],
    ['Adel', 'Berrached'],
    ['Rania', 'Touati'],
    ['Nabil', 'Ferhat']
];

const ORGANIZATIONS = [
    {
        name: 'Atlas Finance Algerie',
        industry: 'Finance',
        email: 'contact@atlas-finance.dz',
        phone: '021450101',
        address: 'Hydra, Alger',
        contacts: [
            ['Omar', 'Bensalem', 'Legal Representative'],
            ['Selma', 'Kara', 'PKI Coordinator'],
            ['Mourad', 'Khaldi', 'Technical Expert']
        ]
    },
    {
        name: 'Numidia Telecom Services',
        industry: 'Telecommunications',
        email: 'contact@numidia-telecom.dz',
        phone: '021450102',
        address: 'Bab Ezzouar, Alger',
        contacts: [
            ['Amina', 'Berrah', 'Service Manager'],
            ['Hakim', 'Meziane', 'Network Engineer'],
            ['Lila', 'Guemra', 'Compliance Officer']
        ]
    },
    {
        name: 'Tassili Energy Solutions',
        industry: 'Energy',
        email: 'contact@tassili-energy.dz',
        phone: '021450103',
        address: 'Hassi Messaoud, Ouargla',
        contacts: [
            ['Fares', 'Oukaci', 'Operations Manager'],
            ['Dounia', 'Tebbal', 'Security Officer'],
            ['Nacer', 'Aouadi', 'Technical Expert']
        ]
    },
    {
        name: 'Casbah Assurance',
        industry: 'Insurance',
        email: 'contact@casbah-assurance.dz',
        phone: '021450104',
        address: 'Didouche Mourad, Alger',
        contacts: [
            ['Nadia', 'Merad', 'Legal Representative'],
            ['Younes', 'Boukerche', 'IT Manager'],
            ['Ibtissem', 'Sahraoui', 'Client Services Lead']
        ]
    },
    {
        name: 'Mitidja Pharma',
        industry: 'Healthcare',
        email: 'contact@mitidja-pharma.dz',
        phone: '021450105',
        address: 'Blida Centre, Blida',
        contacts: [
            ['Samira', 'Dridi', 'Quality Manager'],
            ['Mehdi', 'Bellil', 'Information Systems Lead'],
            ['Kenza', 'Amrani', 'Regulatory Officer']
        ]
    },
    {
        name: 'Oran Logistics Hub',
        industry: 'Logistics',
        email: 'contact@oran-logistics.dz',
        phone: '041450106',
        address: 'Es Senia, Oran',
        contacts: [
            ['Rachid', 'Benaissa', 'Operations Director'],
            ['Houda', 'Belmokhtar', 'Support Coordinator'],
            ['Anis', 'Seddiki', 'Systems Administrator']
        ]
    },
    {
        name: 'Sahara Digital Bank',
        industry: 'Banking',
        email: 'contact@sahara-digital-bank.dz',
        phone: '029450107',
        address: 'Ghardaia Centre, Ghardaia',
        contacts: [
            ['Wassim', 'Laib', 'Digital Channels Manager'],
            ['Malika', 'Hamzaoui', 'Risk Officer'],
            ['Badis', 'Kaci', 'Application Owner']
        ]
    },
    {
        name: 'Kabylie Agro Industrie',
        industry: 'Agro-industry',
        email: 'contact@kabylie-agro.dz',
        phone: '026450108',
        address: 'Tizi Ouzou Centre, Tizi Ouzou',
        contacts: [
            ['Sofiane', 'Rabah', 'Plant Manager'],
            ['Manel', 'Boudiaf', 'Procurement Lead'],
            ['Aksel', 'Ferhani', 'IT Support Lead']
        ]
    },
    {
        name: 'Aurassi Public Works',
        industry: 'Construction',
        email: 'contact@aurassi-public-works.dz',
        phone: '033450109',
        address: 'Batna Centre, Batna',
        contacts: [
            ['Zohra', 'Chettah', 'Project Director'],
            ['Reda', 'Allal', 'Technical Manager'],
            ['Nesrine', 'Djebbar', 'Administrative Lead']
        ]
    },
    {
        name: 'Constantine Health Systems',
        industry: 'Healthcare',
        email: 'contact@constantine-health.dz',
        phone: '031450110',
        address: 'Nouvelle Ville, Constantine',
        contacts: [
            ['Walid', 'Boudjemaa', 'Clinical Systems Manager'],
            ['Souhila', 'Mansour', 'Security Coordinator'],
            ['Ilyes', 'Benyahia', 'Technical Expert']
        ]
    }
];

const CONTACT_TYPES = [
    'Applicant',
    'Consultant',
    'Government Official',
    'Legal Representative',
    'Technical Expert'
];

const SERVICE_ISSUES = {
    SD: [
        'Client onboarding follow-up',
        'Account permission request',
        'Request documentation review',
        'Support escalation intake'
    ],
    IT: [
        'VPN access failure',
        'Email gateway incident',
        'Client API integration error',
        'Workstation certificate store issue'
    ],
    PKI: [
        'Certificate issuance delay',
        'Digital signature validation',
        'PKI token blocked',
        'Web RA display issue'
    ]
};

const APPLICATIONS = [
    'Web RA',
    'AGCE RS Plugin (VCSP)',
    'FortiClient VPN',
    'PKI Portal',
    'Service Desk',
    'Email Gateway',
    'Identity Management',
    'Client API'
];

const ISSUE_LEVELS = ['Level 1 Assistance', 'Important', 'Urgent', 'Critical'];
const PREFERRED_STATUSES = ['Pending', 'In Progress', 'Warning', 'Critical', 'Resolved'];

async function ensureService(connection, name) {
    const [existing] = await connection.execute(
        'SELECT id FROM services WHERE UPPER(name) = UPPER(?) LIMIT 1',
        [name]
    );
    if (existing.length) return existing[0].id;

    const [result] = await connection.execute(
        'INSERT INTO services (name) VALUES (?)',
        [name]
    );
    return result.insertId;
}

async function ensureEmployee(connection, employee, role, serviceId, passwordHash) {
    const [firstName, lastName] = employee;
    const baseUserName = `${slugify(firstName)}_${slugify(lastName)}`;
    const email = `${emailName(firstName, lastName)}@agce.demo`;

    const [existing] = await connection.execute(
        'SELECT id FROM employees WHERE email = ? OR userName = ? LIMIT 1',
        [email, baseUserName]
    );
    if (existing.length) {
        return { id: existing[0].id, role, inserted: false };
    }

    const [result] = await connection.execute(
        `INSERT INTO employees (firstName, lastName, email, userName, password, service_id, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
        [firstName, lastName, email, baseUserName, passwordHash, serviceId]
    );

    return { id: result.insertId, role, inserted: true };
}

async function ensureOrganization(connection, organization) {
    const [existing] = await connection.execute(
        'SELECT id FROM organizations WHERE name = ? LIMIT 1',
        [organization.name]
    );
    if (existing.length) {
        return { id: existing[0].id, inserted: false };
    }

    const [result] = await connection.execute(
        `INSERT INTO organizations (name, industry, email, phone, address, status)
         VALUES (?, ?, ?, ?, ?, 'Active')`,
        [organization.name, organization.industry, organization.email, organization.phone, organization.address]
    );
    return { id: result.insertId, inserted: true };
}

async function ensureContact(connection, contact, organization, organizationId, index) {
    const [firstName, lastName, jobTitle] = contact;
    const domain = organization.email.split('@')[1];
    const email = `${emailName(firstName, lastName)}@${domain}`;

    const [existing] = await connection.execute(
        'SELECT id FROM contacts WHERE email = ? LIMIT 1',
        [email]
    );
    if (existing.length) {
        return { id: existing[0].id, organizationId, inserted: false };
    }

    const phoneSuffix = String(1000 + index).padStart(4, '0');
    const [result] = await connection.execute(
        `INSERT INTO contacts (name, type, email, phone, job_title, status, organization_id)
         VALUES (?, ?, ?, ?, ?, 'Active', ?)`,
        [
            `${firstName} ${lastName}`,
            CONTACT_TYPES[index % CONTACT_TYPES.length],
            email,
            `0555${phoneSuffix}`,
            jobTitle,
            organizationId
        ]
    );

    return { id: result.insertId, organizationId, inserted: true };
}

async function getAvailableStatuses(connection) {
    const [columns] = await connection.execute("SHOW COLUMNS FROM tickets LIKE 'status'");
    const type = columns[0]?.Type || '';
    const matches = [...type.matchAll(/'((?:[^'\\\\]|\\\\.)*)'/g)].map((match) => match[1]);
    const available = PREFERRED_STATUSES.filter((status) => matches.includes(status));
    return available.length ? available : ['Pending', 'Warning', 'Critical', 'Resolved'];
}

function buildTicketPayload(index, contacts, employees, statuses) {
    const targetService = choice(['SD', 'IT', 'PKI']);
    const contact = choice(contacts);
    const serviceEmployees = employees.filter((employee) => employee.role === 'SD');
    const creator = choice(serviceEmployees.length ? serviceEmployees : employees);
    const issueType = choice(SERVICE_ISSUES[targetService]);
    const issueLevel = targetService === 'SD' ? 'Level 1 Assistance' : choice(ISSUE_LEVELS.slice(1));
    const status = choice(statuses);
    const application = choice(APPLICATIONS);
    const daysAgo = Math.floor(rng() * 120);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const requestCode = `SEED-AGCE-2026-${String(index + 1).padStart(3, '0')}`;
    const description = `${contact.name} reported "${issueType}" on ${application}. The request was routed to ${targetService} for analysis and follow-up.`;
    const resolution = status === 'Resolved'
        ? `Resolved by ${targetService} after verification with the client and internal validation.`
        : null;

    return {
        requestCode,
        contactId: contact.id,
        organizationId: contact.organizationId,
        createdBy: creator.id,
        assignedBy: creator.id,
        application,
        issueType,
        issueLevel,
        description,
        resolution,
        status,
        targetService,
        allowedServices: targetService === 'SD' ? ['SD'] : ['SD', targetService],
        createdAt: formatMysqlDate(createdAt)
    };
}

async function ensureRoom(connection, ticketId, payload) {
    const [existing] = await connection.execute(
        'SELECT id FROM rooms WHERE ticket_id = ? LIMIT 1',
        [ticketId]
    );
    if (existing.length) return false;

    await connection.execute(
        `INSERT INTO rooms (ticket_id, name, room_type, allowed_services, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [
            ticketId,
            `${payload.issueType} - ${payload.issueLevel} - ${payload.requestCode}`,
            payload.issueType,
            JSON.stringify(payload.allowedServices),
            payload.createdAt
        ]
    );
    return true;
}

async function ensureAssignmentHistory(connection, ticketId, payload) {
    if (payload.targetService === 'SD') return false;

    const [existing] = await connection.execute(
        'SELECT id FROM ticket_assignment_history WHERE ticket_id = ? AND new_service = ? LIMIT 1',
        [ticketId, payload.targetService]
    );
    if (existing.length) return false;

    await connection.execute(
        `INSERT INTO ticket_assignment_history (
            ticket_id, previous_service, new_service, assigned_by, assigned_at, action_type, created_at
         ) VALUES (?, 'SD', ?, ?, ?, 'assigned', ?)`,
        [ticketId, payload.targetService, payload.assignedBy, payload.createdAt, payload.createdAt]
    );
    return true;
}

async function ensureTicket(connection, payload) {
    const [existing] = await connection.execute(
        'SELECT id FROM tickets WHERE request_code = ? LIMIT 1',
        [payload.requestCode]
    );

    if (existing.length) {
        const roomInserted = await ensureRoom(connection, existing[0].id, payload);
        const assignmentInserted = await ensureAssignmentHistory(connection, existing[0].id, payload);
        return { inserted: false, roomInserted, assignmentInserted };
    }

    const [result] = await connection.execute(
        `INSERT INTO tickets (
            request_code, organization_id, client_id, application, issue_type, issue_level,
            issue_description, resolution, status, created_by, createdAt, updatedAt
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            payload.requestCode,
            payload.organizationId,
            String(payload.contactId),
            payload.application,
            payload.issueType,
            payload.issueLevel,
            payload.description,
            payload.resolution,
            payload.status,
            payload.createdBy,
            payload.createdAt,
            payload.createdAt
        ]
    );

    const roomInserted = await ensureRoom(connection, result.insertId, payload);
    const assignmentInserted = await ensureAssignmentHistory(connection, result.insertId, payload);

    return { inserted: true, roomInserted, assignmentInserted };
}

async function seedDemoData() {
    const connection = await db.getConnection();
    const stats = {
        employeesInserted: 0,
        organizationsInserted: 0,
        contactsInserted: 0,
        ticketsInserted: 0,
        roomsInserted: 0,
        assignmentsInserted: 0
    };

    try {
        await connection.beginTransaction();

        const serviceIds = {};
        for (const serviceName of SERVICE_ROLES) {
            serviceIds[serviceName] = await ensureService(connection, serviceName);
        }

        const passwordHash = await bcrypt.hash(PASSWORD, 10);
        const rolePool = shuffle([
            'SD', 'IT', 'PKI', 'MANAGER', 'ADMIN',
            'SD', 'IT', 'PKI', 'MANAGER', 'ADMIN',
            'SD', 'IT', 'PKI', 'MANAGER', 'ADMIN',
            'SD', 'IT', 'PKI', 'IT', 'SD'
        ]);

        const employeeRecords = [];
        for (let index = 0; index < EMPLOYEES.length; index += 1) {
            const role = rolePool[index];
            const employeeRecord = await ensureEmployee(
                connection,
                EMPLOYEES[index],
                role,
                serviceIds[role],
                passwordHash
            );
            if (employeeRecord.inserted) stats.employeesInserted += 1;
            employeeRecords.push(employeeRecord);
        }

        const contactRecords = [];
        let contactIndex = 0;
        for (const organization of ORGANIZATIONS) {
            const organizationRecord = await ensureOrganization(connection, organization);
            if (organizationRecord.inserted) stats.organizationsInserted += 1;

            for (const contact of organization.contacts) {
                const contactRecord = await ensureContact(
                    connection,
                    contact,
                    organization,
                    organizationRecord.id,
                    contactIndex
                );
                if (contactRecord.inserted) stats.contactsInserted += 1;
                contactRecords.push({
                    ...contactRecord,
                    name: `${contact[0]} ${contact[1]}`
                });
                contactIndex += 1;
            }
        }

        const statuses = await getAvailableStatuses(connection);
        for (let index = 0; index < TICKET_COUNT; index += 1) {
            const payload = buildTicketPayload(index, contactRecords, employeeRecords, statuses);
            const result = await ensureTicket(connection, payload);
            if (result.inserted) stats.ticketsInserted += 1;
            if (result.roomInserted) stats.roomsInserted += 1;
            if (result.assignmentInserted) stats.assignmentsInserted += 1;
        }

        await connection.commit();

        const [totals] = await connection.execute(
            `SELECT
                (SELECT COUNT(*) FROM employees WHERE email LIKE '%@agce.demo') AS demoEmployees,
                (SELECT COUNT(*) FROM organizations WHERE name IN (${ORGANIZATIONS.map(() => '?').join(',')})) AS demoOrganizations,
                (SELECT COUNT(*)
                 FROM contacts c
                 JOIN organizations o ON o.id = c.organization_id
                 WHERE o.name IN (${ORGANIZATIONS.map(() => '?').join(',')})) AS demoContacts,
                (SELECT COUNT(*) FROM tickets WHERE request_code LIKE 'SEED-AGCE-2026-%') AS demoTickets`,
            [
                ...ORGANIZATIONS.map((organization) => organization.name),
                ...ORGANIZATIONS.map((organization) => organization.name)
            ]
        );

        return { stats, totals: totals[0], password: PASSWORD };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

if (require.main === module) {
    seedDemoData()
        .then(async (summary) => {
            console.log(JSON.stringify(summary, null, 2));
            await db.end();
        })
        .catch(async (error) => {
            console.error(error);
            await db.end();
            process.exit(1);
        });
}

module.exports = seedDemoData;
