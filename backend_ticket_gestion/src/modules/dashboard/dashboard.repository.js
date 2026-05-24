const db = require('../../config/db');
const activityRepository = require('../activity/activity.repository');

async function one(sql, params = []) {
    const [rows] = await db.execute(sql, params);
    return rows[0] || {};
}

async function many(sql, params = []) {
    const [rows] = await db.execute(sql, params);
    return rows;
}

function number(value) {
    return Number(value) || 0;
}

function nullableNumber(value) {
    if (value === null || value === undefined) return null;
    return Number(value);
}

function mapCounts(rows, key = 'name', value = 'count') {
    return rows.map((row) => ({
        name: row[key] || 'Unknown',
        value: number(row[value])
    }));
}

const ANALYTICS_PERIODS = ['yearly', 'monthly', 'weekly', 'daily'];
const MONTH_LABELS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function pad2(value) {
    return String(value).padStart(2, '0');
}

function formatSqlDate(date) {
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function getIsoWeekValue(date) {
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
    return `${utcDate.getUTCFullYear()}-W${pad2(week)}`;
}

function startOfIsoWeek(year, week) {
    const januaryFourth = new Date(Date.UTC(year, 0, 4));
    const mondayOffset = 1 - (januaryFourth.getUTCDay() || 7);
    const firstMonday = new Date(januaryFourth);
    firstMonday.setUTCDate(januaryFourth.getUTCDate() + mondayOffset);
    const start = new Date(firstMonday);
    start.setUTCDate(firstMonday.getUTCDate() + ((week - 1) * 7));
    if (getIsoWeekValue(start) !== `${year}-W${pad2(week)}`) {
        throw new Error('Invalid analytics week selection');
    }
    return start;
}

function createAnalyticsSelection(period, selection = {}) {
    const selectedPeriod = ANALYTICS_PERIODS.includes(period) ? period : 'weekly';
    const now = new Date();
    const currentYear = now.getFullYear();
    const year = Number(selection.year);
    if (selection.year !== undefined && (!/^\d{4}$/.test(String(selection.year)) || !Number.isInteger(year) || year < 2000 || year > currentYear + 1)) {
        throw new Error('Invalid analytics year selection');
    }
    const validYear = Number.isInteger(year) && year >= 2000 && year <= currentYear + 1 ? year : currentYear;
    let start;
    let end;
    let label;
    let selectedValue;
    let bucket;

    if (selectedPeriod === 'yearly') {
        start = new Date(Date.UTC(validYear, 0, 1));
        end = new Date(Date.UTC(validYear + 1, 0, 1));
        label = String(validYear);
        selectedValue = String(validYear);
        bucket = (column) => `DATE_FORMAT(${column}, '%Y-%m-01')`;
    } else if (selectedPeriod === 'monthly') {
        const month = Number(selection.month);
        if (selection.month !== undefined && (!/^\d{1,2}$/.test(String(selection.month)) || !Number.isInteger(month) || month < 1 || month > 12)) {
            throw new Error('Invalid analytics month selection');
        }
        const validMonth = Number.isInteger(month) && month >= 1 && month <= 12 ? month : now.getMonth() + 1;
        start = new Date(Date.UTC(validYear, validMonth - 1, 1));
        end = new Date(Date.UTC(validYear, validMonth, 1));
        label = `${MONTH_LABELS[validMonth - 1]} ${validYear}`;
        selectedValue = `${validYear}-${pad2(validMonth)}`;
        bucket = (column) => `DATE(${column})`;
    } else if (selectedPeriod === 'daily') {
        const value = /^\d{4}-\d{2}-\d{2}$/.test(String(selection.date || ''))
            ? String(selection.date)
            : formatSqlDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
        start = new Date(`${value}T00:00:00Z`);
        if (Number.isNaN(start.getTime()) || formatSqlDate(start) !== value) {
            throw new Error('Invalid analytics day selection');
        }
        end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 1);
        label = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        selectedValue = value;
        bucket = (column) => `DATE_FORMAT(${column}, '%Y-%m-%d %H:00:00')`;
    } else {
        const fallbackWeek = getIsoWeekValue(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
        const weekValue = /^\d{4}-W\d{2}$/.test(String(selection.week || '')) ? String(selection.week) : fallbackWeek;
        const [weekYear, weekNumber] = weekValue.split('-W').map(Number);
        if (weekYear < 2000 || weekYear > currentYear + 1) {
            throw new Error('Invalid analytics week selection');
        }
        start = startOfIsoWeek(weekYear, weekNumber);
        end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 7);
        label = `Week ${weekNumber}, ${weekYear}`;
        selectedValue = weekValue;
        bucket = (column) => `DATE(${column})`;
    }

    const startDate = formatSqlDate(start);
    const endDate = formatSqlDate(end);
    return {
        period: selectedPeriod,
        periodLabel: label,
        selectedValue,
        startDate,
        endDate,
        bucket,
        filter: (column) => `${column} >= '${startDate} 00:00:00' AND ${column} < '${endDate} 00:00:00'`
    };
}

