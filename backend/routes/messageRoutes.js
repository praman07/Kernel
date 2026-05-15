const express = require('express');
const router = express.Router();
const { getMessages, getConversations } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);

module.exports = router;
