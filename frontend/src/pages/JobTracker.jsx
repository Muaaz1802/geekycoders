import { useState, useEffect } from 'react';
import { jobTracker } from '../lib/api';

export default function JobTracker() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    jobTracker
      .list()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Job Tracker</h1>
      <p>Track applications and match scores (add new application form in next iteration).</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {list.map((j) => (
          <li key={j.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
            <strong>{j.job_title}</strong> at {j.company_name}
            <span style={{ marginLeft: 8, color: '#666' }}>({j.status})</span>
            {j.match_score != null && <span style={{ marginLeft: 8 }}>Score: {j.match_score}%</span>}
          </li>
        ))}
      </ul>
      {list.length === 0 && <p>No applications tracked yet.</p>}
    </div>
  );
}
