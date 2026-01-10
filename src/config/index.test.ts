/**
 * Configuration Tests
 */

import { describe, it, expect } from 'vitest';
import { loadConfig, defaultConfig } from './index.js';

describe('loadConfig', () => {
  it('should return default config with no input', () => {
    const config = loadConfig();
    expect(config).toEqual(defaultConfig);
  });

  it('should merge user config with defaults', () => {
    const userConfig = {
      lsp: {
        enabled: false,
      },
    };

    const config = loadConfig(userConfig);
    expect(config.lsp.enabled).toBe(false);
    expect(config.boulder.enabled).toBe(true); // Default preserved
  });

  it('should validate config schema', () => {
    const validConfig = {
      lsp: {
        enabled: true,
        serverTimeout: 60000,
      },
      orchestration: {
        defaultModel: 'claude-haiku-4-5',
        maxParallelAgents: 5,
      },
    };

    const config = loadConfig(validConfig);
    expect(config.orchestration.defaultModel).toBe('claude-haiku-4-5');
    expect(config.orchestration.maxParallelAgents).toBe(5);
  });

  it('should include category configurations', () => {
    const config = loadConfig();
    expect(config.categories).toBeTruthy();
    expect(config.categories?.['visual-engineering']).toBeTruthy();
    expect(config.categories?.['ultrabrain']).toBeTruthy();
    expect(config.categories?.['quick']).toBeTruthy();
  });
});
