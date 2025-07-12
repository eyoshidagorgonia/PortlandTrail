
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Bike, Coffee, DiscAlbum, Frown, Heart, Map, MessageSquare, Quote, BadgeCheck, ShoppingBag, Utensils, CloudOff, CloudCog } from 'lucide-react';
import Link from 'next/link';
import { BUILD_NUMBER } from '@/lib/constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function HelpPage() {
  const [isPrimaryDegraded, setIsPrimaryDegraded] = useState(false);
  const [isFullyOffline, setIsFullyOffline] = useState(false);

  useEffect(() => {
    // Check local storage on the client side for system status.
    const primaryDegraded = localStorage.getItem('isPrimaryDegraded');
    if (primaryDegraded === 'true') {
      setIsPrimaryDegraded(true);
    }
    const fullyOffline = localStorage.getItem('isFullyOffline');
    if (fullyOffline === 'true') {
      setIsFullyOffline(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 md:p-8 flex items-center justify-center relative">
      <Card className="max-w-4xl w-full shadow-xl border">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline">How to Play The Portland Trail</CardTitle>
          <CardDescription className="pt-2">A guide to surviving your hipster journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-headline text-xl text-left">
                <Award className="mr-3 h-5 w-5 text-primary shrink-0" /> The Goal
              </AccordionTrigger>
              <AccordionContent className="text-base text-foreground/90 pl-10 pt-2">
                Your quest is to travel from the sunny shores of **San Francisco** to the promised land of **Portland**. The path is long and treacherous, measured by your **Progress**. Reach 100% progress to achieve ultimate coolness and win the game. But beware, the journey is fraught with peril!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="font-headline text-xl text-left">
                <Heart className="mr-3 h-5 w-5 text-primary shrink-0" /> Your Vitals
              </AccordionTrigger>
              <AccordionContent className="text-base text-foreground/90 pl-10 pt-2 space-y-4">
                <p className="flex items-start"><Utensils className="h-5 w-5 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Hunger:** If this reaches zero, you succumb to starvation. Keep it topped up by foraging or through scenario choices.</span></p>
                <p className="flex items-start"><Bike className="h-5 w-5 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Bike Health:** Your trusty fixed-gear bike is your only way forward. If its health drops to zero, you're stranded. Perform maintenance to keep it in good shape.</span></p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="font-headline text-xl text-left">
                <Frown className="mr-3 h-5 w-5 text-primary shrink-0" /> Social Stats & Resources
              </AccordionTrigger>
              <AccordionContent className="text-base text-foreground/90 pl-10 pt-2 space-y-4">
                <p className="flex items-start"><ShoppingBag className="h-5 w-5 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Style:** Your aesthetic sense. High style might open up unique opportunities.</span></p>
                <p className="flex items-start"><Quote className="h-5 w-5 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Irony:** Your ability to find humor in the mundane. A sharp wit can be a powerful tool.</span></p>
                <p className="flex items-start"><BadgeCheck className="h-5 w-5 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Authenticity:** How "real" you are. This can be a double-edged sword in the world of hipsters.</span></p>
                <p className="flex items-start"><Coffee className="h-5 w-5 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Coffee Beans:** The currency of the trail. Spend it on actions like bike tune-ups or thrifting.</span></p>
                <p className="flex items-start"><DiscAlbum className="h-5 w-5 mr-3 mt-1 shrink-0 text-secondary" /> <span>**Vinyls:** Prized possessions that prove your superior taste. A collection is a status symbol.</span></p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="font-headline text-xl text-left">
                <Map className="mr-3 h-5 w-5 text-primary shrink-0" /> Gameplay Loop
              </AccordionTrigger>
              <AccordionContent className="text-base text-foreground/90 pl-10 pt-2 space-y-4">
                <p>The game unfolds in a turn-based loop:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>**Scenario:** The game presents you with an AI-generated scenario. Read it carefully to understand the situation.</li>
                  <li>**Choice:** Make a choice. Each choice has consequences that will affect your stats, resources, and progress.</li>
                  <li>**Actions:** Between scenarios, you can perform one of four actions to manage your resources and vitals. Performing an action advances the game to the next scenario.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger className="font-headline text-xl text-left">
                <MessageSquare className="mr-3 h-5 w-5 text-primary shrink-0" /> On-Screen Cards
              </AccordionTrigger>
              <AccordionContent className="text-base text-foreground/90 pl-10 pt-2 space-y-4">
                <p>**Status Dashboard:** Your character sheet. All your vitals, stats, and inventory are here.</p>
                <p>**Actions Card:** Your available actions between story events. Use them wisely!</p>
                <p>**The Trail Map:** Shows your overall progress towards Portland.</p>
                <p>**Scenario Display:** This is where the story happens. Read the text and make your choices here.</p>
                <p>**Travel Diary:** A running history of what has happened on your journey.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center pt-4">
            <Link href="/" passHref>
              <Button size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Return to Game
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50 font-mono flex items-center gap-2">
        <TooltipProvider>
            {isPrimaryDegraded && (
            <Tooltip>
                <TooltipTrigger>
                <CloudCog className="h-3 w-3 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>
                <p>Primary AI degraded. Using fallback system.</p>
                </TooltipContent>
            </Tooltip>
            )}
            {isFullyOffline && (
            <Tooltip>
                <TooltipTrigger>
                <CloudOff className="h-3 w-3 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>
                <p>All AI systems offline. Using hardcoded data.</p>
                </TooltipContent>
            </Tooltip>
            )}
        </TooltipProvider>
        <span>Build: {BUILD_NUMBER.toFixed(3)}</span>
      </div>
    </main>
  );
}
