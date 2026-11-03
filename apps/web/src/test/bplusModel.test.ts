import { describe, it, expect } from 'vitest';
import { BPlusModel } from '../services/visualization/bplusModel';

describe('BPlusModel (B+ Tree Laboratory)', () => {
  it('initializes an empty order 3 B+ tree with leaf root', () => {
    const state = BPlusModel.createEmptyState(3);
    expect(state.order).toBe(3);
    expect(state.root.isLeaf).toBe(true);
    expect(state.root.keys).toEqual([]);
    expect(state.height).toBe(1);
    expect(state.totalKeys).toBe(0);

    const inv = BPlusModel.validateInvariants(state);
    expect(inv.valid).toBe(true);
  });

  it('inserts keys into a single leaf until capacity', () => {
    // For order 3, max keys per leaf is order - 1 = 2
    let state = BPlusModel.createEmptyState(3);
    state = BPlusModel.insert(state, 10).nextState;
    expect(state.root.keys).toEqual([10]);

    state = BPlusModel.insert(state, 20).nextState;
    expect(state.root.keys).toEqual([10, 20]);
    expect(state.root.isLeaf).toBe(true);
    expect(state.height).toBe(1);

    const inv = BPlusModel.validateInvariants(state);
    expect(inv.valid).toBe(true);
  });

  it('splits leaf and creates new root on 3rd key insertion (order 3)', () => {
    let state = BPlusModel.createEmptyState(3);
    state = BPlusModel.insert(state, 10).nextState;
    state = BPlusModel.insert(state, 20).nextState;

    // Inserting 30 triggers leaf overflow & root split
    const res = BPlusModel.insert(state, 30);
    state = res.nextState;

    expect(state.root.isLeaf).toBe(false);
    expect(state.height).toBe(2);
    expect(state.root.children?.length).toBe(2);

    // Check separator promotion
    expect(state.root.keys.length).toBe(1);
    const promotedSeparator = state.root.keys[0];
    expect(promotedSeparator).toBe(20);

    // Left leaf has [10], right leaf has [20, 30]
    const leftChild = state.root.children![0];
    const rightChild = state.root.children![1];
    expect(leftChild.isLeaf).toBe(true);
    expect(rightChild.isLeaf).toBe(true);
    expect(leftChild.keys).toEqual([10]);
    expect(rightChild.keys).toEqual([20, 30]);

    // Check leaf linked list
    expect(leftChild.nextLeaf?.id).toBe(rightChild.id);

    const inv = BPlusModel.validateInvariants(state);
    expect(inv.valid).toBe(true);
    expect(res.trace.steps.some((s) => s.operation === 'SPLIT_LEAF')).toBe(true);
    expect(res.trace.steps.some((s) => s.operation === 'ROOT_SPLIT')).toBe(true);
  });

  it('handles multiple splits and maintains uniform leaf depth', () => {
    let state = BPlusModel.createEmptyState(3);
    const keys = [5, 15, 25, 35, 45, 55, 65];

    for (const k of keys) {
      state = BPlusModel.insert(state, k).nextState;
      const inv = BPlusModel.validateInvariants(state);
      expect(inv.valid).toBe(true);
    }

    expect(state.totalKeys).toBe(keys.length);
    expect(state.height).toBeGreaterThanOrEqual(2);
  });

  it('performs range query correctly across leaf linked sibling pointers', () => {
    let state = BPlusModel.createEmptyState(3);
    const keys = [10, 20, 30, 40, 50, 60, 70, 80];

    for (const k of keys) {
      state = BPlusModel.insert(state, k).nextState;
    }

    // Range search from 25 to 65
    const rangeRes = BPlusModel.rangeSearch(state, 25, 65);
    expect(rangeRes.matchedKeys).toEqual([30, 40, 50, 60]);
    expect(rangeRes.trace.steps.some((s) => s.operation === 'SCAN_LEAF')).toBe(true);
    expect(rangeRes.trace.steps.some((s) => s.operation === 'RANGE_COMPLETE')).toBe(true);
  });

  it('maintains invariants over random insertion sequences (property test)', () => {
    const sequences = [
      [88, 12, 45, 67, 23, 91, 34, 76, 52],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Sequential ascending
      [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], // Sequential descending
    ];

    for (const seq of sequences) {
      let state = BPlusModel.createEmptyState(4); // Order 4
      for (const val of seq) {
        state = BPlusModel.insert(state, val).nextState;
        const inv = BPlusModel.validateInvariants(state);
        expect(inv.valid).toBe(true);
      }
      expect(state.totalKeys).toBe(seq.length);
    }
  });
});
