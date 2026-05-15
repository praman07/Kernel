const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  addCommentBlog
} = require('../controllers/blogController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(getBlogs).post(protect, createBlog);
router.route('/:id').get(getBlogById).put(protect, updateBlog).delete(protect, deleteBlog);

router.route('/:id/like').post(protect, toggleLikeBlog);
router.route('/:id/comment').post(protect, addCommentBlog);

module.exports = router;
