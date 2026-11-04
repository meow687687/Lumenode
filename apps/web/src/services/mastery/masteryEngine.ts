/**
 * Deterministic Mastery Tracking Model.
 * Implements rule-based concept mastery state transitions with evidence tracking,
 * separation of achievement vs retention status, and spaced-repetition schedules.
 *
 * Achievement Levels:
 * - unattempted: No lesson completed, no exercises attempted.
 * - introduced: Lesson completed or initial unpassed attempts.
 * - practicing: At least 1 passed attempt with >= 70% score.
 * - mastered: Demonstrated mastery (>= 2 consecutive passes with >= 80% score).
 *
 * Retention Statuses:
 * - fresh: Concepts whose spaced repetition review date is in the future.
 * - due: Concepts scheduled for review today.
 * - overdue: Concepts past their review window without practice.
 *
 * Composite Mastery State (for backward compatibility):
 * - not_started: No lesson completed, no exercises attempted.
 * - learning: In-progress introductory study.
 * - practicing: Active exercise practice.
 * - demonstrated: Mastered with fresh retention.
 * - needs_review: Demonstrated concept with subsequent failed check or review due.
 */

import {
  MasteryState,
  AchievementLevel,
  RetentionStatus,
  ConceptMasteryRecord,
  ExerciseAttempt,
  ExerciseType,
} from '@lumenode/shared-types';

