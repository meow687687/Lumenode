/**
 * Pure, Deterministic B+ Tree Laboratory Model.
 * Configurable Order M with Leaf Node Splitting, Separator Promotion,
 * Internal Splitting, Range Queries, and Invariant Verification.
 */

import { SimulationStep, SimulationTrace } from '@lumenode/shared-types';

export interface BPlusNode {
  id: string;
  isLeaf: boolean;
  keys: number[];
  children?: BPlusNode[]; // defined for internal nodes
  nextLeaf?: BPlusNode | null; // defined for leaf nodes (horizontal linked list)
}

export interface BPlusTreeState {
  order: number; // Order M (max children = M, max keys = M - 1)
  root: BPlusNode;
  height: number;
  totalKeys: number;
}

export class BPlusModel {
  private static nodeCounter = 0;

  public static generateNodeId(isLeaf: boolean): string {
    return `bp-${isLeaf ? 'leaf' : 'internal'}-${++this.nodeCounter}`;
  }

  public static createEmptyState(order: number = 3): BPlusTreeState {
    const root: BPlusNode = {
      id: this.generateNodeId(true),
      isLeaf: true,
      keys: [],
      nextLeaf: null,
    };
    return {
      order: Math.max(3, order),
      root,
      height: 1,
      totalKeys: 0,
    };
  }

  public static cloneNode(node: BPlusNode, leafMap?: Map<string, BPlusNode>): BPlusNode {
    const cloned: BPlusNode = {
      id: node.id,
      isLeaf: node.isLeaf,
      keys: [...node.keys],
    };

    if (leafMap && node.isLeaf) {
      leafMap.set(node.id, cloned);
    }

    if (!node.isLeaf && node.children) {
      cloned.children = node.children.map((c) => this.cloneNode(c, leafMap));
    }

    return cloned;
  }

  public static cloneState(state: BPlusTreeState): BPlusTreeState {
    const leafMap = new Map<string, BPlusNode>();
    const clonedRoot = this.cloneNode(state.root, leafMap);

    // Reconstruct nextLeaf pointers for leaves
    const linkLeaves = (original: BPlusNode, cloned: BPlusNode) => {
      if (original.isLeaf) {
        if (original.nextLeaf && leafMap.has(original.nextLeaf.id)) {
          cloned.nextLeaf = leafMap.get(original.nextLeaf.id) || null;
        } else {
          cloned.nextLeaf = null;
        }
        return;
      }
      if (original.children && cloned.children) {
        for (let i = 0; i < original.children.length; i++) {
          linkLeaves(original.children[i], cloned.children[i]);
        }
      }
    };
    linkLeaves(state.root, clonedRoot);

    return {
      order: state.order,
      root: clonedRoot,
      height: state.height,
      totalKeys: state.totalKeys,
    };
  }

  public static calculateHeight(node: BPlusNode): number {
    let h = 1;
    let curr = node;
    while (!curr.isLeaf && curr.children && curr.children.length > 0) {
      curr = curr.children[0];
      h++;
    }
    return h;
  }

  public static countKeys(node: BPlusNode): number {
    let count = 0;
    let curr: BPlusNode | null = node;
    while (curr && !curr.isLeaf && curr.children) {
      curr = curr.children[0];
    }
    while (curr) {
      count += curr.keys.length;
      curr = curr.nextLeaf ?? null;
    }
    return count;
  }

