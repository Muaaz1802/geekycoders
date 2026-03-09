/**
 * Job application tracker: track applications and resume score vs job description.
 */
const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    jobUrl: { type: String },
    jobDescription: { type: String },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
      default: 'saved',
    },
    appliedAt: { type: Date },
    matchScore: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
