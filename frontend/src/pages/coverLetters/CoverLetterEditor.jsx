import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coverLetters } from '../../lib/api';

export default function CoverLetterEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [data, setData] = useState({
    title: 'Cover Letter',
    company_name: '',
    job_title: '',
    content: { greeting: '', intro: '', body: '', closing: '', signature: '' },
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    coverLetters
      .get(id)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        const created = await coverLetters.create(data);
        navigate(`/app/cover-letters/${created.id}`, { replace: true });
      } else {
        await coverLetters.update(id, data);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{isNew ? 'New Cover Letter' : 'Edit Cover Letter'}</h1>
      <div style={{ marginBottom: 12 }}>
        <label>Company </label>
        <input
          value={data.company_name || ''}
          onChange={(e) => setData((d) => ({ ...d, company_name: e.target.value }))}
          style={{ marginLeft: 8, padding: 6 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Job title </label>
        <input
          value={data.job_title || ''}
          onChange={(e) => setData((d) => ({ ...d, job_title: e.target.value }))}
          style={{ marginLeft: 8, padding: 6 }}
        />
      </div>
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : isNew ? 'Create' : 'Save'}
      </button>
    </div>
  );
}
