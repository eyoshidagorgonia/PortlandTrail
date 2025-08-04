
"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Button } from "./button"
import { Clipboard, Check } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()
  const [copiedToastId, setCopiedToastId] = React.useState<string | null>(null);

  const handleCopy = (id: string, title?: React.ReactNode, description?: React.ReactNode) => {
    const titleText = title ? (typeof title === 'string' ? title : (title as React.ReactElement).props.children) : '';
    const descriptionText = description ? (typeof description === 'string' ? description : (description as React.ReactElement).props.children) : '';
    
    let textToCopy = '';
    if (titleText) {
        textToCopy += `${titleText}\n\n`;
    }
    if (descriptionText) {
        textToCopy += descriptionText;
    }
    
    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        setCopiedToastId(id);
        setTimeout(() => setCopiedToastId(null), 2000);
    });
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1 flex-grow">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            <div className="flex items-center gap-2 self-start">
                {action}
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground/70 hover:text-foreground"
                    onClick={() => handleCopy(id, title, description)}
                >
                    {copiedToastId === id ? <Check className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
                </Button>
                <ToastClose />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
