const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  rgb: { type: String },
  brand: { type: String, default: 'SmartPaint' },
  category: { type: String, required: true }, // Legacy/UI grouping
  family: { type: String, enum: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'Grey', 'White'] },
  tone: { type: String, enum: ['Light', 'Medium', 'Dark'] },
  temperature: { type: String, enum: ['Cool', 'Warm', 'Neutral', 'Accent'] },
  rooms: [{ type: String }],
  styles: [{ type: String }],
  finishes: [{ type: String, enum: ['Matte', 'Satin', 'Glossy'] }],
  description: { type: String },
  swatchImage: { type: String },
  usageCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  colorCode: { type: String },
  pricePerUnit: { type: Number, default: 250 },
  unit: { type: String, default: 'Swatch' },
  stock: { type: Number, default: 100 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Color', colorSchema);
