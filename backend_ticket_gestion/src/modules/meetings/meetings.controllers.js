const meetingService = require('./meetings.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');

async function getMeetingMeta(req, res) {
    try {
        const data = await meetingService.getMeetingMeta(req.user);
        sendSuccess(res, 200, 'Meeting metadata loaded successfully', data);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function createMeeting(req, res) {
    try {
        const data = await meetingService.createMeeting(req.body, req.user);
        sendSuccess(res, 201, 'Meeting created successfully', data);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
}

async function listMeetings(req, res) {
    try {
        const data = await meetingService.listMeetings(req.user);
        sendSuccess(res, 200, 'Meetings loaded successfully', data);
    } catch (error) {
        sendError(res, 500, error.message);
    }
}

async function getMeeting(req, res) {
    try {
        const data = await meetingService.getMeetingById(req.params.meetingId, req.user);
        sendSuccess(res, 200, 'Meeting loaded successfully', data);
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        sendError(res, status, error.message);
    }
}

async function updateMeeting(req, res) {
    try {
        const data = await meetingService.updateMeeting(req.params.meetingId, req.body, req.user);
        sendSuccess(res, 200, 'Meeting updated successfully', data);
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 400;
        sendError(res, getErrorStatus(error, status), error.message);
    }
}

async function deleteMeeting(req, res) {
    try {
        await meetingService.deleteMeeting(req.params.meetingId, req.user);
        sendSuccess(res, 200, 'Meeting deleted successfully');
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        sendError(res, status, error.message);
    }
}

module.exports = {
    getMeetingMeta,
    createMeeting,
    listMeetings,
    getMeeting,
    updateMeeting,
    deleteMeeting
};
