const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true }
}, { timestamps: true });

// Ensure a user can only favorite a color once
favoriteSchema.index({ user: 1, color: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
