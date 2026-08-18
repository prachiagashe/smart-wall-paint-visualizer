const Color = require('../models/Color');

// Get all active colors
exports.getAllColors = async (req, res) => {
  try {
    const colors = await Color.find({ status: 'active' }).sort({ name: 1 });
    res.json(colors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching colors', error: err.message });
  }
};

// Increment usage count for a color
exports.incrementUsage = async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    if (!color) return res.status(404).json({ message: 'Color not found' });
    res.json(color);
  } catch (err) {
    res.status(500).json({ message: 'Error updating usage', error: err.message });
  }
};
