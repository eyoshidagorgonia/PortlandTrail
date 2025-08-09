
'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Brain, Copy, Check } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export default function HistoryDisplay() {
  const { history } = useToast();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  const handleCopy = (toast: any) => {
    const textToCopy = `${toast.title ? `${toast.title}\n` : ''}${
      toast.description || ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(toast.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 z-[100] p-4 md:max-w-[420px] w-full">
      <Collapsible
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        className="w-full flex flex-col items-end"
      >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-center bg-background border p-2 font-headline text-sm hover:no-underline hover:bg-muted transition-colors flex items-center gap-2",
                historyOpen ? "rounded-b-none border-b-0" : "rounded-sm"
              )}
            >
              <Brain className="h-4 w-4" />
              <span className="font-body">Vibe Sage</span>
            </Button>
          </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <div className="w-[150px] bg-background border border-t-0 rounded-b-sm shadow-lg">
            <ScrollArea className="h-72">
              <div className="p-4 space-y-3">
                {history.map((toast, index) => (
                  <div
                    key={`${toast.id}-${index}`}
                    className="group relative text-sm text-foreground/80 border-b border-border/50 pb-2 last:border-b-0"
                  >
                    {toast.title && <p className="font-bold">{toast.title}</p>}
                    {toast.description && (
                      <p>{toast.description as React.ReactNode}</p>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        'absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                        copiedId === toast.id && 'opacity-100'
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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
