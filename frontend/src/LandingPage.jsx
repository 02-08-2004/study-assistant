import { motion } from 'framer-motion';

const SAMPLE_PROMPTS = [
  { icon: '🧬', title: 'DNA Replication & Genetics' },
  { icon: '⚛️', title: 'Quantum Physics Basics' },
  { icon: '💻', title: 'JavaScript Promises & Async/Await' },
  { icon: '📜', title: 'The French Revolution (1789)' },
  { icon: '🧠', title: 'Cognitive Psychology & Memory' }
];

function LandingPage({ onStart, onSelectSample }) {
  return (
    <motion.div 
      className="landing-page-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Hero Header Section */}
      <section className="landing-hero-section">
        <motion.div 
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="badge-sparkle">✨</span>
          <span>Next-Gen AI Active Recall Platform</span>
        </motion.div>

        <motion.h1 
          className="landing-hero-title"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Master Any Subject in Seconds with <span className="gradient-text">AI Flashcards</span> & <span className="gradient-text-alt">Adaptive Quizzes</span>
        </motion.h1>

        <motion.p 
          className="landing-hero-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Paste raw lecture notes, PDF summaries, or any topic prompt. Our Groq AI engine automatically transforms them into interactive 3D study sets designed for maximum retention.
        </motion.p>

        <motion.div 
          className="hero-cta-group"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button 
            className="cta-primary-btn"
            whileHover={{ scale: 1.04, boxShadow: '0 10px 30px rgba(10, 51, 35, 0.3)' }}
            whileTap={{ scale: 0.96 }}
            onClick={onStart}
          >
            🚀 Launch Study Workbench
          </motion.button>
          
          <motion.button 
            className="cta-secondary-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectSample('Photosynthesis & Cellular Respiration')}
          >
            ⚡ Try Sample Set
          </motion.button>
        </motion.div>
      </section>

      {/* Quick Prompt Chips Bar */}
      <section className="prompt-chips-section">
        <span className="chips-label">Try a popular topic:</span>
        <div className="chips-row">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <motion.button
              key={idx}
              className="prompt-chip"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectSample(prompt.title)}
            >
              <span className="chip-icon">{prompt.icon}</span>
              <span>{prompt.title}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="features-showcase-grid">
        <motion.div 
          className="showcase-card glass-panel"
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="showcase-icon-wrapper rosy">🎴</div>
          <h3>3D Flip Flashcards</h3>
          <p>Study with smooth 3D flip card animations, progress tracking, and instant keyboard / click controls.</p>
        </motion.div>

        <motion.div 
          className="showcase-card glass-panel"
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="showcase-icon-wrapper midnight">🎯</div>
          <h3>Adaptive Quizzes & Retest</h3>
          <p>Instant option feedback, performance breakdown cards, and 1-click targeted retests for missed questions.</p>
        </motion.div>

        <motion.div 
          className="showcase-card glass-panel"
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="showcase-icon-wrapper moss">🗂️</div>
          <h3>Persistent Session Library</h3>
          <p>Never lose your study sets. Automatic local storage history with slide-in drawer access and session intercepts.</p>
        </motion.div>
      </section>
    </motion.div>
  );
}

export default LandingPage;
