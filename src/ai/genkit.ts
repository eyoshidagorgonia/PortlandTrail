import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {ollama} from 'genkitx-ollama';

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama({
      models: [
        {
          name: 'gemma:7b',
          type: 'generate',
        },
      ],
      serverAddress: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    }),
  ],
  model: 'ollama/gemma:7b', // Set ollama as the default text model
});
