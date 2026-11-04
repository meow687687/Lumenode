import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProgressProvider } from '../context/ProgressContext';
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from '../components/onboarding/OnboardingModal';
import { GlobalSearchModal } from '../components/navigation/GlobalSearchModal';
import { QuizBlock } from '../components/lesson/QuizBlock';
import { SimulationPlayer } from '../components/visualizers/SimulationPlayer';
import { SimulationEngine } from '../services/visualization/simulationEngine';
import { StorageService } from '../services/persistence/storageService';
import { CompilerGatewayClient } from '../services/compilerGateway';
import { SimulationStep } from '@lumenode/shared-types';

describe('Learner End-to-End Journeys', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Journey 1: First-Time Learner Onboarding Flow
  it('Journey 1: Guides new learner through onboarding and remembers dismissal in local-first storage', () => {
    const handleClose = vi.fn();
    render(
      <OnboardingModal isOpen={true} onClose={handleClose} />
    );

    // Initial step: Welcome
    expect(screen.getByText('Explore. Understand. Build.')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Lumenode')).toBeInTheDocument();

    // Advance step 1 -> step 2
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText('Concept-First, Language-Independent')).toBeInTheDocument();

    // Advance through steps to the final step
    fireEvent.click(screen.getByRole('button', { name: /Next/i })); // step 3 (labs)
    expect(screen.getByText('Visual Simulations & In-Browser Engines')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next/i })); // step 4 (mastery)
    expect(screen.getByText('Spaced Repetition, Zero Cramming')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next/i })); // step 5 (privacy)
    expect(screen.getByText('Your Progress Stays With You')).toBeInTheDocument();

    // Finish onboarding
    const finishBtn = screen.getByRole('button', { name: /Start Learning/i });
    fireEvent.click(finishBtn);

    expect(handleClose).toHaveBeenCalled();
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  it('Journey 1b: Allows learner to immediately skip onboarding with a single click', () => {
    const handleClose = vi.fn();
    render(<OnboardingModal isOpen={true} onClose={handleClose} />);

    const skipButtons = screen.getAllByRole('button', { name: /Skip Tour/i });
    fireEvent.click(skipButtons[0]);

    expect(handleClose).toHaveBeenCalled();
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  // Journey 2: Global Cross-Entity Search & Navigation
  it('Journey 2: Discovers content across lessons, concepts, subjects, and languages', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <GlobalSearchModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search lessons, concepts/i);
    expect(searchInput).toBeInTheDocument();

    // Search for pointer-related concepts
    fireEvent.change(searchInput, { target: { value: 'pointer' } });
    expect(screen.getAllByText(/pointer/i).length).toBeGreaterThan(0);

    // Search for a language
    fireEvent.change(searchInput, { target: { value: 'Python' } });
    expect(screen.getAllByText(/Python/i).length).toBeGreaterThan(0);

    // Search for a subject or foundational topic
    fireEvent.change(searchInput, { target: { value: 'binary' } });
    expect(screen.getAllByText(/binary/i).length).toBeGreaterThan(0);
  });

  // Journey 3: Interactive Lesson Assessment with Hints & Mastery
  it('Journey 3: Learner accesses progressive assessment and passes to update mastery', () => {
    render(
      <ProgressProvider>
        <QuizBlock exerciseId="quiz-c-pipeline" />
      </ProgressProvider>
    );

    expect(screen.getByText(/Which phase of the C translation pipeline expands #include directives/i)).toBeInTheDocument();

    // Select correct option: The Preprocessor (cpp)
    const option = screen.getByText(/The Preprocessor \(cpp\)/i);
    fireEvent.click(option);

    // Submit answer
    const submitBtn = screen.getByRole('button', { name: /Verify Answer/i });
    fireEvent.click(submitBtn);

    // Verified scoring: 100 / 100
    expect(screen.getByText(/Score: 100 \/ 100/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Correct!/i).length).toBeGreaterThan(0);
  });

  // Journey 4: Simulation Laboratory Step & Time-Travel Controls
  it('Journey 4: Learner operates simulation player (Step forward, Step backward, Reset)', () => {
    const sampleSteps: SimulationStep<{ value: number }>[] = [
      { stepIndex: 0, operation: 'INIT', description: 'Starting state', stateSnapshot: { value: 0 } },
      { stepIndex: 1, operation: 'ADVANCE', description: 'Advancing operation', stateSnapshot: { value: 10 } },
      { stepIndex: 2, operation: 'FINISH', description: 'Finished operation', stateSnapshot: { value: 20 } },
    ];

    const engine = new SimulationEngine<{ value: number }>({
      trace: {
        id: 'test-trace',
        visualizerId: 'bst',
        title: 'BST Insert Simulation',
        totalSteps: 3,
        initialState: { value: 0 },
        finalState: { value: 20 },
        steps: sampleSteps,
      },
    });

    render(
      <SimulationPlayer
        engine={engine}
      />
    );

    // Initially at -1 before first step
    expect(screen.getByText(/Initial simulation state loaded/i)).toBeInTheDocument();
    expect(screen.getByText('Step 0 of 3')).toBeInTheDocument();

    // Step forward to step 0
    const nextBtn = screen.getByTitle('Step Forward (Right Arrow)');
    act(() => {
      fireEvent.click(nextBtn);
    });
    expect(screen.getByText('Starting state')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();

    // Step forward to step 1
    act(() => {
      fireEvent.click(nextBtn);
    });
    expect(screen.getByText('Advancing operation')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    // Step backward to step 0
    const prevBtn = screen.getByTitle('Step Backward (Left Arrow)');
    act(() => {
      fireEvent.click(prevBtn);
    });
    expect(screen.getByText('Starting state')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  // Journey 5: Local-First Data Portability & Backup Integrity
  it('Journey 5: Learner exports backup snapshot and re-imports into empty session without data loss', () => {
    const completedSet = new Set(['c-pointers-basics', 'dsa-binary-search-tree']);
    StorageService.saveCompletedLessons(completedSet);

    // Export snapshot
    const backupSnapshot = StorageService.exportLearnerBackup();
    expect(backupSnapshot.version).toBe(2);
    expect(backupSnapshot.completedLessons).toContain('c-pointers-basics');
    expect(backupSnapshot.completedLessons).toContain('dsa-binary-search-tree');

    // Wipe storage (simulating browser cache clear or moving to a new computer)
    StorageService.clearAll();
    const cleanState = StorageService.initialize();
    expect(cleanState.completedLessons.size).toBe(0);

    // Import backup JSON
    const jsonString = JSON.stringify(backupSnapshot);
    const importRes = StorageService.importLearnerBackup(jsonString);
    expect(importRes.success).toBe(true);

    // Verify full restoration
    const restoredState = StorageService.initialize();
    expect(restoredState.completedLessons.has('c-pointers-basics')).toBe(true);
    expect(restoredState.completedLessons.has('dsa-binary-search-tree')).toBe(true);
  });

  // Journey 6: Compiler Gateway Offline Failure Resilience
  it('Journey 6: Truthfully reports when remote compiler gateway is unconfigured or offline', async () => {
    // Client with unconfigured gateway
    const unconfiguredClient = new CompilerGatewayClient('');
    const resUnconfigured = await unconfiguredClient.execute({
      sourceCode: '#include <stdio.h>\nint main() { return 0; }',
      language: 'c',
    });

    expect(resUnconfigured.status).toBe('gateway_not_configured');
    expect(resUnconfigured.message).toContain('VITE_COMPILER_GATEWAY_URL');

    // Client with offline/unreachable gateway
    const offlineClient = new CompilerGatewayClient('http://localhost:9999');
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const resOffline = await offlineClient.execute({
      sourceCode: '#include <stdio.h>\nint main() { return 0; }',
      language: 'c',
    });

    expect(resOffline.status).toBe('gateway_unreachable');
    expect(resOffline.message).toContain('Unable to connect to Compiler Gateway');

    global.fetch = originalFetch;
  });
});
