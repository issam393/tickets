const commentsService = require('./comments.services');
async function listComments(req, res) {
    try {
        const result = await commentsService.listComments(req.params.ticketId, req.user);
        res.status(200).json({ data: result });
    } catch (error) {
        const status = error.message.includes('Access denied') ? 403 : 404;
        res.status(status).json({ error: error.message });
    }
}
async function addComment(req, res) {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }
        const result = await commentsService.addComment(req.params.ticketId, req.user.id, text.trim(), req.user);
        res.status(201).json({ message: 'Comment created successfully', data: result });
    } catch (error) {
        const status = error.message.includes('Access denied') || error.message.includes('Unauthorized') ? 403 : 400;
        res.status(status).json({ error: error.message });
    }
}
module.exports = {
    listComments,
    addComment
};