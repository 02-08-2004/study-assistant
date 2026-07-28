import { useState } from 'react';
import { motion } from 'framer-motion';

const slides = [
    {
        icon: '💬',
        iconBg: '#D3968C',
        title: 'Welcome to Study Assistant',
        desc: 'Turn any notes or topic into interactive flashcards or quizzes instantly.'
    },
    {
        icon: '📝',
        iconBg: '#105666',
        title: 'Paste anything, get a study set',
        desc: 'Drop in messy notes or just name a topic — AI builds your study material.'
    },
    {
        icon: '✅',
        iconBg: '#839958',
        title: 'Retest what you got wrong',
        desc: 'Take the quiz and loop back on questions that tripped you up.'
    }
];

function Onboarding({ onFinish }) {
    const [index, setIndex] = useState(0);
    const isLast = index === slides.length - 1;
    const slide = slides[index];

    return (
        <motion.div 
            className="onboarding-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="onboarding-card glass-panel"
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
                <button className="onboarding-skip" onClick={onFinish}>Skip</button>

                <div className="onboarding-icon-ring" style={{ background: `${slide.iconBg}22` }}>
                    <div className="onboarding-icon-circle" style={{ background: slide.iconBg, color: '#ffffff' }}>
                        <span>{slide.icon}</span>
                    </div>
                </div>

                <h2>{slide.title}</h2>
                <p>{slide.desc}</p>

                <div className="onboarding-dots">
                    {slides.map((_, i) => (
                        <span key={i} className={`dot ${i === index ? 'active' : ''}`}></span>
                    ))}
                </div>

                <button
                    className="onboarding-next"
                    onClick={() => (isLast ? onFinish() : setIndex(index + 1))}
                >
                    {isLast ? 'Get started' : 'Next'}
                </button>
            </motion.div>
        </motion.div>
    );
}

export default Onboarding;