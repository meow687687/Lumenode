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
  moduleIds: z.array(z.string()).default([]),
});
export type Subject = z.infer<typeof SubjectSchema>;

export const ModuleSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  order: z.number().int().nonnegative(),
  topicIds: z.array(z.string()).default([]),
});
export type Module = z.infer<typeof ModuleSchema>;

export const TopicSchema = z.object({
  id: z.string().min(1),
  moduleId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  order: z.number().int().nonnegative(),
  conceptIds: z.array(z.string()).default([]),
});
export type Topic = z.infer<typeof TopicSchema>;

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

// Language Implementation Details for a Canonical Concept
export const LanguageImplementationSchema = z.object({
  languageId: SupportedLanguageIdSchema,
  title: z.string(),
  summary: z.string(),
  codeSnippet: z.string(),
  memorySemantics: z.string(),
  keyDifferences: z.array(z.string()).default([]),
  idiomaticAlternative: z.string().optional(),
});
export type LanguageImplementation = z.infer<typeof LanguageImplementationSchema>;

// Canonical Language-Agnostic Concept Schema
export const ConceptSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  topicId: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  prerequisiteConceptIds: z.array(z.string()).default([]),
  relatedConceptIds: z.array(z.string()).default([]),
  difficulty: DifficultyLevelSchema,
  learningObjectives: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  implementations: z.array(LanguageImplementationSchema).default([]),
  lessonIds: z.array(z.string()).default([]),
  exerciseIds: z.array(z.string()).default([]),
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
  visualizerType: z.enum(['dsa', 'memory', 'oop', 'sql', 'bst', 'avl', 'bplus', 'callstack', 'custom']),
  initialStateKey: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});
export type VisualizationBlock = z.infer<typeof VisualizationBlockSchema>;

// --- Visualization & Simulation Engine Schemas ---
export const PlaybackStatusSchema = z.enum(['idle', 'playing', 'paused', 'completed']);
export type PlaybackStatus = z.infer<typeof PlaybackStatusSchema>;

export const SimulationStepSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  operation: z.string(),
  description: z.string(),
  highlightedNodeIds: z.array(z.string()).optional().default([]),
  secondaryHighlightedNodeIds: z.array(z.string()).optional().default([]),
  activePointerIds: z.array(z.string()).optional().default([]),
  comparison: z.object({
    leftValue: z.union([z.number(), z.string()]),
    rightValue: z.union([z.number(), z.string()]),
    operator: z.enum(['<', '<=', '==', '!=', '>=', '>']),
    result: z.boolean(),
  }).optional(),
  codeLine: z.number().int().positive().optional(),
  callout: z.string().optional(),
  stateSnapshot: z.any().optional(),
});
export type SimulationStep<TState = unknown> = Omit<
  z.infer<typeof SimulationStepSchema>,
  'stateSnapshot' | 'highlightedNodeIds' | 'secondaryHighlightedNodeIds' | 'activePointerIds'
> & {
  highlightedNodeIds?: string[];
  secondaryHighlightedNodeIds?: string[];
  activePointerIds?: string[];
  stateSnapshot?: TState;
};

export const SimulationTraceSchema = z.object({
  id: z.string(),
  visualizerId: z.string(),
  title: z.string(),
  totalSteps: z.number().int().nonnegative(),
  steps: z.array(SimulationStepSchema),
  initialState: z.any(),
  finalState: z.any(),
});
export type SimulationTrace<TState = unknown> = Omit<z.infer<typeof SimulationTraceSchema>, 'steps' | 'initialState' | 'finalState'> & {
  steps: SimulationStep<TState>[];
  initialState: TState;
  finalState: TState;
};

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

export const WalkthroughStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  codeSnippet: z.string().optional(),
  highlightLines: z.array(z.number()).optional(),
});
export type WalkthroughStep = z.infer<typeof WalkthroughStepSchema>;

export const WalkthroughBlockSchema = z.object({
  type: z.literal('walkthrough'),
  title: z.string(),
  description: z.string().optional(),
  steps: z.array(WalkthroughStepSchema).min(1),
});
export type WalkthroughBlock = z.infer<typeof WalkthroughBlockSchema>;

export const MathBlockSchema = z.object({
  type: z.literal('math'),
  formula: z.string(),
  explanation: z.string().optional(),
});
export type MathBlock = z.infer<typeof MathBlockSchema>;

export const RelatedConceptsBlockSchema = z.object({
  type: z.literal('related_concepts'),
  title: z.string().optional(),
  conceptIds: z.array(z.string()).min(1),
});
export type RelatedConceptsBlock = z.infer<typeof RelatedConceptsBlockSchema>;

