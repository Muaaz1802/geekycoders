/**
 * Cover letter model: linked to resume and optional job.
 */
const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    title: { type: String, default: 'Cover Letter' },
    jobTitle: { type: String },
    companyName: { type: String },
    jobDescription: { type: String },
    content: {
      greeting: String,
      intro: String,
      body: String,
      closing: String,
      signature: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CoverLetter', coverLetterSchema);
