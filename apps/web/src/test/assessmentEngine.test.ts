import { describe, it, expect } from 'vitest';
import { AssessmentEngine } from '../services/assessment/assessmentEngine';
import { Exercise } from '@lumenode/shared-types';

describe('AssessmentEngine (Archetype Evaluation & Scoring)', () => {
  const mcqExercise: Exercise = {
    id: 'ex-mcq-1',
    conceptId: 'c.types',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'What is sizeof(char) in standard C?',
    options: [
      { id: 'opt-1', text: '1 byte', explanation: 'Correct! By C standard, sizeof(char) is guaranteed to be 1.' },
      { id: 'opt-2', text: '4 bytes', explanation: 'Incorrect: int is typically 4 bytes.' },
    ],
    correctOptionId: 'opt-1',
    explanation: 'char is the fundamental addressable byte unit in C.',
    hints: ['Think of the smallest addressable unit in C.'],
  };

  const predictExercise: Exercise = {
    id: 'ex-predict-1',
    conceptId: 'py.data-structures',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What does this print?',
    expectedOutput: '[4, 8]',
    explanation: 'The list comprehension filters even numbers and multiplies by 2.',
    hints: ['Check the if condition.', 'Only even numbers are doubled.'],
  };

  const fillBlankExercise: Exercise = {
    id: 'ex-blank-1',
    conceptId: 'c.pointers',
    type: 'fill_blank',
    difficulty: 'intermediate',
    question: 'Fill in the address-of operator.',
    blanks: [
      {
        id: 'b1',
        answer: '&',
        acceptedVariants: ['&amp;', 'address-of'],
      },
    ],
    explanation: '& retrieves the virtual memory address of an lvalue.',
  };

  it('evaluates correct MCQ choice with full 100 score', () => {
    const res = AssessmentEngine.evaluate(mcqExercise, {
      exerciseId: 'ex-mcq-1',
      selectedOptionId: 'opt-1',
      hintsRevealedCount: 0,
    });

    expect(res.isCorrect).toBe(true);
    expect(res.score).toBe(100);
    expect(res.feedback).toContain('Correct!');
  });

  it('evaluates incorrect MCQ choice with 0 score and provides feedback without leaking answer before submit', () => {
    const res = AssessmentEngine.evaluate(mcqExercise, {
      exerciseId: 'ex-mcq-1',
      selectedOptionId: 'opt-2',
      hintsRevealedCount: 0,
    });

    expect(res.isCorrect).toBe(false);
    expect(res.score).toBe(0);
    expect(res.feedback).toContain('Incorrect');
    expect(res.correctAnswerSummary).toBeDefined();
  });

  it('penalizes score proportionally when hints are revealed with a balanced penalty curve', () => {
    // 1 hint used: 100 - 10 = 90
    const res1 = AssessmentEngine.evaluate(mcqExercise, {
      exerciseId: 'ex-mcq-1',
      selectedOptionId: 'opt-1',
      hintsRevealedCount: 1,
    });
    expect(res1.score).toBe(90);

    // 6 hints used: floored at 70 (never overly punitive for using hints)
    const res6 = AssessmentEngine.evaluate(mcqExercise, {
      exerciseId: 'ex-mcq-1',
      selectedOptionId: 'opt-1',
      hintsRevealedCount: 6,
    });
    expect(res6.score).toBe(70);
  });

  it('evaluates predict_output with whitespace and case tolerance', () => {
    const res = AssessmentEngine.evaluate(predictExercise, {
      exerciseId: 'ex-predict-1',
      userOutput: '  [4, 8]\n ',
      hintsRevealedCount: 0,
    });
    expect(res.isCorrect).toBe(true);
    expect(res.score).toBe(100);
  });

  it('evaluates fill_blank with primary answer and accepted variants', () => {
    // Primary answer
    const res1 = AssessmentEngine.evaluate(fillBlankExercise, {
      exerciseId: 'ex-blank-1',
      blankAnswers: { b1: '&' },
      hintsRevealedCount: 0,
    });
    expect(res1.isCorrect).toBe(true);

    // Accepted variant
    const res2 = AssessmentEngine.evaluate(fillBlankExercise, {
      exerciseId: 'ex-blank-1',
      blankAnswers: { b1: 'address-of' },
      hintsRevealedCount: 0,
    });
    expect(res2.isCorrect).toBe(true);

    // Wrong answer
    const res3 = AssessmentEngine.evaluate(fillBlankExercise, {
      exerciseId: 'ex-blank-1',
      blankAnswers: { b1: '*' },
      hintsRevealedCount: 0,
    });
    expect(res3.isCorrect).toBe(false);
    expect(res3.score).toBe(0);
  });
});
