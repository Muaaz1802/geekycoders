import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coverLetters } from '../../lib/api';

export default function CoverLetterList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    coverLetters
      .list()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Cover Letters</h1>
      <Link to="/app/cover-letters/new" style={{ display: 'inline-block', marginBottom: 16 }}>
        New cover letter
      </Link>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {list.map((c) => (
          <li key={c.id} style={{ marginBottom: 8 }}>
            <Link to={`/app/cover-letters/${c.id}`}>
              {c.title || 'Untitled'} {c.company_name && `– ${c.company_name}`}
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p>No cover letters yet.</p>}
    </div>
  );
}
