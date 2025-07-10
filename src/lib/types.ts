'use server';

import type { GeneratePortlandScenarioOutput } from "@/ai/flows/generate-portland-scenario";

export interface PlayerStats {
  hunger: number;
  style: number;
  irony: number;
  authenticity: number;
}

export interface Badge {
  imageDataUri: string;
  description: string;
  isUber?: boolean;
}

export interface PlayerResources {
  vinyls: number;
  coffee: number;
  bikeHealth: number;
  badges: Badge[];
}

export interface PlayerState {
  name: string;
  job: string;
  avatar: string;
  bio: string;
  stats: PlayerStats;
  resources: PlayerResources;
  location: string;
  progress: number;
  vibe: string;
}

export interface Choice {
  text: string;
  description: string;
  consequences: {
    hunger: number;
    style: number;
    irony: number;
    authenticity: number;
    coffee: number;
    vinyls: number;
    progress: number;
    bikeHealth: number;
    badge?: Omit<Badge, 'isUber'>;
  };
}

export interface PlayerAction {
    text: string;
    description: string;
    icon: React.ElementType;
    consequences: {
        hunger: number;
        style: number;
        irony: number;
        authenticity: number;
        coffee: number;
        vinyls: number;
        progress: number;
        bikeHealth: number;
    };
}

export type Scenario = (GeneratePortlandScenarioOutput & {
  choices: Choice[];
  image: string;
  isFallback?: boolean;
  error?: undefined;
}) | { error: string };
