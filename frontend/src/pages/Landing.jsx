import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h1>Resume Builder</h1>
      <p>Build ATS-friendly resumes, cover letters, and track job applications.</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
        <Link to="/login" style={{ padding: '12px 24px', background: '#eee', borderRadius: 8 }}>
          Log in
        </Link>
        <Link to="/signup" style={{ padding: '12px 24px', background: '#0ea5e9', color: '#fff', borderRadius: 8 }}>
          Get started
        </Link>
      </div>
    </div>
  );
}
