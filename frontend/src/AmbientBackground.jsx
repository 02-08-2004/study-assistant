import { motion } from 'framer-motion';

const PARTICLES = Array.from({ length: 12 });

export default function AmbientBackground() {
  return (
    <div className="ambient-background-container">
      {/* Floating Blob 1 - Rosy Brown */}
      <motion.div
        className="ambient-blob blob-1"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Blob 2 - Moss Green */}
      <motion.div
        className="ambient-blob blob-2"
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 70, -40, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Blob 3 - Midnight Green */}
      <motion.div
        className="ambient-blob blob-3"
        animate={{
          x: [0, 50, -60, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.2, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Sparkle Particles */}
      {PARTICLES.map((_, i) => (
        <motion.div
          key={i}
          className="ambient-particle"
          style={{
            left: `${(i * 8.5 + 5) % 95}%`,
            top: `${(i * 12 + 10) % 90}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.75, 0.2],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: 4 + (i % 5),
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
