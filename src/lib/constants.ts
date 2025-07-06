import type { PlayerState } from './types';

export const INITIAL_PLAYER_STATE: PlayerState = {
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
