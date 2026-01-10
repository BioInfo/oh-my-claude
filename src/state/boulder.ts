/**
 * Boulder State Management
 * Persistent state that survives crashes and enables multi-day project tracking
 */

import { z } from 'zod';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Schema validation for boulder state
export const BoulderStateSchema = z.object({
  version: z.string().default('1.0'),
  planPath: z.string(),
  sessionID: z.string(),
  totalSteps: z.number(),
  currentStep: z.number(),
  completedTodos: z.array(z.number()),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type BoulderState = z.infer<typeof BoulderStateSchema>;

export class BoulderManager {
  private boulderDir: string;
  private boulderPath: string;

  constructor(projectRoot: string, boulderDirName: string = '.keepers') {
    this.boulderDir = join(projectRoot, boulderDirName);
    this.boulderPath = join(this.boulderDir, 'boulder.json');
  }

  /**
   * Initialize boulder directory
   */
  async init(): Promise<void> {
    try {
      await mkdir(this.boulderDir, { recursive: true });
      await mkdir(join(this.boulderDir, 'plans'), { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }
  }

  /**
   * Load boulder state if it exists
   */
  async load(): Promise<BoulderState | null> {
    try {
      const content = await readFile(this.boulderPath, 'utf-8');
      const data = JSON.parse(content);
      return BoulderStateSchema.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save boulder state with validation
   */
  async save(state: Omit<BoulderState, 'updatedAt'>): Promise<void> {
    await this.init();

    const fullState: BoulderState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };

    // Validate before saving
    const validated = BoulderStateSchema.parse(fullState);

    // Create backup before writing
    await this.backup();

    await writeFile(this.boulderPath, JSON.stringify(validated, null, 2));
  }

  /**
   * Update specific fields in boulder state
   */
  async update(
    updates: Partial<Omit<BoulderState, 'version' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const current = await this.load();
    if (!current) {
      throw new Error('No boulder state to update');
    }

    await this.save({
      ...current,
      ...updates,
    });
  }

  /**
   * Create backup of current state
   */
  private async backup(): Promise<void> {
    try {
      const current = await readFile(this.boulderPath, 'utf-8');
      const backupPath = join(
        this.boulderDir,
        `boulder.backup.${Date.now()}.json`
      );
      await writeFile(backupPath, current);

      // Keep only last 5 backups
      await this.cleanupBackups(5);
    } catch (error) {
      // No existing file to backup, that's fine
    }
  }

  /**
   * Clean up old backups, keeping only the most recent N
   */
  private async cleanupBackups(keep: number): Promise<void> {
    try {
      const { readdir, unlink } = await import('fs/promises');
      const files = await readdir(this.boulderDir);
      const backups = files
        .filter((f) => f.startsWith('boulder.backup.'))
        .sort()
        .reverse();

      for (const backup of backups.slice(keep)) {
        await unlink(join(this.boulderDir, backup));
      }
    } catch (error) {
      // Cleanup is best-effort
    }
  }

  /**
   * Clear boulder state (task completed)
   */
  async clear(): Promise<void> {
    try {
      await this.backup();
      const { unlink } = await import('fs/promises');
      await unlink(this.boulderPath);
    } catch (error) {
      // File might not exist, that's fine
    }
  }

  /**
   * Check if there's active work
   */
  async hasActiveWork(): Promise<boolean> {
    const state = await this.load();
    return state !== null && state.currentStep < state.totalSteps;
  }

  /**
   * Get progress summary
   */
  async getProgress(): Promise<{
    current: number;
    total: number;
    percentage: number;
  } | null> {
    const state = await this.load();
    if (!state) return null;

    return {
      current: state.currentStep,
      total: state.totalSteps,
      percentage: Math.round((state.currentStep / state.totalSteps) * 100),
    };
  }
}
