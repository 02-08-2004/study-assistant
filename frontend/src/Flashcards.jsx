import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

function Flashcards({ data, session, onUpdateSession, onSwitchToQuiz }) {
    const cards = data.cards || (data.questions ? data.questions.map(q => ({
        question: q.question,
        answer: q.options ? q.options[q.correctIndex] : (q.answer || '')
    })) : []);
    
    const [index, setIndex] = useState(() => session?.flashcardState?.index ?? 0);
    const [flipped, setFlipped] = useState(false);
    const [isCompleted, setIsCompleted] = useState(() => session?.flashcardState?.completed && index === cards.length - 1);

    const isFromHistory = Boolean(session?.openedFromHistory || (session?.flashcardState && (session.flashcardState.index > 0 || session.flashcardState.completed)) || session?.completed);

    const [promptState, setPromptState] = useState(() => {
        if (!isFromHistory) return null;
        if (session?.flashcardState?.completed || session?.completed) return 'completed';
        return 'unfinished';
    });

    useEffect(() => {
        if (session?.id) {
            const fromHist = Boolean(session?.openedFromHistory || (session?.flashcardState && (session.flashcardState.index > 0 || session.flashcardState.completed)) || session?.completed);
            if (fromHist) {
                if (session.flashcardState?.completed || session.completed) {
                    setPromptState('completed');
                    setIndex(cards.length - 1);
                } else {
                    setPromptState('unfinished');
                    setIndex(session.flashcardState?.index ?? 0);
                }
            } else {
                setPromptState(null);
                setIndex(0);
            }
        } else {
            setPromptState(null);
            setIndex(0);
        }
    }, [session?.id]);

    useEffect(() => {
        if (isCompleted && !promptState) {
            confetti({
                particleCount: 75,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0A3323', '#839958', '#D3968C', '#105666', '#F7F4D5']
            });
        }
    }, [isCompleted, promptState]);

    if (!cards || cards.length === 0) {
        return <p className="no-cards-msg">No flashcards were generated. Try rephrasing your notes.</p>;
    }

    const updateState = (newIndex) => {
        setIndex(newIndex);
        setFlipped(false);
        if (session && onUpdateSession) {
            onUpdateSession(session.id, {
                flashcardState: {
                    index: newIndex,
                    completed: newIndex === cards.length - 1
                }
            });
        }
    };

    const goNext = () => {
        if (index < cards.length - 1) {
            updateState(index + 1);
        } else {
            setIsCompleted(true);
            if (session && onUpdateSession) {
                onUpdateSession(session.id, {
                    flashcardState: {
                        index: cards.length - 1,
                        completed: true
                    }
                });
            }
        }
    };

    const goPrev = () => {
        if (index > 0) {
            updateState(index - 1);
        }
    };

    const progressPercentage = Math.round(((index + 1) / cards.length) * 100);

    const handleContinueLearning = () => {
        setPromptState(null);
    };

    const handleStartOver = () => {
        setPromptState(null);
        setIsCompleted(false);
        updateState(0);
    };

    if (isCompleted) {
        return (
            <motion.div 
                className="flashcards-container completion-view"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
                <div className="completion-card glass-panel">
                    <motion.div 
                        className="completion-icon"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    >
                        🎉
                    </motion.div>
                    <h2>Deck Completed!</h2>
                    <p className="completion-subtitle">
                        You reviewed all <strong>{cards.length}</strong> flashcards for <strong>{data.topic}</strong>.
                    </p>
                    
                    <div className="completion-actions">
                        <motion.button 
                            className="ctrl-btn primary" 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setIsCompleted(false); updateState(0); }}
                        >
                            🔄 Review Deck Again
                        </motion.button>
                        {onSwitchToQuiz && (
                            <motion.button 
                                className="ctrl-btn secondary" 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onSwitchToQuiz}
                            >
                                🎯 Test Yourself in Quiz Mode
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="flashcards-container"
            style={{ position: 'relative' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        >
            <div className="flashcards-header-compact">
                <div className="card-counter">
                    Card <span>{index + 1}</span> of {cards.length}
                </div>
                <div className="progress-percentage-label">
                    {progressPercentage}%
                </div>
            </div>

            <div className="card-progress-track">
                <motion.div 
                    className="card-progress-bar" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                ></motion.div>
            </div>

            {promptState ? (
                <motion.div 
                    className="prompt-card-slot glass-panel"
                    initial={{ scale: 0.96, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                    {promptState === 'unfinished' ? (
                        <>
                            <div className="session-prompt-icon">📚</div>
                            <h3>Flashcard Session</h3>
                            <p>You haven't completed this flashcard session.</p>
                            <div className="session-prompt-actions">
                                <motion.button 
                                    className="ctrl-btn primary"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleContinueLearning}
                                >
                                    Continue Learning
                                </motion.button>
                                <motion.button 
                                    className="ctrl-btn secondary"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleStartOver}
                                >
                                    Start Over
                                </motion.button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="session-prompt-icon">✅</div>
                            <h3>Session Completed</h3>
                            <p>You have already completed this study session.</p>
                            <div className="session-prompt-actions">
                                <motion.button 
                                    className="ctrl-btn primary"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleStartOver}
                                >
                                    Review Again
                                </motion.button>
                            </div>
                        </>
                    )}
                </motion.div>
            ) : (
                <>
                    <motion.div 
                        className="flip-card-wrapper"
                        whileHover={{ y: -4 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                        onClick={() => setFlipped(!flipped)}
                    >
                        <motion.div 
                            className="flip-card-stage"
                            animate={{ rotateY: flipped ? 180 : 0 }}
                            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front Face */}
                            <div className="flip-card-face flip-card-front glass-panel">
                                <span className="card-type-label">QUESTION</span>
                                <div className="card-body">
                                    <p className="card-text">{cards[index]?.question}</p>
                                </div>
                                <span className="hint-pill">Click card to reveal answer 🔄</span>
                            </div>

                            {/* Back Face */}
                            <div className="flip-card-face flip-card-back glass-panel">
                                <span className="card-type-label">ANSWER</span>
                                <div className="card-body">
                                    <p className="card-text">{cards[index]?.answer}</p>
                                </div>
                                <span className="hint-pill">Click card to view question 🔄</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="card-controls">
                        <motion.button 
                            className="ctrl-btn" 
                            whileHover={{ scale: index === 0 ? 1 : 1.03 }}
                            whileTap={{ scale: index === 0 ? 1 : 0.96 }}
                            onClick={goPrev} 
                            disabled={index === 0}
                        >
                            ← Previous
                        </motion.button>
                        <motion.button 
                            className="ctrl-btn primary" 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={goNext}
                        >
                            {index === cards.length - 1 ? 'Finish Deck 🎉' : 'Next Card →'}
                        </motion.button>
                    </div>
                </>
            )}
        </motion.div>
    );
}

export default Flashcards;