import { describe, it, expect, vi } from 'vitest';
import { generateHipsterName } from './generate-hipster-name';

// Mock the global fetch function
global.fetch = vi.fn();

const createFetchResponse = (data: any, ok = true) => {
  return { ok, json: () => new Promise((resolve) => resolve(data)) };
};

describe('generateHipsterName', () => {
  it('should return a name from the AI service on success', async () => {
    const mockResponse = {
      content: JSON.stringify({ name: 'Birch' }),
      isCached: false,
    };
    (fetch as any).mockResolvedValue(createFetchResponse(mockResponse));

    const result = await generateHipsterName();

    expect(result.name).toBe('Birch');
    expect(result.isFallback).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should return fallback names when the fetch call fails', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    const result = await generateHipsterName();

    expect(result.fallbackNames).toBeInstanceOf(Array);
    expect(result.fallbackNames?.length).toBeGreaterThan(0);
    expect(result.name).toBeUndefined();
    expect(result.isFallback).toBe(true);
  });

  it('should return fallback names when the API response is not ok', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse({}, false));

    const result = await generateHipsterName();

    expect(result.fallbackNames).toBeInstanceOf(Array);
    expect(result.fallbackNames?.length).toBeGreaterThan(0);
    expect(result.isFallback).toBe(true);
  });

  it('should return fallback names when the response JSON is malformed', async () => {
    const mockResponse = {
        content: 'this is not json',
        isCached: false,
    };
    (fetch as any).mockResolvedValue(createFetchResponse(mockResponse));

    const result = await generateHipsterName();
    
    expect(result.fallbackNames).toBeInstanceOf(Array);
    expect(result.fallbackNames?.length).toBeGreaterThan(0);
    expect(result.isFallback).toBe(true);
  });
});
