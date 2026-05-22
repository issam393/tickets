const ALL_CHAT_ROLES = ['SD'];

function getAllowedRolesForTicket(issueLevel = '', issueType = '') {
    const normalizedLevel = String(issueLevel).toLowerCase();
    const normalizedType = String(issueType).toLowerCase();

    return ALL_CHAT_ROLES;
}

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
