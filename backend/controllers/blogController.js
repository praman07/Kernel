const Blog = require('../models/Blog');
const Notification = require('../models/Notification');

const getBlogs = async (req, res) => {
  try {
    const keyword = req.query.keyword ? {
      $or: [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { content: { $regex: req.query.keyword, $options: 'i' } },
        { tags: { $regex: req.query.keyword, $options: 'i' } }
      ]
    } : {};

    const blogs = await Blog.find(keyword)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, tags, imageUrl } = req.body;

    const blog = new Blog({
      title,
      content,
      tags,
      imageUrl,
      author: req.user._id
    });

    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, content, tags, imageUrl } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (blog) {
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this blog' });
      }

      blog.title = title || blog.title;
      blog.content = content || blog.content;
      blog.tags = tags || blog.tags;
      blog.imageUrl = imageUrl !== undefined ? imageUrl : blog.imageUrl;

      const updatedBlog = await blog.save();
      res.json(updatedBlog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this blog' });
      }

      await blog.deleteOne();
      res.json({ message: 'Blog removed' });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleLikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    
    const isLiked = blog.likes.includes(req.user._id);
    if (isLiked) {
      blog.likes.pull(req.user._id);
    } else {
      blog.likes.push(req.user._id);

      if (blog.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: blog.author,
          sender: req.user._id,
          type: 'LIKE_BLOG',
          entityId: blog._id
        });
      }
    }
    await blog.save();
    res.json({ isLiked: !isLiked, likesCount: blog.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCommentBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const comment = {
      user: req.user._id,
      text: req.body.text
    };
    
    blog.comments.push(comment);
    await blog.save();
    
    if (blog.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: blog.author,
        sender: req.user._id,
        type: 'COMMENT_BLOG',
        entityId: blog._id
      });
    }

    await blog.populate('comments.user', 'name profilePicture');
    const newComment = blog.comments[blog.comments.length - 1];

    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  addCommentBlog
};
