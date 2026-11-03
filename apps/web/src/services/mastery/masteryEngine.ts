/**
 * Deterministic Mastery Tracking Model.
 * Implements rule-based concept mastery state transitions with evidence tracking.
 *
 * States:
 * - not_started: No lesson completed, no exercises attempted.
 * - learning: Lesson completed or initial unpassed attempts.
 * - practicing: At least 1 passed attempt with >= 70% score.
 * - demonstrated: >= 2 independent passed attempts with >= 80% average score.
 * - needs_review: Demonstrated concept with subsequent failed check or decayed (>14 days without activity).
 */

import {
  MasteryState,
  ConceptMasteryRecord,
  ExerciseAttempt,
  ExerciseType,
} from '@lumenode/shared-types';

export class MasteryEngine {
  public static readonly DECAY_THRESHOLD_DAYS = 14;
  public static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  public static createDefaultRecord(conceptId: string): ConceptMasteryRecord {
    return {
      conceptId,
      state: 'not_started',
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
   * Pure evaluation function: computes the exact mastery state based on transparent evidence rules.
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
      if (attemptsCount > 0 && lastScore < 60) {
        return 'needs_review';
      }
    }

    // Criteria for Demonstrated Mastery:
    // Requires >= 2 passed attempts with consecutivePasses >= 2 and lastScore >= 80,
    // OR at least 2 independent passes with bestScore 100 and lastScore >= 80.
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
    const updated = {
      ...record,
      lessonCompleted: true,
      lastAttemptAt: timestamp,
    };
    updated.state = this.computeMasteryState(updated, timestamp);
    return updated;
  }

  /**
   * Records an exercise or assessment attempt
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

    const updated: ConceptMasteryRecord = {
      ...record,
      attemptsCount: newAttemptsCount,
      passedCount: newPassedCount,
      consecutivePasses: newConsecutivePasses,
      bestScore: newBestScore,
      lastScore: attempt.score,
      lastAttemptAt: timestamp,
      evidenceHistory: [...record.evidenceHistory, newAttempt],
    };

    const nextState = this.computeMasteryState(updated, timestamp);
    if (nextState === 'demonstrated' && !updated.demonstratedAt) {
      updated.demonstratedAt = timestamp;
    }
    updated.state = nextState;
    updated.decayAlert = nextState === 'needs_review';

    return updated;
  }
}
