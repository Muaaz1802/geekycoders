/**
 * Resume checker: paste JD and resume text (or upload PDF) to get match score and highlights.
 * Inspired by ai-resume-screener: integrate with AI later; placeholder UI for now.
 */
import { useState } from 'react';

export default function ResumeChecker() {
  const [jd, setJd] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState(null);

  function handleAnalyze() {
    // Placeholder: wire to backend AI endpoint when available (e.g. Gemini/OpenAI).
    setResult({
      score: 0,
      summary: 'Connect an AI endpoint (e.g. Gemini) to analyze resume vs job description.',
      highlights: [],
    });
  }

  return (
    <div>
      <h1>Resume Checker</h1>
      <p>Paste job description and resume to get match score and suggestions (AI integration coming).</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>Job description</label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste job description here..."
            rows={12}
            style={{ width: '100%', padding: 12 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>Resume text</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste resume text or upload PDF..."
            rows={12}
            style={{ width: '100%', padding: 12 }}
          />
        </div>
      </div>
      <button onClick={handleAnalyze} style={{ marginTop: 16, padding: '10px 24px' }}>
        Analyze match
      </button>
      {result && (
        <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <p><strong>Score:</strong> {result.score}%</p>
          <p>{result.summary}</p>
        </div>
      )}
    </div>
  );
}
