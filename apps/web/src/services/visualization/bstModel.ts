/**
 * Pure, Deterministic Binary Search Tree (BST) Model.
 * Produces discrete simulation steps and state snapshots for visualizations.
 */

import { SimulationStep, SimulationTrace } from '@lumenode/shared-types';

export interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  height: number;
}

export interface BSTTreeState {
  root: BSTNode | null;
  nodeCount: number;
  height: number;
}

export class BSTModel {
  private static nodeCounter = 0;

  public static generateNodeId(value: number): string {
    return `bst-node-${value}-${++this.nodeCounter}`;
  }

  public static createEmptyState(): BSTTreeState {
    return {
      root: null,
      nodeCount: 0,
      height: 0,
    };
  }

  public static cloneNode(node: BSTNode | null): BSTNode | null {
    if (!node) return null;
    return {
      id: node.id,
      value: node.value,
      height: node.height,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
    };
  }

  public static cloneState(state: BSTTreeState): BSTTreeState {
    return {
      root: this.cloneNode(state.root),
      nodeCount: state.nodeCount,
      height: state.height,
    };
  }

  public static calculateHeight(node: BSTNode | null): number {
    if (!node) return 0;
    return 1 + Math.max(this.calculateHeight(node.left), this.calculateHeight(node.right));
  }

  public static updateHeights(node: BSTNode | null): number {
    if (!node) return 0;
    node.height = 1 + Math.max(this.updateHeights(node.left), this.updateHeights(node.right));
    return node.height;
  }

  public static countNodes(node: BSTNode | null): number {
    if (!node) return 0;
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }

  /**
   * Validate BST ordering invariant: For every node N:
   * all keys in N.left < N.value, and all keys in N.right > N.value.
   */
  public static validateBSTInvariants(
    node: BSTNode | null,
    minVal: number = -Infinity,
    maxVal: number = Infinity
  ): { valid: boolean; error?: string } {
    if (!node) return { valid: true };

    if (node.value <= minVal || node.value >= maxVal) {
      return {
        valid: false,
        error: `Node ${node.value} violates BST ordering constraint (${minVal} < ${node.value} < ${maxVal})`,
      };
    }

    const leftCheck = this.validateBSTInvariants(node.left, minVal, node.value);
    if (!leftCheck.valid) return leftCheck;

    const rightCheck = this.validateBSTInvariants(node.right, node.value, maxVal);
    if (!rightCheck.valid) return rightCheck;

    return { valid: true };
  }

