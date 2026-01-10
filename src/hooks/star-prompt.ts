/**
 * Star Prompt Hook
 * Asks users to star the repository after successful plugin initialization
 */

import type { HookContext } from '../registry/hooks.js';

const STAR_PROMPT_SHOWN_KEY = 'oh-my-claude-star-prompt-shown';
const GITHUB_REPO = 'https://github.com/BioInfo/oh-my-claude';

/**
 * Check if star prompt was already shown in this session
 */
function hasShownPrompt(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[STAR_PROMPT_SHOWN_KEY] === 'true';
  }
  return false;
}

/**
 * Mark star prompt as shown
 */
function markPromptShown(): void {
  if (typeof process !== 'undefined' && process.env) {
    process.env[STAR_PROMPT_SHOWN_KEY] = 'true';
  }
}

/**
 * Hook to prompt user to star the repository
 */
export async function starPromptHook(
  _data: unknown,
  _context: HookContext
): Promise<void> {
  if (hasShownPrompt()) {
    return;
  }

  markPromptShown();

  console.log('\n⭐ Enjoying oh-my-claude?');
  console.log(`   Star the repository to support the project:`);
  console.log(`   ${GITHUB_REPO}\n`);
}
