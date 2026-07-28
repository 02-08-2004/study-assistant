import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

function Quiz({ data, session, onUpdateSession }) {
    const attemptsHistory = session?.quizState?.attemptsHistory || [];
    const hasPreviousAttempt = attemptsHistory.length > 0 || session?.quizState?.finished || !!session?.quizState?.lastScore;

    const [activeQuestions] = useState(() => {
        if (Array.isArray(data?.questions) && data.questions.length > 0) {
            return data.questions;
        }
        if (Array.isArray(data?.cards) && data.cards.length > 0) {
            return data.cards.map((c, i, arr) => {
                const otherAnswers = arr.filter((_, idx) => idx !== i).map(other => other.answer);
                const options = [c.answer];
                while (options.length < 4 && otherAnswers.length > 0) {
                    const randIdx = Math.floor(Math.random() * otherAnswers.length);
                    const choice = otherAnswers.splice(randIdx, 1)[0];
                    if (!options.includes(choice)) options.push(choice);
                }
                while (options.length < 4) {
                    options.push(`Option ${options.length + 1}`);
                }
                const shuffled = [...options].sort(() => Math.random() - 0.5);
                const correctIndex = shuffled.indexOf(c.answer);
                return {
                    question: c.question,
                    options: shuffled,
                    correctIndex: correctIndex >= 0 ? correctIndex : 0
                };
            });
        }
        return [];
    });
    const [currentIndex, setCurrentIndex] = useState(() => session?.quizState?.currentIndex ?? 0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState(() => session?.quizState?.answers ?? []);
    
    const [viewMode, setViewMode] = useState(() => (hasPreviousAttempt ? 'summary' : 'taking'));

    const [viewingAttemptIndex, setViewingAttemptIndex] = useState(() => {
        return attemptsHistory.length > 0 ? attemptsHistory.length - 1 : 0;
    });

    const isFromHistory = Boolean(session?.openedFromHistory || (session?.quizState && (session.quizState.currentIndex > 0 || session.quizState.finished || (session.quizState.answers && session.quizState.answers.length > 0))) || hasPreviousAttempt || session?.completed);

    const [promptState, setPromptState] = useState(() => {
        if (!isFromHistory) return null;
        if (session?.quizState?.finished || hasPreviousAttempt || session?.completed) return 'completed';
        return 'unfinished';
    });

    useEffect(() => {
        if (session?.id) {
            const fromHist = Boolean(session?.openedFromHistory || (session?.quizState && (session.quizState.currentIndex > 0 || session.quizState.finished || (session.quizState.answers && session.quizState.answers.length > 0))) || hasPreviousAttempt || session?.completed);
            if (fromHist) {
                const history = session?.quizState?.attemptsHistory || [];
                const isDone = history.length > 0 || session?.quizState?.finished || !!session?.quizState?.lastScore || session?.completed;
                const savedIdx = session?.quizState?.currentIndex ?? 0;
                const savedAns = session?.quizState?.answers || [];

                if (isDone) {
                    setPromptState('completed');
                    setViewMode('summary');
                } else {
                    setPromptState('unfinished');
                    setCurrentIndex(savedIdx);
                    setAnswers(savedAns);
                    setViewMode('taking');
                }
            } else {
                setPromptState(null);
                setCurrentIndex(0);
                setAnswers([]);
                setViewMode('taking');
            }
        } else {
            setPromptState(null);
            setCurrentIndex(0);
            setAnswers([]);
            setViewMode('taking');
        }
    }, [session?.id]);

    useEffect(() => {
        if (viewMode === 'summary' && !promptState) {
            confetti({
                particleCount: 75,
                spread: 65,
                origin: { y: 0.6 },
                colors: ['#0A3323', '#839958', '#D3968C', '#105666', '#F7F4D5']
            });
        }
    }, [viewMode, promptState]);

    if (!activeQuestions || activeQuestions.length === 0) {
        return <p className="no-cards-msg">No quiz questions available.</p>;
    }

    const handleSelect = (optionIndex) => {
        if (selected !== null) return;
        setSelected(optionIndex);
    };

    const handleNext = () => {
        const currentQuestion = activeQuestions[currentIndex];
        const correct = selected === currentQuestion.correctIndex;
        const updatedAnswers = [...answers, { question: currentQuestion, selectedIndex: selected, correct }];
        
        const isFinished = currentIndex + 1 >= activeQuestions.length;

        if (isFinished) {
            const score = updatedAnswers.filter((a) => a.correct).length;
            const newAttempt = {
                attemptNum: attemptsHistory.length + 1,
                date: new Date().toLocaleDateString(),
                score: { correct: score, total: updatedAnswers.length },
                answers: updatedAnswers,
                questions: activeQuestions
            };

            const updatedHistory = [...attemptsHistory, newAttempt];
            setViewingAttemptIndex(updatedHistory.length - 1);
            setViewMode('summary');
            setAnswers([]);
            setCurrentIndex(0);
            setSelected(null);

            if (session && onUpdateSession) {
                onUpdateSession(session.id, {
                    quizState: {
                        finished: true,
                        lastScore: newAttempt.score,
                        attemptsCount: updatedHistory.length,
                        attemptsHistory: updatedHistory
                    }
                });
            }
        } else {
            const nextIdx = currentIndex + 1;
            setAnswers(updatedAnswers);
            setSelected(null);
            setCurrentIndex(nextIdx);

            if (session && onUpdateSession) {
                onUpdateSession(session.id, {
                    quizState: {
                        ...session.quizState,
                        finished: false,
                        currentIndex: nextIdx,
                        answers: updatedAnswers
                    }
                });
            }
        }
    };

    const handleContinueQuiz = () => {
        setPromptState(null);
        setViewMode('taking');
    };

    const handleRestartQuiz = () => {
        setPromptState(null);
        setCurrentIndex(0);
        setSelected(null);
        setAnswers([]);
        setViewMode('taking');

        if (session && onUpdateSession) {
            onUpdateSession(session.id, {
                quizState: {
                    ...session.quizState,
                    finished: false,
                    currentIndex: 0,
                    answers: []
                }
            });
        }
    };

    const handleReviewSummary = () => {
        setPromptState(null);
        setViewMode('summary');
    };

    const handleTakeAgain = () => {
        setPromptState(null);
        startNewAttempt(data.questions);
    };

    const startNewAttempt = (questionsToUse = data.questions) => {
        setActiveQuestions(questionsToUse);
        setCurrentIndex(0);
        setSelected(null);
        setAnswers([]);
        setViewMode('taking');
    };

    const handleRetestWrong = (currentAttemptAnswers) => {
        const wrongQuestions = currentAttemptAnswers.filter((a) => !a.correct).map((a) => a.question);
        if (wrongQuestions.length > 0) {
            startNewAttempt(wrongQuestions);
        }
    };

    if (viewMode === 'summary') {
        const activeAttempt = attemptsHistory[viewingAttemptIndex] || {
            attemptNum: session?.quizState?.attemptsCount || 1,
            score: session?.quizState?.lastScore || { correct: 0, total: data.questions?.length || 5 },
            answers: session?.quizState?.answers || []
        };

        const score = activeAttempt.score?.correct ?? 0;
        const total = activeAttempt.score?.total ?? activeAttempt.answers?.length ?? data.questions?.length ?? 1;
        const wrongCount = total - score;
        const percentage = Math.round((score / total) * 100);

        return (
            <motion.div 
                className="quiz-results"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 25 }}
            >
                <div className="unified-performance-card glass-panel">
                    <div className="performance-card-top">
                        <div className="performance-title-group">
                            <h3>Quiz Performance</h3>
                            <span className="attempts-badge">Attempt #{activeAttempt.attemptNum || viewingAttemptIndex + 1}</span>
                        </div>
                        <span className="score-percentage-pill">{percentage}%</span>
                    </div>

                    <div className="performance-card-body">
                        <div className="score-hero-display">
                            <span className="score-big">{score} <span className="score-total">/ {total}</span></span>
                        </div>
                        <div className="score-metrics-group">
                            <span className="metric-tag correct">✓ {score} Correct</span>
                            <span className="metric-tag wrong">✗ {wrongCount} Incorrect</span>
                        </div>
                        <div className="performance-actions-inline">
                            <motion.button 
                                className="re-btn primary" 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => startNewAttempt(data.questions)}
                            >
                                🔄 Retake Quiz
                            </motion.button>
                            {wrongCount > 0 && activeAttempt.answers?.length > 0 && (
                                <motion.button 
                                    className="re-btn secondary" 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleRetestWrong(activeAttempt.answers)}
                                >
                                    🎯 Retest {wrongCount} Wrong Answer{wrongCount > 1 ? 's' : ''}
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {attemptsHistory.length > 1 && (
                        <div className="attempt-tabs">
                            {attemptsHistory.map((att, idx) => (
                                <motion.button
                                    key={idx}
                                    className={`attempt-tab-btn ${idx === viewingAttemptIndex ? 'active' : ''}`}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setViewingAttemptIndex(idx)}
                                >
                                    Attempt #{att.attemptNum} ({att.score.correct}/{att.score.total})
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="review-section glass-panel">
                    <h3>Detailed Breakdown</h3>
                    {(!activeAttempt.answers || activeAttempt.answers.length === 0) ? (
                        <p className="no-details-text">Previous score recorded: {score} out of {total}.</p>
                    ) : (
                        <ul className="wrong-list">
                            {activeAttempt.answers.map((a, i) => (
                                <motion.li 
                                    key={i} 
                                    className={`answer-item ${a.correct ? 'is-correct' : 'is-wrong'}`}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <div className="answer-item-left">
                                        <span className="q-badge">{i + 1}</span>
                                        <span className="wrong-question-text">{a.question.question}</span>
                                    </div>
                                    <div className="answer-item-right">
                                        <span className={`answer-pill ${a.correct ? 'correct' : 'wrong'}`}>
                                            {a.correct ? (
                                                <>✓ {a.question.options[a.selectedIndex]}</>
                                            ) : (
                                                <>
                                                    <span className="user-choice">Your: {a.question.options[a.selectedIndex]} ✗</span>
                                                    <span className="correct-choice">Correct: {a.question.options[a.question.correctIndex]}</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </div>
            </motion.div>
        );
    }

    const currentQ = activeQuestions[currentIndex];
    const progressPercentage = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);

    return (
        <div className="quiz-container" style={{ position: 'relative' }}>
            <div className="quiz-header-compact">
                <div className="q-counter">
                    Question <span>{currentIndex + 1}</span> of {activeQuestions.length}
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
                            <div className="session-prompt-icon">📝</div>
                            <h3>Quiz Session</h3>
                            <p>You left this quiz unfinished.</p>
                            <div className="session-prompt-actions">
                                <motion.button 
                                    className="ctrl-btn primary"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleContinueQuiz}
                                >
                                    Continue Quiz
                                </motion.button>
                                <motion.button 
                                    className="ctrl-btn secondary"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleRestartQuiz}
                                >
                                    Restart Quiz
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
                                    onClick={handleReviewSummary}
                                >
                                    Review Performance
                                </motion.button>
                                <motion.button 
                                    className="ctrl-btn secondary"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleTakeAgain}
                                >
                                    Take Again
                                </motion.button>
                            </div>
                        </>
                    )}
                </motion.div>
            ) : (
                <>
                    <AnimatePresence mode="wait">
                <motion.div 
                    key={currentIndex}
                    className="question-card glass-panel"
                    initial={{ opacity: 0, x: 40, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -40, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                    <p className="q-text">{currentQ.question}</p>

                    <motion.div 
                        className="options-grid"
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } }
                        }}
                        initial="hidden"
                        animate="show"
                    >
                        {currentQ.options.map((opt, idx) => {
                            let optionClass = 'option-btn';
                            if (selected !== null) {
                                if (idx === currentQ.correctIndex) {
                                    optionClass += ' correct';
                                } else if (idx === selected) {
                                    optionClass += ' wrong';
                                } else {
                                    optionClass += ' disabled';
                                }
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    className={optionClass}
                                    variants={{
                                        hidden: { opacity: 0, y: 12, scale: 0.97 },
                                        show: { opacity: 1, y: 0, scale: 1 }
                                    }}
                                    transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                                    whileHover={{ scale: selected === null ? 1.018 : 1 }}
                                    whileTap={{ scale: selected === null ? 0.982 : 1 }}
                                    onClick={() => handleSelect(idx)}
                                >
                                    <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                                    <span className="opt-text">{opt}</span>
                                    {selected !== null && idx === currentQ.correctIndex && <span className="opt-icon">✓</span>}
                                    {selected !== null && idx === selected && idx !== currentQ.correctIndex && <span className="opt-icon">✗</span>}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            <motion.button
                className="next-btn"
                whileHover={{ scale: selected === null ? 1 : 1.02 }}
                whileTap={{ scale: selected === null ? 1 : 0.97 }}
                onClick={handleNext}
                disabled={selected === null}
            >
                {currentIndex + 1 === activeQuestions.length ? 'Finish Quiz ✓' : 'Next Question →'}
            </motion.button>
                </>
            )}
        </div>
    );
}

export default Quiz;