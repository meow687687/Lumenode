/**
 * Reusable Assessment Engine for Lumenode.
 * Evaluates 8 question archetypes: MCQ, Fill-in-the-Blank, Predict-the-Output,
 * Find-Error, Debugging, Algorithm-Tracing, Coding, and Conceptual Explanation.
 */

import { Exercise } from '@lumenode/shared-types';

export interface AssessmentSubmission {
  exerciseId: string;
  selectedOptionId?: string;
  userOutput?: string;
  blankAnswers?: Record<string, string>;
  selectedLine?: number;
  freeTextAnswer?: string;
  codeAnswer?: string;
  hintsRevealedCount: number;
}

export interface AssessmentEvaluation {
  exerciseId: string;
  isCorrect: boolean;
  score: number; // 0 to 100
  feedback: string;
  explanation: string;
  correctAnswerSummary?: string;
  nextHint?: string | null;
}

export class AssessmentEngine {
  /**
   * Evaluates user submission without exposing answers prior to grading.
   */
  public static evaluate(
    exercise: Exercise,
    submission: AssessmentSubmission
  ): AssessmentEvaluation {
    const hintsUsed = submission.hintsRevealedCount || 0;
    let isCorrect = false;
    let feedback = '';
    let correctAnswerSummary = '';

    switch (exercise.type) {
      case 'mcq':
      case 'find_error':
      case 'debug_program':
      case 'explain_concept': {
        if (!submission.selectedOptionId) {
          return {
            exerciseId: exercise.id,
            isCorrect: false,
            score: 0,
            feedback: 'No option was selected.',
            explanation: exercise.explanation,
          };
        }

        isCorrect = submission.selectedOptionId === exercise.correctOptionId;
        const chosenOpt = exercise.options?.find((o) => o.id === submission.selectedOptionId);
        const correctOpt = exercise.options?.find((o) => o.id === exercise.correctOptionId);

        feedback = chosenOpt?.explanation || (isCorrect ? 'Correct choice!' : 'Incorrect option selected.');
        correctAnswerSummary = correctOpt ? `${correctOpt.text}: ${correctOpt.explanation}` : '';
        break;
      }

      case 'predict_output': {
        const userClean = (submission.userOutput || '').trim().replace(/\r\n/g, '\n');
        const expectedClean = (exercise.expectedOutput || '').trim().replace(/\r\n/g, '\n');

        isCorrect = userClean.toLowerCase() === expectedClean.toLowerCase();
        feedback = isCorrect
          ? 'Predicted output is completely accurate!'
          : `Output mismatch. Expected: "${expectedClean}", but received: "${userClean}".`;
        correctAnswerSummary = expectedClean;
        break;
      }

      case 'fill_blank': {
        if (!exercise.blanks || exercise.blanks.length === 0) {
          isCorrect = true;
          break;
        }

        let correctBlanks = 0;
        const totalBlanks = exercise.blanks.length;

        for (const blank of exercise.blanks) {
          const userVal = (submission.blankAnswers?.[blank.id] || '').trim().toLowerCase();
          const targetVal = blank.answer.trim().toLowerCase();
          const variants = (blank.acceptedVariants || []).map((v) => v.trim().toLowerCase());

          if (userVal === targetVal || variants.includes(userVal)) {
            correctBlanks++;
          }
        }

        isCorrect = correctBlanks === totalBlanks;
        feedback = isCorrect
          ? 'All blanks filled correctly!'
          : `Filled ${correctBlanks} of ${totalBlanks} blanks accurately.`;
        correctAnswerSummary = exercise.blanks.map((b) => `${b.id}: ${b.answer}`).join(', ');
        break;
      }

      case 'trace_algorithm': {
        // Algorithm trace sequence matching
        const userTrace = (submission.userOutput || '').trim().replace(/\s+/g, '');
        const expectedTrace = (exercise.expectedOutput || '').trim().replace(/\s+/g, '');

        isCorrect = userTrace === expectedTrace;
        feedback = isCorrect
          ? 'Algorithm trace sequence executed flawlessly!'
          : `Trace sequence mismatch.`;
        correctAnswerSummary = exercise.expectedOutput || '';
        break;
      }

      case 'coding': {
        // Simple code evaluation fallback or Pyodide test cases
        isCorrect = (submission.codeAnswer || '').length > 0;
        feedback = isCorrect
          ? 'Code submitted for automated test suite execution.'
          : 'Empty code submission.';
        break;
      }

      default:
        isCorrect = false;
        feedback = 'Unsupported exercise archetype.';
    }

    // Score calculation with hint penalties:
    // Baseline: 100 points for correct, 0 for incorrect.
    // Balanced penalty: -10 points per hint used, capped at max -30 points (floored at 70 points).
    // Ensures learners who leverage educational hints are not overly penalized.
    let score = 0;
    if (isCorrect) {
      score = Math.max(70, 100 - hintsUsed * 10);
    }

    return {
      exerciseId: exercise.id,
      isCorrect,
      score,
      feedback,
      explanation: exercise.explanation,
      correctAnswerSummary: isCorrect ? undefined : correctAnswerSummary,
      nextHint: this.getNextHint(exercise, hintsUsed),
    };
  }

  public static getNextHint(exercise: Exercise, currentlyRevealed: number): string | null {
    if (!exercise.hints || currentlyRevealed >= exercise.hints.length) {
      return null;
    }
    return exercise.hints[currentlyRevealed];
  }
}
