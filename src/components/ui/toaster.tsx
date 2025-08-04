
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Brain } from "lucide-react"
import { ScrollArea } from "./scroll-area"

export function Toaster() {
  const { toasts, history } = useToast()

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
          <Accordion type="single" collapsible className="w-full max-w-[210px]">
            <AccordionItem value="history" className="border-none">
              <AccordionTrigger className="w-full justify-center rounded-sm bg-background border p-2 font-headline text-base hover:no-underline hover:bg-muted transition-colors data-[state=open]:bg-muted">
                <Brain className="h-5 w-5"/>
              </AccordionTrigger>
              <AccordionContent className="bg-background border border-t-0 p-0 rounded-b-sm">
                <ScrollArea className="h-72">
                  <div className="p-4 space-y-3">
                    {history.map((toast, index) => (
                      <div key={`${toast.id}-${index}`} className="text-sm text-foreground/80 border-b border-border/50 pb-2 last:border-b-0">
                        {toast.title && <p className="font-bold">{toast.title}</p>}
                        {toast.description && <p>{toast.description as React.ReactNode}</p>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </ToastViewport>
    </ToastProvider>
  )
}
