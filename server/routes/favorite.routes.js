const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, favoriteController.getFavorites);
router.get('/count', protect, favoriteController.getFavoritesCount);
router.post('/', protect, favoriteController.addFavorite);
router.delete('/:colorId', protect, favoriteController.removeFavorite);

module.exports = router;
