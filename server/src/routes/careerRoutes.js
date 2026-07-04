const express = require('express');

const careerController = require('../controllers/careerController');
const requireAuth = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(careerController.listCareers));
// Antes de '/:id': si no, Express interpretaría "compare" como un id de carrera.
router.get('/compare', requireAuth, asyncHandler(careerController.compareCareers));
router.get('/:id', requireAuth, asyncHandler(careerController.getCareer));

module.exports = router;
