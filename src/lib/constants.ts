import type { PlayerState } from './types';

export const BUILD_NUMBER = 1.002;

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
  avatar: '',
  bio: '',
  stats: {
    hunger: 80,
    style: 50,
    irony: 20,
    authenticity: 60,
  },
  resources: {
    vinyls: 1,
    coffee: 10,
    bikeHealth: 100,
    badges: [],
  },
  location: 'San Francisco',
  progress: 0,
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
