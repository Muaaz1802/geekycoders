import { useState, useEffect } from 'react';
import { templates } from '../lib/api';

export default function Templates() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    templates
      .list()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading templates...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Resume Templates</h1>
      <p>Choose a template when creating or editing a resume.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
        {list.map((t) => (
          <div key={t.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
            <strong>{t.name}</strong>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#666' }}>{t.description || t.layout}</p>
          </div>
        ))}
      </div>
      {list.length === 0 && <p>No templates in database. Run schema and seed.</p>}
    </div>
  );
}
