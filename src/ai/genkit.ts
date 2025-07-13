import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openai} from '@genkit-ai/openai';

// Define a custom model name for your Ollama proxy.
// This makes it easy to reference in your flows.
const ollamaModel = 'ollama/gemma3:12b';

export const ai = genkit({
  plugins: [
    googleAI(),
    openai({
      // Provide an empty apiKey, as the proxy handles authentication.
      // Your real key is sent via the Authorization header.
      apiKey: process.env.NEXIS_API_KEY || 'not-needed',
      // Point the baseURL to your custom proxy endpoint.
      baseURL: 'https://modelapi.nexix.ai/api/v1',
      // Define the model mapping.
      // When a flow requests 'ollama/gemma3:12b', Genkit will
      // use the 'gemma3:12b' model name when calling your proxy.
      models: {
        [ollamaModel]: {
          model: 'gemma3:12b',
        }
      },
    }),
  ],
});
