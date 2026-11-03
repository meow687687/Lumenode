/**
 * @lumenode/shared-types
 * Canonical types and interfaces for the Lumenode platform.
 */

export type SubjectCategory = 'programming-languages' | 'core-cs' | 'laboratories';

export interface Subject {
  id: string; // e.g. "c-programming", "dsa", "oops", "memory", "dbms"
  title: string;
  slug: string;
  description: string;
  category: SubjectCategory;
  icon: string;
  order: number;
  totalLessons?: number;
}

export type SupportedLanguageId = 'c' | 'cpp' | 'python' | 'java' | 'rust';

export interface SupportedLanguage {
  id: SupportedLanguageId;
  name: string;
  version: string;
  description: string;
  fileExtension: string;
  monacoLanguage: string;
  defaultCodeTemplate: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Concept {
  id: string; // e.g. "dsa.linked-list", "memory.stack-vs-heap"
  subjectId: string;
  title: string;
  slug: string;
  description: string;
  prerequisiteConceptIds: string[];
  relatedConceptIds: string[];
  difficulty: DifficultyLevel;
  tags: string[];
}

export type ContentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'markdown'; content: string }
  | {
      type: 'code';
      language: string;
      code: string;
      title?: string;
      highlightLines?: number[];
      executable?: boolean;
    }
  | {
      type: 'visualization';
      visualizerType: 'dsa' | 'memory' | 'oop' | 'sql' | 'custom';
      initialStateKey?: string;
      config?: Record<string, unknown>;
    }
  | {
      type: 'callout';
      variant: 'note' | 'tip' | 'warning' | 'deep-dive';
      title?: string;
      content: string;
    }
  | {
      type: 'comparison';
      title?: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: 'quiz';
      exerciseId: string;
    };

export interface Lesson {
  id: string; // e.g. "c.pointers.basics", "dsa.linked-lists.traversal"
  conceptId: string;
  languageId?: SupportedLanguageId;
  title: string;
  slug: string;
  summary: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  order: number;
  sections: ContentBlock[];
  version: string;
}

// Visualization Core Types
export interface VisualStep<TState = unknown> {
  stepIndex: number;
  title: string;
  description: string;
  state: TState;
  highlightedIds?: string[];
  actionType?: string;
}

export interface VisualSequence<TState = unknown> {
  id: string;
  conceptId: string;
  title: string;
  description: string;
  initialState: TState;
  steps: VisualStep<TState>[];
}

// Exercise and Assessment Types
export type ExerciseType = 'mcq' | 'predict_output' | 'find_error' | 'coding';

export interface MCQOption {
  id: string;
  text: string;
  explanation: string;
}

export interface Exercise {
  id: string;
  conceptId: string;
  type: ExerciseType;
  difficulty: DifficultyLevel;
  question: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  options?: MCQOption[];
  correctOptionId?: string;
  expectedOutput?: string;
  explanation: string;
}

// User Progress & Bookmarks (IndexedDB)
export interface UserLessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  lastAccessedAt: number;
  completedAt?: number;
  completedBlockIndices?: number[];
  quizScores?: Record<string, { score: number; passed: boolean }>;
}

export interface UserExerciseAttempt {
  exerciseId: string;
  passed: boolean;
  userAnswer: string;
  attemptedAt: number;
}

export interface Bookmark {
  id: string;
  targetId: string;
  targetType: 'lesson' | 'concept' | 'exercise' | 'laboratory';
  title: string;
  url: string;
  createdAt: number;
}

// Code Execution Adapter Types
export interface ExecutionRequest {
  language: SupportedLanguageId;
  sourceCode: string;
  stdin?: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryKb: number;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'limit_exceeded';
}
