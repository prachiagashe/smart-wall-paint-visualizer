const express = require('express');
const router = express.Router();
const colorController = require('../controllers/color.controller');

router.get('/', colorController.getAllColors);
router.post('/:id/usage', colorController.incrementUsage);

module.exports = router;
