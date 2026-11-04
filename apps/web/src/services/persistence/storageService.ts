/**
 * Local-First Data Persistence, Versioning & Migration Service.
 * Supports V1 -> V2 schema migration, JSON learner backup export/import,
 * and reliable offline storage.
 */

import {
  LearnerProfileSnapshot,
  LearnerProfileSnapshotSchema,
  ConceptMasteryRecord,
  Bookmark,
} from '@lumenode/shared-types';
import { MasteryEngine } from '../mastery/masteryEngine';

export const CURRENT_STORAGE_VERSION = 2;

export const STORAGE_KEYS = {
  VERSION: 'lumenode_schema_version',
  COMPLETED_LESSONS: 'lumenode_completed_lessons_v2',
  BOOKMARKS: 'lumenode_bookmarks_v2',
  MASTERY_RECORDS: 'lumenode_mastery_records_v2',
  ACTIVE_LESSON: 'lumenode_active_lesson_v2',
  // Legacy V1 keys for migration
  LEGACY_COMPLETED: 'lumenode_completed_lessons_v1',
  LEGACY_QUIZ_SCORES: 'lumenode_quiz_scores_v1',
  LEGACY_BOOKMARKS: 'lumenode_bookmarks_v1',
  LEGACY_ACTIVE: 'lumenode_active_lesson_v1',
};

export class StorageService {
  /**
   * Initializes storage and automatically applies migrations if necessary.
   */
  public static initialize(): {
    completedLessons: Set<string>;
    bookmarks: Bookmark[];
    masteryRecords: Record<string, ConceptMasteryRecord>;
    activeLessonId: string;
  } {
    const rawVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

    if (
      rawVersion === '1' ||
      (!rawVersion && localStorage.getItem(STORAGE_KEYS.LEGACY_COMPLETED) !== null)
    ) {
      this.migrateFromV1();
    } else if (!rawVersion) {
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION.toString());
    }

    // Load V2 data
    let completedLessons = new Set<string>();
    let bookmarks: Bookmark[] = [];
    let masteryRecords: Record<string, ConceptMasteryRecord> = {};
    let activeLessonId = 'c-pointers-basics';

    try {
      const savedCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
      if (savedCompleted) {
        completedLessons = new Set(JSON.parse(savedCompleted));
      }

      const savedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (savedBookmarks) {
        bookmarks = JSON.parse(savedBookmarks);
      }

      const savedMastery = localStorage.getItem(STORAGE_KEYS.MASTERY_RECORDS);
      if (savedMastery) {
        const parsed: Record<string, ConceptMasteryRecord> = JSON.parse(savedMastery);
        for (const [k, v] of Object.entries(parsed)) {
          if (!v.achievementLevel) {
            v.achievementLevel = MasteryEngine.computeAchievementLevel(v);
          }
          if (!v.retentionStatus) {
            v.retentionStatus = MasteryEngine.computeRetentionStatus(v);
          }
          if (!v.reviewIntervalDays) {
            v.reviewIntervalDays = 1;
          }
          if (v.reviewStreak === undefined) {
            v.reviewStreak = 0;
          }
          parsed[k] = v;
        }
        masteryRecords = parsed;
      }

      const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_LESSON);
      if (savedActive) {
        activeLessonId = savedActive;
      }
    } catch (e) {
      console.warn('StorageService: Error loading V2 storage', e);
    }

    return { completedLessons, bookmarks, masteryRecords, activeLessonId };
  }

  /**
   * Auto-migrates legacy V1 data to V2 schema.
   */
  public static migrateFromV1(): void {
    try {
      // 1. Read legacy completed lessons
      const legacyCompletedRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_COMPLETED);
      const completedList: string[] = legacyCompletedRaw ? JSON.parse(legacyCompletedRaw) : [];

      // 2. Read legacy quiz scores
      const legacyScoresRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_QUIZ_SCORES);
      const quizScores: Record<string, { score: number; passed: boolean }> = legacyScoresRaw
        ? JSON.parse(legacyScoresRaw)
        : {};

      // 3. Read legacy bookmarks
      const legacyBookmarksRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_BOOKMARKS);
      const bookmarks: Bookmark[] = legacyBookmarksRaw ? JSON.parse(legacyBookmarksRaw) : [];

      // 4. Transform into V2 mastery records
      const masteryRecords: Record<string, ConceptMasteryRecord> = {};
      const now = Date.now();

      Object.entries(quizScores).forEach(([exerciseId, data]) => {
        // Concept ID heuristic or default
        const conceptId = exerciseId.replace('quiz-', '').replace(/-[0-9]+$/, '');
        let record = masteryRecords[conceptId] || MasteryEngine.createDefaultRecord(conceptId);

        record = MasteryEngine.recordExerciseAttempt(
          record,
          {
            exerciseId,
            type: 'mcq',
            passed: data.passed,
            score: data.score,
          },
          now
        );
        masteryRecords[conceptId] = record;
      });

      // Save to V2 keys
      localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(completedList));
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      localStorage.setItem(STORAGE_KEYS.MASTERY_RECORDS, JSON.stringify(masteryRecords));
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION.toString());
    } catch (e) {
      console.warn('StorageService: Migration from V1 failed', e);
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION.toString());
    }
  }

  public static saveCompletedLessons(completed: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(Array.from(completed)));
    } catch (e) {
      console.warn('Failed saving completed lessons', e);
    }
  }

  public static saveBookmarks(bookmarks: Bookmark[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed saving bookmarks', e);
    }
  }

  public static saveMasteryRecords(records: Record<string, ConceptMasteryRecord>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MASTERY_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed saving mastery records', e);
    }
  }

  public static saveActiveLessonId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LESSON, id);
    } catch (e) {
      console.warn('Failed saving active lesson', e);
    }
  }

  /**
   * Export learner progress as a downloadable JSON backup snapshot.
   */
  public static exportLearnerBackup(): LearnerProfileSnapshot {
    const { completedLessons, bookmarks, masteryRecords, activeLessonId } = this.initialize();

    const snapshot: LearnerProfileSnapshot = {
      version: CURRENT_STORAGE_VERSION,
      exportedAt: Date.now(),
      completedLessons: Array.from(completedLessons),
      bookmarks,
      masteryRecords,
      activeLessonId,
    };

    return snapshot;
  }

  /**
   * Imports learner progress from a validated JSON backup.
   */
  public static importLearnerBackup(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = LearnerProfileSnapshotSchema.parse(parsed);

      this.saveCompletedLessons(new Set(validated.completedLessons));
      this.saveBookmarks(validated.bookmarks);
      this.saveMasteryRecords(validated.masteryRecords);
      this.saveActiveLessonId(validated.activeLessonId);
      localStorage.setItem(STORAGE_KEYS.VERSION, validated.version.toString());

      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Invalid backup JSON file',
      };
    }
  }

  public static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Failed clearing storage', e);
    }
  }
}
