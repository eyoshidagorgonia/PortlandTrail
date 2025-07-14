import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background font-headline">
      <div className="flex items-center gap-4 text-2xl text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Conjuring visions from the aether...</p>
      </div>
      <p className="mt-4 text-muted-foreground font-body">Your dark and wonderful journey awaits.</p>
    </div>
  );
}
