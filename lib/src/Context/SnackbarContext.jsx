import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '../Components/Snackbar';

const SnackbarContext = createContext();

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }) => {
  const [snackbarState, setSnackbarState] = useState({
    isOpen: false,
    type: 'success',
    message: '',
    variant: 'alert',
    onConfirm: null,
    onCancel: null,
    duration: 3000
  });

  const closeSnackbar = useCallback(() => {
    setSnackbarState(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Show an alert snackbar
   * @param {string} type - 'success', 'warning', or 'error'
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the snackbar (default: 3000ms)
   */
  const showSnackbar = useCallback((type, message, duration = 3000) => {
    setSnackbarState({
      isOpen: true,
      type,
      message,
      variant: 'alert',
      onConfirm: null,
      onCancel: null,
      duration
    });
  }, []);

  /**
   * Show a confirmation snackbar
   * @param {string} message - The message to display
   * @param {function} onConfirm - Callback when user clicks Confirm
   * @param {string} type - 'success', 'warning', or 'error' (default: 'warning')
   */
  const showConfirmSnackbar = useCallback((message, onConfirm, type = 'warning') => {
    setSnackbarState({
      isOpen: true,
      type,
      message,
      variant: 'confirmation',
      onConfirm,
      onCancel: null,
      duration: 3000 // Not used for confirmation, but kept for consistency
    });
  }, []);

  const value = {
    showSnackbar,
    showConfirmSnackbar,
    closeSnackbar
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        isOpen={snackbarState.isOpen}
        type={snackbarState.type}
        message={snackbarState.message}
        variant={snackbarState.variant}
        onClose={closeSnackbar}
        onConfirm={snackbarState.onConfirm}
        onCancel={closeSnackbar}
        duration={snackbarState.duration}
      />
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
