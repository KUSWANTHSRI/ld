const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const requireRole = require('../middleware/requireRole');

// Public (authenticated) routes
router.get('/', trainingController.getAllTrainings);
router.get('/stats', requireRole(['Admin']), trainingController.getStats);
router.get('/trainer/:trainerId', trainingController.getTrainingsByTrainer);
router.get('/:id', trainingController.getTrainingById);

// Admin/Trainer create/update/delete
router.post('/', requireRole(['Admin', 'Trainer']), trainingController.createTraining);
router.put('/:id', requireRole(['Admin', 'Trainer']), trainingController.updateTraining);
router.delete('/:id', requireRole(['Admin']), trainingController.deleteTraining);

module.exports = router;
