
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Brain, Copy, Check } from "lucide-react"
import { ScrollArea } from "./scroll-area"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, history } = useToast()
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  const handleCopy = (toast: any) => {
    const textToCopy = `${toast.title ? `${toast.title}\n` : ''}${toast.description || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(toast.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
                <ToastClose />
            </div>
          </Toast>
        )
      })}
      <ToastViewport>
        {history.length > 0 && (
          <Collapsible
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            className="w-full"
          >
            <div className="flex justify-center">
              <CollapsibleTrigger 
                className="w-full justify-center rounded-sm bg-background border p-1 font-headline text-xs hover:no-underline hover:bg-muted transition-colors data-[state=open]:bg-muted flex items-center gap-2"
              >
                <Brain className="h-4 w-4"/>
                <span className="font-body">Vibe Sage</span>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="bg-background border border-t-0 p-0 rounded-b-sm">
              <ScrollArea className="h-72">
                <div className="p-4 space-y-3">
                  {history.map((toast, index) => (
                    <div key={`${toast.id}-${index}`} className="group relative text-sm text-foreground/80 border-b border-border/50 pb-2 last:border-b-0">
                      {toast.title && <p className="font-bold">{toast.title}</p>}
                      {toast.description && <p>{toast.description as React.ReactNode}</p>}
                       <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                              "absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                              copiedId === toast.id && "opacity-100"
                          )}
                          onClick={() => handleCopy(toast)}
                      >
                          {copiedId === toast.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                          ) : (
                              <Copy className="h-4 w-4" />
                          )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        )}
      </ToastViewport>
    </ToastProvider>
  )
}
