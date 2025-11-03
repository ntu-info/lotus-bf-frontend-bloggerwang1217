/**
 * ToastContainer Component - 顯示所有 Toast 通知
 * 放在頁面右上角，展示通知佇列
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
