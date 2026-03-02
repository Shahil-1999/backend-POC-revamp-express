// routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const TestRoutes = require('./test');
const PostCommentRoutes = require('./post-comment-routes');
const PostRoutes = require('./post-routes');
const UserRoutes = require('./user-routes');
const UserProfileImageRoutes = require('./user-profile-image-routes');

router.use(TestRoutes);
router.use(PostCommentRoutes);
router.use(PostRoutes);
router.use(UserRoutes);
router.use(UserProfileImageRoutes);

module.exports = router;