export const ReferenceItemSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  author: z.string().optional(),
  year: z.number().optional(),
});
export type ReferenceItem = z.infer<typeof ReferenceItemSchema>;

export const ReferencesBlockSchema = z.object({
  type: z.literal('references'),
  title: z.string().optional(),
  items: z.array(ReferenceItemSchema).min(1),
});
export type ReferencesBlock = z.infer<typeof ReferencesBlockSchema>;

export const ExerciseBlockSchema = z.object({
  type: z.literal('exercise'),
  exerciseId: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
});
export type ExerciseBlock = z.infer<typeof ExerciseBlockSchema>;

export const ContentBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  MarkdownBlockSchema,
  CodeBlockSchema,
  VisualizationBlockSchema,
  CalloutBlockSchema,
  ComparisonBlockSchema,
  QuizBlockSchema,
  WalkthroughBlockSchema,
  MathBlockSchema,
  RelatedConceptsBlockSchema,
  ReferencesBlockSchema,
  ExerciseBlockSchema,
]);
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

export const LessonTemplateTypeSchema = z.enum([
  'fundamentals',
  'data-structures',
  'algorithms',
  'oop',
  'dbms',
  'memory-systems',
  'mathematical',
  'custom',
]);
export type LessonTemplateType = z.infer<typeof LessonTemplateTypeSchema>;

export const LessonSchema = z.object({
  id: z.string().min(1),
  conceptId: z.string().min(1),
  languageId: SupportedLanguageIdSchema.optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string(),
  difficulty: DifficultyLevelSchema,
  templateType: LessonTemplateTypeSchema.optional(),
  estimatedMinutes: z.number().positive(),
  order: z.number().int().nonnegative(),
  learningObjectives: z.array(z.string()).default([]),
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
  'fill_blank',
  'predict_output',
  'find_error',
  'debug_program',
  'trace_algorithm',
  'coding',
  'explain_concept',
]);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

export const MCQOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  explanation: z.string(),
});
export type MCQOption = z.infer<typeof MCQOptionSchema>;

export const TestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  explanation: z.string().optional(),
});
export type TestCase = z.infer<typeof TestCaseSchema>;

export const FillBlankItemSchema = z.object({
  id: z.string(),
  answer: z.string(),
  acceptedVariants: z.array(z.string()).default([]),
  explanation: z.string().optional(),
});
export type FillBlankItem = z.infer<typeof FillBlankItemSchema>;

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
  hints: z.array(z.string()).optional(),
  starterCode: z.string().optional(),
  testCases: z.array(TestCaseSchema).optional(),
  blanks: z.array(FillBlankItemSchema).optional(),
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

// Mastery Tracking Types
export const MasteryStateSchema = z.enum([
  'not_started',
  'learning',
  'practicing',
  'demonstrated',
  'needs_review',
]);
export type MasteryState = z.infer<typeof MasteryStateSchema>;

export const AchievementLevelSchema = z.enum([
  'unattempted',
  'introduced',
  'practicing',
  'mastered',
]);
export type AchievementLevel = z.infer<typeof AchievementLevelSchema>;

export const RetentionStatusSchema = z.enum([
  'fresh',
  'due',
  'overdue',
]);
export type RetentionStatus = z.infer<typeof RetentionStatusSchema>;

export const ExerciseAttemptSchema = z.object({
  attemptId: z.string(),
  exerciseId: z.string(),
  conceptId: z.string(),
  type: ExerciseTypeSchema,
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  hintsUsed: z.number().int().nonnegative().default(0),
  userAnswer: z.any().optional(),
  feedback: z.string().optional(),
  timestamp: z.number(),
});
export type ExerciseAttempt = z.infer<typeof ExerciseAttemptSchema>;

export const ConceptMasteryRecordSchema = z.object({
  conceptId: z.string(),
  state: MasteryStateSchema,
  achievementLevel: AchievementLevelSchema.default('unattempted'),
  retentionStatus: RetentionStatusSchema.default('fresh'),
  reviewIntervalDays: z.number().positive().default(1),
  nextReviewAt: z.number().optional(),
  reviewStreak: z.number().int().nonnegative().default(0),
  lessonCompleted: z.boolean().default(false),
  attemptsCount: z.number().int().nonnegative().default(0),
  passedCount: z.number().int().nonnegative().default(0),
  consecutivePasses: z.number().int().nonnegative().default(0),
  bestScore: z.number().min(0).max(100).default(0),
  lastScore: z.number().min(0).max(100).default(0),
  lastAttemptAt: z.number().optional(),
  demonstratedAt: z.number().optional(),
  decayAlert: z.boolean().default(false),
  evidenceHistory: z.array(ExerciseAttemptSchema).default([]),
});
export type ConceptMasteryRecord = z.infer<typeof ConceptMasteryRecordSchema>;

