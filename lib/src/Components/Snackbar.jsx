import React, { useEffect, useState } from 'react';
import './Snackbar.css';

const Snackbar = ({
  type = 'success',
  message,
  isOpen,
  onClose,
  variant = 'alert', // 'alert' or 'confirmation'
  onConfirm,
  onCancel,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsExiting(false);

      // Auto-hide only for alert variant
      if (variant === 'alert') {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, variant, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onClose?.();
    }, 300); // Match animation duration
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  if (!isVisible && !isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="snackbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="snackbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="snackbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`snackbar-overlay ${isExiting ? 'snackbar-overlay-exit' : ''}`}>
      <div className={`snackbar snackbar-${type} ${isExiting ? 'snackbar-exit' : ''}`}>
        <div className="snackbar-content">
          {getIcon()}
          <span className="snackbar-message">{message}</span>
        </div>

        {variant === 'confirmation' ? (
          <div className="snackbar-actions">
            <button
              className="snackbar-btn snackbar-btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="snackbar-btn snackbar-btn-confirm"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        ) : (
          <button
            className="snackbar-close"
            onClick={handleClose}
            aria-label="Close notification"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Snackbar;
