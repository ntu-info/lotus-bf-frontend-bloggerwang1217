/**
 * Toast Component - 單個 Toast 通知顯示
 * 支持 success, error, info, warning 四種類型
 */

import React from 'react';
import styles from './Toast.module.css';

export function Toast({ id, message, type = 'info', action, onClose }) {
  return (
    <div className={`${styles.toast} ${styles[`toast-${type}`]}`}>
      <div className={styles.toastContent}>
        <span className={styles.toastMessage}>{message}</span>
      </div>

      <div className={styles.toastActions}>
        {action && (
          <button className={styles.toastActionButton} onClick={action.onClick}>
            {action.label}
          </button>
        )}
        <button
          className={styles.toastCloseButton}
          onClick={() => onClose(id)}
          aria-label="關閉通知"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