async function getAvailableAnalyticsYears() {
    const rows = await many(
        `SELECT DISTINCT year_value AS year
         FROM (
            SELECT YEAR(createdAt) AS year_value FROM tickets
            UNION SELECT YEAR(createdAt) AS year_value FROM contacts
            UNION SELECT YEAR(createdAt) AS year_value FROM organizations
         ) periods
         WHERE year_value IS NOT NULL
         ORDER BY year_value DESC`
    );
    const currentYear = new Date().getFullYear();
    const years = rows.map((row) => number(row.year)).filter(Boolean);
    const recentYears = Array.from({ length: 6 }, (_, index) => currentYear - index);
    return [...new Set([...recentYears, ...years])].sort((a, b) => b - a);
}

async function getTicketStatistics() {
    const base = await one(
        `SELECT
            COUNT(*) AS totalTickets,
            SUM(status = 'Pending') AS pendingTickets,
            SUM(status = 'Resolved') AS resolvedTickets,
            SUM(status = 'Critical') AS criticalTickets,
            SUM(status = 'Warning') AS warningTickets,
            SUM(DATE(createdAt) = CURDATE()) AS createdToday,
            SUM(YEARWEEK(createdAt, 1) = YEARWEEK(CURDATE(), 1)) AS createdThisWeek,
            SUM(YEAR(createdAt) = YEAR(CURDATE()) AND MONTH(createdAt) = MONTH(CURDATE())) AS createdThisMonth,
            AVG(CASE WHEN status = 'Resolved' THEN TIMESTAMPDIFF(MINUTE, createdAt, updatedAt) END) AS avgResolutionMinutes
         FROM tickets`
    );

    const assignment = await one(
        `SELECT
            SUM(t.issue_level <> 'Level 1 Assistance' AND r.allowed_services LIKE '%"IT"%') AS assignedToIT,
            SUM(t.issue_level <> 'Level 1 Assistance' AND r.allowed_services LIKE '%"PKI"%') AS assignedToPKI,
            SUM(t.issue_level <> 'Level 1 Assistance' AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"IT"%' AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"PKI"%') AS notAssigned,
            AVG(TIMESTAMPDIFF(MINUTE, t.createdAt, first_assignment.first_assigned_at)) AS avgAssignmentMinutes
         FROM tickets t
         LEFT JOIN rooms r ON r.ticket_id = t.id
         LEFT JOIN (
            SELECT ticket_id, MIN(assigned_at) AS first_assigned_at
            FROM ticket_assignment_history
            GROUP BY ticket_id
         ) first_assignment ON first_assignment.ticket_id = t.id`
    );

    const oldestPending = await one(
        `SELECT id, request_code, application, issue_type, issue_level, status, createdAt
         FROM tickets
         WHERE status = 'Pending'
         ORDER BY createdAt ASC
         LIMIT 1`
    );

    const mostRecentTicket = await one(
        `SELECT id, request_code, application, issue_type, issue_level, status, createdAt
         FROM tickets
         ORDER BY createdAt DESC
         LIMIT 1`
    );

    return {
        totalTickets: number(base.totalTickets),
        pendingTickets: number(base.pendingTickets),
        resolvedTickets: number(base.resolvedTickets),
        criticalTickets: number(base.criticalTickets),
        warningTickets: number(base.warningTickets),
        assignedToIT: number(assignment.assignedToIT),
        assignedToPKI: number(assignment.assignedToPKI),
        notAssigned: number(assignment.notAssigned),
        createdToday: number(base.createdToday),
        createdThisWeek: number(base.createdThisWeek),
        createdThisMonth: number(base.createdThisMonth),
        avgResolutionMinutes: nullableNumber(base.avgResolutionMinutes),
        avgAssignmentMinutes: nullableNumber(assignment.avgAssignmentMinutes),
        oldestPending: oldestPending.id ? oldestPending : null,
        mostRecentTicket: mostRecentTicket.id ? mostRecentTicket : null
    };
}

