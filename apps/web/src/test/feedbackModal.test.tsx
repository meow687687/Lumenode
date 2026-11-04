import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackModal, FEEDBACK_STORAGE_KEY } from '../components/feedback/FeedbackModal';

describe('FeedbackModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders feedback categories and requires at least 3 characters', () => {
    const handleClose = vi.fn();
    render(
      <FeedbackModal
        isOpen={true}
        onClose={handleClose}
        initialLessonId="c-pointers-basics"
      />
    );

    expect(screen.getByText('Beta Feedback & Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Rate Clarity')).toBeInTheDocument();
    expect(screen.getByText('Suggestion')).toBeInTheDocument();
    expect(screen.getByText('Report Problem')).toBeInTheDocument();
    expect(screen.getByText('Educational Error')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Submit Feedback/i });
    expect(submitBtn).toBeDisabled();

    // Type comment
    const textarea = screen.getByPlaceholderText(/What was confusing, inspiring, or broken/i);
    fireEvent.change(textarea, { target: { value: 'Great visualization on pointer arithmetic!' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('successfully records feedback into localStorage queue upon submission', () => {
    const handleClose = vi.fn();
    render(
      <FeedbackModal
        isOpen={true}
        onClose={handleClose}
        initialLessonId="dsa-binary-search-tree"
        initialConceptId="dsa.bst"
      />
    );

    // Switch to educational error
    fireEvent.click(screen.getByText('Educational Error'));

    const textarea = screen.getByPlaceholderText(/What was confusing, inspiring, or broken/i);
    fireEvent.change(textarea, { target: { value: 'Typo in section 2: "left child" should be "right child"' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Feedback/i });
    fireEvent.click(submitBtn);

    // Success screen
    expect(screen.getByText('Thank You for Your Feedback!')).toBeInTheDocument();

    // Verify localStorage
    const storedRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    const stored = JSON.parse(storedRaw!);
    expect(stored.length).toBe(1);
    expect(stored[0].category).toBe('educational_error');
    expect(stored[0].lessonId).toBe('dsa-binary-search-tree');
    expect(stored[0].comment).toContain('Typo in section 2');
  });
});
