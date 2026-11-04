import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateNormalizedGain,
  saveAssessmentSession,
  getAssessmentSession,
  getConceptEffectiveness,
} from '../services/learningEffectivenessEngine';
import { CONCEPT_EFFECTIVENESS_ASSESSMENTS } from '../data/learningEffectiveness';
import { ConceptAssessmentSession } from '@lumenode/shared-types';

describe('Learning Effectiveness Engine & Normalized Gain (Workstream 6B)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('contains validated evaluation sets for all 5 core concepts', () => {
    const conceptKeys = Object.keys(CONCEPT_EFFECTIVENESS_ASSESSMENTS);
    expect(conceptKeys).toEqual(
      expect.arrayContaining([
        'memory.pointers-intro',
        'dsa.singly-linked-list',
        'dsa.binary-search',
        'cpp.inheritance',
        'dbms.joins',
      ])
    );

    conceptKeys.forEach((key) => {
      const item = CONCEPT_EFFECTIVENESS_ASSESSMENTS[key];
      expect(item.preQuestions.length).toBeGreaterThanOrEqual(3);
      expect(item.postQuestions.length).toBeGreaterThanOrEqual(3);
      expect(item.retentionQuestions.length).toBeGreaterThanOrEqual(3);

      // Verify question options and answers are valid
      item.preQuestions.forEach((q) => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      });
    });
  });

  it('calculates Hake normalized gain correctly for high gain scenario', () => {
    // Pre-score: 20%, Post-score: 80%
    // g = (80 - 20) / (100 - 20) = 60 / 80 = 0.75 (high_gain)
    const preSession: ConceptAssessmentSession = {
      id: 'pre-1',
      conceptId: 'memory.pointers-intro',
      stage: 'pre_assessment',
      scorePercent: 20,
      completedAt: Date.now() - 100000,
      responses: [
        { questionId: 'q1', selectedOptionIndex: 0, isCorrect: false, confidence: 'low', timeSpentMs: 2000 },
        { questionId: 'q2', selectedOptionIndex: 1, isCorrect: true, confidence: 'medium', timeSpentMs: 2000 },
      ],
    };

    const postSession: ConceptAssessmentSession = {
      id: 'post-1',
      conceptId: 'memory.pointers-intro',
      stage: 'post_assessment',
      scorePercent: 80,
      completedAt: Date.now(),
      responses: [
        { questionId: 'q1', selectedOptionIndex: 1, isCorrect: true, confidence: 'high', timeSpentMs: 1500 },
        { questionId: 'q2', selectedOptionIndex: 1, isCorrect: true, confidence: 'high', timeSpentMs: 1500 },
      ],
    };

    const result = calculateNormalizedGain('memory.pointers-intro', preSession, postSession);
    expect(result.preScore).toBe(20);
    expect(result.postScore).toBe(80);
    expect(result.normalizedGain).toBe(0.75);
    expect(result.effectCategory).toBe('high_gain');
    expect(result.confidenceShift).toBeGreaterThan(0);
  });

  it('calculates medium gain correctly', () => {
    // Pre-score: 40%, Post-score: 70%
    // g = (70 - 40) / (100 - 40) = 30 / 60 = 0.5 (medium_gain)
    const preSession: ConceptAssessmentSession = {
      id: 'pre-2',
      conceptId: 'dsa.binary-search',
      stage: 'pre_assessment',
      scorePercent: 40,
      completedAt: Date.now() - 50000,
      responses: [],
    };

    const postSession: ConceptAssessmentSession = {
      id: 'post-2',
      conceptId: 'dsa.binary-search',
      stage: 'post_assessment',
      scorePercent: 70,
      completedAt: Date.now(),
      responses: [],
    };

    const result = calculateNormalizedGain('dsa.binary-search', preSession, postSession);
    expect(result.normalizedGain).toBe(0.5);
    expect(result.effectCategory).toBe('medium_gain');
  });

  it('calculates retention loss when delayed retention check is performed', () => {
    const preSession: ConceptAssessmentSession = {
      id: 'pre-3',
      conceptId: 'dbms.joins',
      stage: 'pre_assessment',
      scorePercent: 30,
      completedAt: Date.now() - 200000,
      responses: [],
    };

    const postSession: ConceptAssessmentSession = {
      id: 'post-3',
      conceptId: 'dbms.joins',
      stage: 'post_assessment',
      scorePercent: 100,
      completedAt: Date.now() - 100000,
      responses: [],
    };

    const retSession: ConceptAssessmentSession = {
      id: 'ret-3',
      conceptId: 'dbms.joins',
      stage: 'retention_assessment',
      scorePercent: 90,
      completedAt: Date.now(),
      responses: [],
    };

    const result = calculateNormalizedGain('dbms.joins', preSession, postSession, retSession);
    expect(result.normalizedGain).toBe(1);
    expect(result.retentionScore).toBe(90);
    expect(result.normalizedRetentionLoss).toBe(0.1); // (100 - 90) / 100 = 0.10
  });

  it('persists and retrieves assessment sessions via localStorage', () => {
    const session: ConceptAssessmentSession = {
      id: 'sess-save-1',
      conceptId: 'cpp.inheritance',
      stage: 'pre_assessment',
      scorePercent: 66,
      completedAt: Date.now(),
      responses: [],
    };

    saveAssessmentSession(session);
    const retrieved = getAssessmentSession('cpp.inheritance', 'pre_assessment');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.scorePercent).toBe(66);
    expect(getConceptEffectiveness('cpp.inheritance')).toBeNull(); // post not yet done
  });
});
