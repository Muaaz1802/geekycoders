/**
 * Resume CRUD and PDF upload. PDFs stored in Supabase Storage bucket.
 */
const { supabase } = require('../config/supabase');
const { STORAGE_BUCKET_RESUMES } = require('../config/constants');

async function list(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('id, title, template_id, updated_at, pdf_storage_path')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Resume not found' });
      throw error;
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, template_id, sections, contact, settings } = req.body;
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: req.user.id,
        title: title || 'My Resume',
        template_id: template_id || null,
        sections: sections || [],
        contact: contact || {},
        settings: settings || {},
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, template_id, sections, contact, settings, is_public } = req.body;
    const payload = {};
    if (title !== undefined) payload.title = title;
    if (template_id !== undefined) payload.template_id = template_id;
    if (sections !== undefined) payload.sections = sections;
    if (contact !== undefined) payload.contact = contact;
    if (settings !== undefined) payload.settings = settings;
    if (is_public !== undefined) payload.is_public = is_public;

    const { data, error } = await supabase
      .from('resumes')
      .update(payload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Resume not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const { data: resume } = await supabase.from('resumes').select('pdf_storage_path').eq('id', id).eq('user_id', req.user.id).single();
    const { error: delError } = await supabase.from('resumes').delete().eq('id', id).eq('user_id', req.user.id);
    if (delError) throw delError;
    if (resume?.pdf_storage_path) {
      await supabase.storage.from(STORAGE_BUCKET_RESUMES).remove([resume.pdf_storage_path]);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** Generate a signed URL for viewing/downloading PDF from Storage */
async function getPdfUrl(req, res, next) {
  try {
    const { id } = req.params;
    const { data: resume } = await supabase.from('resumes').select('pdf_storage_path').eq('id', id).eq('user_id', req.user.id).single();
    if (!resume?.pdf_storage_path) return res.status(404).json({ message: 'No PDF for this resume' });
    const { data: urlData, error } = await supabase.storage.from(STORAGE_BUCKET_RESUMES).createSignedUrl(resume.pdf_storage_path, 3600);
    if (error) throw error;
    res.json({ url: urlData?.signedUrl });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove, getPdfUrl };
