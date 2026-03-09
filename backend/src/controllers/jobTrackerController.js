/**
 * Job application tracker CRUD via Supabase.
 */
const { supabase } = require('../config/supabase');

async function list(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
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
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Application not found' });
      throw error;
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { resume_id, company_name, job_title, job_url, job_description, status, match_score, notes } = req.body;
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: req.user.id,
        resume_id: resume_id || null,
        company_name: company_name || '',
        job_title: job_title || '',
        job_url: job_url || null,
        job_description: job_description || null,
        status: status || 'saved',
        match_score: match_score ?? null,
        notes: notes || null,
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
    const body = req.body;
    const allowed = ['resume_id', 'company_name', 'job_title', 'job_url', 'job_description', 'status', 'applied_at', 'match_score', 'notes'];
    const payload = {};
    allowed.forEach((k) => { if (body[k] !== undefined) payload[k] = body[k]; });

    const { data, error } = await supabase
      .from('job_applications')
      .update(payload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Application not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('job_applications').delete().eq('id', id).eq('user_id', req.user.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
