import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import ResumeList from './pages/resumes/ResumeList';
import ResumeBuilder from './pages/resumes/ResumeBuilder';
import Templates from './pages/Templates';
import CoverLetterList from './pages/coverLetters/CoverLetterList';
import CoverLetterEditor from './pages/coverLetters/CoverLetterEditor';
import JobTracker from './pages/JobTracker';
import ResumeChecker from './pages/ResumeChecker';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="resumes" element={<ResumeList />} />
            <Route path="resumes/new" element={<ResumeBuilder />} />
            <Route path="resumes/:id" element={<ResumeBuilder />} />
            <Route path="templates" element={<Templates />} />
            <Route path="cover-letters" element={<CoverLetterList />} />
            <Route path="cover-letters/new" element={<CoverLetterEditor />} />
            <Route path="cover-letters/:id" element={<CoverLetterEditor />} />
            <Route path="job-tracker" element={<JobTracker />} />
            <Route path="resume-checker" element={<ResumeChecker />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
