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
  stats: PlayerStats;
  resources: PlayerResources;
  location: string;
  progress: number;
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
    badge?: Badge;
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
  error?: undefined;
}) | { error: string };
