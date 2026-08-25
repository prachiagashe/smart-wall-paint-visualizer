const Favorite = require('../models/Favorite');
const Color = require('../models/Color');

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate('color');
    res.json(favorites.map(f => f.color));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching favorites', error: err.message });
  }
};

exports.getFavoritesCount = async (req, res) => {
  try {
    const count = await Favorite.countDocuments({ user: req.user._id });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching favorites count', error: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { colorId } = req.body;
    
    // Check if it already exists
    const existing = await Favorite.findOne({ user: req.user._id, color: colorId });
    if (existing) {
      return res.status(400).json({ message: 'Color already in favorites' });
    }

    const favorite = new Favorite({ user: req.user._id, color: colorId });
    await favorite.save();
    
    res.status(201).json({ message: 'Added to favorites', favorite });
  } catch (err) {
    res.status(500).json({ message: 'Error adding favorite', error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { colorId } = req.params;
    await Favorite.findOneAndDelete({ user: req.user._id, color: colorId });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing favorite', error: err.message });
  }
};
