import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumes } from '../../lib/api';

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [resume, setResume] = useState({ title: 'My Resume', sections: [], contact: {}, settings: {} });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    resumes
      .get(id)
      .then(setResume)
      .catch(() => setResume({ title: 'My Resume', sections: [], contact: {}, settings: {} }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        const created = await resumes.create(resume);
        navigate(`/app/resumes/${created.id}`, { replace: true });
      } else {
        await resumes.update(id, resume);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{isNew ? 'New Resume' : 'Edit Resume'}</h1>
      <div style={{ marginBottom: 16 }}>
        <label>Title </label>
        <input
          value={resume.title || ''}
          onChange={(e) => setResume((r) => ({ ...r, title: e.target.value }))}
          style={{ marginLeft: 8, padding: 6, minWidth: 300 }}
        />
      </div>
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : isNew ? 'Create' : 'Save'}
      </button>
      <p style={{ marginTop: 16, color: '#666' }}>
        Add sections (experience, education, skills) and PDF export in the next iteration.
      </p>
    </div>
  );
}
