const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const requireRole = require('../middleware/requireRole');

// Enroll an employee into a training
router.post('/', requireRole(['Admin', 'Trainer']), enrollmentController.enroll);
// Get all enrollments (Admin) or by trainingId
router.get('/', requireRole(['Admin', 'Trainer']), enrollmentController.getAllEnrollments);
// Get enrollments for a specific training
router.get('/training/:trainingId', requireRole(['Admin', 'Trainer']), enrollmentController.getEnrollmentsByTraining);
// Get enrollments for the current user
router.get('/my', enrollmentController.getMyEnrollments);
// Update progress
router.patch('/:id/progress', requireRole(['Admin', 'Trainer']), enrollmentController.updateProgress);
// Unenroll
router.delete('/:id', requireRole(['Admin']), enrollmentController.unenroll);
// Admin report stats
router.get('/stats', requireRole(['Admin']), enrollmentController.getEnrollmentStats);

module.exports = router;
