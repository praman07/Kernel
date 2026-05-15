const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['LIKE_PROJECT', 'LIKE_BLOG', 'COMMENT_PROJECT', 'COMMENT_BLOG', 'FOLLOW', 'REPOST_PROJECT', 'REPOST_BLOG', 'SAVE_PROJECT', 'SAVE_BLOG'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    // The ID of the project, blog, or whatever was liked/commented
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
