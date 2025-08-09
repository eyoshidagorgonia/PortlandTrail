
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

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let memoryState: { toasts: ToasterToast[] } = { toasts: [] };

const listeners: Array<(state: { toasts: ToasterToast[] }) => void> = [];

function dispatch(action: { type: keyof typeof actionTypes; toast?: ToasterToast; toastId?: string }) {
  if (action.type === 'ADD_TOAST' && action.toast) {
    memoryState = {
      ...memoryState,
      toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
    };
  }

  if (action.type === 'REMOVE_TOAST' && action.toastId) {
    memoryState = {
      ...memoryState,
      toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
    };
  }

  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function toast(props: Omit<ToasterToast, 'id'>) {
  const id = String(Date.now() + Math.random());

  const newToast = {
    ...props,
    id,
  };

  dispatch({ type: 'ADD_TOAST', toast: newToast });

  setTimeout(() => {
    dispatch({ type: 'REMOVE_TOAST', toastId: id });
  }, TOAST_LIFETIME);
}

export function useToast() {
    const [state, setState] = React.useState(memoryState);

    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [state]);

    return {
        ...state,
        toast,
    };
}
