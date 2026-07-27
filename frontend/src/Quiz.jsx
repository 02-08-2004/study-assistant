import { useState } from 'react';

function Quiz({ data }) {
    const [questions, setQuestions] = useState(data.questions);
    if (!questions || questions.length === 0) {
        return <p>No quiz questions were generated. Try rephrasing your notes.</p>;
    }
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]); // { questionIndex, selectedIndex, correct }
    const [finished, setFinished] = useState(false);

    const current = questions[currentIndex];

    const handleSelect = (optionIndex) => {
        if (selected !== null) return; // already answered this question
        setSelected(optionIndex);
    };

    const handleNext = () => {
        const correct = selected === current.correctIndex;
        const updatedAnswers = [...answers, { question: current, selectedIndex: selected, correct }];
        setAnswers(updatedAnswers);
        setSelected(null);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setFinished(true);
        }
    };

    const handleRetestWrong = () => {
        const wrongQuestions = answers.filter((a) => !a.correct).map((a) => a.question);
        setQuestions(wrongQuestions);
        setCurrentIndex(0);
        setSelected(null);
        setAnswers([]);
        setFinished(false);
    };

    if (finished) {
        const score = answers.filter((a) => a.correct).length;
        const wrongCount = answers.length - score;

        return (
            <div className="quiz-results">
                <h2>Results</h2>
                <p className="score">You scored {score} out of {answers.length}</p>

                {wrongCount > 0 && (
                    <>
                        <h3>Review wrong answers</h3>
                        <ul className="wrong-list">
                            {answers
                                .filter((a) => !a.correct)
                                .map((a, i) => (
                                    <li key={i}>
                                        <p className="wrong-question">{a.question.question}</p>
                                        <p className="your-answer">Your answer: {a.question.options[a.selectedIndex]}</p>
                                        <p className="correct-answer">Correct: {a.question.options[a.question.correctIndex]}</p>
                                    </li>
                                ))}
                        </ul>
                        <button onClick={handleRetestWrong}>Retest wrong answers</button>
                    </>
                )}

                {wrongCount === 0 && <p>Perfect score! 🎉</p>}
            </div>
        );
    }

    return (
        <div className="quiz">
            <h2>{data.topic}</h2>
            <p className="progress">Question {currentIndex + 1} of {questions.length}</p>

            <p className="question-text">{current.question}</p>

            <div className="options">
                {current.options.map((opt, i) => {
                    let className = 'option';
                    if (selected !== null) {
                        if (i === current.correctIndex) className += ' correct';
                        else if (i === selected) className += ' incorrect';
                    }
                    return (
                        <button
                            key={i}
                            className={className}
                            onClick={() => handleSelect(i)}
                            disabled={selected !== null}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>

            <button
                className="next-btn"
                onClick={handleNext}
                disabled={selected === null}
            >
                {currentIndex + 1 < questions.length ? 'Next' : 'Finish'}
            </button>
        </div>
    );
}

export default Quiz;