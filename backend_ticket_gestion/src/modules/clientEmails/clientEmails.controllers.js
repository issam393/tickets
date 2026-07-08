const clientEmailService = require('./clientEmails.services');
const gmailSyncService = require('./gmailSync.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');

async function listEmails(req, res) {
    try {
        const data = await clientEmailService.listEmails(req.user);
        sendSuccess(res, 200, 'Client emails loaded successfully', data);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function receiveEmail(req, res) {
    try {
        const data = await clientEmailService.receiveEmail(req.body);
        sendSuccess(res, 201, 'Client email received successfully', data);
    } catch (error) {
        const status = error.message.includes('existing client') ? 403 : getErrorStatus(error, 400);
        sendError(res, status, error.message);
    }
}

async function markEmailRead(req, res) {
    try {
        const data = await clientEmailService.markEmailRead(req.params.emailId, req.user);
        sendSuccess(res, 200, 'Email marked as read', data);
    } catch (error) {
        sendError(res, getErrorStatus(error, 404), error.message);
    }
}

async function syncInbox(req, res) {
    try {
        const data = await gmailSyncService.syncGmailInbox();
        sendSuccess(res, 200, 'Service Delivery inbox synchronized successfully', data);
    } catch (error) {
        const status = error.message.includes('not configured') || error.message.includes('Missing required environment variable')
            ? 503
            : 502;
        sendError(res, status, error.message);
    }
}

module.exports = {
    listEmails,
    receiveEmail,
    markEmailRead,
    syncInbox
};
