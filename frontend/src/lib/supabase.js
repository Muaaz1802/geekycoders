import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

const isConfigured = url.length > 0 && anonKey.length > 0;

export const supabase = isConfigured
  ? createClient(url, anonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;
