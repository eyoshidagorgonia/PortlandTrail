
'use server';

import type { GeneratePortlandScenarioOutput } from "@/ai/flows/generate-portland-scenario";
import type { GenerateHipsterNameOutput } from "@/ai/flows/generate-hipster-name";
import type { GenerateCharacterBioOutput } from "@/ai/flows/generate-character-bio";
import type { GenerateTransportModeOutput } from "@/ai/flows/generate-transport-mode";

export interface PlayerStats {
  hunger: number;
  style: number;
  irony: number;
  authenticity: number;
}

export interface Badge {
  emoji: string;
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
  avatar: string; // This will now hold a Kaomoji string
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

export type ScenarioData = Omit<GeneratePortlandScenarioOutput, 'dataSource' | 'avatarKaomoji' | 'choices' | 'reward'> & { reward?: string };


export type Scenario = (ScenarioData & {
  choices: Choice[];
  playerAvatar?: string; // The kaomoji for the player
  dataSources?: Record<string, 'primary' | 'fallback' | 'hardcoded'>;
});

export interface SystemStatus {
    healthyServices: Set<string>;
    primaryDegradedServices: Set<string>;
    fullyOfflineServices: Set<string>;
}
