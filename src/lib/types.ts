import type { GeneratePortlandScenarioOutput } from "@/ai/flows/generate-portland-scenario";
import { z } from "zod";

export interface PlayerStats {
  health: number;
  style: number;
  irony: number;
  authenticity: number;
  vibes: number;
}

export const BadgeSchema = z.object({
  badgeDescription: z.string().describe('A short, witty description for a merit badge.'),
  badgeEmoji: z.string().describe('A single emoji that represents the badge.'),
  isUber: z.boolean().optional().describe('Whether this is a powerful, rare "Uber" badge.'),
});

export interface Badge {
  emoji: string;
  description: string;
  isUber?: boolean;
  image?: string; // Data URI for the generated badge image
}

export interface TrailEvent {
  progress: number;
  description: string;
  timestamp: Date;
}

export interface PlayerResources {
  vinyls: number;
  coffee: number;
  stamina: number;
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
  events: TrailEvent[];
}

export const ChoiceSchema = z.object({
    text: z.string().describe("The text for the choice button, e.g., 'Embrace the weirdness'"),
    description: z.string().describe("A tooltip description for the choice."),
    consequences: z.object({
        health: z.number().describe('The change in health. Can be positive or negative.'),
        style: z.number().describe('The change in style. Can be positive or negative.'),
        irony: z.number().describe('The change in irony. Can be positive or negative.'),
        authenticity: z.number().describe('The change in authenticity. Can be positive or negative.'),
        vibes: z.number().describe('The change in vibes. Can be positive or negative.'),
        progress: z.number().describe('The change in progress towards Portland.'),
        coffee: z.number().describe('The change in coffee beans. Can be positive or negative.'),
        vinyls: z.number().describe('The change in vinyl records. Can be positive or negative.'),
        stamina: z.number().describe('The change in bike stamina. Can be positive or negative.'),
        badge: BadgeSchema.optional(), // Badge info is now part of consequences
    }),
});
export type Choice = z.infer<typeof ChoiceSchema>;


export interface PlayerAction {
    text: string;
    description: string;
    icon: React.ElementType;
    consequences: {
        health: number;
        style: number;
        irony: number;
        authenticity: number;
        vibes: number;
        coffee: number;
        vinyls: number;
        progress: number;
        stamina: number;
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