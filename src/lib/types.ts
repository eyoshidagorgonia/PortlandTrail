import type { GeneratePortlandScenarioOutput } from "@/ai/flows/generate-portland-scenario";
import { z } from "zod";

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
  image?: string; // Data URI for the generated badge image
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
    badge?: Omit<Badge, 'isUber' | 'image'>;
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

// Data directly from the text-generation flow
export type ScenarioTextData = Omit<GeneratePortlandScenarioOutput, 'dataSource' | 'avatarKaomoji' | 'choices' | 'reward' | 'badge'>;

export type Scenario = (ScenarioTextData & {
  choices: Choice[];
  playerAvatar: string; // The kaomoji for the player
  dataSources?: Record<string, 'primary' | 'fallback' | 'hardcoded'>;
  badge?: {
      description: string;
      emoji: string;
  };
});

export interface SystemStatus {
    healthyServices: Set<string>;
    primaryDegradedServices: Set<string>;
    fullyOfflineServices: Set<string>;
}

// Types for Image Generation Flow
export const GenerateImagesInputSchema = z.object({
  scenarioDescription: z.string().describe('The full text description of the current scenario.'),
  character: z.object({
    name: z.string(),
    job: z.string(),
    vibe: z.string(),
    avatarKaomoji: z.string(),
  }),
  badge: z.object({
    description: z.string(),
    emoji: z.string(),
  }).optional(),
});
export type GenerateImagesInput = z.infer<typeof GenerateImagesInputSchema>;

export const GenerateImagesOutputSchema = z.object({
  avatarImage: z.string().describe("A data URI of the generated player avatar image."),
  sceneImage: z.string().describe("A data URI of the generated scene image."),
  badgeImage: z.string().optional().describe("A data URI of the generated badge image, if applicable."),
  dataSource: z.enum(['primary', 'fallback', 'hardcoded']).describe('The source of the generated data.'),
});
export type GenerateImagesOutput = z.infer<typeof GenerateImagesOutputSchema>;