  /**
   * Traceable Insertion
   */
  public static insert(
    state: BSTTreeState,
    value: number
  ): { nextState: BSTTreeState; trace: SimulationTrace<BSTTreeState> } {
    const steps: SimulationStep<BSTTreeState>[] = [];
    const initialState = this.cloneState(state);

    if (!initialState.root) {
      const newNode: BSTNode = {
        id: this.generateNodeId(value),
        value,
        left: null,
        right: null,
        height: 1,
      };
      const finalState: BSTTreeState = {
        root: newNode,
        nodeCount: 1,
        height: 1,
      };

      steps.push({
        stepIndex: 0,
        operation: 'INSERT_ROOT',
        description: `Tree is empty. Created new root node with key ${value}.`,
        highlightedNodeIds: [newNode.id],
        secondaryHighlightedNodeIds: [],
        activePointerIds: ['root'],
        stateSnapshot: this.cloneState(finalState),
      });

      return {
        nextState: finalState,
        trace: {
          id: `trace-insert-${value}-${Date.now()}`,
          visualizerId: 'bst',
          title: `Insert ${value} into BST`,
          totalSteps: steps.length,
          steps,
          initialState,
          finalState,
        },
      };
    }

    let current: BSTNode | null = initialState.root;
    let parent: BSTNode | null = null;
    let isLeftChild = false;
    let stepCount = 0;

    while (current !== null) {
      parent = current;
      const compOp = value < current.value ? '<' : value > current.value ? '>' : '==';
      const isSmaller: boolean = value < current.value;
      const isDuplicate = value === current.value;

      steps.push({
        stepIndex: stepCount++,
        operation: 'COMPARE',
        description: `Comparing insert key ${value} with current node ${current.value} (${value} ${compOp} ${current.value}).`,
        highlightedNodeIds: [current.id],
        secondaryHighlightedNodeIds: parent && parent !== current ? [parent.id] : [],
        activePointerIds: [current.id],
        comparison: {
          leftValue: value,
          rightValue: current.value,
          operator: compOp as '<' | '>' | '==',
          result: isSmaller,
        },
        stateSnapshot: this.cloneState(initialState),
      });

      if (isDuplicate) {
        steps.push({
          stepIndex: stepCount++,
          operation: 'DUPLICATE_REJECTED',
          description: `Key ${value} already exists in the BST. Duplicate insertion rejected to maintain key uniqueness.`,
          highlightedNodeIds: [current.id],
          secondaryHighlightedNodeIds: [],
          activePointerIds: [current.id],
          callout: 'Standard BSTs enforce strict key uniqueness.',
          stateSnapshot: this.cloneState(initialState),
        });

        return {
          nextState: initialState,
          trace: {
            id: `trace-insert-dup-${value}-${Date.now()}`,
            visualizerId: 'bst',
            title: `Insert Duplicate ${value} into BST`,
            totalSteps: steps.length,
            steps,
            initialState,
            finalState: initialState,
          },
        };
      }

      if (isSmaller) {
        if (!current.left) {
          isLeftChild = true;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          isLeftChild = false;
          break;
        }
        current = current.right;
      }
    }

    const newNode: BSTNode = {
      id: this.generateNodeId(value),
      value,
      left: null,
      right: null,
      height: 1,
    };

    if (isLeftChild) {
      parent!.left = newNode;
    } else {
      parent!.right = newNode;
    }

    this.updateHeights(initialState.root);
    const finalState: BSTTreeState = {
      root: initialState.root,
      nodeCount: this.countNodes(initialState.root),
      height: this.calculateHeight(initialState.root),
    };

    steps.push({
      stepIndex: stepCount++,
      operation: 'ATTACH_NODE',
      description: `Attached new node ${value} as the ${isLeftChild ? 'left' : 'right'} child of node ${parent!.value}.`,
      highlightedNodeIds: [newNode.id],
      secondaryHighlightedNodeIds: [parent!.id],
      activePointerIds: [newNode.id],
      stateSnapshot: this.cloneState(finalState),
    });

    return {
      nextState: finalState,
      trace: {
        id: `trace-insert-${value}-${Date.now()}`,
        visualizerId: 'bst',
        title: `Insert ${value} into BST`,
        totalSteps: steps.length,
        steps,
        initialState,
        finalState,
      },
    };
  }

