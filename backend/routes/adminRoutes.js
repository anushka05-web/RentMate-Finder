const express = require('express');
const router = express.Router();
const { getPlatformStats, getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
