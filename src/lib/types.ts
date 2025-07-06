import type { GeneratePortlandScenarioOutput } from "@/ai/flows/generate-portland-scenario";

export interface PlayerStats {
  hunger: number;
  style: number;
  irony: number;
  authenticity: number;
}

export interface PlayerResources {
  vinyls: number;
  coffee: number;
  bikeHealth: number;
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
  };
}

export type Scenario = GeneratePortlandScenarioOutput & {
  choices: Choice[];
  error?: undefined;
} | { error: string };
