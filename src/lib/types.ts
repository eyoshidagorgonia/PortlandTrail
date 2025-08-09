
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

// Loot & Equipment System
export const EquipmentSlotEnum = z.enum(["Headwear", "Outerwear", "Accessory", "Footwear", "Eyewear"]);
export type EquipmentSlot = z.infer<typeof EquipmentSlotEnum>;

export const GearQualityEnum = z.enum(["Thrifted", "Artisanal", "One-of-One"]);
export type GearQuality = z.infer<typeof GearQualityEnum>;

export const StatModifierSchema = z.object({
    health: z.number().optional(),
    style: z.number().optional(),
    irony: z.number().optional(),
    authenticity: z.number().optional(),
    vibes: z.number().optional(),
});
export type StatModifier = z.infer<typeof StatModifierSchema>;

export const LootItemSchema = z.object({
    name: z.string().describe("A quirky, thematic name for the item."),
    type: EquipmentSlotEnum.describe("The equipment slot this item belongs to."),
    quality: GearQualityEnum.describe("The quality tier of the item."),
    flavorText: z.string().describe("A short, ironic description of the item."),
    modifiers: StatModifierSchema.describe("The stat changes this item provides. Can be positive or negative."),
});
export type LootItem = z.infer<typeof LootItemSchema>;

export type Equipment = Partial<Record<EquipmentSlot, LootItem>>;

export interface PlayerResources {
  vinyls: number;
  coffee: number;
  stamina: number;
  badges: Badge[];
  inventory: LootItem[];
  equipment: Equipment;
}


export interface PlayerState {
  name: string;
  job: string;
  origin: string;
  avatar: string; // This will now hold a Kaomoji string
  mood: string;
  stats: PlayerStats;
  baseStats: PlayerStats; // Base stats before equipment modifiers
  resources: PlayerResources;
  location: string;
  progress: number;
  vibe: string;
  events: TrailEvent[];
  trail: string[];
}

export const ChoiceSchema = z.object({
    text: z.string().describe("The text for the choice button, e.g., 'Embrace the weirdness'"),
    description: z.string().describe("A tooltip description for the choice."),
    consequences: z.object({
        health: z.number().optional().describe('The change in health. Can be positive or negative.'),
        style: z.number().optional().describe('The change in style. Can be positive or negative.'),
        irony: z.number().optional().describe('The change in irony. Can be positive or negative.'),
        authenticity: z.number().optional().describe('The change in authenticity. Can be positive or negative.'),
        vibes: z.number().optional().describe('The change in vibes. Can be positive or negative.'),
        progress: z.number().optional().describe('The change in progress towards Portland.'),
        coffee: z.number().optional().describe('The change in coffee beans. Can be positive or negative.'),
        vinyls: z.number().optional().describe('The change in vinyl records. Can be positive or negative.'),
        stamina: z.number().optional().describe('The change in bike stamina. Can be positive or negative.'),
        badge: BadgeSchema.optional(),
        reward: z.object({
            loot: z.boolean().describe("Set to true if this choice should reward the player with loot."),
        }).optional(),
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
  dataSources?: Record<string, 'primary' | 'hardcoded'>;
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
    origin: z.string(),
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
  sceneImage: z.string().describe("A data URI of the generated scene image."),
  badgeImage: z.string().optional().describe("A data URI of the generated badge image, if applicable."),
  dataSource: z.enum(['primary', 'hardcoded']).describe('The source of the generated data.'),
});
export type GenerateImagesOutput = z.infer<typeof GenerateImagesOutputSchema>;

// Types for Loot Generation
export const GenerateLootInputSchema = z.object({
    playerStatus: z.string().describe("A summary of the player's current status."),
    scenario: z.string().describe("The description of the scenario that led to this loot drop."),
});
export type GenerateLootInput = z.infer<typeof GenerateLootInputSchema>;

export const GenerateLootOutputSchema = z.object({
    loot: z.array(LootItemSchema).describe("An array of 1 to 3 generated loot items."),
});
export type GenerateLootOutput = z.infer<typeof GenerateLootOutputSchema>;