  /**
   * Traceable Search
   */
  public static search(state: BSTTreeState, value: number): SimulationTrace<BSTTreeState> {
    const steps: SimulationStep<BSTTreeState>[] = [];
    const initialState = this.cloneState(state);
    let current = initialState.root;
    let stepCount = 0;

    if (!current) {
      steps.push({
        stepIndex: 0,
        operation: 'SEARCH_EMPTY',
        description: `Cannot search key ${value}: Tree is empty.`,
        highlightedNodeIds: [],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [],
        stateSnapshot: initialState,
      });

      return {
        id: `trace-search-${value}-${Date.now()}`,
        visualizerId: 'bst',
        title: `Search ${value} in Empty BST`,
        totalSteps: steps.length,
        steps,
        initialState,
        finalState: initialState,
      };
    }

    let found = false;
    while (current !== null) {
      const isSmaller: boolean = value < current.value;
      const isMatch = value === current.value;
      const compOp = isSmaller ? '<' : value > current.value ? '>' : '==';

      steps.push({
        stepIndex: stepCount++,
        operation: 'COMPARE',
        description: `Comparing search target ${value} with node ${current.value} (${value} ${compOp} ${current.value}).`,
        highlightedNodeIds: [current.id],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [current.id],
        comparison: {
          leftValue: value,
          rightValue: current.value,
          operator: compOp as '<' | '>' | '==',
          result: isMatch,
        },
        stateSnapshot: initialState,
      });

      if (isMatch) {
        found = true;
        steps.push({
          stepIndex: stepCount++,
          operation: 'FOUND',
          description: `Target key ${value} found in BST at node ${current.id}.`,
          highlightedNodeIds: [current.id],
          secondaryHighlightedNodeIds: [],
          activePointerIds: [current.id],
          callout: `Search succeeded in O(h) comparisons where h is tree height.`,
          stateSnapshot: initialState,
        });
        break;
      }

      current = isSmaller ? current.left : current.right;
    }

    if (!found) {
      steps.push({
        stepIndex: stepCount++,
        operation: 'NOT_FOUND',
        description: `Reached NULL pointer. Target key ${value} does not exist in the BST.`,
        highlightedNodeIds: [],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [],
        stateSnapshot: initialState,
      });
    }

    return {
      id: `trace-search-${value}-${Date.now()}`,
      visualizerId: 'bst',
      title: `Search ${value} in BST`,
      totalSteps: steps.length,
      steps,
      initialState,
      finalState: initialState,
    };
  }

