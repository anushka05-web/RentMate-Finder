const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, readAllNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/read-all')
  .post(readAllNotifications);

router.route('/:id/read')
  .patch(markAsRead);

module.exports = router;
