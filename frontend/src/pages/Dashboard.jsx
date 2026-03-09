import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome. Quick actions:</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/app/resumes/new">Create new resume</Link></li>
        <li><Link to="/app/resumes">My resumes</Link></li>
        <li><Link to="/app/cover-letters/new">New cover letter</Link></li>
        <li><Link to="/app/job-tracker">Job tracker</Link></li>
        <li><Link to="/app/resume-checker">Resume checker (JD vs resume)</Link></li>
      </ul>
    </div>
  );
}
