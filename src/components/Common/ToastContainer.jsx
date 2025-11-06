/**
 * ToastContainer Component - Displays all toast notifications
 * Positioned in the top-right corner, showing a queue of notifications
 */

import React, { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import { Toast } from './Toast';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
