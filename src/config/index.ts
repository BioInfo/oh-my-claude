/**
 * Configuration management with Zod validation
 */

import { z } from 'zod';

export const CategoryConfigSchema = z.object({
  defaultAgent: z.string(),
  defaultModel: z.enum(['claude-haiku-4-5', 'claude-sonnet-4-5', 'claude-opus-4-5']),
  temperature: z.number().min(0).max(1).default(0.3),
});

export const PluginConfigSchema = z.object({
  lsp: z.object({
    enabled: z.boolean().default(true),
    serverTimeout: z.number().default(30000),
  }),
  astGrep: z.object({
    enabled: z.boolean().default(true),
  }),
  orchestration: z.object({
    defaultModel: z.string().default('claude-sonnet-4-5'),
    maxParallelAgents: z.number().default(10),
  }),
  boulder: z.object({
    enabled: z.boolean().default(true),
    path: z.string().default('.keepers'),
  }),
  categories: z.record(CategoryConfigSchema).optional(),
});

export type CategoryConfig = z.infer<typeof CategoryConfigSchema>;
export type PluginConfig = z.infer<typeof PluginConfigSchema>;

export const defaultConfig: PluginConfig = {
  lsp: {
    enabled: true,
    serverTimeout: 30000,
  },
  astGrep: {
    enabled: true,
  },
  orchestration: {
    defaultModel: 'claude-sonnet-4-5',
    maxParallelAgents: 10,
  },
  boulder: {
    enabled: true,
    path: '.keepers',
  },
  categories: {
    'visual-engineering': {
      defaultAgent: 'frontend-developer',
      defaultModel: 'claude-sonnet-4-5',
      temperature: 0.7,
    },
    ultrabrain: {
      defaultAgent: 'architect-reviewer',
      defaultModel: 'claude-opus-4-5',
      temperature: 0.1,
    },
    quick: {
      defaultAgent: 'batch-editor',
      defaultModel: 'claude-haiku-4-5',
      temperature: 0.3,
    },
  },
};

/**
 * Load and validate configuration
 */
export function loadConfig(userConfig: unknown = {}): PluginConfig {
  const merged = {
    ...defaultConfig,
    ...(typeof userConfig === 'object' && userConfig !== null ? userConfig : {}),
  };

  return PluginConfigSchema.parse(merged);
}
