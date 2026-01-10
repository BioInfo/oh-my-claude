/**
 * Hook Registration System
 * Manages lifecycle hooks for the plugin
 */

export type HookEvent =
  | 'session-start'
  | 'session-end'
  | 'message'
  | 'idle'
  | 'tool-call'
  | 'agent-spawn';

export interface HookContext {
  projectRoot: string;
  [key: string]: unknown;
}

export type HookHandler<T = unknown> = (
  data: T,
  context: HookContext
) => Promise<unknown>;

export interface HookDefinition {
  name: string;
  event: HookEvent;
  description: string;
  handler: HookHandler;
  priority?: number; // Lower number = higher priority
}

export class HookRegistry {
  private hooks: Map<HookEvent, HookDefinition[]> = new Map();

  /**
   * Register a hook
   */
  register(hook: HookDefinition): void {
    const existing = this.hooks.get(hook.event) || [];
    existing.push(hook);

    // Sort by priority
    existing.sort((a, b) => (a.priority || 100) - (b.priority || 100));

    this.hooks.set(hook.event, existing);
  }

  /**
   * Trigger an event
   */
  async trigger<T>(
    event: HookEvent,
    data: T,
    context: HookContext
  ): Promise<unknown[]> {
    const handlers = this.hooks.get(event) || [];
    const results: unknown[] = [];

    for (const handler of handlers) {
      try {
        const result = await handler.handler(data, context);
        results.push(result);
      } catch (error) {
        console.error(`Hook ${handler.name} failed:`, error);
      }
    }

    return results;
  }

  /**
   * List hooks for an event
   */
  list(event?: HookEvent): HookDefinition[] {
    if (event) {
      return this.hooks.get(event) || [];
    }

    const all: HookDefinition[] = [];
    for (const hooks of this.hooks.values()) {
      all.push(...hooks);
    }
    return all;
  }
}

/**
 * Create and populate the default hook registry
 */
export function createHookRegistry(context: HookContext): HookRegistry {
  const registry = new HookRegistry();

  // Session Start Hook - Boulder Resume
  registry.register({
    name: 'boulder-resume',
    event: 'session-start',
    description: 'Resumes incomplete work from previous sessions',
    priority: 10,
    handler: async (_data, ctx) => {
      const { boulderResumeHook } = await import('../hooks/boulder-resume.js');
      return boulderResumeHook(ctx as any);
    },
  });

  // Message Hook - Keyword Detector
  registry.register({
    name: 'keyword-detector',
    event: 'message',
    description: 'Detects ultrawork/ulw keywords',
    priority: 5,
    handler: async (data: any, ctx) => {
      const { onMessage } = await import('../hooks/keyword-detector.js');
      return onMessage(data, ctx as any);
    },
  });

  // Idle Hook - Completion Enforcer
  registry.register({
    name: 'completion-enforcer',
    event: 'idle',
    description: 'Prevents stopping with incomplete work',
    priority: 1,
    handler: async (_data, ctx) => {
      const { completionEnforcerHook } = await import('../hooks/completion-enforcer.js');
      return completionEnforcerHook(ctx as any);
    },
  });

  return registry;
}
