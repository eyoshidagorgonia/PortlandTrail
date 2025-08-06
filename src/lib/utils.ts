import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlayerStats, Equipment } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStats(baseStats: PlayerStats, equipment: Equipment): PlayerStats {
    const combinedStats: PlayerStats = { ...baseStats };

    for (const slot in equipment) {
        const item = equipment[slot as keyof Equipment];
        if (item && item.modifiers) {
            for (const [stat, value] of Object.entries(item.modifiers)) {
                if (value !== undefined) {
                    combinedStats[stat as keyof PlayerStats] += value;
                }
            }
        }
    }
    
    // Ensure stats don't go below zero, except health which is handled elsewhere
    combinedStats.style = Math.max(0, combinedStats.style);
    combinedStats.irony = Math.max(0, combinedStats.irony);
    combinedStats.authenticity = Math.max(0, combinedStats.authenticity);
    combinedStats.vibes = Math.min(100, Math.max(0, combinedStats.vibes));
    combinedStats.health = Math.min(100, Math.max(0, combinedStats.health));

    return combinedStats;
}
