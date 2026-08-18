const express = require('express');
const router = express.Router();
const colorController = require('../controllers/color.controller');

// Important: Specific routes must come before parameterized routes like /:id
router.get('/search', colorController.searchColors);
router.get('/', colorController.getAllColors);
router.get('/:id', colorController.getColor);
router.get('/:id/recommendations', colorController.getRecommendations);
router.post('/:id/usage', colorController.incrementUsage);

module.exports = router;
