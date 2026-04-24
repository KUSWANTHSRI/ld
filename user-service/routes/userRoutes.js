const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireRole = require('../middleware/requireRole');

// Internal route called by Auth Service
router.post('/internal/users', userController.createInternalUser);

// External routes (Protected by API Gateway, x-user-id header is present)
router.get('/', requireRole(['Admin', 'Trainer']), userController.getAllUsers);
router.get('/stats', requireRole(['Admin']), userController.getStats);
router.get('/me', userController.getCurrentUser);
router.get('/:id', userController.getUserById);
router.put('/:id', requireRole(['Admin']), userController.updateUser);
router.delete('/:id', requireRole(['Admin']), userController.deleteUser);

module.exports = router;
