import { useState, useRef } from 'react';
import './App.css';
import Flashcards from './Flashcards';
import Quiz from './Quiz';

function App() {
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('flashcards');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const requestId = useRef(0);

  const handleSubmit = async () => {
    const thisRequestId = ++requestId.current;

    setStatus('loading');
    setErrorMsg('');
    setData(null);

    try {
      const res = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, mode })
      });

      const json = await res.json();

      // If a newer request has started since this one was fired, discard this result
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
  return (
    <div className="app">
      <h1>Study Assistant</h1>
      <div className="input-row">
        <textarea
          placeholder="Paste your notes or type a topic..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={8}
        />

        <div className="input-sidebar">
          <div className="mode-select">
            <label>
              <input
                type="radio"
                name="mode"
                value="flashcards"
                checked={mode === 'flashcards'}
                onChange={(e) => {
                  setMode(e.target.value);
                  setStatus('idle');
                  setData(null);
                  setErrorMsg('');
                }}
              />
              Flashcards
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="quiz"
                checked={mode === 'quiz'}
                onChange={(e) => {
                  setMode(e.target.value);
                  setStatus('idle');
                  setData(null);
                  setErrorMsg('');
                }}
              />
              Quiz
            </label>
          </div>

          <button onClick={handleSubmit} disabled={!notes.trim() || status === 'loading'}>
            {status === 'loading' ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

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
  );
}

export default App;