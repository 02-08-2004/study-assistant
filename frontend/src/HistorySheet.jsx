import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

export default function HistorySheet({
    open,
    onClose,
    sessions,
    activeId,
    onSelect,
    onDelete,
}) {
    const [selected, setSelected] = useState(null);

    const handleOpen = (session) => {
        setSelected(session);
    };

    const handleBack = () => {
        setSelected(null);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Glass Blur Background */}
                    <motion.div
                        className="history-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="history-sheet"
                        initial={{
                            x: -80,
                            opacity: 0,
                            scale: 0.96,
                        }}
                        animate={{
                            x: 0,
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            x: -80,
                            opacity: 0,
                            scale: 0.96,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 160,
                            damping: 20,
                        }}
                    >
                        <LayoutGroup>
                            {!selected ? (
                                <>
                                    <div className="history-sheet-header">
                                        <h2>Study History</h2>

                                        <button
                                            className="close-history"
                                            onClick={onClose}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <motion.div 
                                        className="history-sheet-list"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.03 } }
                                        }}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        {sessions.length === 0 && (
                                            <div className="empty-history">
                                                No history yet.
                                            </div>
                                        )}

                                        {sessions.map((session) => (
                                            <motion.div
                                                key={session.id}
                                                layoutId={`history-${session.id}`}
                                                className={`history-sheet-card ${activeId === session.id ? 'active' : ''}`}
                                                variants={{
                                                    hidden: { opacity: 0, x: -16 },
                                                    show: { opacity: 1, x: 0 }
                                                }}
                                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                                whileHover={{
                                                    scale: 1.025,
                                                    x: 4
                                                }}
                                                whileTap={{
                                                    scale: 0.985,
                                                }}
                                                onClick={() => onSelect(session)}
                                            >
                                                <div>
                                                    <h4>{session.topic}</h4>

                                                    <p>
                                                        {new Date(
                                                            session.timestamp
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <button
                                                    className="delete-history-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(session.id);
                                                    }}
                                                >
                                                    🗑
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </>
                            ) : (
                                <motion.div
                                    layoutId={`history-${selected.id}`}
                                    className="history-expanded"
                                >
                                    <button
                                        className="back-history"
                                        onClick={handleBack}
                                    >
                                        ← Back
                                    </button>

                                    <h2>{selected.topic}</h2>

                                    <div className="history-details">
                                        <div className="history-row">
                                            <span>Mode</span>

                                            <strong>{selected.mode}</strong>
                                        </div>

                                        <div className="history-row">
                                            <span>Date</span>

                                            <strong>
                                                {new Date(
                                                    selected.timestamp
                                                ).toLocaleString()}
                                            </strong>
                                        </div>
                                    </div>

                                    <motion.button
                                        className="open-session-btn"
                                        whileHover={{
                                            scale: 1.02,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        onClick={() => {
                                            onSelect(selected);
                                            onClose();
                                        }}
                                    >
                                        Open Session
                                    </motion.button>
                                </motion.div>
                            )}
                        </LayoutGroup>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}