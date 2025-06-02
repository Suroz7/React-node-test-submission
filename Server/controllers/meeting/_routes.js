const express = require('express');
const router = express.Router();
const auth = require('../../middelwares/auth');
const meeting = require('./meeting');
const meetingController = require('./meeting');
router.get('/', auth, meeting.index);
router.post('/add', auth, meeting.add);
router.get('/view/:id', auth, meeting.view);
router.delete('/delete/:id', auth, meeting.deleteData);
router.post('/deleteMany', auth, meeting.deleteMany);
router.get('/', auth, meetingController.index);

module.exports = router;