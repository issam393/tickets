const ALL_CHAT_ROLES = ['SD'];

function getAllowedRolesForTicket(issueLevel = '', issueType = '') {
    const normalizedLevel = String(issueLevel).toLowerCase();
    const normalizedType = String(issueType).toLowerCase();

    return ALL_CHAT_ROLES;
}
//getAlloedRolesForTicket this function returns the allowed roles for a ticket based on its issue level and type. Currently, it returns a constant array of roles defined in ALL_CHAT_ROLES, which includes 'SD'. The function normalizes the input parameters to lowercase strings, but does not use them in its current implementation.
//in other words , the function is a placeholder for future logic that may determine allowed roles based on the issue level and type of the ticket.
//more explication : this function is designed to provide flexibility for future enhancements where the allowed roles for a ticket may vary based on its specific characteristics. For now, it serves as a simple utility to retrieve a predefined set of roles that have access to tickets, ensuring that the system can easily accommodate changes in access control policies without requiring significant modifications to the codebase.

function parseAllowedRoles(rawAllowedRoles) {
    if (!rawAllowedRoles) return [];
    if (Array.isArray(rawAllowedRoles)) return rawAllowedRoles;

    if (typeof rawAllowedRoles === 'string') {
        const trimmedValue = rawAllowedRoles.trim();
        if (!trimmedValue) return [];

        try {
            const parsed = JSON.parse(trimmedValue);
            if (Array.isArray(parsed)) return parsed;
        } catch (error) {
            return trimmedValue
                .split(',')
                .map((value) => value.replace(/[\[\]"']/g, '').trim())
                .filter(Boolean);
        }
    }

    return [];
}

function canRoleAccessRoom(role, allowedRoles) {
    if (!role) return false;
    const normalizedRole = String(role).trim().toUpperCase() === 'MANAGER' ? 'Manager' : role;
    if (normalizedRole === 'SD' || normalizedRole === 'Manager') return true;
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
    return allowedRoles.includes(normalizedRole);
}

function toSocketRoom(roomId) {
    return `room_${roomId}`;
}

module.exports = {
    ALL_CHAT_ROLES,
    getAllowedRolesForTicket,
    parseAllowedRoles,
    canRoleAccessRoom,
    toSocketRoom
};