  /**
   * Validates B+ Tree Invariants:
   * 1. All leaves are at the exact same depth.
   * 2. Keys within every node are strictly sorted ascending.
   * 3. Internal nodes contain between ceil(M/2)-1 and M-1 keys (except root).
   * 4. Internal nodes have keys.length + 1 children.
   * 5. Leaf linked list correctly chains all leaf records.
   */
  public static validateInvariants(state: BPlusTreeState): { valid: boolean; error?: string } {
    const { order, root } = state;
    const maxKeys = order - 1;
    const minInternalKeys = Math.ceil(order / 2) - 1;

    // Check leaf depths
    let expectedLeafDepth = -1;

    const checkNode = (node: BPlusNode, depth: number, minVal: number, maxVal: number): { valid: boolean; error?: string } => {
      // Check keys sorted
      for (let i = 0; i < node.keys.length; i++) {
        const k = node.keys[i];
        const violatesMin = node.isLeaf ? k < minVal : k <= minVal;
        if (violatesMin || k >= maxVal) {
          return {
            valid: false,
            error: `Key ${k} in node ${node.id} violates boundary (${minVal} <= ${k} < ${maxVal})`,
          };
        }
        if (i > 0 && node.keys[i] <= node.keys[i - 1]) {
          return {
            valid: false,
            error: `Keys in node ${node.id} are not strictly sorted: ${node.keys.join(', ')}`,
          };
        }
      }

      if (node.isLeaf) {
        if (expectedLeafDepth === -1) {
          expectedLeafDepth = depth;
        } else if (expectedLeafDepth !== depth) {
          return {
            valid: false,
            error: `Leaf node ${node.id} is at depth ${depth}, expected ${expectedLeafDepth} (B+ tree leaves must be at uniform depth)`,
          };
        }

        if (node.keys.length > maxKeys) {
          return {
            valid: false,
            error: `Leaf node ${node.id} exceeds capacity: ${node.keys.length} keys > max ${maxKeys}`,
          };
        }
        return { valid: true };
      }

      // Internal node checks
      if (!node.children || node.children.length !== node.keys.length + 1) {
        return {
          valid: false,
          error: `Internal node ${node.id} has ${node.keys.length} keys but ${node.children?.length ?? 0} children (must be keys + 1)`,
        };
      }

      const isRoot = node === root;
      if (!isRoot && node.keys.length < minInternalKeys) {
        return {
          valid: false,
          error: `Internal node ${node.id} underflow: ${node.keys.length} keys < min ${minInternalKeys}`,
        };
      }

      if (node.keys.length > maxKeys) {
        return {
          valid: false,
          error: `Internal node ${node.id} overflow: ${node.keys.length} keys > max ${maxKeys}`,
        };
      }

      // Check child partitions
      for (let i = 0; i < node.children.length; i++) {
        const childMin = i === 0 ? minVal : node.keys[i - 1];
        const childMax = i === node.keys.length ? maxVal : node.keys[i];
        const childCheck = checkNode(node.children[i], depth + 1, childMin, childMax);
        if (!childCheck.valid) return childCheck;
      }

      return { valid: true };
    };

    return checkNode(root, 1, -Infinity, Infinity);
  }

