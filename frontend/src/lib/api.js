/**
 * Backend API client. All requests send Supabase session token when available.
 */
import { supabase } from './supabase';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (_) {}
  }
  return headers;
}

export async function api(method, path, body = null) {
  const headers = await getHeaders();
  const opts = { method, headers };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

export const resumes = {
  list: () => api('GET', '/api/v1/resumes'),
  get: (id) => api('GET', `/api/v1/resumes/${id}`),
  create: (body) => api('POST', '/api/v1/resumes', body),
  update: (id, body) => api('PATCH', `/api/v1/resumes/${id}`, body),
  delete: (id) => api('DELETE', `/api/v1/resumes/${id}`),
  getPdfUrl: (id) => api('GET', `/api/v1/resumes/${id}/pdf-url`),
  /** Upload PDF: pass File and resumeId. Uses multipart/form-data. */
  async uploadPdf(file, resumeId) {
    const headers = await getHeaders();
    const form = new FormData();
    form.append('file', file);
    form.append('resumeId', resumeId);
    const reqHeaders = {};
    if (headers.Authorization) reqHeaders.Authorization = headers.Authorization;
    const res = await fetch(`${API_BASE}/api/v1/resumes/upload-pdf`, {
      method: 'POST',
      headers: reqHeaders,
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || res.statusText);
    return data;
  },
};

export const templates = {
  list: () => api('GET', '/api/v1/templates'),
  get: (id) => api('GET', `/api/v1/templates/${id}`),
};

export const coverLetters = {
  list: () => api('GET', '/api/v1/cover-letters'),
  get: (id) => api('GET', `/api/v1/cover-letters/${id}`),
  create: (body) => api('POST', '/api/v1/cover-letters', body),
  update: (id, body) => api('PATCH', `/api/v1/cover-letters/${id}`, body),
  delete: (id) => api('DELETE', `/api/v1/cover-letters/${id}`),
};

export const jobTracker = {
  list: () => api('GET', '/api/v1/job-tracker'),
  get: (id) => api('GET', `/api/v1/job-tracker/${id}`),
  create: (body) => api('POST', '/api/v1/job-tracker', body),
  update: (id, body) => api('PATCH', `/api/v1/job-tracker/${id}`, body),
  delete: (id) => api('DELETE', `/api/v1/job-tracker/${id}`),
};

export const profile = {
  get: () => api('GET', '/api/v1/users/profile'),
  update: (body) => api('PATCH', '/api/v1/users/profile', body),
};
