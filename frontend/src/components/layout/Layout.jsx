import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/app', end: true, label: 'Dashboard' },
  { to: '/app/resumes', label: 'Resumes' },
  { to: '/app/templates', label: 'Templates' },
  { to: '/app/cover-letters', label: 'Cover Letters' },
  { to: '/app/job-tracker', label: 'Job Tracker' },
  { to: '/app/resume-checker', label: 'Resume Checker' },
];

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, borderRight: '1px solid #eee', padding: 16 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                padding: '8px 12px',
                borderRadius: 6,
                textDecoration: 'none',
                color: isActive ? '#0ea5e9' : '#333',
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 24 }}>
          <span style={{ fontSize: 12, color: '#666' }}>{user?.email}</span>
          <button
            type="button"
            onClick={() => signOut()}
            style={{ display: 'block', marginTop: 8, padding: '6px 12px', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