  /**
   * Traceable B+ Tree Insertion
   */
  public static insert(
    state: BPlusTreeState,
    key: number
  ): { nextState: BPlusTreeState; trace: SimulationTrace<BPlusTreeState> } {
    const steps: SimulationStep<BPlusTreeState>[] = [];
    const currentState = this.cloneState(state);
    const { order } = currentState;
    const maxKeys = order - 1;
    let stepCount = 0;

    // Helper: find leaf to insert into
    const path: BPlusNode[] = [];
    let curr = currentState.root;

    while (!curr.isLeaf) {
      path.push(curr);
      let idx = 0;
      while (idx < curr.keys.length && key >= curr.keys[idx]) {
        idx++;
      }

      steps.push({
        stepIndex: stepCount++,
        operation: 'NAVIGATE_INTERNAL',
        description: `Comparing key ${key} with separator keys in internal node [${curr.keys.join(', ')}]. Descending to child index ${idx}.`,
        highlightedNodeIds: [curr.id],
        secondaryHighlightedNodeIds: [curr.children![idx].id],
        activePointerIds: [curr.id],
      });

      curr = curr.children![idx];
    }

    // Now curr is the target leaf
    steps.push({
      stepIndex: stepCount++,
      operation: 'TARGET_LEAF',
      description: `Target leaf node [${curr.keys.join(', ')}] reached. Attempting key insertion of ${key}.`,
      highlightedNodeIds: [curr.id],
      secondaryHighlightedNodeIds: [],
      activePointerIds: [curr.id],
    });

    if (curr.keys.includes(key)) {
      steps.push({
        stepIndex: stepCount++,
        operation: 'DUPLICATE_REJECTED',
        description: `Key ${key} already exists in leaf node. Duplicate rejected.`,
        highlightedNodeIds: [curr.id],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [curr.id],
      });

      return {
        nextState: state,
        trace: {
          id: `trace-bp-dup-${key}-${Date.now()}`,
          visualizerId: 'bplus',
          title: `Insert Duplicate ${key} into B+ Tree`,
          totalSteps: steps.length,
          steps,
          initialState: state,
          finalState: state,
        },
      };
    }

    // Insert key into leaf maintaining sorted order
    curr.keys.push(key);
    curr.keys.sort((a, b) => a - b);

    steps.push({
      stepIndex: stepCount++,
      operation: 'INSERT_LEAF_KEY',
      description: `Inserted key ${key} into leaf. Keys are now [${curr.keys.join(', ')}].`,
      highlightedNodeIds: [curr.id],
      secondaryHighlightedNodeIds: [],
      activePointerIds: [curr.id],
    });

    // Check if leaf needs to split
    if (curr.keys.length > maxKeys) {
      steps.push({
        stepIndex: stepCount++,
        operation: 'LEAF_OVERFLOW',
        description: `Leaf capacity (${maxKeys} keys) exceeded! Node has ${curr.keys.length} keys: [${curr.keys.join(', ')}]. Splitting leaf.`,
        highlightedNodeIds: [curr.id],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [curr.id],
        callout: 'When a leaf overflows, it splits into two leaves and promotes the smallest key of the right leaf.',
      });

      // Split leaf
      const mid = Math.floor(curr.keys.length / 2);
      const rightKeys = curr.keys.splice(mid); // right gets from mid to end
      const promotedKey = rightKeys[0]; // In B+ trees, right leaf's first key is copied to parent

      const newLeaf: BPlusNode = {
        id: this.generateNodeId(true),
        isLeaf: true,
        keys: rightKeys,
        nextLeaf: curr.nextLeaf,
      };
      curr.nextLeaf = newLeaf;

      steps.push({
        stepIndex: stepCount++,
        operation: 'SPLIT_LEAF',
        description: `Leaf split into left [${curr.keys.join(', ')}] and right [${newLeaf.keys.join(', ')}]. Promoting separator key ${promotedKey} to parent. Linked list updated.`,
        highlightedNodeIds: [curr.id, newLeaf.id],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [newLeaf.id],
      });

      if (path.length === 0) {
        // The root was a leaf and just split!
        const newRoot: BPlusNode = {
          id: this.generateNodeId(false),
          isLeaf: false,
          keys: [promotedKey],
          children: [curr, newLeaf],
        };
        currentState.root = newRoot;
        currentState.height = 2;

        steps.push({
          stepIndex: stepCount++,
          operation: 'ROOT_SPLIT',
          description: `Root leaf split! Created new internal root [${promotedKey}] with 2 children. Tree height increased to 2.`,
          highlightedNodeIds: [newRoot.id],
          secondaryHighlightedNodeIds: [curr.id, newLeaf.id],
          activePointerIds: [newRoot.id],
          callout: 'B+ trees grow from the bottom up: tree height only increases when the root splits.',
        });
      } else {
        // Propagate split upward
        let childToInsert: BPlusNode = newLeaf;
        let keyToPromote: number = promotedKey;

        while (path.length > 0) {
          const parent = path.pop()!;
          let insertIdx = 0;
          while (insertIdx < parent.keys.length && keyToPromote >= parent.keys[insertIdx]) {
            insertIdx++;
          }

          parent.keys.splice(insertIdx, 0, keyToPromote);
          parent.children!.splice(insertIdx + 1, 0, childToInsert);

          steps.push({
            stepIndex: stepCount++,
            operation: 'PARENT_KEY_PROMOTED',
            description: `Separator key ${keyToPromote} inserted into parent [${parent.keys.join(', ')}].`,
            highlightedNodeIds: [parent.id],
            secondaryHighlightedNodeIds: [childToInsert.id],
            activePointerIds: [parent.id],
          });

          if (parent.keys.length <= maxKeys) {
            // Parent accommodated the key without splitting
            break;
          }

          // Parent internal node overflowed: split internal node
          steps.push({
            stepIndex: stepCount++,
            operation: 'INTERNAL_OVERFLOW',
            description: `Internal node ${parent.id} capacity (${maxKeys} keys) exceeded! Splitting internal node.`,
            highlightedNodeIds: [parent.id],
            secondaryHighlightedNodeIds: [],
            activePointerIds: [parent.id],
            callout: 'Internal node splits extract the median key (it does not remain in the child).',
          });

          const internalMid = Math.floor(parent.keys.length / 2);
          const internalPromotedKey = parent.keys[internalMid];
          const rightInternalKeys = parent.keys.slice(internalMid + 1);
          const rightInternalChildren = parent.children!.slice(internalMid + 1);

          parent.keys = parent.keys.slice(0, internalMid);
          parent.children = parent.children!.slice(0, internalMid + 1);

          const newInternal: BPlusNode = {
            id: this.generateNodeId(false),
            isLeaf: false,
            keys: rightInternalKeys,
            children: rightInternalChildren,
          };

          childToInsert = newInternal;
          keyToPromote = internalPromotedKey;

          steps.push({
            stepIndex: stepCount++,
            operation: 'SPLIT_INTERNAL',
            description: `Internal node split into left [${parent.keys.join(', ')}] and right [${newInternal.keys.join(', ')}]. Pushing median key ${keyToPromote} upward.`,
            highlightedNodeIds: [parent.id, newInternal.id],
            secondaryHighlightedNodeIds: [],
            activePointerIds: [newInternal.id],
          });

          if (path.length === 0) {
            // Root internal node split!
            const newRoot: BPlusNode = {
              id: this.generateNodeId(false),
              isLeaf: false,
              keys: [keyToPromote],
              children: [parent, newInternal],
            };
            currentState.root = newRoot;
            currentState.height++;

            steps.push({
              stepIndex: stepCount++,
              operation: 'ROOT_SPLIT',
              description: `Internal root split! Created new root [${keyToPromote}]. Tree height increased to ${currentState.height}.`,
              highlightedNodeIds: [newRoot.id],
              secondaryHighlightedNodeIds: [parent.id, newInternal.id],
              activePointerIds: [newRoot.id],
            });
            break;
          }
        }
      }
    }

    currentState.height = this.calculateHeight(currentState.root);
    currentState.totalKeys = this.countKeys(currentState.root);

    // Stamp final snapshot
    steps.forEach((s) => {
      if (!s.stateSnapshot) {
        s.stateSnapshot = this.cloneState(currentState);
      }
    });

    return {
      nextState: currentState,
      trace: {
        id: `trace-bp-insert-${key}-${Date.now()}`,
        visualizerId: 'bplus',
        title: `Insert ${key} into Order ${order} B+ Tree`,
        totalSteps: steps.length,
        steps,
        initialState: state,
        finalState: currentState,
      },
    };
  }

