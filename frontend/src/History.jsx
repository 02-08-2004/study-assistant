function History({ sessions, activeId, onSelect, onDelete, onNew }) {
    return (
        <div className="history-panel">
            <button className="new-btn" onClick={onNew}>+ New</button>

            <div className="history-list">
                {sessions.length === 0 && (
                    <p className="history-empty">No sets yet</p>
                )}

                {sessions.map((s) => (
                    <div
                        key={s.id}
                        className={`history-item ${activeId === s.id ? 'active' : ''}`}
                        onClick={() => onSelect(s)}
                    >
                        <div className="history-item-main">
                            <span className="history-dot" data-type={s.mode}></span>
                            <div>
                                <p className="history-title">{s.topic || 'Untitled'}</p>
                                <p className="history-meta">
                                    {s.mode === 'flashcards' ? `${s.data.cards.length} cards` : `${s.data.questions.length} questions`}
                                </p>
                            </div>
                        </div>
                        <button
                            className="history-delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(s.id);
                            }}
                            aria-label="Delete"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default History;