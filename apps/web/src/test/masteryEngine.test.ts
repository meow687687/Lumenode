import { describe, it, expect } from 'vitest';
import { MasteryEngine } from '../services/mastery/masteryEngine';

describe('MasteryEngine (Concept Mastery State Machine)', () => {
  it('initializes default record in not_started state', () => {
    const record = MasteryEngine.createDefaultRecord('dsa.singly-linked-list');
    expect(record.state).toBe('not_started');
    expect(record.attemptsCount).toBe(0);
    expect(record.passedCount).toBe(0);
  });

  it('transitions to learning state when lesson is completed', () => {
    let record = MasteryEngine.createDefaultRecord('dsa.singly-linked-list');
    record = MasteryEngine.recordLessonCompletion(record);

    expect(record.lessonCompleted).toBe(true);
    expect(record.state).toBe('learning');
  });

  it('transitions to practicing state when first exercise passes with score >= 70', () => {
    let record = MasteryEngine.createDefaultRecord('c.pointers');
    record = MasteryEngine.recordLessonCompletion(record);

    record = MasteryEngine.recordExerciseAttempt(record, {
      exerciseId: 'quiz-c-pointers',
      type: 'predict_output',
      passed: true,
      score: 85,
    });

    expect(record.state).toBe('practicing');
    expect(record.passedCount).toBe(1);
    expect(record.bestScore).toBe(85);
  });

  it('transitions to demonstrated state after 2 consecutive high passes', () => {
    let record = MasteryEngine.createDefaultRecord('c.pointers');
    record = MasteryEngine.recordLessonCompletion(record);

    // Attempt 1: passed with 85
    record = MasteryEngine.recordExerciseAttempt(record, {
      exerciseId: 'quiz-c-pointers-1',
      type: 'predict_output',
      passed: true,
      score: 85,
    });
    expect(record.state).toBe('practicing');

    // Attempt 2: passed with 95
    record = MasteryEngine.recordExerciseAttempt(record, {
      exerciseId: 'quiz-c-pointers-2',
      type: 'find_error',
      passed: true,
      score: 95,
    });

    expect(record.state).toBe('demonstrated');
    expect(record.consecutivePasses).toBe(2);
    expect(record.demonstratedAt).toBeDefined();
  });

  it('transitions to needs_review when demonstrated concept has decayed > 14 days', () => {
    let record = MasteryEngine.createDefaultRecord('dbms.indexing-btree');
    record = MasteryEngine.recordLessonCompletion(record, 1000);

    // Pass 1 and Pass 2
    record = MasteryEngine.recordExerciseAttempt(
      record,
      { exerciseId: 'q1', type: 'mcq', passed: true, score: 90 },
      2000
    );
    record = MasteryEngine.recordExerciseAttempt(
      record,
      { exerciseId: 'q2', type: 'predict_output', passed: true, score: 90 },
      3000
    );
    expect(record.state).toBe('demonstrated');

    // Fast-forward 15 days later (15 * 86400 * 1000 = 1,296,000,000 ms)
    const futureTime = 3000 + 15 * 24 * 60 * 60 * 1000;
    const evaluatedState = MasteryEngine.computeMasteryState(record, futureTime);
    expect(evaluatedState).toBe('needs_review');
  });

  it('transitions to needs_review if demonstrated concept fails a subsequent check', () => {
    let record = MasteryEngine.createDefaultRecord('dbms.indexing-btree');
    record = MasteryEngine.recordLessonCompletion(record);
    record = MasteryEngine.recordExerciseAttempt(record, { exerciseId: 'q1', type: 'mcq', passed: true, score: 90 });
    record = MasteryEngine.recordExerciseAttempt(record, { exerciseId: 'q2', type: 'mcq', passed: true, score: 90 });
    expect(record.state).toBe('demonstrated');

    // Subsequent fail
    record = MasteryEngine.recordExerciseAttempt(record, { exerciseId: 'q3', type: 'find_error', passed: false, score: 40 });
    expect(record.state).toBe('needs_review');
  });
});
