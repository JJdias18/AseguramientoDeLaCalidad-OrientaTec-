const express = require('express');

const questionnaireController = require('../controllers/questionnaireController');
const requireAuth = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Solo estudiantes con sesión iniciada consultan el cuestionario (HU-02 depende de HU-01).
router.get('/', requireAuth, asyncHandler(questionnaireController.getQuestions));

module.exports = router;
