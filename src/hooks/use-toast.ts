
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type Toast = Omit<ToasterToast, "id">;

interface ToastContextType {
    toasts: ToasterToast[];
    toast: (props: Toast) => { id: string; };
    dismiss: (id?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  const timeouts = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  const toast = React.useCallback((props: Toast) => {
    const id = genId();
    const newToast = {
      id,
      ...props,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          dismiss(id);
        }
      },
    };

    setToasts((prevToasts) => [newToast, ...prevToasts].slice(0, TOAST_LIMIT));
    
    const timeout = setTimeout(() => {
        dismiss(id);
    }, TOAST_REMOVE_DELAY);

    timeouts.current.set(id, timeout);

    return { id };
  }, []);

  const dismiss = React.useCallback((id?: string) => {
    setToasts((prevToasts) =>
      prevToasts.filter((t) => {
        if (t.id === id || id === undefined) {
          if (timeouts.current.has(t.id)) {
            clearTimeout(timeouts.current.get(t.id)!);
            timeouts.current.delete(t.id);
          }
          return false;
        }
        return true;
      })
    );
  }, []);

  const value = React.useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
