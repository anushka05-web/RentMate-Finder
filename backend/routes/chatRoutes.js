const express = require('express');
const router = express.Router();
const { getChatHistory, getActiveChatRooms } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/messages/:chatRoomId', getChatHistory);
router.get('/active-rooms', getActiveChatRooms);

module.exports = router;