async function getManagerAnalytics(period = 'weekly', selection = {}) {
    const config = createAnalyticsSelection(period, selection);
    const createdFilter = config.filter('t.createdAt');
    const resolvedFilter = config.filter('t.updatedAt');
    const contactFilter = config.filter('c.createdAt');
    const organizationFilter = config.filter('o.createdAt');
    const commentFilter = config.filter('cm.createdAt');
    const assignmentFilter = config.filter('h.assigned_at');

    const summary = await one(
        `SELECT
            SUM(${createdFilter}) AS totalTickets,
            SUM(${createdFilter} AND t.status = 'Pending') AS pendingTickets,
            SUM(${resolvedFilter} AND t.status = 'Resolved') AS resolvedTickets,
            SUM(${createdFilter} AND (t.status = 'Critical' OR t.issue_level LIKE '%Critical%')) AS criticalTickets,
            SUM(${createdFilter} AND (t.status = 'Warning' OR t.issue_level LIKE '%Warning%')) AS warningTickets,
            SUM(${createdFilter} AND t.issue_level <> 'Level 1 Assistance'
                AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"IT"%'
                AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"PKI"%') AS awaitingAssignment,
            AVG(CASE WHEN ${resolvedFilter} AND t.status = 'Resolved'
                THEN TIMESTAMPDIFF(MINUTE, t.createdAt, t.updatedAt) END) AS avgResolutionMinutes
         FROM tickets t
         LEFT JOIN rooms r ON r.ticket_id = t.id`
    );

    const creationSummary = await one(
        `SELECT
            (SELECT COUNT(*) FROM contacts c WHERE ${contactFilter}) AS contactsCreated,
            (SELECT COUNT(*) FROM organizations o WHERE ${organizationFilter}) AS organizationsCreated`
    );

    const volume = await many(
        `SELECT bucket,
            SUM(kind = 'created') AS created,
            SUM(kind = 'resolved') AS resolved
         FROM (
            SELECT ${config.bucket('t.createdAt')} AS bucket, 'created' AS kind
            FROM tickets t
            WHERE ${createdFilter}
            UNION ALL
            SELECT ${config.bucket('t.updatedAt')} AS bucket, 'resolved' AS kind
            FROM tickets t
            WHERE t.status = 'Resolved' AND ${resolvedFilter}
         ) trend
         GROUP BY bucket
         ORDER BY bucket ASC`
    );

    const resolutionTrend = await many(
        `SELECT
            ${config.bucket('t.updatedAt')} AS bucket,
            AVG(TIMESTAMPDIFF(MINUTE, t.createdAt, t.updatedAt)) AS avgResolutionMinutes,
            COUNT(*) AS resolved
         FROM tickets t
         WHERE t.status = 'Resolved' AND ${resolvedFilter}
         GROUP BY bucket
         ORDER BY bucket ASC`
    );

    const categories = await many(
        `SELECT t.issue_type AS name, COUNT(*) AS count
         FROM tickets t
         WHERE ${createdFilter}
         GROUP BY t.issue_type
         ORDER BY count DESC
         LIMIT 8`
    );

    const services = await many(
        `SELECT handledBy AS name, COUNT(*) AS count
         FROM (
            SELECT CASE
                WHEN t.issue_level = 'Level 1 Assistance' THEN 'SD'
                WHEN r.allowed_services LIKE '%"IT"%' THEN 'IT'
                WHEN r.allowed_services LIKE '%"PKI"%' THEN 'PKI'
                ELSE 'Unassigned'
            END AS handledBy
            FROM tickets t
            LEFT JOIN rooms r ON r.ticket_id = t.id
            WHERE ${createdFilter}
         ) workload
         GROUP BY handledBy
         ORDER BY count DESC`
    );

    const agents = await many(
        `SELECT
            e.id,
            COALESCE(NULLIF(TRIM(CONCAT_WS(' ', e.firstName, e.lastName)), ''), e.userName) AS name,
            s.name AS service,
            (SELECT COUNT(*) FROM tickets t WHERE t.created_by = e.id AND ${config.filter('t.createdAt')}) AS ticketsCreated,
            (SELECT COUNT(*) FROM comments cm WHERE cm.user_id = e.id AND ${commentFilter}) AS commentsAdded,
            (SELECT COUNT(*) FROM ticket_assignment_history h WHERE h.assigned_by = e.id AND ${assignmentFilter}) AS assignments
         FROM employees e
         LEFT JOIN services s ON s.id = e.service_id
         WHERE s.name IN ('SD', 'PKI', 'IT', 'Service Delivery')
         ORDER BY (ticketsCreated + commentsAdded + assignments) DESC, name ASC
         LIMIT 8`
    );

    return {
        period: config.period,
        periodLabel: config.periodLabel,
        filters: {
            selectedValue: config.selectedValue,
            startDate: config.startDate,
            endDate: config.endDate,
            availableYears: await getAvailableAnalyticsYears()
        },
        summary: {
            totalTickets: number(summary.totalTickets),
            pendingTickets: number(summary.pendingTickets),
            resolvedTickets: number(summary.resolvedTickets),
            criticalTickets: number(summary.criticalTickets),
            warningTickets: number(summary.warningTickets),
            awaitingAssignment: number(summary.awaitingAssignment),
            avgResolutionMinutes: nullableNumber(summary.avgResolutionMinutes),
            contactsCreated: number(creationSummary.contactsCreated),
            organizationsCreated: number(creationSummary.organizationsCreated)
        },
        volume: volume.map((row) => ({
            bucket: row.bucket,
            created: number(row.created),
            resolved: number(row.resolved)
        })),
        resolutionTrend: resolutionTrend.map((row) => ({
            bucket: row.bucket,
            avgResolutionMinutes: nullableNumber(row.avgResolutionMinutes),
            resolved: number(row.resolved)
        })),
        categories: mapCounts(categories),
        services: mapCounts(services),
        agents: agents.map((row) => ({
            id: row.id,
            name: row.name,
            service: row.service,
            ticketsCreated: number(row.ticketsCreated),
            commentsAdded: number(row.commentsAdded),
            assignments: number(row.assignments)
        }))
    };
}