export const LearningRecommendationSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  conceptTitle: z.string(),
  type: z.enum(['prerequisite_remediation', 'practice_reinforcement', 'next_in_path', 'review_decayed']),
  reason: z.string(),
  urgency: z.enum(['high', 'medium', 'low']),
  suggestedLessonId: z.string().optional(),
  suggestedExerciseId: z.string().optional(),
});
export type LearningRecommendation = z.infer<typeof LearningRecommendationSchema>;

export const LearnerProfileSnapshotSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.number(),
  completedLessons: z.array(z.string()),
  bookmarks: z.array(BookmarkSchema),
  masteryRecords: z.record(ConceptMasteryRecordSchema),
  activeLessonId: z.string(),
});
export type LearnerProfileSnapshot = z.infer<typeof LearnerProfileSnapshotSchema>;

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

// Phase 5: Feedback & Analytics Schemas
export const FeedbackCategorySchema = z.enum([
  'problem',
  'improvement',
  'educational_error',
  'accessibility',
  'lesson_clarity',
]);
export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>;

export const FeedbackSubmissionSchema = z.object({
  id: z.string(),
  submittedAt: z.number(),
  category: FeedbackCategorySchema,
  lessonId: z.string().optional(),
  conceptId: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(3),
  userEmail: z.string().email().optional().or(z.literal('')),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    viewport: z.string().optional(),
  }).optional(),
});
export type FeedbackSubmission = z.infer<typeof FeedbackSubmissionSchema>;

export const AnalyticsEventTypeSchema = z.enum([
  'lesson_opened',
  'lesson_completed',
  'exercise_attempted',
  'exercise_completed',
  'visualization_explored',
  'search_performed',
  'path_progressed',
  'error_encountered',
]);
export type AnalyticsEventType = z.infer<typeof AnalyticsEventTypeSchema>;

export const AnalyticsEventSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
  type: AnalyticsEventTypeSchema,
  payload: z.record(z.union([z.string(), z.number(), z.boolean()])),
});
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// Phase 6: Learning Effectiveness & Pedagogical Cycle Schemas
export const AssessmentQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  codeSnippet: z.string().optional(),
  options: z.array(z.string()),
  correctIndex: z.number().int().nonnegative(),
  explanation: z.string(),
  difficulty: DifficultyLevelSchema,
  conceptId: z.string(),
});
export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

export const LearningCycleStageSchema = z.enum([
  'pre_assessment',
  'guided_lesson',
  'interactive_visualization',
  'independent_practice',
  'post_assessment',
  'retention_assessment',
]);
export type LearningCycleStage = z.infer<typeof LearningCycleStageSchema>;

export const QuestionConfidenceLevelSchema = z.enum(['low', 'medium', 'high']);
export type QuestionConfidenceLevel = z.infer<typeof QuestionConfidenceLevelSchema>;

export const EvaluatedQuestionResponseSchema = z.object({
  questionId: z.string(),
  selectedOptionIndex: z.number(),
  isCorrect: z.boolean(),
  confidence: QuestionConfidenceLevelSchema,
  timeSpentMs: z.number().nonnegative(),
});
export type EvaluatedQuestionResponse = z.infer<typeof EvaluatedQuestionResponseSchema>;

export const ConceptAssessmentSessionSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  stage: z.enum(['pre_assessment', 'post_assessment', 'retention_assessment']),
  scorePercent: z.number().min(0).max(100),
  completedAt: z.number(),
  responses: z.array(EvaluatedQuestionResponseSchema),
});
export type ConceptAssessmentSession = z.infer<typeof ConceptAssessmentSessionSchema>;

export const NormalizedGainResultSchema = z.object({
  conceptId: z.string(),
  preScore: z.number().min(0).max(100),
  postScore: z.number().min(0).max(100),
  retentionScore: z.number().min(0).max(100).optional(),
  normalizedGain: z.number(), // g = (post - pre) / (100 - pre)
  normalizedRetentionLoss: z.number().optional(),
  confidenceShift: z.number(), // difference in average confidence level
  effectCategory: z.enum(['high_gain', 'medium_gain', 'low_gain', 'negative']),
});
export type NormalizedGainResult = z.infer<typeof NormalizedGainResultSchema>;

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

export function validateConcept(data: unknown): Concept {
  return ConceptSchema.parse(data);
}

export function safeValidateConcept(data: unknown) {
  return ConceptSchema.safeParse(data);
}
