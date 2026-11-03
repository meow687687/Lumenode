import { describe, it, expect } from 'vitest';
import { 
  LessonSchema, 
  SubjectSchema, 
  safeValidateLesson,
  ContentBlockSchema 
} from '@lumenode/shared-types';
import { LESSONS } from '../data/lessons';
import { SUBJECTS } from '../data/subjects';

describe('Shared Types & Zod Schemas Validation', () => {
  it('validates all curated lessons in data/lessons.ts against LessonSchema', () => {
    for (const lesson of LESSONS) {
      const result = safeValidateLesson(lesson);
      expect(result.success, `Lesson "${lesson.id}" failed Zod validation: ${JSON.stringify(result)}`).toBe(true);
      if (result.success) {
        expect(result.data.sections.length).toBeGreaterThan(0);
      }
    }
  });

  it('validates all canonical subjects in data/subjects.ts against SubjectSchema', () => {
    for (const subject of SUBJECTS) {
      const parsed = SubjectSchema.safeParse(subject);
      expect(parsed.success, `Subject "${subject.id}" failed Zod validation`).toBe(true);
    }
  });

  it('rejects malformed lesson blocks with detailed validation errors', () => {
    const invalidBlock = {
      type: 'invalid_type',
      data: 123,
    };
    const parsed = ContentBlockSchema.safeParse(invalidBlock);
    expect(parsed.success).toBe(false);
  });

  it('rejects lessons with non-positive estimatedMinutes', () => {
    const invalidLesson = {
      id: 'bad-lesson',
      conceptId: 'test.concept',
      title: 'Bad Lesson',
      slug: 'bad-lesson',
      summary: 'Test',
      difficulty: 'beginner' as const,
      estimatedMinutes: -5,
      order: 1,
      sections: [],
      version: '1.0.0',
    };
    const parsed = LessonSchema.safeParse(invalidLesson);
    expect(parsed.success).toBe(false);
  });
});
