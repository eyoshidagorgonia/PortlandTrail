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
        process.env.NEXIS_API_KEY = 'test-api-key';
    });

  it('should return a name from the AI service on success', async () => {
    const mockResponse = {
      content: JSON.stringify({ name: 'Birch' }),
      isCached: false,
    };
    (fetch as any).mockResolvedValue(createFetchResponse(mockResponse));

    const result = await generateHipsterName();

    expect(result.name).toBe('Birch');
    expect(result.dataSource).toBe('primary');
    expect(fetch).toHaveBeenCalledTimes(1);
    const firstCall = (fetch as any).mock.calls[0];
    expect(firstCall[1].cache).toBe('no-store');
  });

  it('should use the Nexis.ai fallback if the primary service fails', async () => {
    const mockNexisResponse = {
        // The actual content is a stringified JSON object
        response: JSON.stringify({ name: 'Fennel' }),
    };

    (fetch as any)
      .mockRejectedValueOnce(new Error('Primary service failed'))
      .mockResolvedValueOnce(createFetchResponse(mockNexisResponse));

    const result = await generateHipsterName();

    expect(result.name).toBe('Fennel');
    expect(result.dataSource).toBe('fallback');
    expect(fetch).toHaveBeenCalledTimes(2);

    const secondCall = (fetch as any).mock.calls[1];
    const secondCallBody = JSON.parse(secondCall[1].body);
    expect(secondCall[0]).toBe('http://modelapi.nexix.ai/api/v1/proxy/generate');
    expect(secondCallBody.format).toBe('json');
    expect(secondCall[1].cache).toBe('no-store');
  });

  it('should return a hardcoded fallback name when both primary and nexis services fail', async () => {
    (fetch as any)
        .mockRejectedValueOnce(new Error('Primary service failed'))
        .mockRejectedValueOnce(new Error('Nexis service failed'));

    const result = await generateHipsterName();
    
    const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
    expect(fallbackNames).toContain(result.name);
    expect(result.dataSource).toBe('hardcoded');
  });

  it('should return a hardcoded fallback name when the primary response is not ok and nexis fails', async () => {
    (fetch as any)
        .mockResolvedValueOnce(createFetchResponse({}, false))
        .mockRejectedValueOnce(new Error('Nexis service failed'));

    const result = await generateHipsterName();
    const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
    expect(fallbackNames).toContain(result.name);
    expect(result.dataSource).toBe('hardcoded');
  });

  it('should return a hardcoded fallback name when the response JSON is malformed and nexis fails', async () => {
    const mockResponse = {
        content: 'this is not json',
        isCached: false,
    };
    (fetch as any)
        .mockResolvedValueOnce(createFetchResponse(mockResponse))
        .mockRejectedValueOnce(new Error('Nexis service failed'));

    const result = await generateHipsterName();
    
    const fallbackNames = ["Pip", "Wren", "Lark", "Moss", "Cove"];
    expect(fallbackNames).toContain(result.name);
    expect(result.dataSource).toBe('hardcoded');
  });
});
