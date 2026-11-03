import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from '../services/recommendations/recommendationEngine';
import { Concept, ConceptMasteryRecord, Lesson } from '@lumenode/shared-types';

describe('RecommendationEngine (Deterministic DAG Remediation & Next-Step Guidance)', () => {
  const sampleConcepts: Concept[] = [
    {
      id: 'c.types',
      title: 'Primitive Data Types',
      slug: 'c-types',
      description: 'Byte sizing in C',
      subjectId: 'c-lang',
      difficulty: 'beginner',
      prerequisiteConceptIds: [],
      relatedConceptIds: [],
      learningObjectives: ['Types'],
      tags: ['c'],
      implementations: [],
      lessonIds: ['lesson-types'],
      exerciseIds: ['quiz-types'],
    },
    {
      id: 'c.pointers',
      title: 'Pointer Mechanics',
      slug: 'c-pointers',
      description: 'Addresses and dereferencing',
      subjectId: 'c-lang',
      difficulty: 'intermediate',
      prerequisiteConceptIds: ['c.types'],
      relatedConceptIds: [],
      learningObjectives: ['Pointers'],
      tags: ['c', 'memory'],
      implementations: [],
      lessonIds: ['lesson-pointers'],
      exerciseIds: ['quiz-pointers'],
    },
    {
      id: 'dsa.linked-list',
      title: 'Singly Linked Lists',
      slug: 'dsa-linked-list',
      description: 'Heap linked nodes',
      subjectId: 'dsa',
      difficulty: 'intermediate',
      prerequisiteConceptIds: ['c.pointers'],
      relatedConceptIds: [],
      learningObjectives: ['Linked lists'],
      tags: ['dsa'],
      implementations: [],
      lessonIds: ['lesson-linked-list'],
      exerciseIds: ['quiz-linked-list'],
    },
  ];

  const sampleLessons: Lesson[] = [
    {
      id: 'lesson-types',
      conceptId: 'c.types',
      title: 'Types Lesson',
      slug: 'types-lesson',
      summary: 'Desc',
      difficulty: 'beginner',
      estimatedMinutes: 10,
      order: 1,
      version: '1.0.0',
      learningObjectives: ['O1', 'O2', 'O3'],
      sections: [],
    },
    {
      id: 'lesson-pointers',
      conceptId: 'c.pointers',
      title: 'Pointers Lesson',
      slug: 'pointers-lesson',
      summary: 'Desc',
      difficulty: 'intermediate',
      estimatedMinutes: 15,
      order: 2,
      version: '1.0.0',
      learningObjectives: ['O1', 'O2', 'O3'],
      sections: [],
    },
    {
      id: 'lesson-linked-list',
      conceptId: 'dsa.linked-list',
      title: 'Linked List Lesson',
      slug: 'linked-list-lesson',
      summary: 'Desc',
      difficulty: 'intermediate',
      estimatedMinutes: 20,
      order: 3,
      version: '1.0.0',
      learningObjectives: ['O1', 'O2', 'O3'],
      sections: [],
    },
  ];

  it('recommends foundational prerequisite remediation when struggling with a downstream concept', () => {
    const masteryRecords: Record<string, ConceptMasteryRecord> = {
      'dsa.linked-list': {
        conceptId: 'dsa.linked-list',
        state: 'needs_review',
        lessonCompleted: true,
        attemptsCount: 2,
        passedCount: 0,
        consecutivePasses: 0,
        bestScore: 30,
        lastScore: 30,
        decayAlert: false,
        evidenceHistory: [],
      },
      'c.pointers': {
        conceptId: 'c.pointers',
        state: 'learning',
        lessonCompleted: true,
        attemptsCount: 0,
        passedCount: 0,
        consecutivePasses: 0,
        bestScore: 0,
        lastScore: 0,
        decayAlert: false,
        evidenceHistory: [],
      },
    };

    const recs = RecommendationEngine.generateRecommendations(masteryRecords, sampleConcepts, sampleLessons);
    expect(recs.length).toBeGreaterThan(0);

    const remediationRec = recs.find((r) => r.type === 'prerequisite_remediation');
    expect(remediationRec).toBeDefined();
    expect(remediationRec?.conceptId).toBe('c.pointers');
    expect(remediationRec?.urgency).toBe('high');
    expect(remediationRec?.reason).toContain('Singly Linked Lists');
    expect(remediationRec?.reason).toContain('Pointer Mechanics');
  });

  it('suggests next in path when all prerequisites are satisfied', () => {
    const masteryRecords: Record<string, ConceptMasteryRecord> = {
      'c.types': {
        conceptId: 'c.types',
        state: 'demonstrated',
        lessonCompleted: true,
        attemptsCount: 2,
        passedCount: 2,
        consecutivePasses: 2,
        bestScore: 100,
        lastScore: 100,
        decayAlert: false,
        evidenceHistory: [],
      },
    };

    const recs = RecommendationEngine.generateRecommendations(masteryRecords, sampleConcepts, sampleLessons);
    const nextRec = recs.find((r) => r.conceptId === 'c.pointers' && r.type === 'next_in_path');
    expect(nextRec).toBeDefined();
    expect(nextRec?.reason).toContain('satisfied all prerequisites');
  });

  it('suggests practice reinforcement for concepts in practicing status', () => {
    const masteryRecords: Record<string, ConceptMasteryRecord> = {
      'c.types': {
        conceptId: 'c.types',
        state: 'practicing',
        lessonCompleted: true,
        attemptsCount: 1,
        passedCount: 1,
        consecutivePasses: 1,
        bestScore: 75,
        lastScore: 75,
        decayAlert: false,
        evidenceHistory: [],
      },
    };

    const recs = RecommendationEngine.generateRecommendations(masteryRecords, sampleConcepts, sampleLessons);
    const reinforceRec = recs.find((r) => r.conceptId === 'c.types' && r.type === 'practice_reinforcement');
    expect(reinforceRec).toBeDefined();
    expect(reinforceRec?.reason).toContain('Pass 1 more exercise');
  });
});
