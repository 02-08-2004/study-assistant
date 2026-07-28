import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import Flashcards from './Flashcards';
import Quiz from './Quiz';
import Onboarding from './Onboarding';
import AmbientBackground from './AmbientBackground';
import SplashScreen from './SplashScreen';
import AIGreeting from './AIGreeting';
import ConfirmModal from './ConfirmModal';
import HistorySheet from './HistorySheet';
import Ripple from './Ripple';

const STORAGE_KEY = 'study-assistant-sessions';

const AI_THINKING_PHRASES = [
  "Analyzing your notes...",
  "Extracting key concepts & definitions...",
  "Crafting interactive study cards...",
  "Finalizing your personalized set..."
];

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('flashcards');
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showComposer, setShowComposer] = useState(true);
  const [viewType, setViewType] = useState('flashcards');
  const [composerHighlight, setComposerHighlight] = useState(false);
  const [aiThinkingIdx, setAiThinkingIdx] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  const requestId = useRef(0);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('study-assistant-onboarded');
  });

  const finishOnboarding = () => {
    localStorage.setItem('study-assistant-onboarded', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSessions(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load saved sessions:', e);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (status === 'loading') {
      interval = setInterval(() => {
        setAiThinkingIdx((prev) => (prev + 1) % AI_THINKING_PHRASES.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [status]);

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
    setAiThinkingIdx(0);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/generate`, {
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
      setShowComposer(false);
      setViewType(json.type || mode);

      const newSession = {
        id: Date.now().toString(),
        topic: json.topic,
        mode: json.type || mode,
        data: json,
        notes: notes,
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
    setViewType(newMode);
    setStatus('idle');
    setData(null);
    setErrorMsg('');
    setShowComposer(true);
  };

  const handleUpdateSession = (sessionId, updatedFields) => {
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        return { ...s, ...updatedFields };
      }
      return s;
    });
    saveSessions(updated);
  };

  const handleSelectSession = (session) => {
    setData(session.data);
    const sessionMode = session.mode || session.data?.type || (session.data?.cards ? 'flashcards' : 'quiz');
    setMode(sessionMode);
    setViewType(sessionMode);
    setStatus('success');
    setActiveId(session.id);
    setShowComposer(false);

    const updated = sessions.map((s) => s.id === session.id ? { ...s, openedFromHistory: true } : s);
    saveSessions(updated);

    if (session.notes) {
      setNotes(session.notes);
    } else if (session.topic || session.data?.topic) {
      setNotes(session.topic || session.data?.topic);
    }
  };

  const handleDeleteSession = (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    saveSessions(updated);
    if (activeId === id) {
      setStatus('idle');
      setData(null);
      setActiveId(null);
      setShowComposer(true);
    }
  };

  const [showClearModal, setShowClearModal] = useState(false);

  const handleConfirmClearHistory = () => {
    saveSessions([]);
    setStatus('idle');
    setData(null);
    setActiveId(null);
    setShowComposer(true);
    setShowClearModal(false);
  };

  const handleClearHistory = () => {
    setShowClearModal(true);
  };

  const handleNew = () => {
    setNotes('');
    setMode('flashcards');
    setStatus('idle');
    setData(null);
    setErrorMsg('');
    setActiveId(null);
    setShowComposer(true);
    setComposerHighlight(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setComposerHighlight(false), 600);

    setTimeout(() => {
      const textarea = document.querySelector('.composer textarea');
      if (textarea) textarea.focus();
    }, 100);
  };

  const activeSession = sessions.find((s) => s.id === activeId) || null;
  const activeViewType = viewType || data?.type || mode;

  return (
    <div className="page">
      <Ripple />
      <AmbientBackground />

      <AnimatePresence>
        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && !showSplash && (
          <Onboarding onFinish={finishOnboarding} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearModal && (
          <ConfirmModal
            isOpen={showClearModal}
            title="Clear Study Library History?"
            message="This will permanently delete all your saved flashcards, quiz sessions, and test attempt history. This action cannot be undone."
            confirmText="Yes, Clear All"
            cancelText="Keep My History"
            onConfirm={handleConfirmClearHistory}
            onCancel={() => setShowClearModal(false)}
          />
        )}
      </AnimatePresence>

      <motion.header 
        className="topbar glass-panel"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="brand">
          <motion.div 
            className="brand-mark"
            whileHover={{ rotate: 10, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            S
          </motion.div>
          <span>Study Assistant</span>
        </div>
        <motion.button 
          className="topbar-new-btn" 
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleNew}
        >
          + Create New Set
        </motion.button>
      </motion.header>

      <div className="layout full-screen-layout">
        <motion.main 
          className="content full-stage"
          animate={{ x: historyOpen ? 150 : 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <AnimatePresence mode="wait">
            {/* COMPOSER MODE */}
            {(showComposer || status === 'idle' || status === 'loading' || status === 'error') ? (
              <motion.div 
                key="composer-mode"
                className="composer-hero-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              >
                <div className="composer-column">
                  <div className="composer-header">
                    <h1>What are we studying today?</h1>
                    <p className="subtitle">Paste your notes or name a topic — get flashcards or a quiz instantly.</p>
                  </div>

                  <div className={`composer glass-panel ${composerHighlight ? 'pulse-highlight' : ''}`}>
                    <AnimatePresence>
                      {status === 'loading' && (
                        <motion.div 
                          className="composer-loading-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="ai-orb-container">
                            <div className="ai-orb-ring" />
                            <div className="ai-orb-core" />
                          </div>
                          <motion.p 
                            key={aiThinkingIdx}
                            className="composer-loading-text"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            {AI_THINKING_PHRASES[aiThinkingIdx]}
                          </motion.p>
                          <div className="skeleton-wave-container">
                            <div className="skeleton-wave-line" style={{ width: '75%', margin: '0 auto' }} />
                            <div className="skeleton-wave-line" style={{ width: '50%', margin: '0 auto' }} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mode-select">
                      <motion.button
                        type="button"
                        className={mode === 'flashcards' ? 'active' : ''}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => switchMode('flashcards')}
                      >
                        {mode === 'flashcards' && (
                          <motion.div className="active-pill-bg" layoutId="modePill" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                        )}
                        <span className="btn-label">🎴 Flashcards</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        className={mode === 'quiz' ? 'active' : ''}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => switchMode('quiz')}
                      >
                        {mode === 'quiz' && (
                          <motion.div className="active-pill-bg" layoutId="modePill" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                        )}
                        <span className="btn-label">🎯 Quiz</span>
                      </motion.button>
                    </div>

                    <textarea
                      placeholder='Paste your notes, or just name a topic — e.g. "Photosynthesis"...'
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={9}
                    />

                    <motion.button
                      className="generate-btn"
                      whileHover={{ scale: !notes.trim() || status === 'loading' ? 1 : 1.02 }}
                      whileTap={{ scale: !notes.trim() || status === 'loading' ? 1 : 0.97 }}
                      onClick={handleSubmit}
                      disabled={!notes.trim() || status === 'loading'}
                    >
                      {status === 'loading'
                        ? 'Generating Study Material...'
                        : `Generate ${mode === 'flashcards' ? 'Flashcards' : 'Quiz'}`}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.div 
                        className="error-box glass-panel"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p>{errorMsg}</p>
                        <button onClick={handleSubmit}>Retry</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              /* ACTIVE STUDY WORKBENCH MODE */
              <motion.div 
                key="workbench-mode"
                className="workbench-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              >
                <div className="workbench-top-bar glass-panel">
                  <div className="workbench-title-info">
                    <div className="workbench-view-toggle">
                      <motion.button
                        type="button"
                        className={activeViewType === 'flashcards' ? 'active' : ''}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setViewType('flashcards')}
                      >
                        {activeViewType === 'flashcards' && (
                          <motion.div className="active-pill-bg" layoutId="workbenchPill" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                        )}
                        <span className="btn-label">🎴 Flashcards</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        className={activeViewType === 'quiz' ? 'active' : ''}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setViewType('quiz')}
                      >
                        {activeViewType === 'quiz' && (
                          <motion.div className="active-pill-bg" layoutId="workbenchPill" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                        )}
                        <span className="btn-label">🎯 Quiz</span>
                      </motion.button>
                    </div>

                    <span className="workbench-topic-badge">
                      <span className="topic-badge-icon">📖</span> {data?.topic}
                    </span>
                  </div>
                  <motion.button 
                    className="edit-notes-btn"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowComposer(true)}
                  >
                    ✏️ Edit Notes
                  </motion.button>
                </div>

                <div className="result-panel">
                  <AnimatePresence mode="wait">
                    {activeViewType === 'flashcards' ? (
                      <Flashcards
                        key={`fc-${activeId || JSON.stringify(data)}`}
                        data={data}
                        session={activeSession}
                        onUpdateSession={handleUpdateSession}
                        onSwitchToQuiz={() => setViewType('quiz')}
                      />
                    ) : (
                      <Quiz
                        key={`qz-${activeId || JSON.stringify(data)}`}
                        data={data}
                        session={activeSession}
                        onUpdateSession={handleUpdateSession}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>

      <motion.button
        className="floating-history"
        onClick={() => setHistoryOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🕘 History
      </motion.button>

      <HistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={sessions}
        activeId={activeId}
        onSelect={handleSelectSession}
        onDelete={handleDeleteSession}
      />
    </div>
  );
}

export default App;