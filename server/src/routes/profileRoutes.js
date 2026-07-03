const express = require('express');

const questionnaireController = require('../controllers/questionnaireController');
const requireAuth = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(questionnaireController.getProfile));

module.exports = router;
