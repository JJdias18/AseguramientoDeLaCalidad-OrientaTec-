const express = require('express');

const careerController = require('../controllers/careerController');
const requireAuth = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(careerController.listCareers));
router.get('/:id', requireAuth, asyncHandler(careerController.getCareer));

module.exports = router;
