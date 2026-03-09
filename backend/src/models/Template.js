/**
 * Resume template model: layout, style, and preview.
 */
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    layout: { type: String, enum: ['single-column', 'double-column', 'multi-column'], default: 'single-column' },
    category: { type: String, default: 'traditional' },
    previewImageUrl: { type: String },
    config: {
      sections: [String],
      defaultFont: String,
      defaultColors: mongoose.Schema.Types.Mixed,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
