import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {ollama} from 'genkit-plugin-ollama';

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama({
      models: [
        {
          name: 'ollama/gemma3:12b',
          type: 'chat',
          path: 'gemma3:12b', // The model name the API expects
        },
      ],
      // The endpoint is /chat/completions, so serverAddress is the base URL
      serverAddress: 'https://modelapi.nexix.ai/api/v1',
      requestHeaders: {
        Authorization: `Bearer ${process.env.NEXIS_API_KEY || ''}`,
      },
    }),
  ],
});
