const commentsRepository = require('./comments.repository');
const ticketRepository = require('../tickets/tickets.repository');
const { canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');
async function listComments(ticketId, user) {
    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    const allowedRoles = parseAllowedRoles(ticket.allowed_services);
    if (!canRoleAccessRoom(user.service, allowedRoles)) {
        throw new Error('Access denied: You do not have permission to view comments for this ticket.');
    }
    return commentsRepository.getCommentsByTicketId(ticketId);
}
async function addComment(ticketId, userId, text, user, isResolutionProposal = false) {
    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    if (ticket.status === 'Resolved') {
        throw new Error('This ticket is resolved and permanently locked');
    }
    const allowedRoles = parseAllowedRoles(ticket.allowed_services);
    if (!canRoleAccessRoom(user.service, allowedRoles)) {
        throw new Error('Access denied: You do not have permission to add comments to this ticket.');
    }
    // Check if ticket is explicitly assigned to IT or PKI
    const assignedTeam = allowedRoles.includes('IT') ? 'IT' : (allowedRoles.includes('PKI') ? 'PKI' : null);
    if (assignedTeam) {
        if (user.service !== assignedTeam && user.service !== 'SD') {
            throw new Error('Unauthorized: You do not belong to the assigned service or have Service Delivery authorization.');
        }
    }
    if (isResolutionProposal && !['IT', 'PKI'].includes(user.service)) {
        throw new Error('Only assigned technical services can submit a resolution proposal.');
    }
    const commentId = await commentsRepository.createComment(ticketId, userId, text, isResolutionProposal);
    return commentsRepository.getCommentById(commentId);
}
module.exports = {
    listComments,
    addComment
};
