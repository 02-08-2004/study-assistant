import { motion } from 'framer-motion';

export default function SplashScreen({ onFinish }) {
  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="splash-content">
        <motion.div
          className="splash-logo"
          initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
        >
          <span>S</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Study Assistant
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Intelligent AI Flashcards & Interactive Quizzes
        </motion.p>

        <motion.div
          className="splash-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.div
            className="splash-bar"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.3, duration: 1.0, ease: 'easeInOut' }}
            onAnimationComplete={() => setTimeout(onFinish, 150)}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
