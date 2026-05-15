const express = require('express');
const router = express.Router();
const { getMessages, getConversations, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/unread', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);

module.exports = router;
