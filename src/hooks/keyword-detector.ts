/**
 * Keyword Detector Hook
 * Detects ultrawork/ulw keywords and activates orchestration mode
 */

import type { PluginContext } from '../index.js';

export interface KeywordDetectorOptions {
  keywords: string[];
  caseSensitive?: boolean;
}

const DEFAULT_KEYWORDS = ['ultrawork', 'ulw', '@plan'];

/**
 * Detect orchestration keywords in user messages
 */
export async function detectKeywords(
  message: string,
  _context: PluginContext,
  options: KeywordDetectorOptions = { keywords: DEFAULT_KEYWORDS }
): Promise<{
  detected: boolean;
  keyword?: string;
  mode?: 'orchestration' | 'planning';
}> {
  const text = options.caseSensitive ? message : message.toLowerCase();
  const keywords = options.caseSensitive
    ? options.keywords
    : options.keywords.map((k) => k.toLowerCase());

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      const mode = keyword === '@plan' ? 'planning' : 'orchestration';
      return { detected: true, keyword, mode };
    }
  }

  return { detected: false };
}

/**
 * Hook handler for message events
 */
export async function onMessage(
  message: { role: string; content: string },
  context: PluginContext
): Promise<{ inject?: string; metadata?: Record<string, unknown> }> {
  if (message.role !== 'user') {
    return {};
  }

  const result = await detectKeywords(message.content, context);

  if (!result.detected) {
    return {};
  }

  if (result.mode === 'planning') {
    return {
      inject: `
[ORCHESTRATION MODE: PLANNING]

Keyword detected: ${result.keyword}

You are now in planning mode. Spawn the Seer agent to create a comprehensive plan.

Instructions:
1. Use Task tool with subagent_type="Task" to spawn Seer
2. Seer will interview the user and create a plan
3. Plan will be saved to .keepers/plans/{name}.md
4. After planning, Warden will execute

Example:
Task(description="Create implementation plan", prompt="Create a comprehensive plan for: {user request}", subagent_type="Task")
`.trim(),
      metadata: {
        orchestrationMode: 'planning',
        keyword: result.keyword,
      },
    };
  }

  return {
    inject: `
[ORCHESTRATION MODE: ULTRAWORK]

Keyword detected: ${result.keyword}

You are now in parallel orchestration mode. This is an extended work session.

The Oh-My-Claude Council is at your command.

Instructions:
1. Spawn Seer to create a plan (if needed)
2. Spawn Warden to execute the plan with aggressive parallelization
3. Delegate to specialist agents for specific tasks
4. Use boulder state to track progress

Key principles:
- MAXIMIZE PARALLELISM: Launch multiple agents concurrently
- PERSISTENT STATE: Update boulder.json after each step
- RELENTLESS COMPLETION: Don't stop until all todos complete
- AGGRESSIVE DELEGATION: Use specialist agents

The Oh-My-Claude Council (orchestration agents):
- Seer (planning) - Divines the path ahead
- Warden (orchestration) - Guards work until completion
- Sage (architecture/debugging) - Ancient wisdom keeper
- Chronicler (documentation/research) - Records knowledge
- Pathfinder (file discovery) - Swift scout

Specialist agents:
- code-reviewer, test-engineer, debugger, batch-editor, security-scanner, etc.

Start by spawning Seer if you need a plan, or Warden if you have one.
`.trim(),
    metadata: {
      orchestrationMode: 'ultrawork',
      keyword: result.keyword,
    },
  };
}
