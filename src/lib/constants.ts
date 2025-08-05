
import type { PlayerState } from './types';

export const BUILD_NUMBER = 1.042;

export const IRONIC_TAGLINES = [
    "An epic saga of bespoke suffering and curated gloom.",
    "A pilgrimage fueled by single-origin dread and artisanal angst.",
    "The path to enlightenment is paved with avocado toast and existential despair.",
    "Forge your legend in the fires of irony, armed with a vintage flannel.",
    "A grimdark quest for the perfect pour-over and a reason to feel something.",
    "Suffer beautifully on this handcrafted journey into the heart of coolness.",
    "Where small-batch terrors and locally-sourced nightmares await.",
    "They said the dream of the 90s was alive in Portland. They didn't mention the curse.",
    "A tale whispered only in speakeasies and written on reclaimed parchment.",
    "Your destiny is as murky as an unfiltered, hazy IPA.",
    "A curated descent into the maelstrom of meticulous self-expression.",
];

export const HIPSTER_JOBS = [
  "Artisanal Pickle Maker",
  "Kombucha Brewer",
  "Fixie Bike Mechanic",
  "Terrarium Builder",
  "Vintage Clothing Curator",
  "Urban Beekeeper",
  "Indie Band Vlogger",
  "Latte Artist",
  "Zine Publisher",
  "Etsy Artisan",
];

export const INITIAL_PLAYER_STATE: PlayerState = {
  name: 'Art',
  job: HIPSTER_JOBS[0],
  avatar: '(o_O)', // Default Kaomoji
  mood: '',
  stats: {
    health: 80,
    style: 50,
    irony: 20,
    authenticity: 60,
    vibes: 75,
  },
  resources: {
    vinyls: 1,
    coffee: 10,
    stamina: 100,
    badges: [],
  },
  location: 'San Francisco',
  progress: 0,
  vibe: 'Just starting out',
  events: [],
};

export const TRAIL_WAYPOINTS = [
  'San Francisco',
  'Sacramento',
  'Redding',
  'Ashland',
  'Eugene',
  'Salem',
  'Portland',
];

export const getIronicHealthStatus = (health: number): { text: string; variant: 'default' | 'secondary' | 'destructive' } => {
    if (health > 80) return { text: 'Peak Vibe', variant: 'default' };
    if (health > 60) return { text: 'Ironically Detached', variant: 'secondary' };
    if (health > 40) return { text: 'Performatively Pained', variant: 'secondary' };
    if (health > 20) return { text: 'Aesthetically Fading', variant: 'destructive' };
    return { text: 'Basically Mainstream', variant: 'destructive' };
  };

export const SERVICE_DISPLAY_NAMES: Record<string, string> = {
    name: "Name Generation",
    mood: "Character Mood",
    scenario: "Scenario/Art Generation",
    transport: "Transport Mode",
    image: "Image Generation",
    badge: "Badge Generation"
}