  /**
   * Traceable Deletion
   * Covers:
   * 1. Deleting a leaf node
   * 2. Deleting a node with 1 child (bypass)
   * 3. Deleting a node with 2 children (replace with inorder successor)
   */
  public static delete(
    state: BSTTreeState,
    value: number
  ): { nextState: BSTTreeState; trace: SimulationTrace<BSTTreeState> } {
    const steps: SimulationStep<BSTTreeState>[] = [];
    const initialState = this.cloneState(state);
    let stepCount = 0;

    if (!initialState.root) {
      steps.push({
        stepIndex: 0,
        operation: 'DELETE_EMPTY',
        description: `Cannot delete key ${value}: Tree is empty.`,
        highlightedNodeIds: [],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [],
        stateSnapshot: initialState,
      });
      return {
        nextState: initialState,
        trace: {
          id: `trace-del-empty-${value}-${Date.now()}`,
          visualizerId: 'bst',
          title: `Delete ${value} from Empty BST`,
          totalSteps: 1,
          steps,
          initialState,
          finalState: initialState,
        },
      };
    }

    // Step 1: Find target node and its parent
    let parent: BSTNode | null = null;
    let current: BSTNode | null = initialState.root;

    while (current !== null && current.value !== value) {
      parent = current;
      const isSmaller: boolean = value < current.value;
      steps.push({
        stepIndex: stepCount++,
        operation: 'LOCATE',
        description: `Locating key ${value}: ${value} ${isSmaller ? '<' : '>'} ${current.value}, moving ${isSmaller ? 'left' : 'right'}.`,
        highlightedNodeIds: [current.id],
        secondaryHighlightedNodeIds: parent ? [parent.id] : [],
        activePointerIds: [current.id],
        stateSnapshot: this.cloneState(initialState),
      });
      current = isSmaller ? current.left : current.right;
    }

    if (!current) {
      steps.push({
        stepIndex: stepCount++,
        operation: 'NOT_FOUND',
        description: `Key ${value} not found in BST. No deletion performed.`,
        highlightedNodeIds: [],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [],
        stateSnapshot: initialState,
      });
      return {
        nextState: initialState,
        trace: {
          id: `trace-del-missing-${value}-${Date.now()}`,
          visualizerId: 'bst',
          title: `Delete Missing ${value}`,
          totalSteps: steps.length,
          steps,
          initialState,
          finalState: initialState,
        },
      };
    }

    // Found target node
    steps.push({
      stepIndex: stepCount++,
      operation: 'TARGET_FOUND',
      description: `Found target node ${current.value} to delete. Evaluating number of children.`,
      highlightedNodeIds: [current.id],
      secondaryHighlightedNodeIds: parent ? [parent.id] : [],
      activePointerIds: [current.id],
      stateSnapshot: this.cloneState(initialState),
    });

    const isLeaf = !current.left && !current.right;
    const hasOneChild = (!current.left && current.right !== null) || (current.left !== null && !current.right);

    // CASE 1: Leaf node (0 children)
    if (isLeaf) {
      steps.push({
        stepIndex: stepCount++,
        operation: 'DELETE_LEAF',
        description: `Node ${current.value} is a leaf node with 0 children. Setting parent's link to NULL.`,
        highlightedNodeIds: [current.id],
        secondaryHighlightedNodeIds: parent ? [parent.id] : [],
        activePointerIds: [current.id],
        stateSnapshot: this.cloneState(initialState),
      });

      if (!parent) {
        // Deleting root leaf
        initialState.root = null;
      } else if (parent.left === current) {
        parent.left = null;
      } else {
        parent.right = null;
      }
    }
    // CASE 2: Single child (1 child)
    else if (hasOneChild) {
      const child = current.left ?? current.right;
      steps.push({
        stepIndex: stepCount++,
        operation: 'DELETE_ONE_CHILD',
        description: `Node ${current.value} has 1 child (${child!.value}). Splicing parent directly to child.`,
        highlightedNodeIds: [current.id],
        secondaryHighlightedNodeIds: [child!.id, ...(parent ? [parent.id] : [])],
        activePointerIds: [current.id],
        stateSnapshot: this.cloneState(initialState),
      });

      if (!parent) {
        initialState.root = child;
      } else if (parent.left === current) {
        parent.left = child;
      } else {
        parent.right = child;
      }
    }
    // CASE 3: Two children
    else {
      steps.push({
        stepIndex: stepCount++,
        operation: 'FIND_SUCCESSOR',
        description: `Node ${current.value} has 2 children. Locating in-order successor (minimum node in right subtree).`,
        highlightedNodeIds: [current.id],
        secondaryHighlightedNodeIds: [current.right!.id],
        activePointerIds: [current.right!.id],
        stateSnapshot: this.cloneState(initialState),
      });

      let succParent = current;
      let successor = current.right!;
      while (successor.left !== null) {
        succParent = successor;
        successor = successor.left;
      }

      steps.push({
        stepIndex: stepCount++,
        operation: 'SUCCESSOR_FOUND',
        description: `In-order successor is node ${successor.value}. Copying successor value ${successor.value} into target node.`,
        highlightedNodeIds: [current.id, successor.id],
        secondaryHighlightedNodeIds: [succParent.id],
        activePointerIds: [successor.id],
        stateSnapshot: this.cloneState(initialState),
      });

      current.value = successor.value;

      // Now splice out successor from its parent
      if (succParent.left === successor) {
        succParent.left = successor.right;
      } else {
        succParent.right = successor.right;
      }
    }

    this.updateHeights(initialState.root);
    const finalState: BSTTreeState = {
      root: initialState.root,
      nodeCount: this.countNodes(initialState.root),
      height: this.calculateHeight(initialState.root),
    };

    steps.push({
      stepIndex: stepCount++,
      operation: 'DELETE_COMPLETE',
      description: `Deletion of ${value} completed. BST ordering invariants preserved.`,
      highlightedNodeIds: [],
      secondaryHighlightedNodeIds: [],
      activePointerIds: [],
      stateSnapshot: this.cloneState(finalState),
    });

    return {
      nextState: finalState,
      trace: {
        id: `trace-del-${value}-${Date.now()}`,
        visualizerId: 'bst',
        title: `Delete ${value} from BST`,
        totalSteps: steps.length,
        steps,
        initialState,
        finalState,
      },
    };
  }

