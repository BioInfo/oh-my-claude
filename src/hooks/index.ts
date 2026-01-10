/**
 * Lifecycle Hooks Export
 */

export { detectKeywords } from './keyword-detector.js';
export { onMessage as keywordDetectorHook } from './keyword-detector.js';
export {
  onIdle as completionEnforcerHook,
  checkCompletion,
} from './completion-enforcer.js';
export {
  onSessionStart as boulderResumeHook,
  createInitialState,
  getResumeInstructions,
} from './boulder-resume.js';
