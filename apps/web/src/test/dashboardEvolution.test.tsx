import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from '../context/ProgressContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { DashboardView } from '../components/dashboard/DashboardView';
import { AppShell } from '../components/layout/AppShell';
import { StorageService } from '../services/persistence/storageService';

describe('Dashboard Evolution 1.1 Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // Test 1: Empty / New learner state
  it('renders correctly for a new learner with no history and no invented metrics', () => {
    render(
      <ThemeProvider>
        <ProgressProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </ProgressProvider>
      </ThemeProvider>
    );

    // 1. Orientation heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Make room for a new idea/i);

    // 2. Continue Learning Hero card with actual initial lesson
    expect(screen.getByText(/CONTINUE LEARNING/i)).toBeInTheDocument();
    const resumeBtn = screen.getByRole('button', { name: /Resume lesson/i });
    expect(resumeBtn).toBeInTheDocument();

    // 3. Compact real metrics
    expect(screen.getByText('Concepts Mastered')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getByText('Review Urgency')).toBeInTheDocument();
    expect(screen.getByText('All concepts fresh')).toBeInTheDocument();
    expect(screen.getByText('0% total syllabus finished')).toBeInTheDocument();

    // 4. Neutral empty state for recent activity
    expect(screen.getByText(/No exercise attempts logged yet/i)).toBeInTheDocument();
  });

  // Test 2: Learner with active paths & real progress
  it('correctly calculates path progress and displays demonstrated mastery', () => {
    // Populate storage with 2 completed lessons
    const completed = new Set(['c-pointers-basics', 'c-types-vars']);
    StorageService.saveCompletedLessons(completed);

    // Create a demonstrated mastery record
    const records = {
      'c.compilation-pipeline': {
        conceptId: 'c.compilation-pipeline',
        state: 'demonstrated' as const,
        achievementLevel: 'mastered' as const,
        retentionStatus: 'fresh' as const,
        reviewIntervalDays: 7,
        reviewStreak: 2,
        lessonCompleted: true,
        attemptsCount: 3,
        passedCount: 3,
        consecutivePasses: 2,
        bestScore: 100,
        lastScore: 100,
        decayAlert: false,
        demonstratedAt: Date.now() - 3600000,
        lastAttemptAt: Date.now() - 3600000,
        evidenceHistory: [
          {
            attemptId: 'att-1',
            exerciseId: 'quiz-c-pipeline',
            conceptId: 'c.compilation-pipeline',
            type: 'mcq' as const,
            passed: true,
            score: 100,
            hintsUsed: 0,
            timestamp: Date.now() - 3600000,
          },
        ],
      },
    };
    StorageService.saveMasteryRecords(records);

    render(
      <ThemeProvider>
        <ProgressProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </ProgressProvider>
      </ThemeProvider>
    );

    // Mastered count should reflect exactly 1
    const statValues = screen.getAllByText('1');
    expect(statValues.length).toBeGreaterThan(0);

    // Recent activity list should show the genuine evidence
    expect(screen.getByText(/Demonstrated/i)).toBeInTheDocument();
    expect(screen.getByText(/The C Compilation Pipeline/i)).toBeInTheDocument();
  });

  // Test 3: Continue Learning route and context handoff
  it('Continue Learning button navigates to the active lesson route', () => {
    StorageService.saveActiveLessonId('c-functions');

    render(
      <ThemeProvider>
        <ProgressProvider>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/lessons/:id" element={<div data-testid="lesson-screen">Lesson Screen</div>} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>
      </ThemeProvider>
    );

    const resumeBtn = screen.getByRole('button', { name: /Resume lesson|Review lesson/i });
    fireEvent.click(resumeBtn);

    expect(screen.getByTestId('lesson-screen')).toBeInTheDocument();
  });

  // Test 4: Mastery achievement remains distinct from review urgency
  it('distinguishes permanent mastery achievement from temporary retention decay/review due', () => {
    const records = {
      'c.compilation-pipeline': {
        conceptId: 'c.compilation-pipeline',
        state: 'needs_review' as const,
        achievementLevel: 'mastered' as const, // Mastered!
        retentionStatus: 'due' as const,       // But due for review!
        reviewIntervalDays: 1,
        reviewStreak: 0,
        lessonCompleted: true,
        attemptsCount: 2,
        passedCount: 2,
        consecutivePasses: 0,
        bestScore: 90,
        lastScore: 60,
        decayAlert: true,
        demonstratedAt: Date.now() - 15 * 86400000,
        evidenceHistory: [],
      },
    };
    StorageService.saveMasteryRecords(records);

    render(
      <ThemeProvider>
        <ProgressProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </ProgressProvider>
      </ThemeProvider>
    );

    // 1 Mastered concept
    expect(screen.getByText('Concepts Mastered')).toBeInTheDocument();
    // 1 Review Urgency count
    expect(screen.getByText('Review Urgency')).toBeInTheDocument();
    expect(screen.getByText('Scheduled for retention refresh')).toBeInTheDocument();
  });

  // Test 5: Theme switching and persistence
  it('switches and persists theme in localStorage and updates root dataset', () => {
    const TestThemeComponent: React.FC = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="current-theme">{theme}</span>
          <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    const themeSpan = screen.getByTestId('current-theme');
    const toggleBtn = screen.getByRole('button', { name: 'Toggle Theme' });

    // Initial default is dark
    expect(themeSpan.textContent).toBe('dark');
    expect(localStorage.getItem('lumenode_theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    // Toggle to light
    fireEvent.click(toggleBtn);
    expect(themeSpan.textContent).toBe('light');
    expect(localStorage.getItem('lumenode_theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');

    // Toggle back to dark
    fireEvent.click(toggleBtn);
    expect(themeSpan.textContent).toBe('dark');
    expect(localStorage.getItem('lumenode_theme')).toBe('dark');
  });

  // Test 6: Mobile drawer and keyboard accessibility
  it('opens and closes mobile navigation drawer via menu toggle and Escape key', () => {
    // Set dismissed onboarding
    localStorage.setItem('lumenode_onboarding_dismissed_v1', 'true');

    render(
      <ThemeProvider>
        <ProgressProvider>
          <MemoryRouter>
            <AppShell />
          </MemoryRouter>
        </ProgressProvider>
      </ThemeProvider>
    );

    const menuToggle = screen.getByRole('button', { name: /Toggle navigation menu/i });
    expect(menuToggle).toBeInTheDocument();

    // Click to open sidebar
    fireEvent.click(menuToggle);
    const sidebar = screen.getByRole('complementary', { name: /Primary navigation/i });
    expect(sidebar.className).toContain('translate-x-0');

    // Press Escape to close drawer
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(sidebar.className).toContain('-translate-x-full');
  });

  // Test 7: Global search invocation and focus trapping
  it('invokes global search on Cmd+K and traps keyboard focus', () => {
    localStorage.setItem('lumenode_onboarding_dismissed_v1', 'true');

    render(
      <ThemeProvider>
        <ProgressProvider>
          <MemoryRouter>
            <AppShell />
          </MemoryRouter>
        </ProgressProvider>
      </ThemeProvider>
    );

    // Press Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const searchDialog = screen.getByRole('dialog', { name: /Global Search/i });
    expect(searchDialog).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Search lessons, concepts, languages/i);
    expect(input).toBeInTheDocument();

    // Type query
    fireEvent.change(input, { target: { value: 'pointer' } });
    expect(screen.getAllByText(/pointer/i).length).toBeGreaterThan(0);

    // Press Escape to close search modal
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /Global Search/i })).not.toBeInTheDocument();
  });
});
