/**
 * Keyword Detector Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { detectKeywords } from './keyword-detector.js';
import { BoulderManager } from '../state/boulder.js';
import { loadConfig } from '../config/index.js';
import type { PluginContext } from '../index.js';

describe('detectKeywords', () => {
  let context: PluginContext;

  beforeEach(() => {
    context = {
      projectRoot: process.cwd(),
      config: loadConfig(),
      boulder: new BoulderManager(process.cwd()),
    };
  });

  it('should detect ultrawork keyword', async () => {
    const result = await detectKeywords('ultrawork build this feature', context);
    expect(result.detected).toBe(true);
    expect(result.keyword).toBe('ultrawork');
    expect(result.mode).toBe('orchestration');
  });

  it('should detect ulw keyword', async () => {
    const result = await detectKeywords('ulw fix the bugs', context);
    expect(result.detected).toBe(true);
    expect(result.keyword).toBe('ulw');
    expect(result.mode).toBe('orchestration');
  });

  it('should detect @plan keyword', async () => {
    const result = await detectKeywords('@plan the architecture', context);
    expect(result.detected).toBe(true);
    expect(result.keyword).toBe('@plan');
    expect(result.mode).toBe('planning');
  });

  it('should be case insensitive by default', async () => {
    const result = await detectKeywords('ULTRAWORK build this', context);
    expect(result.detected).toBe(true);
    expect(result.keyword).toBe('ultrawork');
  });

  it('should not detect when keyword absent', async () => {
    const result = await detectKeywords('regular message', context);
    expect(result.detected).toBe(false);
    expect(result.keyword).toBeUndefined();
  });

  it('should handle custom keywords', async () => {
    const result = await detectKeywords('custom-keyword test', context, {
      keywords: ['custom-keyword'],
    });
    expect(result.detected).toBe(true);
    expect(result.keyword).toBe('custom-keyword');
  });
});
