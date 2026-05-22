const activityRepository = require('./activity.repository');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

function normalizeActivity(row) {
    return {
        id: row.id,
        actorEmployeeId: row.actor_employee_id,
        actorName: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.userName || 'System',
        actorRole: row.actor_role || row.service_name,
        actionType: row.action_type,
        entityType: row.entity_type,
        entityId: row.entity_id,
        description: row.description,
        metadata: row.metadata,
        createdAt: row.created_at
    };
}

async function getRecentActivity(req, res) {
    try {
        const rows = await activityRepository.getRecentActivity(req.query.limit);
        sendSuccess(res, 200, 'Recent activity loaded successfully', rows.map(normalizeActivity));
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

module.exports = {
    getRecentActivity
};
