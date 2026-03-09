/**
 * User profile (Supabase profiles table). Auth is handled by Supabase Auth on frontend.
 */
const { supabase } = require('../config/supabase');

async function getProfile(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Profile not found' });
      throw error;
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { full_name, avatar_url, plan } = req.body;
    const payload = {};
    if (full_name !== undefined) payload.full_name = full_name;
    if (avatar_url !== undefined) payload.avatar_url = avatar_url;
    if (plan !== undefined) payload.plan = plan;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
