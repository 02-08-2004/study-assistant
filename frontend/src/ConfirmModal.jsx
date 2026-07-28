import { motion } from 'framer-motion';

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="custom-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="custom-modal-card glass-panel"
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon-wrapper">
          <span>⚠️</span>
        </div>

        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <motion.button
            className="modal-btn cancel"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onCancel}
          >
            {cancelText}
          </motion.button>
          <motion.button
            className="modal-btn confirm-danger"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
          >
            {confirmText}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
