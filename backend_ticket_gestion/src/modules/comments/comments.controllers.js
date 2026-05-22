const commentsService = require('./comments.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');
async function listComments(req, res) {
    try {
        const result = await commentsService.listComments(req.params.ticketId, req.user);
        sendSuccess(res, 200, 'Comments loaded successfully', result);
    } catch (error) {
        const status = error.message.includes('Access denied') ? 403 : 404;
        sendError(res, status, error.message);
    }
}
async function addComment(req, res) {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return sendError(res, 400, 'Comment text is required');
        }
        const result = await commentsService.addComment(req.params.ticketId, req.user.id, text.trim(), req.user);
        sendSuccess(res, 201, 'Comment created successfully', result);
    } catch (error) {
        const status = error.message.includes('Access denied') || error.message.includes('Unauthorized') ? 403 : 400;
        sendError(res, getErrorStatus(error, status), error.message);
    }
}
module.exports = {
    listComments,
    addComment
};
