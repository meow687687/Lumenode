/**
 * Reusable, Headless Simulation Engine for Lumenode Visualizations.
 * Pure TypeScript implementation independent of React rendering.
 */

import { SimulationStep, SimulationTrace } from '@lumenode/shared-types';

export interface SimulationEngineOptions<TState extends object> {
  trace: SimulationTrace<TState>;
  snapshotInterval?: number; // Cache state snapshots every N steps for O(1) seeking
  stateReducer?: (prevState: TState, step: SimulationStep<TState>) => TState;
}

export class SimulationEngine<TState extends object> {
  private readonly trace: SimulationTrace<TState>;
  private readonly snapshots: Map<number, TState> = new Map();
  private readonly stateReducer?: (prevState: TState, step: SimulationStep<TState>) => TState;
  private currentStepIndex: number = -1; // -1 means initial state before first step
  private currentState: TState;
  private listeners: Set<() => void> = new Set();

  constructor(options: SimulationEngineOptions<TState>) {
    this.trace = options.trace;
    this.stateReducer = options.stateReducer;
    this.currentState = structuredClone(options.trace.initialState);
    this.snapshots.set(-1, structuredClone(options.trace.initialState));

    // Pre-cache any snapshots bundled with steps
    options.trace.steps.forEach((step, idx) => {
      if (step.stateSnapshot !== undefined) {
        this.snapshots.set(idx, structuredClone(step.stateSnapshot));
      }
    });

    // If a reducer is provided and not all steps have snapshots, build snapshot index
    if (this.stateReducer) {
      const interval = options.snapshotInterval || 5;
      let runningState = structuredClone(options.trace.initialState);
      options.trace.steps.forEach((step, idx) => {
        runningState = this.stateReducer!(runningState, step);
        if (idx % interval === 0 || idx === options.trace.steps.length - 1) {
          if (!this.snapshots.has(idx)) {
            this.snapshots.set(idx, structuredClone(runningState));
          }
        }
      });
    }
  }

  public getTrace(): SimulationTrace<TState> {
    return this.trace;
  }

  public getTotalSteps(): number {
    return this.trace.steps.length;
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public getCurrentStep(): SimulationStep<TState> | null {
    if (this.currentStepIndex < 0 || this.currentStepIndex >= this.trace.steps.length) {
      return null;
    }
    return this.trace.steps[this.currentStepIndex];
  }

  public getCurrentState(): TState {
    return this.currentState;
  }

  public canStepForward(): boolean {
    return this.currentStepIndex < this.trace.steps.length - 1;
  }

  public canStepBackward(): boolean {
    return this.currentStepIndex > -1;
  }

  public stepForward(): boolean {
    if (!this.canStepForward()) {
      return false;
    }
    this.jumpToStep(this.currentStepIndex + 1);
    return true;
  }

  public stepBackward(): boolean {
    if (!this.canStepBackward()) {
      return false;
    }
    this.jumpToStep(this.currentStepIndex - 1);
    return true;
  }

  public jumpToStep(targetIndex: number): void {
    const clampedIndex = Math.max(-1, Math.min(this.trace.steps.length - 1, targetIndex));
    if (clampedIndex === this.currentStepIndex) return;

    if (clampedIndex === -1) {
      this.currentStepIndex = -1;
      this.currentState = structuredClone(this.trace.initialState);
      this.notify();
      return;
    }

    // Direct snapshot hit
    if (this.snapshots.has(clampedIndex)) {
      this.currentStepIndex = clampedIndex;
      this.currentState = structuredClone(this.snapshots.get(clampedIndex)!);
      this.notify();
      return;
    }

    // If step itself has snapshot
    const targetStep = this.trace.steps[clampedIndex];
    if (targetStep.stateSnapshot !== undefined) {
      this.currentStepIndex = clampedIndex;
      this.currentState = structuredClone(targetStep.stateSnapshot);
      this.snapshots.set(clampedIndex, structuredClone(this.currentState));
      this.notify();
      return;
    }

    // Otherwise find closest preceding snapshot and advance with reducer
    if (this.stateReducer) {
      let nearestSnapshotIndex = -1;
      for (const idx of this.snapshots.keys()) {
        if (idx <= clampedIndex && idx > nearestSnapshotIndex) {
          nearestSnapshotIndex = idx;
        }
      }

      let state = structuredClone(this.snapshots.get(nearestSnapshotIndex)!);
      for (let i = nearestSnapshotIndex + 1; i <= clampedIndex; i++) {
        state = this.stateReducer(state, this.trace.steps[i]);
      }
      this.currentStepIndex = clampedIndex;
      this.currentState = state;
      this.snapshots.set(clampedIndex, structuredClone(state));
      this.notify();
      return;
    }

    // If no reducer and no snapshot, fallback to closest available snapshot
    let nearestIndex = -1;
    for (const idx of this.snapshots.keys()) {
      if (idx <= clampedIndex && idx > nearestIndex) {
        nearestIndex = idx;
      }
    }
    this.currentStepIndex = clampedIndex;
    this.currentState = structuredClone(this.snapshots.get(nearestIndex) ?? this.trace.initialState);
    this.notify();
  }

  public reset(): void {
    this.jumpToStep(-1);
  }

  public getProgress(): number {
    if (this.trace.steps.length === 0) return 100;
    if (this.currentStepIndex < 0) return 0;
    return Math.round(((this.currentStepIndex + 1) / this.trace.steps.length) * 100);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
