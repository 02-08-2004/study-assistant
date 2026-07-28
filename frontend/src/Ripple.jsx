import { useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Ripple({ color = 'rgba(255, 255, 255, 0.45)', duration = 600 }) {
  const [ripples, setRipples] = useState([]);

  useLayoutEffect(() => {
    const handleGlobalClick = (e) => {
      // Find closest button or ripple target if inside
      const target = e.target.closest('.has-ripple, button, .interactive-card');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.5;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple = {
        id: Date.now() + Math.random(),
        x,
        y,
        size,
        target
      };

      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    window.addEventListener('pointerdown', handleGlobalClick);
    return () => window.removeEventListener('pointerdown', handleGlobalClick);
  }, []);

  return (
    <div className="global-ripple-container">
      <AnimatePresence>
        {ripples.map((r) => (
          <RippleItem key={r.id} ripple={r} color={color} duration={duration} onComplete={(id) => {
            setRipples((prev) => prev.filter((item) => item.id !== id));
          }} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function RippleItem({ ripple, color, duration, onComplete }) {
  useLayoutEffect(() => {
    const timer = setTimeout(() => onComplete(ripple.id), duration);
    return () => clearTimeout(timer);
  }, [ripple.id, duration, onComplete]);

  return (
    <motion.span
      className="ripple-circle"
      style={{
        left: ripple.x,
        top: ripple.y,
        width: ripple.size,
        height: ripple.size,
        backgroundColor: color,
        position: 'absolute',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        transformOrigin: 'center'
      }}
      initial={{ scale: 0, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: duration / 1000, ease: 'easeOut' }}
    />
  );
}