async function getCharts() {
    const statusDistribution = await many(
        `SELECT status AS name, COUNT(*) AS count
         FROM tickets
         GROUP BY status
         ORDER BY count DESC`
    );

    const severityDistribution = await many(
        `SELECT issue_level AS name, COUNT(*) AS count
         FROM tickets
         GROUP BY issue_level
         ORDER BY count DESC`
    );

    const serviceDistribution = await many(
        `SELECT service AS name, COUNT(*) AS count
         FROM (
            SELECT
                CASE
                    WHEN t.issue_level = 'Level 1 Assistance' THEN 'SD'
                    WHEN r.allowed_services LIKE '%"IT"%' THEN 'IT'
                    WHEN r.allowed_services LIKE '%"PKI"%' THEN 'PKI'
                    ELSE 'Unassigned'
                END AS service
            FROM tickets t
            LEFT JOIN rooms r ON r.ticket_id = t.id
         ) x
         GROUP BY service`
    );

    const createdVsResolved = await many(
        `SELECT
            DATE(d.day) AS day,
            SUM(d.kind = 'created') AS created,
            SUM(d.kind = 'resolved') AS resolved
         FROM (
            SELECT DATE(createdAt) AS day, 'created' AS kind FROM tickets WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
            UNION ALL
            SELECT DATE(updatedAt) AS day, 'resolved' AS kind FROM tickets WHERE status = 'Resolved' AND updatedAt >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
         ) d
         GROUP BY DATE(d.day)
         ORDER BY DATE(d.day) ASC`
    );

    return {
        statusDistribution: mapCounts(statusDistribution),
        severityDistribution: mapCounts(severityDistribution),
        serviceDistribution: mapCounts(serviceDistribution),
        createdVsResolved: createdVsResolved.map((row) => ({
            day: row.day,
            created: number(row.created),
            resolved: number(row.resolved)
        }))
    };
}

