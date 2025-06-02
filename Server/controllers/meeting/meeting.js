const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

const add = async (req, res) => {
    try {
        console.log('Received meeting data:', req.body); // Log incoming data

        const { agenda, dateTime, createBy, attendes, attendesLead } = req.body;
        if (!agenda || !dateTime || !createBy) {
            return res.status(400).json({ error: 'Agenda, DateTime, and Created By are required' });
        }
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(createBy)) {
            return res.status(400).json({ error: 'Invalid User ID' });
        }
        if ((attendes && attendes.some(id => !objectIdRegex.test(id))) ||
            (attendesLead && attendesLead.some(id => !objectIdRegex.test(id)))) {
            return res.status(400).json({ error: 'Invalid Contact/Lead ID' });
        }

        const meeting = new MeetingHistory(req.body);
        await meeting.save();
        console.log('Meeting saved:', meeting); // Log saved meeting

        res.status(200).json({ status: 200, data: meeting });
    } catch (err) {
        console.error('Failed to create meeting:', err);
        res.status(400).json({ error: err.message });
    }
};
const index = async (req, res) => {
    try {
        const meetings = await MeetingHistory.find({ deleted: false })
            .populate('createBy', 'firstName lastName')
            .populate('attendes', 'firstName lastName')
            .populate('attendesLead', 'leadName')
            .lean();

        const result = meetings.map(meeting => ({
            ...meeting,
            createdByName: meeting.createBy
                ? `${meeting.createBy.firstName} ${meeting.createBy.lastName}`
                : ''
        }));

        res.status(200).json({ status: 200, data: result });
    } catch (err) {
        console.error('Failed to fetch meetings:', err);
        res.status(500).json({ status: 500, data: [], error: err.message });
    }
};

const view = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findOne({ _id: req.params.id })
            .populate('attendes', 'firstName lastName')
            .populate('attendesLead', 'leadName')
            .populate('createBy', 'firstName lastName');

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        const result = {
            ...meeting.toObject(),
            createdByName: meeting.createBy ? `${meeting.createBy.firstName} ${meeting.createBy.lastName}` : ''
        };

        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to fetch meeting:', err);
        res.status(400).json({ error: 'Failed to fetch meeting' });
    }
};

const deleteData = async (req, res) => {
    try {
        await MeetingHistory.findByIdAndUpdate(req.params.id, { deleted: true });
        res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (err) {
        console.error('Failed to delete meeting:', err);
        res.status(400).json({ error: 'Failed to delete meeting' });
    }
};

const deleteMany = async (req, res) => {
    try {
        await MeetingHistory.updateMany(
            { _id: { $in: req.body } },
            { $set: { deleted: true } }
        );
        res.status(200).json({ message: "Selected meetings deleted successfully" });
    } catch (err) {
        console.error('Failed to delete meetings:', err);
        res.status(400).json({ error: 'Failed to delete meetings' });
    }
};

module.exports = { add, index, view, deleteData, deleteMany };