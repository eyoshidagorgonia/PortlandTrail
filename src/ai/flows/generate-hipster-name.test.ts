import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateHipsterName } from './generate-hipster-name';

// Mock the global fetch function
global.fetch = vi.fn();

const createFetchResponse = (data: any, ok = true) => {
  return { ok, json: () => new Promise((resolve) => resolve(data)), text: () => new Promise((resolve) => resolve(JSON.stringify(data))) };
};

describe('generateHipsterName', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.env.NEXIX_API_KEY = 'test-api-key';
    });

  it('should return a name from the primary AI service on success', async () => {
    const mockResponse = {
      choices: [{ message: { content: '{"name": "Birch"}' }}]
    };
    (fetch as any).mockResolvedValue(createFetchResponse(mockResponse));

    const result = await generateHipsterName();

    expect(result.name).toBe('Birch');
    expect(result.dataSource).toBe('primary');
    expect(fetch).toHaveBeenCalledTimes(1);
    const firstCall = (fetch as any).mock.calls[0];
    const firstCallBody = JSON.parse(firstCall[1].body);
    expect(firstCall[0]).toBe('https://modelapi.nexix.ai/api/v1/chat/completions');
    expect(firstCallBody.model).toBe('gemma3:12b');
    expect(firstCall[1].cache).toBe('no-store');
  });

  it('should use the Nexix.ai fallback if the primary service fails', async () => {
    const mockNexixResponse = {
        // The actual content is a stringified JSON object
        response: JSON.stringify({ name: 'Fennel' }),
    };

    (fetch as any)
      .mockRejectedValueOnce(new Error('Primary service failed'))
      .mockResolvedValueOnce(createFetchResponse(mockNexixResponse));

    const result = await generateHipsterName();

    expect(result.name).toBe('Fennel');
    expect(result.dataSource).toBe('fallback');
    expect(fetch).toHaveBeenCalledTimes(2);

    const secondCall = (fetch as any).mock.calls[1];
    const secondCallBody = JSON.parse(secondCall[1].body);
    expect(secondCall[0]).toBe('http://modelapi.nexix.ai/api/v1/proxy/generate');
    expect(secondCallBody.model).toBe('gemma:2b-instruct-q8_0');
    expect(secondCallBody.format).toBe('json');
    expect(secondCall[1].cache).toBe('no-store');
  });

  it('should return a hardcoded fallback name when both primary and nexix services fail', async () => {
    (fetch as any)
        .mockRejectedValueOnce(new Error('Primary service failed'))
        .mockRejectedValueOnce(new Error('Nexix service failed'));

    const result = await generateHipsterName();
    
    const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
    expect(fallbackNames).toContain(result.name);
    expect(result.dataSource).toBe('hardcoded');
  });

  it('should return a hardcoded fallback name when the primary response is not ok and nexix fails', async () => {
    (fetch as any)
        .mockResolvedValueOnce(createFetchResponse({}, false))
        .mockRejectedValueOnce(new Error('Nexix service failed'));

    const result = await generateHipsterName();
    const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
    expect(fallbackNames).toContain(result.name);
    expect(result.dataSource).toBe('hardcoded');
  });

  it('should return a hardcoded fallback name when the response JSON is malformed and nexix fails', async () => {
    const mockResponse = {
        choices: [{ message: { content: 'this is not json' }}]
    };
    (fetch as any)
        .mockResolvedValueOnce(createFetchResponse(mockResponse))
        .mockRejectedValueOnce(new Error('Nexix service failed'));

    const result = await generateHipsterName();
    
    const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
    expect(fallbackNames).toContain(result.name);
    expect(result.dataSource).toBe('hardcoded');
  });
});