export class MasteryEngine {
  public static readonly DECAY_THRESHOLD_DAYS = 14;
  public static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;
  public static readonly SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30] as const;

  public static createDefaultRecord(conceptId: string): ConceptMasteryRecord {
    return {
      conceptId,
      state: 'not_started',
      achievementLevel: 'unattempted',
      retentionStatus: 'fresh',
      reviewIntervalDays: 1,
      reviewStreak: 0,
      lessonCompleted: false,
      attemptsCount: 0,
      passedCount: 0,
      consecutivePasses: 0,
      bestScore: 0,
      lastScore: 0,
      decayAlert: false,
      evidenceHistory: [],
    };
  }

  /**
   * Evaluates the permanent achievement tier based on verifiable evidence.
   */
  public static computeAchievementLevel(record: ConceptMasteryRecord): AchievementLevel {
    const { lessonCompleted, attemptsCount, passedCount, consecutivePasses, lastScore, demonstratedAt } = record;

    if (demonstratedAt || (passedCount >= 2 && consecutivePasses >= 2 && lastScore >= 80)) {
      return 'mastered';
    }
    if (passedCount >= 1 && lastScore >= 70) {
      return 'practicing';
    }
    if (lessonCompleted || attemptsCount > 0) {
      return 'introduced';
    }
    return 'unattempted';
  }

  /**
   * Evaluates retention status based on spaced repetition review schedule.
   */
  public static computeRetentionStatus(
    record: ConceptMasteryRecord,
    currentTime: number = Date.now()
  ): RetentionStatus {
    const { nextReviewAt, reviewIntervalDays, demonstratedAt, lastAttemptAt } = record;

    if (nextReviewAt) {
      const intervalMs = (reviewIntervalDays || 1) * this.MS_PER_DAY;
      if (currentTime < nextReviewAt) {
        return 'fresh';
      }
      if (currentTime < nextReviewAt + intervalMs) {
        return 'due';
      }
      return 'overdue';
    }

    // Fallback if nextReviewAt not initialized yet but concept was demonstrated
    if (demonstratedAt && lastAttemptAt) {
      const daysSinceAttempt = (currentTime - lastAttemptAt) / this.MS_PER_DAY;
      if (daysSinceAttempt > this.DECAY_THRESHOLD_DAYS) {
        return 'due';
      }
    }

    return 'fresh';
  }

  /**
   * Pure evaluation function: computes the composite mastery state based on transparent evidence rules.
   * Preserves backward compatibility while respecting achievement vs retention separation.
   */
  public static computeMasteryState(
    record: ConceptMasteryRecord,
    currentTime: number = Date.now()
  ): MasteryState {
    const {
      lessonCompleted,
      attemptsCount,
      passedCount,
      consecutivePasses,
      lastScore,
      lastAttemptAt,
      demonstratedAt,
      nextReviewAt,
    } = record;

    if (!lessonCompleted && attemptsCount === 0) {
      return 'not_started';
    }

    // Check decay if concept was previously demonstrated
    if (demonstratedAt && lastAttemptAt) {
      const daysSinceAttempt = (currentTime - lastAttemptAt) / this.MS_PER_DAY;
      if (daysSinceAttempt > this.DECAY_THRESHOLD_DAYS) {
        return 'needs_review';
      }
      if (nextReviewAt && currentTime >= nextReviewAt) {
        return 'needs_review';
      }
      if (attemptsCount > 0 && lastScore < 60) {
        return 'needs_review';
      }
    }

    // Criteria for Demonstrated Mastery:
    // Requires >= 2 passed attempts with consecutivePasses >= 2 and lastScore >= 80,
    // OR previously demonstrated with fresh retention and score >= 60.
    if (passedCount >= 2 && consecutivePasses >= 2 && lastScore >= 80) {
      return 'demonstrated';
    }

    // Criteria for Practicing:
    // At least 1 passed attempt with score >= 70
    if (passedCount >= 1 && lastScore >= 70) {
      return 'practicing';
    }

    // Otherwise, learning in progress
    return 'learning';
  }

  /**
   * Records a lesson completion event
   */
  public static recordLessonCompletion(
    record: ConceptMasteryRecord,
    timestamp: number = Date.now()
  ): ConceptMasteryRecord {
    const updated: ConceptMasteryRecord = {
      ...record,
      lessonCompleted: true,
      lastAttemptAt: timestamp,
    };
    updated.achievementLevel = this.computeAchievementLevel(updated);
    updated.retentionStatus = this.computeRetentionStatus(updated, timestamp);
    updated.state = this.computeMasteryState(updated, timestamp);
    return updated;
  }

  /**
   * Records an exercise or assessment attempt with spaced repetition interval adjustments.
   */
  public static recordExerciseAttempt(
    record: ConceptMasteryRecord,
    attempt: {
      exerciseId: string;
      type: ExerciseType;
      passed: boolean;
      score: number;
      hintsUsed?: number;
      feedback?: string;
      userAnswer?: unknown;
    },
    timestamp: number = Date.now()
  ): ConceptMasteryRecord {
    const newAttempt: ExerciseAttempt = {
      attemptId: `att-${timestamp}-${Math.floor(Math.random() * 1000)}`,
      exerciseId: attempt.exerciseId,
      conceptId: record.conceptId,
      type: attempt.type,
      passed: attempt.passed,
      score: attempt.score,
      hintsUsed: attempt.hintsUsed ?? 0,
      userAnswer: attempt.userAnswer,
      feedback: attempt.feedback,
      timestamp,
    };

    const newAttemptsCount = record.attemptsCount + 1;
    const newPassedCount = attempt.passed ? record.passedCount + 1 : record.passedCount;
    const newConsecutivePasses = attempt.passed ? record.consecutivePasses + 1 : 0;
    const newBestScore = Math.max(record.bestScore, attempt.score);

    // Calculate Spaced Repetition interval
    let reviewStreak = record.reviewStreak ?? 0;
    let reviewIntervalDays: number;
    let nextReviewAt: number;

    if (attempt.passed && attempt.score >= 70) {
      reviewStreak += 1;
      const intervalIdx = Math.min(reviewStreak - 1, this.SPACED_REPETITION_INTERVALS.length - 1);
      reviewIntervalDays = this.SPACED_REPETITION_INTERVALS[intervalIdx];
      nextReviewAt = timestamp + reviewIntervalDays * this.MS_PER_DAY;
    } else {
      // Review struggle / failure resets streak to 0, schedule 1-day check
      reviewStreak = 0;
      reviewIntervalDays = this.SPACED_REPETITION_INTERVALS[0]; // 1 day
      nextReviewAt = timestamp + reviewIntervalDays * this.MS_PER_DAY;
    }

    const updated: ConceptMasteryRecord = {
      ...record,
      attemptsCount: newAttemptsCount,
      passedCount: newPassedCount,
      consecutivePasses: newConsecutivePasses,
      bestScore: newBestScore,
      lastScore: attempt.score,
      lastAttemptAt: timestamp,
      reviewStreak,
      reviewIntervalDays,
      nextReviewAt,
      evidenceHistory: [...record.evidenceHistory, newAttempt],
    };

    const nextState = this.computeMasteryState(updated, timestamp);
    if (nextState === 'demonstrated' && !updated.demonstratedAt) {
      updated.demonstratedAt = timestamp;
    }

    updated.achievementLevel = this.computeAchievementLevel(updated);
    updated.retentionStatus = this.computeRetentionStatus(updated, timestamp);
    updated.state = nextState;
    updated.decayAlert = nextState === 'needs_review';

    return updated;
  }
}
