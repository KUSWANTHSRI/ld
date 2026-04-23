const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const requireRole = require('../middleware/requireRole');

// Mark attendance for a training session
router.post('/mark', requireRole(['Admin', 'Trainer']), attendanceController.markAttendance);
// Get attendance records for a training on a date
router.get('/training/:trainingId', requireRole(['Admin', 'Trainer']), attendanceController.getAttendanceByTraining);
// Get attendance records for current user
router.get('/my', attendanceController.getMyAttendance);
// Get attendance report for a training
router.get('/report/:trainingId', requireRole(['Admin', 'Trainer']), attendanceController.getAttendanceReport);

module.exports = router;
