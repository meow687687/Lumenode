import { describe, it, expect } from 'vitest';
import { BSTModel } from '../services/visualization/bstModel';

describe('BSTModel (Binary Search Tree Laboratory)', () => {
  it('handles empty tree operations gracefully', () => {
    const emptyState = BSTModel.createEmptyState();
    expect(emptyState.root).toBeNull();
    expect(emptyState.nodeCount).toBe(0);
    expect(emptyState.height).toBe(0);

    const searchTrace = BSTModel.search(emptyState, 42);
    expect(searchTrace.steps[0].operation).toBe('SEARCH_EMPTY');

    const delRes = BSTModel.delete(emptyState, 42);
    expect(delRes.nextState.root).toBeNull();
    expect(delRes.trace.steps[0].operation).toBe('DELETE_EMPTY');

    const travRes = BSTModel.traverse(emptyState, 'inorder');
    expect(travRes.visited).toEqual([]);
    expect(travRes.trace.steps[0].operation).toBe('TRAVERSE_EMPTY');
  });

  it('inserts a single root node correctly', () => {
    let state = BSTModel.createEmptyState();
    const res = BSTModel.insert(state, 50);
    state = res.nextState;

    expect(state.root).not.toBeNull();
    expect(state.root?.value).toBe(50);
    expect(state.nodeCount).toBe(1);
    expect(state.height).toBe(1);
    expect(BSTModel.validateBSTInvariants(state.root).valid).toBe(true);
  });

  it('rejects duplicate insertion per strict BST uniqueness policy', () => {
    let state = BSTModel.createEmptyState();
    state = BSTModel.insert(state, 50).nextState;
    const dupRes = BSTModel.insert(state, 50);

    expect(dupRes.nextState.nodeCount).toBe(1);
    const hasDupStep = dupRes.trace.steps.some((s) => s.operation === 'DUPLICATE_REJECTED');
    expect(hasDupStep).toBe(true);
  });

  it('handles left and right child insertions maintaining BST invariants', () => {
    let state = BSTModel.createEmptyState();
    state = BSTModel.insert(state, 50).nextState;
    state = BSTModel.insert(state, 25).nextState; // left
    state = BSTModel.insert(state, 75).nextState; // right
    state = BSTModel.insert(state, 10).nextState; // left-left
    state = BSTModel.insert(state, 30).nextState; // left-right

    expect(state.nodeCount).toBe(5);
    expect(state.root?.left?.value).toBe(25);
    expect(state.root?.right?.value).toBe(75);
    expect(state.root?.left?.left?.value).toBe(10);
    expect(state.root?.left?.right?.value).toBe(30);

    const inv = BSTModel.validateBSTInvariants(state.root);
    expect(inv.valid).toBe(true);
  });

  it('correctly searches for existing and missing keys', () => {
    let state = BSTModel.createEmptyState();
    [50, 20, 80, 10, 30].forEach((val) => {
      state = BSTModel.insert(state, val).nextState;
    });

    const hit = BSTModel.search(state, 30);
    expect(hit.steps.some((s) => s.operation === 'FOUND')).toBe(true);

    const miss = BSTModel.search(state, 99);
    expect(miss.steps.some((s) => s.operation === 'NOT_FOUND')).toBe(true);
  });

  it('performs all 4 tree traversals accurately', () => {
    let state = BSTModel.createEmptyState();
    // Tree: 50, 20, 70, 10, 30
    [50, 20, 70, 10, 30].forEach((v) => {
      state = BSTModel.insert(state, v).nextState;
    });

    const inorder = BSTModel.traverse(state, 'inorder');
    expect(inorder.visited).toEqual([10, 20, 30, 50, 70]); // Sorted ascending!

    const preorder = BSTModel.traverse(state, 'preorder');
    expect(preorder.visited).toEqual([50, 20, 10, 30, 70]); // Root, Left, Right

    const postorder = BSTModel.traverse(state, 'postorder');
    expect(postorder.visited).toEqual([10, 30, 20, 70, 50]); // Left, Right, Root

    const levelorder = BSTModel.traverse(state, 'levelorder');
    expect(levelorder.visited).toEqual([50, 20, 70, 10, 30]); // BFS by depth
  });

  it('deletes a leaf node (0 children)', () => {
    let state = BSTModel.createEmptyState();
    [50, 25, 75].forEach((v) => {
      state = BSTModel.insert(state, v).nextState;
    });

    const res = BSTModel.delete(state, 75);
    state = res.nextState;

    expect(state.nodeCount).toBe(2);
    expect(state.root?.right).toBeNull();
    expect(res.trace.steps.some((s) => s.operation === 'DELETE_LEAF')).toBe(true);
    expect(BSTModel.validateBSTInvariants(state.root).valid).toBe(true);
  });

  it('deletes a node with one child (splices child to parent)', () => {
    let state = BSTModel.createEmptyState();
    // 50 -> left: 25 -> left: 10
    [50, 25, 10].forEach((v) => {
      state = BSTModel.insert(state, v).nextState;
    });

    const res = BSTModel.delete(state, 25);
    state = res.nextState;

    expect(state.nodeCount).toBe(2);
    expect(state.root?.left?.value).toBe(10);
    expect(res.trace.steps.some((s) => s.operation === 'DELETE_ONE_CHILD')).toBe(true);
    expect(BSTModel.validateBSTInvariants(state.root).valid).toBe(true);
  });

  it('deletes a node with two children (replaces with inorder successor)', () => {
    let state = BSTModel.createEmptyState();
    // 50, 25, 75, 60, 90, 65
    [50, 25, 75, 60, 90, 65].forEach((v) => {
      state = BSTModel.insert(state, v).nextState;
    });

    // Node 75 has two children (60 and 90). In-order successor is 90 (min in right subtree).
    const res = BSTModel.delete(state, 75);
    state = res.nextState;

    expect(state.nodeCount).toBe(5);
    expect(state.root?.right?.value).toBe(90); // Replaced by successor
    expect(res.trace.steps.some((s) => s.operation === 'SUCCESSOR_FOUND')).toBe(true);
    expect(BSTModel.validateBSTInvariants(state.root).valid).toBe(true);

    const inorder = BSTModel.traverse(state, 'inorder');
    expect(inorder.visited).toEqual([25, 50, 60, 65, 90]);
  });
});
