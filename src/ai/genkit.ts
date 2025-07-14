import {genkit} from 'genkit';

export const ai = genkit({
  plugins: [
    // All AI calls are now handled by custom services (nexix-api.ts, auto1111-api.ts)
    // so no Genkit plugins are needed.
  ],
});
