/**
 * Resume model: stores resume content, sections, and template reference.
 */
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String },
  content: { type: mongoose.Schema.Types.Mixed },
  order: { type: Number, default: 0 },
});

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'My Resume' },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
    sections: [sectionSchema],
    contact: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedIn: String,
      website: String,
    },
    settings: {
      fontFamily: { type: String, default: 'default' },
      fontSize: { type: String, default: 'medium' },
      colorScheme: { type: String, default: 'default' },
    },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
