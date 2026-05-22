function sendSuccess(res, statusCode, message, data = null) {
    const payload = { success: true, message };
    if (data !== null && data !== undefined) payload.data = data;
    return res.status(statusCode).json(payload);
}

function sendError(res, statusCode, message) {
    return res.status(statusCode).json({
        success: false,
        message,
        error: message
    });
}

function getErrorStatus(error, fallback = 500) {
    if (!error || !error.message) return fallback;
    const message = error.message;
    if (message.includes('required') || message.includes('Invalid') || message.includes('already resolved') || message.includes('resolved')) return 400;
    if (message.includes('Unauthorized') || message.includes('token')) return 401;
    if (message.includes('Access denied') || message.includes('permission') || message.includes('not authorized')) return 403;
    if (message.includes('not found')) return 404;
    if (message.includes('existing contacts')) return 409;
    return fallback;
}

module.exports = {
    sendSuccess,
    sendError,
    getErrorStatus
};
