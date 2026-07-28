import { useState } from 'react';

const slides = [
    {
        icon: '💬',
        iconBg: 'var(--strawberry)',
        title: 'Welcome to Study Assistant',
        desc: 'Turn any notes or topic into quizzes you can actually study with.'
    },
    {
        icon: '📝',
        iconBg: 'var(--soft-peach)',
        title: 'Paste anything, get a study set',
        desc: 'Drop in messy notes or just name a topic — the AI builds quiz questions from it.'
    },
    {
        icon: '✅',
        iconBg: '#BFE3C9',
        title: 'Retest what you got wrong',
        desc: 'Take the quiz and loop back on questions that tripped you up.'
    }
];

function Onboarding({ onFinish }) {
    const [index, setIndex] = useState(0);
    const isLast = index === slides.length - 1;
    const slide = slides[index];

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card">
                <button className="onboarding-skip" onClick={onFinish}>Skip</button>

                <div className="onboarding-icon-ring" style={{ background: `${slide.iconBg}33` }}>
                    <div className="onboarding-icon-circle" style={{ background: slide.iconBg }}>
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
            </div>
        </div>
    );
}

export default Onboarding;