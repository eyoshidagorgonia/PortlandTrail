
'use client';

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIFETIME = 5000;
const TOAST_LIMIT = 5;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

interface IToastContext {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, 'id'>) => void;
}

const ToastContext = React.createContext<IToastContext | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const toast = React.useCallback((props: Omit<ToasterToast, 'id'>) => {
    const id = String(Date.now() + Math.random());
    const newToast = { ...props, id };
    
    setToasts((prevToasts) => [newToast, ...prevToasts].slice(0, TOAST_LIMIT));

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, TOAST_LIFETIME);
  }, []);

  const value = React.useMemo(() => ({ toasts, toast }), [toasts, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
