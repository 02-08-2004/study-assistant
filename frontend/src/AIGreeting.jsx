import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GREETING_TEXT = "Paste your notes or enter a topic below to generate flashcards or a quiz.";

export default function AIGreeting() {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < GREETING_TEXT.length) {
        setDisplayedText(GREETING_TEXT.slice(0, index + 1));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="ai-greeting-card glass-panel compact-banner"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="ai-banner-left">
        <motion.div
          className="ai-avatar-wrapper compact"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="ai-avatar-core compact">✨</div>
        </motion.div>
        <div className="ai-banner-text">
          <span className="ai-title-inline">AI Assistant:</span>
          <span className="ai-typing-text compact">
            {displayedText}
            {!isTypingComplete && <span className="typing-cursor">|</span>}
          </span>
        </div>
      </div>

      <span className="ai-badge-online">● Ready</span>
    </motion.div>
  );
}
