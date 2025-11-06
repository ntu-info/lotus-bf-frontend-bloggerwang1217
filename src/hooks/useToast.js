/**
 * useToast Hook - Use toast notifications in a component
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Operation successful!');
 *   toast.error('An error occurred!');
 *   toast.info('Informational message');
 *   toast.warning('Warning message');
 */

import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