async function getAssignmentAnalytics() {
    const latestAssignments = await many(
        `SELECT
            h.*,
            t.request_code,
            e.firstName,
            e.lastName,
            e.userName,
            s.name AS assigner_service
         FROM ticket_assignment_history h
         JOIN tickets t ON t.id = h.ticket_id
         JOIN employees e ON e.id = h.assigned_by
         LEFT JOIN services s ON s.id = e.service_id
         ORDER BY h.assigned_at DESC
         LIMIT 12`
    );

    const reassignments = await many(
        `SELECT ticket_id, COUNT(*) AS reassignment_count
         FROM ticket_assignment_history
         GROUP BY ticket_id
         HAVING COUNT(*) > 1
         ORDER BY reassignment_count DESC
         LIMIT 10`
    );

    return {
        latestAssignments: latestAssignments.map((row) => ({
            id: row.id,
            ticketId: row.ticket_id,
            requestCode: row.request_code,
            previousService: row.previous_service,
            newService: row.new_service,
            assignedByName: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.userName,
            assignerService: row.assigner_service,
            assignedAt: row.assigned_at
        })),
        reassignments: reassignments.map((row) => ({
            ticketId: row.ticket_id,
            count: number(row.reassignment_count)
        }))
    };
}

async function getWorkflowAnalytics() {
    const summary = await one(
        `SELECT
            SUM(status <> 'Resolved' AND t.issue_level <> 'Level 1 Assistance' AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"IT"%' AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"PKI"%') AS waitingForAssignment,
            SUM(status <> 'Resolved' AND t.issue_level <> 'Level 1 Assistance' AND r.allowed_services LIKE '%"IT"%') AS activeInIT,
            SUM(status <> 'Resolved' AND t.issue_level <> 'Level 1 Assistance' AND r.allowed_services LIKE '%"PKI"%') AS activeInPKI,
            SUM(status = 'Resolved' AND last_assignment.new_service = 'IT') AS resolvedByIT,
            SUM(status = 'Resolved' AND last_assignment.new_service = 'PKI') AS resolvedByPKI,
            AVG(CASE
                WHEN first_assignment.first_assigned_at IS NOT NULL
                THEN TIMESTAMPDIFF(MINUTE, t.createdAt, first_assignment.first_assigned_at)
            END) AS avgCreationToAssignmentMinutes,
            AVG(CASE
                WHEN status = 'Resolved' AND first_assignment.first_assigned_at IS NOT NULL
                THEN TIMESTAMPDIFF(MINUTE, first_assignment.first_assigned_at, t.updatedAt)
            END) AS avgAssignmentToResolutionMinutes,
            SUM(status <> 'Resolved' AND TIMESTAMPDIFF(HOUR, t.createdAt, NOW()) >= 24) AS delayed24h,
            SUM(status <> 'Resolved' AND TIMESTAMPDIFF(HOUR, t.createdAt, NOW()) >= 48) AS delayed48h
         FROM tickets t
         LEFT JOIN rooms r ON r.ticket_id = t.id
         LEFT JOIN (
            SELECT ticket_id, MIN(assigned_at) AS first_assigned_at
            FROM ticket_assignment_history
            GROUP BY ticket_id
         ) first_assignment ON first_assignment.ticket_id = t.id
         LEFT JOIN (
            SELECT h.ticket_id, h.new_service
            FROM ticket_assignment_history h
            JOIN (
                SELECT ticket_id, MAX(assigned_at) AS max_assigned_at
                FROM ticket_assignment_history
                GROUP BY ticket_id
            ) latest ON latest.ticket_id = h.ticket_id AND latest.max_assigned_at = h.assigned_at
         ) last_assignment ON last_assignment.ticket_id = t.id`
    );

    return {
        waitingForAssignment: number(summary.waitingForAssignment),
        activeInIT: number(summary.activeInIT),
        activeInPKI: number(summary.activeInPKI),
        resolvedByIT: number(summary.resolvedByIT),
        resolvedByPKI: number(summary.resolvedByPKI),
        avgCreationToAssignmentMinutes: number(summary.avgCreationToAssignmentMinutes),
        avgAssignmentToResolutionMinutes: number(summary.avgAssignmentToResolutionMinutes),
        delayed24h: number(summary.delayed24h),
        delayed48h: number(summary.delayed48h)
    };
}

