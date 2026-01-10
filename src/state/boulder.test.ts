/**
 * Boulder State Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BoulderManager } from './boulder.js';
import { rm, mkdir } from 'fs/promises';
import { join } from 'path';

const TEST_DIR = join(process.cwd(), '.test-boulder');

describe('BoulderManager', () => {
  let boulder: BoulderManager;

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    boulder = new BoulderManager(TEST_DIR);
    await boulder.init();
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should initialize boulder directory', async () => {
    await boulder.init();
    // Should not throw
    expect(true).toBe(true);
  });

  it('should save and load boulder state', async () => {
    const state = {
      version: '1.0' as const,
      planPath: '.keepers/plans/test.md',
      sessionID: 'test-session',
      totalSteps: 10,
      currentStep: 3,
      completedTodos: [1, 2, 3],
      createdAt: new Date().toISOString(),
    };

    await boulder.save(state);
    const loaded = await boulder.load();

    expect(loaded).toBeTruthy();
    expect(loaded?.sessionID).toBe('test-session');
    expect(loaded?.totalSteps).toBe(10);
    expect(loaded?.currentStep).toBe(3);
    expect(loaded?.completedTodos).toEqual([1, 2, 3]);
  });

  it('should return null when no state exists', async () => {
    const loaded = await boulder.load();
    expect(loaded).toBeNull();
  });

  it('should update existing state', async () => {
    const initial = {
      version: '1.0' as const,
      planPath: '.keepers/plans/test.md',
      sessionID: 'test-session',
      totalSteps: 10,
      currentStep: 3,
      completedTodos: [1, 2, 3],
      createdAt: new Date().toISOString(),
    };

    await boulder.save(initial);
    await boulder.update({
      currentStep: 5,
      completedTodos: [1, 2, 3, 4, 5],
    });

    const loaded = await boulder.load();
    expect(loaded?.currentStep).toBe(5);
    expect(loaded?.completedTodos).toEqual([1, 2, 3, 4, 5]);
  });

  it('should detect active work', async () => {
    expect(await boulder.hasActiveWork()).toBe(false);

    await boulder.save({
      version: '1.0' as const,
      planPath: '.keepers/plans/test.md',
      sessionID: 'test-session',
      totalSteps: 10,
      currentStep: 3,
      completedTodos: [1, 2, 3],
      createdAt: new Date().toISOString(),
    });

    expect(await boulder.hasActiveWork()).toBe(true);
  });

  it('should calculate progress correctly', async () => {
    await boulder.save({
      version: '1.0' as const,
      planPath: '.keepers/plans/test.md',
      sessionID: 'test-session',
      totalSteps: 10,
      currentStep: 3,
      completedTodos: [1, 2, 3],
      createdAt: new Date().toISOString(),
    });

    const progress = await boulder.getProgress();
    expect(progress?.current).toBe(3);
    expect(progress?.total).toBe(10);
    expect(progress?.percentage).toBe(30);
  });

  it('should clear boulder state', async () => {
    await boulder.save({
      version: '1.0' as const,
      planPath: '.keepers/plans/test.md',
      sessionID: 'test-session',
      totalSteps: 10,
      currentStep: 10,
      completedTodos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      createdAt: new Date().toISOString(),
    });

    await boulder.clear();
    const loaded = await boulder.load();
    expect(loaded).toBeNull();
  });
});
