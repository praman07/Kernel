const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLikeProject,
  addCommentProject,
  getTrends,
  getPublicActivity
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createProject)
  .get(getProjects);

router.route('/trends').get(getTrends);
router.route('/activity').get(getPublicActivity);

router.route('/:id')
  .get(getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/like').post(protect, toggleLikeProject);
router.route('/:id/comment').post(protect, addCommentProject);

module.exports = router;
