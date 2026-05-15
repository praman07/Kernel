const express = require('express');
const router = express.Router();
const { getProfiles, getProfileById, updateProfile, toggleFollow, toggleBookmark, getTopUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(getProfiles);
router.route('/top').get(getTopUsers);
router.route('/profile').put(protect, updateProfile);
router.route('/:id').get(getProfileById);
router.route('/:id/follow').post(protect, toggleFollow);
router.route('/bookmark/:id').post(protect, toggleBookmark);

module.exports = router;