async function getCrudSummary() {
    const summary = await one(
        `SELECT
            (SELECT COUNT(*) FROM organizations) AS organizationsCreated,
            (SELECT COUNT(*) FROM contacts) AS contactsCreated,
            (SELECT COUNT(*) FROM employees) AS employeesCreated,
            (SELECT COUNT(*) FROM tickets) AS ticketsCreated,
            (SELECT COUNT(*) FROM meetings) AS meetingsCreated,
            (SELECT COUNT(*) FROM comments) AS commentsCreated,
            (SELECT COUNT(*) FROM messages) AS messagesCreated`
    );

    const latestOrganization = await one(`SELECT * FROM organizations ORDER BY createdAt DESC LIMIT 1`);
    const latestContact = await one(
        `SELECT c.*, o.name AS organization
         FROM contacts c
         LEFT JOIN organizations o ON o.id = c.organization_id
         ORDER BY c.createdAt DESC
         LIMIT 1`
    );
    const latestTicket = await one(
        `SELECT t.*, e.firstName, e.lastName, e.userName
         FROM tickets t
         LEFT JOIN employees e ON e.id = t.created_by
         ORDER BY t.createdAt DESC
         LIMIT 1`
    );
    const latestMeeting = await one(
        `SELECT m.*, e.firstName, e.lastName, e.userName
         FROM meetings m
         LEFT JOIN employees e ON e.id = m.organizer_id
         ORDER BY m.createdAt DESC
         LIMIT 1`
    );

    return {
        organizationsCreated: number(summary.organizationsCreated),
        contactsCreated: number(summary.contactsCreated),
        employeesCreated: number(summary.employeesCreated),
        ticketsCreated: number(summary.ticketsCreated),
        meetingsCreated: number(summary.meetingsCreated),
        commentsCreated: number(summary.commentsCreated),
        messagesCreated: number(summary.messagesCreated),
        latestOrganization: latestOrganization.id ? latestOrganization : null,
        latestContact: latestContact.id ? latestContact : null,
        latestTicket: latestTicket.id ? latestTicket : null,
        latestMeeting: latestMeeting.id ? latestMeeting : null
    };
}

async function getContactsSummary() {
    const summary = await one(
        `SELECT
            (SELECT COUNT(*) FROM organizations) AS totalOrganizations,
            (SELECT COUNT(*) FROM contacts) AS totalContacts,
            (SELECT COUNT(*) FROM organizations WHERE YEARWEEK(createdAt, 1) = YEARWEEK(CURDATE(), 1)) AS newOrganizationsThisWeek,
            (SELECT COUNT(*) FROM contacts WHERE YEARWEEK(createdAt, 1) = YEARWEEK(CURDATE(), 1)) AS newContactsThisWeek,
            (SELECT COUNT(DISTINCT organization_id) FROM tickets WHERE status <> 'Resolved' AND organization_id IS NOT NULL) AS organizationsWithOpenTickets,
            (SELECT COUNT(DISTINCT client_id) FROM tickets WHERE status <> 'Resolved' AND client_id IS NOT NULL) AS contactsWithUnresolvedTickets`
    );

    const organizations = await many(
        `SELECT
            o.id,
            o.name,
            o.industry,
            o.status,
            o.createdAt,
            COUNT(c.id) AS contactsCount,
            COUNT(t.id) AS ticketsCount
         FROM organizations o
         LEFT JOIN contacts c ON c.organization_id = o.id
         LEFT JOIN tickets t ON t.organization_id = o.id
         GROUP BY o.id
         ORDER BY o.createdAt DESC
         LIMIT 8`
    );

    const contacts = await many(
        `SELECT
            c.id,
            c.name,
            c.email,
            c.status,
            c.createdAt,
            o.name AS organization,
            COUNT(t.id) AS ticketsCount,
            MAX(t.createdAt) AS lastTicketAt
         FROM contacts c
         LEFT JOIN organizations o ON o.id = c.organization_id
         LEFT JOIN tickets t ON CAST(t.client_id AS CHAR) = CAST(c.id AS CHAR)
         GROUP BY c.id
         ORDER BY c.createdAt DESC
         LIMIT 8`
    );

    return {
        totalOrganizations: number(summary.totalOrganizations),
        totalContacts: number(summary.totalContacts),
        newOrganizationsThisWeek: number(summary.newOrganizationsThisWeek),
        newContactsThisWeek: number(summary.newContactsThisWeek),
        organizationsWithOpenTickets: number(summary.organizationsWithOpenTickets),
        contactsWithUnresolvedTickets: number(summary.contactsWithUnresolvedTickets),
        organizations,
        contacts
    };
}

