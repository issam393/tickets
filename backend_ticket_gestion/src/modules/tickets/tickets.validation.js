function validateCreateTicket(payload) {
    const requiredFields = ['application', 'issueType', 'issueLevel', 'issueDescription'];

    for (const field of requiredFields) {
        if (!payload[field] || !String(payload[field]).trim()) {
            throw new Error(`${field} is required`);
        }
    }
}

module.exports = {
    validateCreateTicket
};
