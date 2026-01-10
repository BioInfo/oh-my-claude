/**
 * Boulder Resume Hook
 * Resumes incomplete work from previous sessions
 */

import type { PluginContext } from '../index.js';

/**
 * Check for incomplete work on session start
 */
export async function onSessionStart(
  context: PluginContext
): Promise<{
  message?: string;
  resumeState?: {
    planPath: string;
    currentStep: number;
    totalSteps: number;
    sessionID: string;
  };
}> {
  if (!context.config.boulder.enabled) {
    return {};
  }

  const state = await context.boulder.load();

  if (!state) {
    return {}; // No previous work to resume
  }

  const hasActiveWork = await context.boulder.hasActiveWork();

  if (!hasActiveWork) {
    // Work was completed but boulder wasn't cleaned
    await context.boulder.clear();
    return {};
  }

  const progress = await context.boulder.getProgress();

  if (!progress) {
    return {};
  }

  return {
    message: `
🔄 RESUMING PREVIOUS WORK

Session: ${state.sessionID}
Plan: ${state.planPath}
Progress: ${progress.current}/${progress.total} steps (${progress.percentage}%)
Started: ${state.createdAt}
Last update: ${state.updatedAt}

Completed todos: ${state.completedTodos.join(', ')}

Ready to continue where you left off.
`.trim(),
    resumeState: {
      planPath: state.planPath,
      currentStep: state.currentStep,
      totalSteps: state.totalSteps,
      sessionID: state.sessionID,
    },
  };
}

/**
 * Create initial boulder state for new work
 */
export async function createInitialState(
  context: PluginContext,
  planPath: string,
  totalSteps: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const sessionID = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  await context.boulder.save({
    version: '1.0',
    planPath,
    sessionID,
    totalSteps,
    currentStep: 0,
    completedTodos: [],
    createdAt: new Date().toISOString(),
    metadata: {
      ...metadata,
      createdBy: 'boulder-resume-hook',
    },
  });
}

/**
 * Get resume instructions for agent
 */
export function getResumeInstructions(
  resumeState: {
    planPath: string;
    currentStep: number;
    totalSteps: number;
    sessionID: string;
  }
): string {
  return `
You are resuming incomplete work from a previous session.

Plan location: ${resumeState.planPath}
Current step: ${resumeState.currentStep}/${resumeState.totalSteps}
Session ID: ${resumeState.sessionID}

Instructions:
1. Read the plan from ${resumeState.planPath}
2. Load boulder state to see completed todos
3. Continue from step ${resumeState.currentStep + 1}
4. Update boulder state after each step
5. Don't stop until all ${resumeState.totalSteps} steps are complete

The completion enforcer will prevent you from stopping early.
`.trim();
}
