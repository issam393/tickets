const db = require('../../config/db');

async function createActivityLog(data) {
    const {
        actorEmployeeId = null,
        actorRole = null,
        actionType,
        entityType,
        entityId = null,
        description,
        metadata = null
    } = data;

    const [result] = await db.execute(
        `INSERT INTO activity_logs (
            actor_employee_id, actor_role, action_type, entity_type, entity_id, description, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            actorEmployeeId,
            actorRole,
            actionType,
            entityType,
            entityId,
            description,
            metadata ? JSON.stringify(metadata) : null
        ]
    );

    return result.insertId;
}

async function getRecentActivity(limit = 20) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const [rows] = await db.execute(
        `SELECT
            a.*,
            e.firstName,
            e.lastName,
            e.userName,
            s.name AS service_name
         FROM activity_logs a
         LEFT JOIN employees e ON e.id = a.actor_employee_id
         LEFT JOIN services s ON s.id = e.service_id
         ORDER BY a.created_at DESC
         LIMIT ${safeLimit}`
    );
    return rows;
}

module.exports = {
    createActivityLog,
    getRecentActivity
};
