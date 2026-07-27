import { useState } from 'react';

function Flashcards({ data }) {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const cards = data.cards;
    if (!cards || cards.length === 0) {
        return <p>No flashcards were generated. Try rephrasing your notes.</p>;
    }
    const current = cards[index];
    const goNext = () => {
        if (index < cards.length - 1) {
            setFlipped(false);
            setIndex(index + 1);
        }
    };

    const goPrev = () => {
        if (index > 0) {
            setFlipped(false);
            setIndex(index - 1);
        }
    };

    return (
        <div className="flashcards">
            <h2>{data.topic}</h2>
            <p className="progress">Card {index + 1} of {cards.length}</p>

            <div className="card" onClick={() => setFlipped(!flipped)}>
                <p>{flipped ? current.answer : current.question}</p>
                <span className="hint">{flipped ? 'Click to see question' : 'Click to reveal answer'}</span>
            </div>

            <div className="card-controls">
                <button onClick={goPrev} disabled={index === 0}>Previous</button>
                <button onClick={goNext} disabled={index === cards.length - 1}>Next</button>
            </div>
        </div>
    );
}

export default Flashcards;