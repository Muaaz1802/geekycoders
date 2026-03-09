/**
 * Application constants: section types, template categories, storage bucket.
 */
const RESUME_SECTION_TYPES = [
  'summary',
  'experience',
  'education',
  'skills',
  'certifications',
  'projects',
  'awards',
  'languages',
  'interests',
  'custom',
];

const TEMPLATE_LAYOUTS = ['single-column', 'double-column', 'multi-column'];

const STORAGE_BUCKET_RESUMES = 'resume-pdfs';

module.exports = {
  RESUME_SECTION_TYPES,
  TEMPLATE_LAYOUTS,
  STORAGE_BUCKET_RESUMES,
};
