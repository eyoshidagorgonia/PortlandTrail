'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-portland-scenario.ts';
import '@/ai/flows/generate-avatar.ts';
import '@/ai/flows/generate-hipster-name.ts';
import '@/ai/flows/generate-scenario-image.ts';
import '@/ai/flows/generate-badge-image.ts';
import '@/ai/flows/generate-character-bio.ts';
