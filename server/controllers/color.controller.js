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

// Search colors (using query parameters)
exports.searchColors = async (req, res) => {
  try {
    const { query, family, temperature, tone, room, finish } = req.query;
    let filter = { status: 'active' };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { hex: { $regex: query, $options: 'i' } }
      ];
    }
    if (family) filter.family = family;
    if (temperature) filter.temperature = temperature;
    if (tone) filter.tone = tone;
    if (room) filter.rooms = room;
    if (finish) filter.finishes = finish;

    const colors = await Color.find(filter).sort({ usageCount: -1 });
    res.json(colors);
  } catch (err) {
    res.status(500).json({ message: 'Error searching colors', error: err.message });
  }
};

// Get a single color by ID
exports.getColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) return res.status(404).json({ message: 'Color not found' });
    res.json(color);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching color', error: err.message });
  }
};

// Get recommendations (Goes Well With)
exports.getRecommendations = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) return res.status(404).json({ message: 'Color not found' });

    // Recommendation Logic: 
    // Return 4 popular colors that are NOT the exact same family and tone.
    // E.g., if Cool Dark Blue, recommend Warm Light / Neutrals.
    const recommendations = await Color.aggregate([
      { $match: { 
          status: 'active', 
          _id: { $ne: color._id },
          family: { $ne: color.family }
      } },
      { $sample: { size: 4 } }
    ]);
    
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recommendations', error: err.message });
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
