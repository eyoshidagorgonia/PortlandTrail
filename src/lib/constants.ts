
import type { PlayerState } from './types';

export const BUILD_NUMBER = 1.042;

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
  bio: '',
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
    bio: "Character Bio",
    scenario: "Scenario/Art Generation",
    transport: "Transport Mode",
    image: "Image Generation",
}
