/**
 * ToastContext - Toast 通知全局狀態管理
 * 支持多個通知、自動消失、不同類型（success, error, info, warning）
 */

import { createContext, useCallback, useState } from 'react';

export const ToastContext = createContext();

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // 新增 Toast
  const addToast = useCallback((message, options = {}) => {
    const {
      type = 'info',        // success | error | info | warning
      duration = 3000,      // 自動消失時間（毫秒），0 = 不自動消失
      action = null,        // 可選的操作按鈕 { label, onClick }
    } = options;

    const id = toastId++;
    const toast = { id, message, type, action };

    setToasts((prev) => [...prev, toast]);

    // 自動消失
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, []);

  // 移除 Toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 快捷方法
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