async function getEmployeeActivitySummary() {
    const employees = await many(
        `SELECT
            e.id,
            e.firstName,
            e.lastName,
            e.userName,
            s.name AS service_name,
            COUNT(DISTINCT t.id) AS ticketsCreated,
            COUNT(DISTINCT c.id) AS commentsCreated,
            COUNT(DISTINCT h.id) AS assignmentsMade
         FROM employees e
         LEFT JOIN services s ON s.id = e.service_id
         LEFT JOIN tickets t ON t.created_by = e.id
         LEFT JOIN comments c ON c.user_id = e.id
         LEFT JOIN ticket_assignment_history h ON h.assigned_by = e.id
         GROUP BY e.id
         ORDER BY (ticketsCreated + commentsCreated + assignmentsMade) DESC
         LIMIT 8`
    );

    return employees.map((row) => ({
        id: row.id,
        name: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.userName,
        userName: row.userName,
        service: row.service_name,
        ticketsCreated: number(row.ticketsCreated),
        commentsCreated: number(row.commentsCreated),
        assignmentsMade: number(row.assignmentsMade)
    }));
}

async function getDelayedTickets() {
    const rows = await many(
        `SELECT
            t.id,
            t.request_code,
            t.application,
            t.issue_type,
            t.issue_level,
            t.status,
            t.createdAt,
            TIMESTAMPDIFF(HOUR, t.createdAt, NOW()) AS ageHours,
            CASE
                WHEN t.issue_level = 'Level 1 Assistance' THEN 'SD'
                WHEN r.allowed_services LIKE '%"IT"%' THEN 'IT'
                WHEN r.allowed_services LIKE '%"PKI"%' THEN 'PKI'
                ELSE 'Unassigned'
            END AS assignedService
         FROM tickets t
         LEFT JOIN rooms r ON r.ticket_id = t.id
         WHERE t.status <> 'Resolved'
           AND (
             TIMESTAMPDIFF(HOUR, t.createdAt, NOW()) >= 24
             OR t.issue_level <> 'Level 1 Assistance' AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"IT"%' AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"PKI"%'
           )
         ORDER BY ageHours DESC
         LIMIT 10`
    );

    return rows.map((row) => ({
        ...row,
        ageHours: number(row.ageHours)
    }));
}

async function getPendingAssignmentQueue(limit = 10) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const rows = await many(
        `SELECT
            t.id,
            t.request_code,
            t.application,
            t.issue_type,
            t.issue_level,
            t.issue_description,
            t.status,
            t.createdAt,
           t.organization_id,
            t.client_id,
            o.name AS organization,
            c.name AS client,
            TIMESTAMPDIFF(HOUR, t.createdAt, NOW()) AS pendingHours
         FROM tickets t
         LEFT JOIN rooms r ON r.ticket_id = t.id
         LEFT JOIN organizations o ON o.id = t.organization_id
         LEFT JOIN contacts c ON CAST(t.client_id AS CHAR) = CAST(c.id AS CHAR)
         WHERE t.status <> 'Resolved'
           AND t.issue_level <> 'Level 1 Assistance'
           AND (COALESCE(r.allowed_services, '[]') NOT LIKE '%"IT"%' AND COALESCE(r.allowed_services, '[]') NOT LIKE '%"PKI"%')
         ORDER BY t.createdAt ASC
         LIMIT ${safeLimit}`
    );
    return rows.map((row) => ({ ...row, pendingHours: number(row.pendingHours) }));
}

async function getRecentTickets(limit = 10) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const rows = await many(
        `SELECT
            t.id,
            t.request_code,
            t.client_id,
            t.application,
            t.issue_type,
            t.issue_level,
            t.status,
            t.createdAt,
            e.userName AS created_by_username,
            o.name AS organization,
            c.name AS client,
            CASE
                WHEN t.issue_level = 'Level 1 Assistance' THEN 'SD'
                WHEN r.allowed_services LIKE '%"IT"%' THEN 'IT'
                WHEN r.allowed_services LIKE '%"PKI"%' THEN 'PKI'
                ELSE 'Unassigned'
            END AS assignedService
         FROM tickets t
         LEFT JOIN rooms r ON r.ticket_id = t.id
         LEFT JOIN employees e ON e.id = t.created_by
         LEFT JOIN organizations o ON o.id = t.organization_id
         LEFT JOIN contacts c ON CAST(t.client_id AS CHAR) = CAST(c.id AS CHAR)
         ORDER BY t.createdAt DESC
         LIMIT ${safeLimit}`
    );
    return rows;
}