  /**
   * Traversals: In-order, Pre-order, Post-order, Level-order
   */
  public static traverse(
    state: BSTTreeState,
    type: 'inorder' | 'preorder' | 'postorder' | 'levelorder'
  ): { visited: number[]; trace: SimulationTrace<BSTTreeState> } {
    const steps: SimulationStep<BSTTreeState>[] = [];
    const visited: number[] = [];
    const initialState = this.cloneState(state);
    let stepCount = 0;

    if (!initialState.root) {
      steps.push({
        stepIndex: 0,
        operation: 'TRAVERSE_EMPTY',
        description: `Cannot perform ${type} traversal: tree is empty.`,
        highlightedNodeIds: [],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [],
        stateSnapshot: initialState,
      });
      return {
        visited,
        trace: {
          id: `trace-trav-${type}-${Date.now()}`,
          visualizerId: 'bst',
          title: `${type.toUpperCase()} Traversal`,
          totalSteps: 1,
          steps,
          initialState,
          finalState: initialState,
        },
      };
    }

    if (type === 'inorder') {
      const inOrderHelper = (node: BSTNode | null) => {
        if (!node) return;
        inOrderHelper(node.left);
        visited.push(node.value);
        steps.push({
          stepIndex: stepCount++,
          operation: 'VISIT_INORDER',
          description: `Visited node ${node.value} (Left -> Root -> Right). Current sequence: [${visited.join(', ')}]`,
          highlightedNodeIds: [node.id],
          secondaryHighlightedNodeIds: [],
          activePointerIds: [node.id],
          callout: 'In-order traversal of a BST always yields keys in strictly ascending order.',
          stateSnapshot: initialState,
        });
        inOrderHelper(node.right);
      };
      inOrderHelper(initialState.root);
    } else if (type === 'preorder') {
      const preOrderHelper = (node: BSTNode | null) => {
        if (!node) return;
        visited.push(node.value);
        steps.push({
          stepIndex: stepCount++,
          operation: 'VISIT_PREORDER',
          description: `Visited node ${node.value} (Root -> Left -> Right). Current sequence: [${visited.join(', ')}]`,
          highlightedNodeIds: [node.id],
          secondaryHighlightedNodeIds: [],
          activePointerIds: [node.id],
          stateSnapshot: initialState,
        });
        preOrderHelper(node.left);
        preOrderHelper(node.right);
      };
      preOrderHelper(initialState.root);
    } else if (type === 'postorder') {
      const postOrderHelper = (node: BSTNode | null) => {
        if (!node) return;
        postOrderHelper(node.left);
        postOrderHelper(node.right);
        visited.push(node.value);
        steps.push({
          stepIndex: stepCount++,
          operation: 'VISIT_POSTORDER',
          description: `Visited node ${node.value} (Left -> Right -> Root). Current sequence: [${visited.join(', ')}]`,
          highlightedNodeIds: [node.id],
          secondaryHighlightedNodeIds: [],
          activePointerIds: [node.id],
          stateSnapshot: initialState,
        });
      };
      postOrderHelper(initialState.root);
    } else if (type === 'levelorder') {
      const queue: BSTNode[] = [initialState.root];
      while (queue.length > 0) {
        const node = queue.shift()!;
        visited.push(node.value);
        steps.push({
          stepIndex: stepCount++,
          operation: 'VISIT_LEVELORDER',
          description: `Visited node ${node.value} (Breadth-first by depth). Current sequence: [${visited.join(', ')}]`,
          highlightedNodeIds: [node.id],
          secondaryHighlightedNodeIds: [],
          activePointerIds: [node.id],
          stateSnapshot: initialState,
        });
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
    }

    return {
      visited,
      trace: {
        id: `trace-trav-${type}-${Date.now()}`,
        visualizerId: 'bst',
        title: `${type.toUpperCase()} Traversal (${visited.length} nodes)`,
        totalSteps: steps.length,
        steps,
        initialState,
        finalState: initialState,
      },
    };
  }
}