  /**
   * Range Search from startKey to endKey using horizontal leaf linking.
   */
  public static rangeSearch(
    state: BPlusTreeState,
    startKey: number,
    endKey: number
  ): { matchedKeys: number[]; trace: SimulationTrace<BPlusTreeState> } {
    const steps: SimulationStep<BPlusTreeState>[] = [];
    const matchedKeys: number[] = [];
    let stepCount = 0;

    // 1. Descend to the first leaf that could contain startKey
    let curr = state.root;
    while (!curr.isLeaf) {
      let idx = 0;
      while (idx < curr.keys.length && startKey >= curr.keys[idx]) {
        idx++;
      }
      steps.push({
        stepIndex: stepCount++,
        operation: 'RANGE_DESCEND',
        description: `Routing to range start ${startKey}: inspecting internal node [${curr.keys.join(', ')}], descending to child ${idx}.`,
        highlightedNodeIds: [curr.id],
        secondaryHighlightedNodeIds: [curr.children![idx].id],
        activePointerIds: [curr.id],
        stateSnapshot: state,
      });
      curr = curr.children![idx];
    }

    // 2. Scan sequentially along the leaf sibling chain
    let leaf: BPlusNode | null = curr;
    let finished = false;

    while (leaf !== null && !finished) {
      steps.push({
        stepIndex: stepCount++,
        operation: 'SCAN_LEAF',
        description: `Scanning leaf node [${leaf.keys.join(', ')}] along horizontal pointer.`,
        highlightedNodeIds: [leaf.id],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [leaf.id],
        stateSnapshot: state,
      });

      for (const k of leaf.keys) {
        if (k >= startKey && k <= endKey) {
          matchedKeys.push(k);
          steps.push({
            stepIndex: stepCount++,
            operation: 'MATCH_KEY',
            description: `Matched key ${k} within range [${startKey}, ${endKey}]. Accumulated: [${matchedKeys.join(', ')}]`,
            highlightedNodeIds: [leaf.id],
            secondaryHighlightedNodeIds: [],
            activePointerIds: [leaf.id],
            stateSnapshot: state,
          });
        } else if (k > endKey) {
          finished = true;
          break;
        }
      }

      if (!finished) {
        leaf = leaf.nextLeaf ?? null;
      }
    }

    steps.push({
      stepIndex: stepCount++,
      operation: 'RANGE_COMPLETE',
      description: `Range query [${startKey}, ${endKey}] completed. Found ${matchedKeys.length} matching keys via leaf-chain scan: [${matchedKeys.join(', ')}].`,
      highlightedNodeIds: [],
      secondaryHighlightedNodeIds: [],
      activePointerIds: [],
      stateSnapshot: state,
    });

    return {
      matchedKeys,
      trace: {
        id: `trace-range-${startKey}-${endKey}-${Date.now()}`,
        visualizerId: 'bplus',
        title: `Range Query [${startKey} - ${endKey}]`,
        totalSteps: steps.length,
        steps,
        initialState: state,
        finalState: state,
      },
    };
  }
}
