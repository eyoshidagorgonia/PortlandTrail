
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-portland-scenario.ts';
import '@/ai/flows/generate-hipster-name.ts';
import '@/ai/flows/generate-character-bio.ts';
import '@/ai/flows/generate-transport-mode.ts';
import '@/ai/flows/generate-images-for-scenario.ts';
