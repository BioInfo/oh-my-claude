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
  priority?: number;
}

const DEFAULT_PRIORITY = 100;

export class HookRegistry {
  private hooks: Map<HookEvent, HookDefinition[]> = new Map();

  /**
   * Register a hook
   */
  register(hook: HookDefinition): void {
    const existing = this.hooks.get(hook.event) || [];
    existing.push(hook);
    existing.sort((a, b) => (a.priority || DEFAULT_PRIORITY) - (b.priority || DEFAULT_PRIORITY));
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
    return Array.from(this.hooks.values()).flat();
  }
}

/**
 * Create and populate the default hook registry
 */
export function createHookRegistry(context: HookContext): HookRegistry {
  const registry = new HookRegistry();

  registry.register({
    name: 'boulder-resume',
    event: 'session-start',
    description: 'Resumes incomplete work from previous sessions',
    priority: 10,
    handler: async (_data, ctx) => {
      const { boulderResumeHook } = await import('../hooks/boulder-resume.js');
      return boulderResumeHook(ctx);
    },
  });

  registry.register({
    name: 'keyword-detector',
    event: 'message',
    description: 'Detects ultrawork/ulw keywords',
    priority: 5,
    handler: async (data, ctx) => {
      const { onMessage } = await import('../hooks/keyword-detector.js');
      return onMessage(data as { role: string; content: string }, ctx);
    },
  });

  registry.register({
    name: 'completion-enforcer',
    event: 'idle',
    description: 'Prevents stopping with incomplete work',
    priority: 1,
    handler: async (_data, ctx) => {
      const { completionEnforcerHook } = await import('../hooks/completion-enforcer.js');
      return completionEnforcerHook(ctx);
    },
  });

  return registry;
}
