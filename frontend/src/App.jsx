import { useState, useRef, useEffect } from 'react';
import './App.css';
import Flashcards from './Flashcards';
import Quiz from './Quiz';
import History from './History';
import Onboarding from './Onboarding';

const STORAGE_KEY = 'study-assistant-sessions';

function App() {
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('flashcards');
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const requestId = useRef(0);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('study-assistant-onboarded');
  });
  const finishOnboarding = () => {
    localStorage.setItem('study-assistant-onboarded', 'true');
    setShowOnboarding(false);
  };
  // Load saved sessions on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSessions(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load saved sessions:', e);
    }
  }, []);

  const saveSessions = (updated) => {
    setSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  };

  const handleSubmit = async () => {
    const thisRequestId = ++requestId.current;

    setStatus('loading');
    setErrorMsg('');
    setData(null);
    setActiveId(null);

    try {
      const res = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, mode })
      });

      const json = await res.json();

      if (thisRequestId !== requestId.current) {
        console.log('Discarding stale response from request', thisRequestId);
        return;
      }

      if (!res.ok) {
        setErrorMsg(json.error || 'Something went wrong');
        setStatus('error');
        return;
      }

      setData(json);
      setStatus('success');

      const newSession = {
        id: Date.now().toString(),
        topic: json.topic,
        mode: json.type,
        data: json,
        timestamp: new Date().toISOString()
      };
      const updated = [newSession, ...sessions];
      saveSessions(updated);
      setActiveId(newSession.id);
    } catch (err) {
      if (thisRequestId !== requestId.current) {
        console.log('Discarding stale error from request', thisRequestId);
        return;
      }
      console.error('Fetch failed:', err);
      setErrorMsg('Could not reach the server. Is the backend running?');
      setStatus('error');
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStatus('idle');
    setData(null);
    setErrorMsg('');
  };

  const handleSelectSession = (session) => {
    setData(session.data);
    setMode(session.mode);
    setStatus('success');
    setActiveId(session.id);
  };

  const handleDeleteSession = (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    saveSessions(updated);
    if (activeId === id) {
      setStatus('idle');
      setData(null);
      setActiveId(null);
    }
  };

  const handleNew = () => {
    setNotes('');
    setStatus('idle');
    setData(null);
    setErrorMsg('');
    setActiveId(null);
  };
  if (showOnboarding) {
    return <Onboarding onFinish={finishOnboarding} />;
  }
  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>Study Assistant</span>
        </div>
      </header>

      <div className="layout">
        <History
          sessions={sessions}
          activeId={activeId}
          onSelect={handleSelectSession}
          onDelete={handleDeleteSession}
          onNew={handleNew}
        />

        <main className="content">
          <h1>What are we studying today?</h1>
          <p className="subtitle">Paste your notes or name a topic — get flashcards or a quiz instantly.</p>

          <div className="composer">
            <div className="mode-select">
              <button
                type="button"
                className={mode === 'flashcards' ? 'active' : ''}
                onClick={() => switchMode('flashcards')}
              >
                Flashcards
              </button>
              <button
                type="button"
                className={mode === 'quiz' ? 'active' : ''}
                onClick={() => switchMode('quiz')}
              >
                Quiz
              </button>
            </div>

            <textarea
              placeholder='Paste your notes, or just name a topic — e.g. "Photosynthesis"...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />

            <button
              className="generate-btn"
              onClick={handleSubmit}
              disabled={!notes.trim() || status === 'loading'}
            >
              {status === 'loading'
                ? 'Generating...'
                : `Generate ${mode === 'flashcards' ? 'flashcards' : 'quiz'}`}
            </button>
          </div>

          {status !== 'idle' && (
            <div className="result-panel">
              {status === 'loading' && (
                <div className="loading-box">
                  <div className="spinner"></div>
                  <p>Talking to the AI, this can take a few seconds...</p>
                </div>
              )}

              {status === 'error' && (
                <div className="error-box">
                  <p>{errorMsg}</p>
                  <button onClick={handleSubmit}>Retry</button>
                </div>
              )}

              {status === 'success' && data && data.type === 'flashcards' && (
                <Flashcards data={data} />
              )}

              {status === 'success' && data && data.type === 'quiz' && (
                <Quiz data={data} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;