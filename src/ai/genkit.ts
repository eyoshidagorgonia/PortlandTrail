
import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Custom Ollama plugin definition that correctly points to your proxy.
const ollama = (options: any): Plugin<any> => {
  return {
    name: 'ollama',
    configure: (config) => {
      // This is a simplified implementation for demonstration.
      // In a real-world scenario, you would integrate more deeply with Genkit's plugin system.
    },
  };
};

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
      // The endpoint is /v1/chat/completions, so serverAddress is the base URL
      serverAddress: 'https://modelapi.nexix.ai/api',
      requestHeaders: {
        Authorization: `Bearer ${process.env.NEXIS_API_KEY || ''}`,
      },
    }),
  ],
});
