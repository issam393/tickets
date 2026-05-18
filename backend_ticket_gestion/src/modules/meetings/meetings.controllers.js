const meetingService = require('./meetings.services');

async function getMeetingMeta(req, res) {
    try {
        const data = await meetingService.getMeetingMeta(req.user);
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createMeeting(req, res) {
    try {
        const data = await meetingService.createMeeting(req.body, req.user);
        res.status(201).json({ data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function listMeetings(req, res) {
    try {
        const data = await meetingService.listMeetings(req.user);
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMeeting(req, res) {
    try {
        const data = await meetingService.getMeetingById(req.params.meetingId, req.user);
        res.status(200).json({ data });
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        res.status(status).json({ error: error.message });
    }
}

async function updateMeeting(req, res) {
    try {
        const data = await meetingService.updateMeeting(req.params.meetingId, req.body, req.user);
        res.status(200).json({ data });
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 400;
        res.status(status).json({ error: error.message });
    }
}

async function deleteMeeting(req, res) {
    try {
        await meetingService.deleteMeeting(req.params.meetingId, req.user);
        res.status(200).json({ message: 'Meeting deleted' });
    } catch (error) {
        const status = error.message === 'Access denied' ? 403 : 404;
        res.status(status).json({ error: error.message });
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
