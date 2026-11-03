import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bookmark } from '../types';

interface ProgressContextType {
  completedLessons: Set<string>;
  quizScores: Record<string, { score: number; passed: boolean }>;
  bookmarks: Bookmark[];
  markLessonComplete: (lessonId: string) => void;
  recordQuizScore: (exerciseId: string, passed: boolean) => void;
  toggleBookmark: (item: { id: string; type: Bookmark['targetType']; title: string; url: string }) => void;
  isBookmarked: (id: string) => boolean;
  activeLessonId: string;
  setActiveLessonId: (id: string) => void;
  resetAllProgress: () => void;
}

const STORAGE_KEYS = {
  COMPLETED_LESSONS: 'lumenode_completed_lessons_v1',
  QUIZ_SCORES: 'lumenode_quiz_scores_v1',
  BOOKMARKS: 'lumenode_bookmarks_v1',
  ACTIVE_LESSON: 'lumenode_active_lesson_v1',
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // First-time users start with an empty progress set (zero lessons pre-completed)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch (e) {
      console.warn('ProgressContext: localStorage unavailable, starting clean state', e);
      return new Set<string>();
    }
  });

  const [quizScores, setQuizScores] = useState<Record<string, { score: number; passed: boolean }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUIZ_SCORES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_LESSON);
      return saved || 'c-pointers-basics';
    } catch {
      return 'c-pointers-basics';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(Array.from(completedLessons)));
    } catch (e) {
      console.warn('Failed to save completed lessons', e);
    }
  }, [completedLessons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZ_SCORES, JSON.stringify(quizScores));
    } catch (e) {
      console.warn('Failed to save quiz scores', e);
    }
  }, [quizScores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks', e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LESSON, activeLessonId);
    } catch (e) {
      console.warn('Failed to save active lesson', e);
    }
  }, [activeLessonId]);

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      next.add(lessonId);
      return next;
    });
  };

  const recordQuizScore = (exerciseId: string, passed: boolean) => {
    setQuizScores(prev => ({
      ...prev,
      [exerciseId]: { score: passed ? 100 : 0, passed }
    }));
  };

  const toggleBookmark = (item: { id: string; type: Bookmark['targetType']; title: string; url: string }) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.targetId === item.id);
      if (exists) {
        return prev.filter(b => b.targetId !== item.id);
      } else {
        return [
          ...prev,
          {
            id: `bm-${Date.now()}`,
            targetId: item.id,
            targetType: item.type,
            title: item.title,
            url: item.url,
            createdAt: Date.now()
          }
        ];
      }
    });
  };

  const isBookmarked = (id: string) => bookmarks.some(b => b.targetId === id);

  const resetAllProgress = () => {
    setCompletedLessons(new Set());
    setQuizScores({});
    setBookmarks([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_LESSONS);
      localStorage.removeItem(STORAGE_KEYS.QUIZ_SCORES);
      localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        completedLessons,
        quizScores,
        bookmarks,
        markLessonComplete,
        recordQuizScore,
        toggleBookmark,
        isBookmarked,
        activeLessonId,
        setActiveLessonId,
        resetAllProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return ctx;
};