async function buildSyntheticRecentActivity(limit = 20) {
    const existing = await activityRepository.getRecentActivity(limit);
    const activities = existing.map((row) => ({
        id: `activity-${row.id}`,
        actorName: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.userName || 'System',
        actorRole: row.actor_role || row.service_name,
        actionType: row.action_type,
        entityType: row.entity_type,
        entityId: row.entity_id,
        description: row.description,
        createdAt: row.created_at
    }));

    const synthetic = await many(
        `SELECT * FROM (
            SELECT
                CONCAT('ticket-', t.id) AS id,
                COALESCE(CONCAT(e.firstName, ' ', e.lastName), e.userName, 'Service Delivery') AS actorName,
                s.name AS actorRole,
                'ticket_created' AS actionType,
                'ticket' AS entityType,
                t.id AS entityId,
                CONCAT(COALESCE(CONCAT(e.firstName, ' ', e.lastName), 'Service Delivery'), ' created ticket ', t.request_code) AS description,
                t.createdAt AS createdAt
            FROM tickets t
            LEFT JOIN employees e ON e.id = t.created_by
            LEFT JOIN services s ON s.id = e.service_id
            UNION ALL
            SELECT
                CONCAT('assignment-', h.id),
                COALESCE(CONCAT(e.firstName, ' ', e.lastName), e.userName, 'Service Delivery'),
                s.name,
                'ticket_assigned',
                'ticket',
                h.ticket_id,
                CONCAT('Ticket ', t.request_code, IF(h.previous_service IS NULL, ' assigned to ', CONCAT(' reassigned from ', h.previous_service, ' to ')), h.new_service),
                h.assigned_at
            FROM ticket_assignment_history h
            JOIN tickets t ON t.id = h.ticket_id
            LEFT JOIN employees e ON e.id = h.assigned_by
            LEFT JOIN services s ON s.id = e.service_id
            UNION ALL
            SELECT
                CONCAT('comment-', c.id),
                COALESCE(CONCAT(e.firstName, ' ', e.lastName), e.userName, 'Employee'),
                s.name,
                'comment_added',
                'comment',
                c.id,
                CONCAT(COALESCE(CONCAT(e.firstName, ' ', e.lastName), 'Employee'), ' added a comment on ticket ', t.request_code),
                c.createdAt
            FROM comments c
            JOIN tickets t ON t.id = c.ticket_id
            LEFT JOIN employees e ON e.id = c.user_id
            LEFT JOIN services s ON s.id = e.service_id
            UNION ALL
            SELECT
                CONCAT('organization-', o.id),
                'Service Delivery',
                'SD',
                'organization_created',
                'organization',
                o.id,
                CONCAT('Service Delivery created organization ', o.name),
                o.createdAt
            FROM organizations o
            UNION ALL
            SELECT
                CONCAT('contact-', c.id),
                'Service Delivery',
                'SD',
                'contact_created',
                'contact',
                c.id,
                CONCAT('Service Delivery created contact ', c.name),
                c.createdAt
            FROM contacts c
            UNION ALL
            SELECT
                CONCAT('meeting-', m.id),
                COALESCE(CONCAT(e.firstName, ' ', e.lastName), e.userName, 'Service Delivery'),
                s.name,
                'meeting_created',
                'meeting',
                m.id,
                CONCAT(COALESCE(CONCAT(e.firstName, ' ', e.lastName), 'Service Delivery'), ' created meeting ', m.title),
                m.createdAt
            FROM meetings m
            LEFT JOIN employees e ON e.id = m.organizer_id
            LEFT JOIN services s ON s.id = e.service_id
        ) feed
        ORDER BY createdAt DESC
        LIMIT ${Math.min(Math.max(Number(limit) || 20, 1), 100)}`
    );

    return [...activities, ...synthetic]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, Math.min(Math.max(Number(limit) || 20, 1), 100));
}

module.exports = {
    getTicketStatistics,
    getManagerAnalytics,
    getCharts,
    getAssignmentAnalytics,
    getWorkflowAnalytics,
    getCrudSummary,
    getContactsSummary,
    getEmployeeActivitySummary,
    getDelayedTickets,
    getPendingAssignmentQueue,
    getRecentTickets,
    buildSyntheticRecentActivity
};
