
"use client"

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 5;
const HISTORY_LIMIT = 50;

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type Toast = Omit<ToasterToast, "id"> & { id?: string };

interface ToastContextType {
  toasts: ToasterToast[];
  history: ToasterToast[];
  toast: (props: Toast) => { id: string, dismiss: () => void, update: (props: Partial<ToasterToast>) => void };
  dismiss: (toastId?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  const [history, setHistory] = React.useState<ToasterToast[]>([]);

  const toast = React.useCallback((props: Toast) => {
    const id = props.id || genId();
    const newToast: ToasterToast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss(id);
        }
      },
    };

    setToasts(prev => [newToast, ...prev].slice(0, TOAST_LIMIT));
    setHistory(prev => [newToast, ...prev].slice(0, HISTORY_LIMIT));

    return {
      id,
      dismiss: () => dismiss(id),
      update: (updatedProps: Partial<ToasterToast>) => {
        setToasts(prev => prev.map(t => (t.id === id ? { ...t, ...updatedProps } : t)));
        setHistory(prev => prev.map(t => (t.id === id ? { ...t, ...updatedProps } : t)));
      }
    };
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    } else {
      setToasts([]);
    }
  }, []);
  
  const value = React.useMemo(() => ({ toasts, history, toast, dismiss }), [toasts, history, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
