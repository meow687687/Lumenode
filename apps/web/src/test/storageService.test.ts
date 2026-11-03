import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, STORAGE_KEYS, CURRENT_STORAGE_VERSION } from '../services/persistence/storageService';

describe('StorageService (Persistence, Migration & Backup Export/Import)', () => {
  beforeEach(() => {
    StorageService.clearAll();
  });

  it('migrates legacy V1 data to V2 schema with mastery records', () => {
    // Populate legacy V1 localStorage
    localStorage.setItem(STORAGE_KEYS.LEGACY_COMPLETED, JSON.stringify(['c-pointers-basics', 'c-dynamic-memory']));
    localStorage.setItem(
      STORAGE_KEYS.LEGACY_QUIZ_SCORES,
      JSON.stringify({
        'quiz-c-pointers': { score: 100, passed: true },
        'quiz-c-dynamic-mem': { score: 0, passed: false },
      })
    );
    localStorage.setItem(STORAGE_KEYS.VERSION, '1');

    // Run initialize to trigger migration
    const state = StorageService.initialize();

    expect(state.completedLessons.has('c-pointers-basics')).toBe(true);
    expect(state.completedLessons.has('c-dynamic-memory')).toBe(true);
    expect(state.masteryRecords['c-pointers']).toBeDefined();
    expect(state.masteryRecords['c-pointers'].passedCount).toBe(1);

    expect(localStorage.getItem(STORAGE_KEYS.VERSION)).toBe(CURRENT_STORAGE_VERSION.toString());
  });

  it('exports learner profile and re-imports successfully with validation', () => {
    const completed = new Set(['lesson-1', 'lesson-2']);
    StorageService.saveCompletedLessons(completed);

    const snapshot = StorageService.exportLearnerBackup();
    expect(snapshot.version).toBe(CURRENT_STORAGE_VERSION);
    expect(snapshot.completedLessons).toEqual(['lesson-1', 'lesson-2']);

    // Wipe storage
    StorageService.clearAll();
    const emptyState = StorageService.initialize();
    expect(emptyState.completedLessons.size).toBe(0);

    // Re-import
    const importRes = StorageService.importLearnerBackup(JSON.stringify(snapshot));
    expect(importRes.success).toBe(true);

    const restoredState = StorageService.initialize();
    expect(restoredState.completedLessons.has('lesson-1')).toBe(true);
    expect(restoredState.completedLessons.has('lesson-2')).toBe(true);
  });

  it('rejects invalid JSON backup import gracefully', () => {
    const invalidJson = '{"not": "a valid snapshot"}';
    const importRes = StorageService.importLearnerBackup(invalidJson);
    expect(importRes.success).toBe(false);
    expect(importRes.error).toBeDefined();
  });
});
