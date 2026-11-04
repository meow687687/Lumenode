import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  ConceptMasteryRecord,
  ExerciseType,
  LearningRecommendation,
  LearnerProfileSnapshot,
} from '@lumenode/shared-types';
import { StorageService } from '../services/persistence/storageService';
import { MasteryEngine } from '../services/mastery/masteryEngine';
import { RecommendationEngine } from '../services/recommendations/recommendationEngine';
import { CONCEPTS } from '../data/concepts';
import { LESSONS } from '../data/lessons';
import { analytics } from '../services/telemetry/analyticsService';

interface ProgressContextType {
  completedLessons: Set<string>;
  quizScores: Record<string, { score: number; passed: boolean }>;
  bookmarks: Bookmark[];
  masteryRecords: Record<string, ConceptMasteryRecord>;
  recommendations: LearningRecommendation[];
  markLessonComplete: (lessonId: string) => void;
  recordQuizScore: (exerciseId: string, passed: boolean, score?: number) => void;
  recordExerciseAttempt: (
    conceptId: string,
    attempt: {
      exerciseId: string;
      type: ExerciseType;
      passed: boolean;
      score: number;
      hintsUsed?: number;
      feedback?: string;
      userAnswer?: unknown;
    }
  ) => void;
  toggleBookmark: (item: { id: string; type: Bookmark['targetType']; title: string; url: string }) => void;
  isBookmarked: (id: string) => boolean;
  activeLessonId: string;
  setActiveLessonId: (id: string) => void;
  resetAllProgress: () => void;
  exportBackup: () => LearnerProfileSnapshot;
  importBackup: (jsonString: string) => { success: boolean; error?: string };
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from storage service with migration
  const [initialData] = useState(() => StorageService.initialize());

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(initialData.completedLessons);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialData.bookmarks);
  const [masteryRecords, setMasteryRecords] = useState<Record<string, ConceptMasteryRecord>>(initialData.masteryRecords);
  const [activeLessonId, setActiveLessonId] = useState<string>(initialData.activeLessonId);

  // Backward-compatible quiz scores map derived from mastery evidence
  const quizScores = useMemo(() => {
    const scores: Record<string, { score: number; passed: boolean }> = {};
    Object.values(masteryRecords).forEach((record) => {
      record.evidenceHistory.forEach((attempt) => {
        scores[attempt.exerciseId] = {
          score: attempt.score,
          passed: attempt.passed,
        };
      });
    });
    return scores;
  }, [masteryRecords]);

  // Save changes
  useEffect(() => {
    StorageService.saveCompletedLessons(completedLessons);
  }, [completedLessons]);

  useEffect(() => {
    StorageService.saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    StorageService.saveMasteryRecords(masteryRecords);
  }, [masteryRecords]);

  useEffect(() => {
    StorageService.saveActiveLessonId(activeLessonId);
  }, [activeLessonId]);

  // Mark lesson complete and update corresponding concept mastery
  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(lessonId);
      return next;
    });

    analytics.track('lesson_completed', {
      lessonId,
      totalCompleted: completedLessons.size + 1,
    });

    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (lesson) {
      setMasteryRecords((prev) => {
        const current = prev[lesson.conceptId] || MasteryEngine.createDefaultRecord(lesson.conceptId);
        const updated = MasteryEngine.recordLessonCompletion(current);
        return {
          ...prev,
          [lesson.conceptId]: updated,
        };
      });
    }
  };

  // Record exercise attempt
  const recordExerciseAttempt = (
    conceptId: string,
    attempt: {
      exerciseId: string;
      type: ExerciseType;
      passed: boolean;
      score: number;
      hintsUsed?: number;
      feedback?: string;
      userAnswer?: unknown;
    }
  ) => {
    analytics.track('exercise_attempted', {
      conceptId,
      exerciseId: attempt.exerciseId,
      exerciseType: attempt.type,
      passed: attempt.passed,
      score: attempt.score,
      hintsUsed: attempt.hintsUsed ?? 0,
    });

    if (attempt.passed) {
      analytics.track('exercise_completed', {
        conceptId,
        exerciseId: attempt.exerciseId,
        score: attempt.score,
      });
    }

    setMasteryRecords((prev) => {
      const current = prev[conceptId] || MasteryEngine.createDefaultRecord(conceptId);
      const updated = MasteryEngine.recordExerciseAttempt(current, attempt);
      return {
        ...prev,
        [conceptId]: updated,
      };
    });
  };

  // Backward-compatible quiz score recording
  const recordQuizScore = (exerciseId: string, passed: boolean, score: number = passed ? 100 : 0) => {
    // Locate matching concept from exercise or lesson
    const concept = CONCEPTS.find((c) => c.exerciseIds.includes(exerciseId));
    const conceptId = concept ? concept.id : exerciseId.replace('quiz-', '');

    recordExerciseAttempt(conceptId, {
      exerciseId,
      type: 'mcq',
      passed,
      score,
    });
  };

  const toggleBookmark = (item: { id: string; type: Bookmark['targetType']; title: string; url: string }) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.targetId === item.id);
      if (exists) {
        return prev.filter((b) => b.targetId !== item.id);
      } else {
        return [
          ...prev,
          {
            id: `bm-${Date.now()}`,
            targetId: item.id,
            targetType: item.type,
            title: item.title,
            url: item.url,
            createdAt: Date.now(),
          },
        ];
      }
    });
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.targetId === id);

  const resetAllProgress = () => {
    setCompletedLessons(new Set());
    setBookmarks([]);
    setMasteryRecords({});
    StorageService.clearAll();
  };

  const exportBackup = () => {
    return StorageService.exportLearnerBackup();
  };

  const importBackup = (jsonString: string) => {
    const res = StorageService.importLearnerBackup(jsonString);
    if (res.success) {
      const reloaded = StorageService.initialize();
      setCompletedLessons(reloaded.completedLessons);
      setBookmarks(reloaded.bookmarks);
      setMasteryRecords(reloaded.masteryRecords);
      setActiveLessonId(reloaded.activeLessonId);
    }
    return res;
  };

  // Recommendations calculated via deterministic DAG analysis
  const recommendations = useMemo(() => {
    return RecommendationEngine.generateRecommendations(masteryRecords, CONCEPTS, LESSONS);
  }, [masteryRecords]);

  return (
    <ProgressContext.Provider
      value={{
        completedLessons,
        quizScores,
        bookmarks,
        masteryRecords,
        recommendations,
        markLessonComplete,
        recordQuizScore,
        recordExerciseAttempt,
        toggleBookmark,
        isBookmarked,
        activeLessonId,
        setActiveLessonId,
        resetAllProgress,
        exportBackup,
        importBackup,
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
