/**
 * @lumenode/shared-types
 * Canonical types, Zod schemas, and runtime validators for the Lumenode platform.
 */

import { z } from 'zod';

export const SubjectCategorySchema = z.enum([
  'programming-languages',
  'core-cs',
  'laboratories',
]);
export type SubjectCategory = z.infer<typeof SubjectCategorySchema>;

export const SubjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  category: SubjectCategorySchema,
  icon: z.string(),
  order: z.number().int().nonnegative(),
  totalLessons: z.number().int().nonnegative().optional(),
});
export type Subject = z.infer<typeof SubjectSchema>;

export const SupportedLanguageIdSchema = z.enum([
  'c',
  'cpp',
  'python',
  'java',
  'rust',
]);
export type SupportedLanguageId = z.infer<typeof SupportedLanguageIdSchema>;

export const SupportedLanguageSchema = z.object({
  id: SupportedLanguageIdSchema,
  name: z.string(),
  version: z.string(),
  description: z.string(),
  fileExtension: z.string(),
  monacoLanguage: z.string(),
  defaultCodeTemplate: z.string(),
});
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const DifficultyLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

export const ConceptSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  prerequisiteConceptIds: z.array(z.string()).default([]),
  relatedConceptIds: z.array(z.string()).default([]),
  difficulty: DifficultyLevelSchema,
  tags: z.array(z.string()).default([]),
});
export type Concept = z.infer<typeof ConceptSchema>;

// Structured Content Blocks
export const HeadingBlockSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().min(1),
});

export const MarkdownBlockSchema = z.object({
  type: z.literal('markdown'),
  content: z.string(),
});

export const CodeBlockSchema = z.object({
  type: z.literal('code'),
  language: z.string(),
  code: z.string(),
  title: z.string().optional(),
  highlightLines: z.array(z.number()).optional(),
  executable: z.boolean().optional(),
});

export const VisualizationBlockSchema = z.object({
  type: z.literal('visualization'),
  visualizerType: z.enum(['dsa', 'memory', 'oop', 'sql', 'custom']),
  initialStateKey: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

export const CalloutBlockSchema = z.object({
  type: z.literal('callout'),
  variant: z.enum(['note', 'tip', 'warning', 'deep-dive']).default('note'),
  title: z.string().optional(),
  content: z.string(),
});

export const ComparisonBlockSchema = z.object({
  type: z.literal('comparison'),
  title: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const QuizBlockSchema = z.object({
  type: z.literal('quiz'),
  exerciseId: z.string().min(1),
});

export const ContentBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  MarkdownBlockSchema,
  CodeBlockSchema,
  VisualizationBlockSchema,
  CalloutBlockSchema,
  ComparisonBlockSchema,
  QuizBlockSchema,
]);
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

export const LessonSchema = z.object({
  id: z.string().min(1),
  conceptId: z.string().min(1),
  languageId: SupportedLanguageIdSchema.optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string(),
  difficulty: DifficultyLevelSchema,
  estimatedMinutes: z.number().positive(),
  order: z.number().int().nonnegative(),
  sections: z.array(ContentBlockSchema),
  version: z.string().default('1.0.0'),
});
export type Lesson = z.infer<typeof LessonSchema>;

// Visualization Trace Types
export const VisualStepSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  title: z.string(),
  description: z.string(),
  state: z.unknown(),
  highlightedIds: z.array(z.string()).optional(),
  actionType: z.string().optional(),
});
export type VisualStep<TState = unknown> = Omit<z.infer<typeof VisualStepSchema>, 'state'> & {
  state: TState;
};

export const VisualSequenceSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  title: z.string(),
  description: z.string(),
  initialState: z.unknown(),
  steps: z.array(VisualStepSchema),
});
export type VisualSequence<TState = unknown> = Omit<z.infer<typeof VisualSequenceSchema>, 'initialState' | 'steps'> & {
  initialState: TState;
  steps: VisualStep<TState>[];
};

// Exercise and Assessment Schemas
export const ExerciseTypeSchema = z.enum([
  'mcq',
  'predict_output',
  'find_error',
  'coding',
]);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

export const MCQOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  explanation: z.string(),
});
export type MCQOption = z.infer<typeof MCQOptionSchema>;

export const ExerciseSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  type: ExerciseTypeSchema,
  difficulty: DifficultyLevelSchema,
  question: z.string(),
  codeSnippet: z
    .object({
      language: z.string(),
      code: z.string(),
    })
    .optional(),
  options: z.array(MCQOptionSchema).optional(),
  correctOptionId: z.string().optional(),
  expectedOutput: z.string().optional(),
  explanation: z.string(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

// User Progress & Bookmarks
export const UserLessonProgressSchema = z.object({
  lessonId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  lastAccessedAt: z.number(),
  completedAt: z.number().optional(),
  completedBlockIndices: z.array(z.number()).optional(),
  quizScores: z.record(z.object({ score: z.number(), passed: z.boolean() })).optional(),
});
export type UserLessonProgress = z.infer<typeof UserLessonProgressSchema>;

export const BookmarkSchema = z.object({
  id: z.string(),
  targetId: z.string(),
  targetType: z.enum(['lesson', 'concept', 'exercise', 'laboratory']),
  title: z.string(),
  url: z.string(),
  createdAt: z.number(),
});
export type Bookmark = z.infer<typeof BookmarkSchema>;

// Code Execution Adapter Types
export const ExecutionStatusSchema = z.enum([
  'success',
  'compilation_error',
  'runtime_error',
  'timeout',
  'limit_exceeded',
  'unsupported',
]);
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;

export const ExecutionResultSchema = z.object({
  executionId: z.string(),
  language: SupportedLanguageIdSchema,
  status: ExecutionStatusSchema,
  stdout: z.string(),
  stderr: z.string(),
  error: z.string().optional(),
  exitCode: z.number().optional(),
  durationMs: z.number().nonnegative(),
  memoryKb: z.number().nonnegative().optional(),
});
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

// Helper Validation Functions
export function validateLesson(data: unknown): Lesson {
  return LessonSchema.parse(data);
}

export function safeValidateLesson(data: unknown) {
  return LessonSchema.safeParse(data);
}

export function validateSubject(data: unknown): Subject {
  return SubjectSchema.parse(data);
}
