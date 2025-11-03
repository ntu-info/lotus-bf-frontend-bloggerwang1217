/**
 * useToast Hook - 在組件中使用 Toast 通知
 *
 * 使用方式：
 *   const toast = useToast();
 *   toast.success('操作成功！');
 *   toast.error('出錯了！');
 *   toast.info('信息提示');
 *   toast.warning('警告訊息');
 */

import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast 必須在 ToastProvider 內使用');
  }

  return context;
}
