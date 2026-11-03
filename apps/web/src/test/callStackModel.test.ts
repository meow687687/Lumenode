import { describe, it, expect } from 'vitest';
import { CallStackModel } from '../services/visualization/callStackModel';

describe('CallStackModel (C Call-Stack & Activation Record Simulator)', () => {
  it('generates simple function call trace with parameter passing and frame cleanup', () => {
    const trace = CallStackModel.generateSimpleCallTrace();
    expect(trace.totalSteps).toBeGreaterThan(0);
    expect(trace.steps.some((s) => s.operation === 'CALL_MAIN')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'CALL_FUNCTION')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'EVALUATE_LOCAL')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'RETURN_VALUE')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'POP_FRAME')).toBe(true);
    expect(trace.finalState.stdout).toContain('7');
    expect(trace.finalState.abiNote).toContain('Pedagogical Architecture Model');
  });

  it('traces recursive factorial with stack growth and unwinding', () => {
    const n = 4;
    const trace = CallStackModel.generateFactorialTrace(n);

    // Max depth should include main + n factorial frames = 5
    expect(trace.finalState.maxDepth).toBe(5);

    // Should include base case
    expect(trace.steps.some((s) => s.operation === 'BASE_CASE')).toBe(true);

    // Should include multiple unwinds
    const unwinds = trace.steps.filter((s) => s.operation === 'STACK_POP_UNWIND');
    expect(unwinds.length).toBe(4);

    // 4! = 24
    expect(trace.finalState.stdout).toContain('24');
  });

  it('simulates nested function calls with peak depth and sequential pops', () => {
    const trace = CallStackModel.generateNestedCallsTrace();

    // main -> process -> helper -> compute = 4 frames
    expect(trace.finalState.maxDepth).toBe(4);
    expect(trace.steps.some((s) => s.operation === 'CALL_COMPUTE')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'POP_COMPUTE')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'POP_HELPER')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'POP_PROCESS')).toBe(true);
  });

  it('simulates branching recursive Fibonacci', () => {
    const trace = CallStackModel.generateFibonacciTrace(3);

    expect(trace.steps.some((s) => s.operation === 'BRANCH_LEFT')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'BRANCH_RIGHT')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'SUM_BRANCHES')).toBe(true);
    expect(trace.steps.some((s) => s.operation === 'COMPLETED')).toBe(true);
    expect(trace.finalState.frames[0].localVariables.res).toBe(2); // fib(3) = 2
  });
});
