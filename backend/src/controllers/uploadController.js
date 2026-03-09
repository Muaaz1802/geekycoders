/**
 * Upload resume PDF to Supabase Storage bucket (resume-pdfs).
 * Expects multipart file field: file (PDF).
 * Query or body: resumeId — update resumes.pdf_storage_path after upload.
 */
const { supabase } = require('../config/supabase');
const { STORAGE_BUCKET_RESUMES } = require('../config/constants');
const path = require('path');

async function uploadPdf(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const resumeId = req.body.resumeId || req.query.resumeId;
    if (!resumeId) return res.status(400).json({ message: 'resumeId required' });

    const ext = path.extname(req.file.originalname) || '.pdf';
    const storagePath = `${req.user.id}/${resumeId}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET_RESUMES)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype || 'application/pdf',
        upsert: true,
      });
    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from('resumes')
      .update({ pdf_storage_path: storagePath })
      .eq('id', resumeId)
      .eq('user_id', req.user.id);
    if (updateError) throw updateError;

    res.json({ success: true, path: storagePath });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadPdf };
