const ALL_CHAT_ROLES = ['ADMIN', 'SD', 'IT', 'PKI', 'MANAGER'];

function getAllowedRolesForTicket(issueLevel = '', issueType = '') {
    const normalizedLevel = String(issueLevel).toLowerCase();
    const normalizedType = String(issueType).toLowerCase();

    if (normalizedLevel.includes('critical')) {
        return ['ADMIN', 'TECHNICIAN'];
    }

    if (normalizedType.includes('incident')) {
        return ['ADMIN', 'AGENT', 'TECHNICIAN'];
    }

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
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
    return allowedRoles.includes(role);
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
