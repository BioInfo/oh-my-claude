/**
 * Completion Enforcer Hook
 * Ensures tasks complete by checking boulder state on idle
 */

import type { PluginContext } from '../index.js';

/**
 * Check if there's incomplete work and prevent idle if so
 */
export async function onIdle(
  context: PluginContext
): Promise<{
  preventIdle?: boolean;
  message?: string;
  continueWith?: string;
}> {
  if (!context.config.boulder.enabled) {
    return {};
  }

  const hasActiveWork = await context.boulder.hasActiveWork();

  if (!hasActiveWork) {
    return {}; // No active work, OK to idle
  }

  // Get progress details
  const progress = await context.boulder.getProgress();
  const state = await context.boulder.load();

  if (!progress || !state) {
    return {};
  }

  // Calculate remaining todos
  const remainingSteps = progress.total - progress.current;
  const remainingTodos = Array.from(
    { length: progress.total },
    (_, i) => i + 1
  ).filter((step) => !state.completedTodos.includes(step));

  return {
    preventIdle: true,
    message: `
⚠️ INCOMPLETE WORK DETECTED

Progress: ${progress.current}/${progress.total} steps (${progress.percentage}%)
Remaining: ${remainingSteps} steps

Boulder state: ${context.boulder['boulderPath']}
Plan: ${state.planPath}

You cannot stop yet. The work is not complete.
`.trim(),
    continueWith: `
I notice there is incomplete work. Let me continue with the remaining steps.

Current progress: ${progress.current}/${progress.total}
Next steps: ${remainingTodos.slice(0, 3).join(', ')}${remainingTodos.length > 3 ? '...' : ''}

Continuing execution...
`.trim(),
  };
}

/**
 * Check completion status and provide feedback
 */
export async function checkCompletion(
  context: PluginContext
): Promise<{
  isComplete: boolean;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  message?: string;
}> {
  const hasActiveWork = await context.boulder.hasActiveWork();

  if (!hasActiveWork) {
    return {
      isComplete: true,
      message: 'All work complete! Boulder state cleared.',
    };
  }

  const progress = await context.boulder.getProgress();

  if (!progress) {
    return { isComplete: true };
  }

  return {
    isComplete: false,
    progress,
    message: `Work in progress: ${progress.current}/${progress.total} steps complete (${progress.percentage}%)`,
  };
}
