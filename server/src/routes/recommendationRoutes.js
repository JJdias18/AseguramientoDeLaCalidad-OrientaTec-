const express = require('express');

const recommendationController = require('../controllers/recommendationController');
const requireAuth = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(recommendationController.getRecommendations));

module.exports = router;
