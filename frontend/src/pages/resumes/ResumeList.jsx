import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumes } from '../../lib/api';

export default function ResumeList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    resumes
      .list()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading resumes...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>My Resumes</h1>
      <Link to="/app/resumes/new" style={{ display: 'inline-block', marginBottom: 16 }}>
        Create resume
      </Link>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {list.map((r) => (
          <li key={r.id} style={{ marginBottom: 8 }}>
            <Link to={`/app/resumes/${r.id}`}>{r.title || 'Untitled'}</Link>
            <span style={{ marginLeft: 8, color: '#666' }}>
              {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : ''}
            </span>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p>No resumes yet. Create one to get started.</p>}
    </div>
  );
}
