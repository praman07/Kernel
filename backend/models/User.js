const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  socialLinks: {
    github: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId }],
  lastActive: { type: Date, default: Date.now },
  status: {
    text: { type: String, default: '' },
    emoji: { type: String, default: '' },
    updatedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
