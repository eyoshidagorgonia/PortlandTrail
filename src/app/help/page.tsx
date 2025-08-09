
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { 
    GoalIcon, VitalsIcon, SocialStatsIcon, MapIcon, CardsIcon, 
    HungerIcon, BikeIcon, StyleIcon, IronyIcon, AuthenticityIcon,
    CoffeeIcon, VinylIcon, LeftArrowIcon, VibeIcon
} from '@/components/game/icons';
import Link from 'next/link';
import { BUILD_NUMBER } from '@/lib/constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function HelpPage() {
    const [fullyOfflineServices, setFullyOfflineServices] = useState<string[]>([]);

  useEffect(() => {
    // Check local storage on the client side for system status.
    try {
        setFullyOfflineServices(JSON.parse(localStorage.getItem('fullyOfflineServices') || '[]'));
    } catch (e) {
        console.error("Failed to parse system status from local storage", e);
    }
  }, []);

  const StatusIcons = () => {
    return (
        <div className="flex items-center gap-2">
            <TooltipProvider>
                {fullyOfflineServices.length > 0 && (
                    <Tooltip>
                        <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                             <div className="space-y-1 text-center">
                                <p className="font-bold">AI Systems Offline</p>
                                <p className="text-xs text-muted-foreground">Using hardcoded data for:</p>
                                <ul className="list-disc list-inside text-xs">
                                    {fullyOfflineServices.map(s => <li key={s}>{s}</li>)}
                                </ul>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 flex items-center justify-center relative">
      <Card className="max-w-4xl w-full shadow-xl bg-card/90 backdrop-blur-sm border-2 border-border/20">
        <CardHeader className="text-center">
          <CardTitle className="text-5xl font-headline font-bold">How to Suffer Beautifully</CardTitle>
          <CardDescription className="pt-2 font-body text-xl text-muted-foreground">A curated guide to your ironic journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-headline text-2xl text-left hover:no-underline">
                <GoalIcon className="mr-3 h-6 w-6 text-primary shrink-0" /> The "Goal"
              </AccordionTrigger>
              <AccordionContent className="text-lg text-foreground/90 pl-12 pt-2 font-body">
                Your so-called quest is to journey from the tech-bro hellscape of **San Francisco** to the flannel-draped promised land of **Portland**. The path is measured by your **Progress**. Reach 100% to win, whatever that means.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="font-headline text-2xl text-left hover:no-underline">
                <VitalsIcon className="mr-3 h-6 w-6 text-primary shrink-0" /> Your Corporeal Form
              </AccordionTrigger>
              <AccordionContent className="text-lg text-foreground/90 pl-12 pt-2 space-y-4 font-body">
                <p className="flex items-start"><HungerIcon className="h-6 w-6 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Health:** If this hits zero, you've ironically starved. Try foraging. Or don't. It's your story.</span></p>
                <p className="flex items-start"><VibeIcon className="h-6 w-6 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Vibes:** Your "mana." Represents your capacity for creative ennui. You'll need it for... things.</span></p>
                <p className="flex items-start"><BikeIcon className="h-6 w-6 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Fixie Stamina:** Your bike's structural integrity. If it fails, you're just a pedestrian. The horror.</span></p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="font-headline text-2xl text-left hover:no-underline">
                <SocialStatsIcon className="mr-3 h-6 w-6 text-primary shrink-0" /> Social Currency
              </AccordionTrigger>
              <AccordionContent className="text-lg text-foreground/90 pl-12 pt-2 space-y-4 font-body">
                <p className="flex items-start"><StyleIcon className="h-6 w-6 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Style:** Your painstakingly curated aesthetic. Opens doors, probably to places that are already over.</span></p>
                <p className="flex items-start"><IronyIcon className="h-6 w-6 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Irony:** Your ability to appreciate things for what they aren't. A powerful shield against sincerity.</span></p>
                <p className="flex items-start"><AuthenticityIcon className="h-6 w-6 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Authenticity:** How "real" you are. A dangerous game to play when you've spent this long on your look.</span></p>
                <p className="flex items-start"><CoffeeIcon className="h-6 w-6 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Coffee Beans:** The realm's true currency. For when you need to buy things, or just feel something.</span></p>
                <p className="flex items-start"><VinylIcon className="h-6 w-6 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Vinyls:** Tangible proof of your superior taste. You don't need a record player to own them.</span></p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="font-headline text-2xl text-left hover:no-underline">
                <MapIcon className="mr-3 h-6 w-6 text-primary shrink-0" /> The Unbearable Loop of Being
              </AccordionTrigger>
              <AccordionContent className="text-lg text-foreground/90 pl-12 pt-2 space-y-4 font-body">
                <p>Existence is cyclical. So is this game:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>**Scenario:** The AI Game Master, in its infinite apathy, presents a situation.</li>
                  <li>**Choice:** You pick one of six ways to react. Consequences are a thing, apparently.</li>
                  <li>**Actions:** Before the next tragedy, you can perform an action. This also, bafflingly, moves time forward.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger className="font-headline text-2xl text-left hover:no-underline">
                <CardsIcon className="mr-3 h-6 w-6 text-primary shrink-0" /> User Interface (Or Whatever)
              </AccordionTrigger>
              <AccordionContent className="text-lg text-foreground/90 pl-12 pt-2 space-y-4 font-body">
                <p>**Status Dashboard:** Your character sheet. All your stats, gear, and questionable life choices, quantified.</p>
                <p>**Actions Card:** The things you can do. Each costs a turn and pushes you closer to the next crisis.</p>
                <p>**The Trail Map:** Proof that you are, in fact, going somewhere. Or at least, moving.</p>
                <p>**Scenario Display:** Where the grim narrative unfolds. Make a choice. Or don't. See what happens.</p>
                <p>**Travel Diary:** A log of your journey. For when you want to reflect on your past mistakes.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center pt-4">
            <Link href="/" passHref>
              <Button size="lg" className="font-headline text-xl">
                <LeftArrowIcon className="mr-2 h-5 w-5" />
                Return to the Farce
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50 font-code flex items-center gap-2">
        <StatusIcons />
        <span>Build: {BUILD_NUMBER.toFixed(3)}</span>
      </div>
    </main>
  );
}

    