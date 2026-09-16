import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'warn' | 'info';
export interface ToastState { message: string; type: ToastType }

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const triggerToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, triggerToast };
}
