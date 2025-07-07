'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// Use require to handle module interop issues.
const ollama = require('genkitx-ollama');

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama.ollama({
      models: [
        {
          name: 'gemma:7b',
          type: 'generate',
        },
      ],
      serverAddress:
        process.env.OLLAMA_HOST || 'http://host.docker.internal:11434',
    }),
  ],
  model: 'ollama/gemma:7b', // Set ollama as the default text model
});
