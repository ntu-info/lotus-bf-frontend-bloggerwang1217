/**
 * ToastContext - Global state management for toast notifications
 * Supports multiple notifications, auto-dismiss, and different types (success, error, info, warning)
 */

import { createContext, useCallback, useState } from 'react';

export const ToastContext = createContext();

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = useCallback((message, options = {}) => {
    const {
      type = 'info',        // success | error | info | warning
      duration = 3000,      // Auto-dismiss duration (ms), 0 = no auto-dismiss
      action = null,        // Optional action button { label, onClick }
    } = options;

    const id = toastId++;
    const toast = { id, message, type, action };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, []);

  // Remove a toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Shortcut methods
  const success = useCallback((message, options) => {
    return addToast(message, { ...options, type: 'success' });
  }, [addToast]);

  const error = useCallback((message, options) => {
    return addToast(message, { ...options, type: 'error', duration: options?.duration ?? 5000 });
  }, [addToast]);

  const info = useCallback((message, options) => {
    return addToast(message, { ...options, type: 'info' });
  }, [addToast]);

  const warning = useCallback((message, options) => {
    return addToast(message, { ...options, type: 'warning', duration: options?.duration ?? 4000 });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  );
};
