import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonRenderer } from '../components/lesson/LessonRenderer';
import { Lesson } from '../types';
import { ProgressProvider } from '../context/ProgressContext';

const mockLesson: Lesson = {
  id: 'test-lesson',
  conceptId: 'test.concept',
  languageId: 'c',
  title: 'Test Lesson Title',
  slug: 'test-lesson',
  summary: 'Lesson summary for testing renderer.',
  difficulty: 'beginner',
  estimatedMinutes: 10,
  order: 1,
  version: '1.0.0',
  learningObjectives: ['Understand test basics'],
  sections: [
    { type: 'heading', level: 2, text: 'Heading Level 2' },
    { type: 'markdown', content: 'This is a sample markdown paragraph.' },
    { type: 'code', language: 'c', code: 'int x = 42;', title: 'test.c', executable: true },
    { type: 'callout', variant: 'tip', title: 'Tip Title', content: 'This is a helpful tip.' },
    { type: 'comparison', title: 'Comp Table', headers: ['Col A', 'Col B'], rows: [['1', '2']] },
    {
      type: 'walkthrough',
      title: 'Sample Stepper',
      steps: [
        {
          stepNumber: 1,
          title: 'First Step',
          description: 'Step one description.',
          codeSnippet: 'int a = 1;',
          highlightLines: [1],
        },
        {
          stepNumber: 2,
          title: 'Second Step',
          description: 'Step two description.',
          codeSnippet: 'int b = 2;',
        },
      ],
    },
    {
      type: 'math',
      formula: 'T(n) = O(log n)',
      explanation: 'Logarithmic asymptotic bound.',
    },
    {
      type: 'references',
      title: 'Verified References',
      items: [
        {
          title: 'Introduction to Algorithms (CLRS)',
          author: 'Cormen et al.',
          year: 2022,
        },
      ],
    },
  ],
};

describe('LessonRenderer Component', () => {
  it('renders all standard structured content blocks', () => {
    render(
      <MemoryRouter>
        <ProgressProvider>
          <LessonRenderer lesson={mockLesson} />
        </ProgressProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Lesson Title')).toBeInTheDocument();
    expect(screen.getByText('Heading Level 2')).toBeInTheDocument();
    expect(screen.getByText('This is a sample markdown paragraph.')).toBeInTheDocument();
    expect(screen.getByText('int x = 42;')).toBeInTheDocument();
    expect(screen.getByText('Tip Title')).toBeInTheDocument();
    expect(screen.getByText('Comp Table')).toBeInTheDocument();
    // New blocks
    expect(screen.getByText('Sample Stepper')).toBeInTheDocument();
    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('T(n) = O(log n)')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Algorithms (CLRS)')).toBeInTheDocument();
  });

  it('triggers onOpenPlaygroundWithCode callback when Run in Playground is clicked', () => {
    const handleRunInPlayground = vi.fn();

    render(
      <MemoryRouter>
        <ProgressProvider>
          <LessonRenderer
            lesson={mockLesson}
            onOpenPlaygroundWithCode={handleRunInPlayground}
          />
        </ProgressProvider>
      </MemoryRouter>
    );

    const runBtn = screen.getByText('Run in Playground');
    fireEvent.click(runBtn);

    expect(handleRunInPlayground).toHaveBeenCalledTimes(1);
    expect(handleRunInPlayground).toHaveBeenCalledWith('int x = 42;', 'c');
  });

  it('renders an authoring error boundary for unrecognized content blocks', () => {
    const malformedLesson: Lesson = {
      ...mockLesson,
      sections: [
        { type: 'unsupported_type', some_val: 123 } as any,
      ],
    };

    render(
      <MemoryRouter>
        <ProgressProvider>
          <LessonRenderer lesson={malformedLesson} />
        </ProgressProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/\[Authoring Error\]/)).toBeInTheDocument();
  });
});
