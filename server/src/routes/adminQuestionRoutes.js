const express = require('express');

const adminQuestionController = require('../controllers/adminQuestionController');
const requireAuth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Banco de reactivos: solo administradores (HU-07). requireAuth resuelve req.user
// antes de que requireRole pueda leer su rol.
router.use(requireAuth, requireRole('admin'));

router.get('/', asyncHandler(adminQuestionController.listQuestions));
router.post('/', asyncHandler(adminQuestionController.createQuestion));
router.put('/:id', asyncHandler(adminQuestionController.updateQuestion));
router.delete('/:id', asyncHandler(adminQuestionController.deactivateQuestion));

module.exports = router;
