const Message = require('../models/Message');

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get list of users I have chatted with
exports.getConversations = async (req, res) => {
  try {
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender receiver', 'name profilePicture');

    const conversations = [];
    const seen = new Set();

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === myId.toString() ? msg.receiver : msg.sender;
      if (!seen.has(otherUser._id.toString())) {
        seen.add(otherUser._id.toString());
        
        // Count unread from this specific user
        const isUnread = !msg.read && msg.receiver._id.toString() === myId.toString();

        conversations.push({
          user: otherUser,
          lastMessage: msg.text,
          time: msg.createdAt,
          isUnread
        });
      }
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
