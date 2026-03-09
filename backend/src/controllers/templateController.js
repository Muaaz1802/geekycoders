/**
 * List resume templates from Supabase (read-only).
 */
const { supabase } = require('../config/supabase');

async function list(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Template not found' });
      throw error;
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne };
