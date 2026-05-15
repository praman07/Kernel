const User = require('../models/User');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');

const getProfiles = async (req, res) => {
  try {
    const keyword = req.query.keyword ? {
      $or: [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { bio: { $regex: req.query.keyword, $options: 'i' } },
        { skills: { $regex: req.query.keyword, $options: 'i' } }
      ]
    } : {};
    
    const users = await User.find(keyword).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name profilePicture bio skills')
      .populate('following', 'name profilePicture bio skills')
      .select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio || user.bio;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      user.bannerImage = req.body.bannerImage || user.bannerImage;
      user.skills = req.body.skills ? req.body.skills : user.skills;
      user.socialLinks = req.body.socialLinks || user.socialLinks;

      if (req.body.password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();
      
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        bannerImage: updatedUser.bannerImage,
        skills: updatedUser.skills,
        socialLinks: updatedUser.socialLinks,
        token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      
      await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'FOLLOW'
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ isFollowing: !isFollowing, followersCount: targetUser.followers.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const entityId = req.params.id;
    const isBookmarked = user.bookmarks.includes(entityId);

    if (isBookmarked) {
      user.bookmarks.pull(entityId);
    } else {
      user.bookmarks.push(entityId);
      
      const project = await Project.findById(entityId);
      if (project && project.creator.toString() !== user._id.toString()) {
        await Notification.create({
          recipient: project.creator,
          sender: user._id,
          type: 'SAVE_PROJECT',
          entityId: project._id
        });
      } else {
        const blog = await Blog.findById(entityId);
        if (blog && blog.author.toString() !== user._id.toString()) {
          await Notification.create({
            recipient: blog.author,
            sender: user._id,
            type: 'SAVE_BLOG',
            entityId: blog._id
          });
        }
      }
    }

    await user.save();
    
    res.json({ isBookmarked: !isBookmarked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name profilePicture bio followers skills')
      .sort({ followers: -1 })
      .limit(20);
    
    // Sort by followers length since we can't directly sort by array length in standard find easily without aggregation
    const sortedUsers = users.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0)).slice(0, 10);
    
    res.json(sortedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfiles,
  getProfileById,
  updateProfile,
  toggleFollow,
  getTopUsers,
  toggleBookmark
};
