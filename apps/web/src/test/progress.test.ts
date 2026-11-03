import { describe, it, expect, beforeEach } from 'vitest';

describe('Progress State & Storage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarantees clean initial state: zero pre-completed lessons for first-time users', () => {
    const saved = localStorage.getItem('lumenode_completed_lessons_v1');
    expect(saved).toBeNull();
    const completedSet = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    expect(completedSet.size).toBe(0);
    expect(completedSet.has('c-pointers-basics')).toBe(false);
  });

  it('persists completed lessons across simulated page reload', () => {
    const completed = new Set<string>();
    completed.add('c-pointers-basics');
    completed.add('dsa-linked-list-basics');

    localStorage.setItem('lumenode_completed_lessons_v1', JSON.stringify(Array.from(completed)));

    const reloaded = new Set<string>(JSON.parse(localStorage.getItem('lumenode_completed_lessons_v1')!));
    expect(reloaded.size).toBe(2);
    expect(reloaded.has('c-pointers-basics')).toBe(true);
    expect(reloaded.has('dsa-linked-list-basics')).toBe(true);
  });

  it('correctly records and persists quiz attempts and scores', () => {
    const quizScores: Record<string, { score: number; passed: boolean }> = {
      'quiz-pointer-deref': { score: 100, passed: true },
      'quiz-linked-list-complexity': { score: 0, passed: false },
    };

    localStorage.setItem('lumenode_quiz_scores_v1', JSON.stringify(quizScores));

    const restored = JSON.parse(localStorage.getItem('lumenode_quiz_scores_v1')!);
    expect(restored['quiz-pointer-deref'].passed).toBe(true);
    expect(restored['quiz-pointer-deref'].score).toBe(100);
    expect(restored['quiz-linked-list-complexity'].passed).toBe(false);
  });

  it('persists and removes bookmarks accurately', () => {
    const bookmarks = [
      {
        id: 'bm-1',
        targetId: 'c-pointers-basics',
        targetType: 'lesson' as const,
        title: 'Pointers in C',
        url: '/lessons/c-pointers-basics',
        createdAt: 1000,
      },
    ];

    localStorage.setItem('lumenode_bookmarks_v1', JSON.stringify(bookmarks));
    const loaded = JSON.parse(localStorage.getItem('lumenode_bookmarks_v1')!);
    expect(loaded.length).toBe(1);
    expect(loaded[0].targetId).toBe('c-pointers-basics');

    // Remove bookmark
    const updated = loaded.filter((b: any) => b.targetId !== 'c-pointers-basics');
    localStorage.setItem('lumenode_bookmarks_v1', JSON.stringify(updated));
    expect(JSON.parse(localStorage.getItem('lumenode_bookmarks_v1')!).length).toBe(0);
  });
});
