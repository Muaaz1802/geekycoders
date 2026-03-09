/**
 * Central export for all API route modules.
 */
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const resumeRoutes = require('./resume.routes');
const templateRoutes = require('./template.routes');
const coverLetterRoutes = require('./coverLetter.routes');
const jobTrackerRoutes = require('./jobTracker.routes');

module.exports = {
  authRoutes,
  userRoutes,
  resumeRoutes,
  templateRoutes,
  coverLetterRoutes,
  jobTrackerRoutes,
};
