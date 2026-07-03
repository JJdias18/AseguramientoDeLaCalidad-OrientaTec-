const express = require('express');

const questionnaireController = require('../controllers/questionnaireController');
const requireAuth = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.post('/', asyncHandler(questionnaireController.startAttempt));
router.get('/current', asyncHandler(questionnaireController.getCurrentAttempt));
router.patch('/:id/answers', asyncHandler(questionnaireController.saveAnswer));
router.post('/:id/submit', asyncHandler(questionnaireController.submitAttempt));

module.exports = router;
