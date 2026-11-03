import { describe, it, expect } from 'vitest';
import { AVLModel } from '../services/visualization/avlModel';

describe('AVLModel (AVL Self-Balancing Tree Laboratory)', () => {
  it('initializes empty state properly', () => {
    const emptyState = AVLModel.createEmptyState();
    expect(emptyState.root).toBeNull();
    expect(emptyState.nodeCount).toBe(0);
    expect(emptyState.height).toBe(0);
    expect(AVLModel.validateAVLInvariants(emptyState.root).valid).toBe(true);
  });

  it('performs Left-Left (LL) right rotation correctly', () => {
    // Inserting decreasing sequence: 30, 20, 10 triggers LL imbalance at 30
    let state = AVLModel.createEmptyState();
    state = AVLModel.insert(state, 30).nextState;
    state = AVLModel.insert(state, 20).nextState;
    const res = AVLModel.insert(state, 10);
    state = res.nextState;

    expect(state.nodeCount).toBe(3);
    expect(state.root?.value).toBe(20); // 20 rotated to root
    expect(state.root?.left?.value).toBe(10);
    expect(state.root?.right?.value).toBe(30);

    // Balance factors and heights
    expect(state.root?.balanceFactor).toBe(0);
    expect(state.root?.height).toBe(2);

    expect(res.trace.steps.some((s) => s.operation === 'IMBALANCE_DETECTED_LL')).toBe(true);
    expect(res.trace.steps.some((s) => s.operation === 'ROTATING_RIGHT')).toBe(true);
    expect(AVLModel.validateAVLInvariants(state.root).valid).toBe(true);
  });

  it('performs Right-Right (RR) left rotation correctly', () => {
    // Inserting increasing sequence: 10, 20, 30 triggers RR imbalance at 10
    let state = AVLModel.createEmptyState();
    state = AVLModel.insert(state, 10).nextState;
    state = AVLModel.insert(state, 20).nextState;
    const res = AVLModel.insert(state, 30);
    state = res.nextState;

    expect(state.nodeCount).toBe(3);
    expect(state.root?.value).toBe(20); // 20 rotated to root
    expect(state.root?.left?.value).toBe(10);
    expect(state.root?.right?.value).toBe(30);

    expect(res.trace.steps.some((s) => s.operation === 'IMBALANCE_DETECTED_RR')).toBe(true);
    expect(res.trace.steps.some((s) => s.operation === 'ROTATING_LEFT')).toBe(true);
    expect(AVLModel.validateAVLInvariants(state.root).valid).toBe(true);
  });

  it('performs Left-Right (LR) double rotation correctly', () => {
    // Sequence 30, 10, 20 triggers LR imbalance at 30
    let state = AVLModel.createEmptyState();
    state = AVLModel.insert(state, 30).nextState;
    state = AVLModel.insert(state, 10).nextState;
    const res = AVLModel.insert(state, 20);
    state = res.nextState;

    expect(state.nodeCount).toBe(3);
    expect(state.root?.value).toBe(20); // 20 hoisted to root
    expect(state.root?.left?.value).toBe(10);
    expect(state.root?.right?.value).toBe(30);

    expect(res.trace.steps.some((s) => s.operation === 'IMBALANCE_DETECTED_LR')).toBe(true);
    expect(AVLModel.validateAVLInvariants(state.root).valid).toBe(true);
  });

  it('performs Right-Left (RL) double rotation correctly', () => {
    // Sequence 10, 30, 20 triggers RL imbalance at 10
    let state = AVLModel.createEmptyState();
    state = AVLModel.insert(state, 10).nextState;
    state = AVLModel.insert(state, 30).nextState;
    const res = AVLModel.insert(state, 20);
    state = res.nextState;

    expect(state.nodeCount).toBe(3);
    expect(state.root?.value).toBe(20);
    expect(state.root?.left?.value).toBe(10);
    expect(state.root?.right?.value).toBe(30);

    expect(res.trace.steps.some((s) => s.operation === 'IMBALANCE_DETECTED_RL')).toBe(true);
    expect(AVLModel.validateAVLInvariants(state.root).valid).toBe(true);
  });

  it('maintains AVL balance invariant across larger insertion sequence', () => {
    const keys = [45, 23, 78, 12, 34, 67, 89, 5, 18, 29, 39, 56, 71, 82, 95];
    let state = AVLModel.createEmptyState();

    for (const key of keys) {
      const res = AVLModel.insert(state, key);
      state = res.nextState;
      const inv = AVLModel.validateAVLInvariants(state.root);
      expect(inv.valid).toBe(true);
    }

    expect(state.nodeCount).toBe(keys.length);
    // 15 nodes in perfectly balanced tree has height <= 5
    expect(state.height).toBeLessThanOrEqual(5);
  });
});
