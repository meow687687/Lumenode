import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../services/visualization/simulationEngine';
import { SimulationTrace, SimulationStep } from '@lumenode/shared-types';

describe('SimulationEngine Core', () => {
  interface CounterState {
    count: number;
  }

  const sampleSteps: SimulationStep<CounterState>[] = [
    {
      stepIndex: 0,
      operation: 'INC',
      description: 'Incremented to 1',
      highlightedNodeIds: ['c1'],
      secondaryHighlightedNodeIds: [],
      activePointerIds: [],
      stateSnapshot: { count: 1 },
    },
    {
      stepIndex: 1,
      operation: 'INC',
      description: 'Incremented to 2',
      highlightedNodeIds: ['c2'],
      secondaryHighlightedNodeIds: [],
      activePointerIds: [],
      stateSnapshot: { count: 2 },
    },
    {
      stepIndex: 2,
      operation: 'INC',
      description: 'Incremented to 3',
      highlightedNodeIds: ['c3'],
      secondaryHighlightedNodeIds: [],
      activePointerIds: [],
      stateSnapshot: { count: 3 },
    },
  ];

  const sampleTrace: SimulationTrace<CounterState> = {
    id: 'trace-test',
    visualizerId: 'counter',
    title: 'Counter Trace',
    totalSteps: 3,
    steps: sampleSteps,
    initialState: { count: 0 },
    finalState: { count: 3 },
  };

  it('initializes at step index -1 with initialState', () => {
    const engine = new SimulationEngine({ trace: sampleTrace });
    expect(engine.getCurrentStepIndex()).toBe(-1);
    expect(engine.getCurrentStep()).toBeNull();
    expect(engine.getCurrentState()).toEqual({ count: 0 });
    expect(engine.canStepBackward()).toBe(false);
    expect(engine.canStepForward()).toBe(true);
    expect(engine.getProgress()).toBe(0);
  });

  it('steps forward and backward deterministically', () => {
    const engine = new SimulationEngine({ trace: sampleTrace });

    expect(engine.stepForward()).toBe(true);
    expect(engine.getCurrentStepIndex()).toBe(0);
    expect(engine.getCurrentState()).toEqual({ count: 1 });
    expect(engine.getCurrentStep()?.operation).toBe('INC');

    expect(engine.stepForward()).toBe(true);
    expect(engine.getCurrentStepIndex()).toBe(1);
    expect(engine.getCurrentState()).toEqual({ count: 2 });

    expect(engine.stepForward()).toBe(true);
    expect(engine.getCurrentStepIndex()).toBe(2);
    expect(engine.getCurrentState()).toEqual({ count: 3 });
    expect(engine.canStepForward()).toBe(false);

    // Cannot step beyond end
    expect(engine.stepForward()).toBe(false);

    // Step backward
    expect(engine.stepBackward()).toBe(true);
    expect(engine.getCurrentStepIndex()).toBe(1);
    expect(engine.getCurrentState()).toEqual({ count: 2 });

    expect(engine.stepBackward()).toBe(true);
    expect(engine.getCurrentStepIndex()).toBe(0);
    expect(engine.getCurrentState()).toEqual({ count: 1 });

    expect(engine.stepBackward()).toBe(true);
    expect(engine.getCurrentStepIndex()).toBe(-1);
    expect(engine.getCurrentState()).toEqual({ count: 0 });
    expect(engine.canStepBackward()).toBe(false);
  });

  it('supports jumpToStep and reset', () => {
    const engine = new SimulationEngine({ trace: sampleTrace });

    engine.jumpToStep(2);
    expect(engine.getCurrentStepIndex()).toBe(2);
    expect(engine.getCurrentState()).toEqual({ count: 3 });

    engine.reset();
    expect(engine.getCurrentStepIndex()).toBe(-1);
    expect(engine.getCurrentState()).toEqual({ count: 0 });
  });

  it('notifies subscribers on step changes', () => {
    const engine = new SimulationEngine({ trace: sampleTrace });
    let callCount = 0;
    const unsubscribe = engine.subscribe(() => {
      callCount++;
    });

    engine.stepForward();
    engine.stepForward();
    expect(callCount).toBe(2);

    unsubscribe();
    engine.stepForward();
    expect(callCount).toBe(2);
  });
});
