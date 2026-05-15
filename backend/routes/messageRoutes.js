const express = require('express');
const router = express.Router();
const { getMessages, getConversations, getUnreadCount, deleteConversation } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/unread', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);
router.delete('/:userId', protect, deleteConversation);

module.exports = router;
