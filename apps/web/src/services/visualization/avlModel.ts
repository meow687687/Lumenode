/**
 * Pure, Deterministic AVL Tree Balancing & Rotation Laboratory Model.
 * Implements self-balancing AVL trees with explicit LL, RR, LR, RL rotation steps.
 */

import { SimulationStep, SimulationTrace } from '@lumenode/shared-types';

export interface AVLNode {
  id: string;
  value: number;
  left: AVLNode | null;
  right: AVLNode | null;
  height: number;
  balanceFactor: number;
}

export interface AVLTreeState {
  root: AVLNode | null;
  nodeCount: number;
  height: number;
}

export class AVLModel {
  private static nodeCounter = 0;

  public static generateNodeId(value: number): string {
    return `avl-node-${value}-${++this.nodeCounter}`;
  }

  public static createEmptyState(): AVLTreeState {
    return {
      root: null,
      nodeCount: 0,
      height: 0,
    };
  }

  public static cloneNode(node: AVLNode | null): AVLNode | null {
    if (!node) return null;
    return {
      id: node.id,
      value: node.value,
      height: node.height,
      balanceFactor: node.balanceFactor,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
    };
  }

  public static cloneState(state: AVLTreeState): AVLTreeState {
    return {
      root: this.cloneNode(state.root),
      nodeCount: state.nodeCount,
      height: state.height,
    };
  }

  public static getNodeHeight(node: AVLNode | null): number {
    return node ? node.height : 0;
  }

  public static getBalanceFactor(node: AVLNode | null): number {
    if (!node) return 0;
    return this.getNodeHeight(node.left) - this.getNodeHeight(node.right);
  }

  public static updateNodeMetrics(node: AVLNode): void {
    const leftH = this.getNodeHeight(node.left);
    const rightH = this.getNodeHeight(node.right);
    node.height = 1 + Math.max(leftH, rightH);
    node.balanceFactor = leftH - rightH;
  }

  public static countNodes(node: AVLNode | null): number {
    if (!node) return 0;
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }

  /**
   * Validates both BST ordering AND AVL height-balance invariant (|BF| <= 1).
   */
  public static validateAVLInvariants(
    node: AVLNode | null,
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

    const expectedBF = this.getNodeHeight(node.left) - this.getNodeHeight(node.right);
    if (Math.abs(expectedBF) > 1) {
      return {
        valid: false,
        error: `Node ${node.value} violates AVL balance invariant! Balance factor is ${expectedBF} (must be -1, 0, or 1)`,
      };
    }

    const leftCheck = this.validateAVLInvariants(node.left, minVal, node.value);
    if (!leftCheck.valid) return leftCheck;

    const rightCheck = this.validateAVLInvariants(node.right, node.value, maxVal);
    if (!rightCheck.valid) return rightCheck;

    return { valid: true };
  }

  /**
   * Traceable AVL Insertion with rotation detection.
   */
  public static insert(
    state: AVLTreeState,
    value: number
  ): { nextState: AVLTreeState; trace: SimulationTrace<AVLTreeState> } {
    const steps: SimulationStep<AVLTreeState>[] = [];
    const initialState = this.cloneState(state);
    let stepCount = 0;

    const insertHelper = (node: AVLNode | null): AVLNode => {
      if (!node) {
        const newNode: AVLNode = {
          id: this.generateNodeId(value),
          value,
          left: null,
          right: null,
          height: 1,
          balanceFactor: 0,
        };

        steps.push({
          stepIndex: stepCount++,
          operation: 'INSERT_LEAF',
          description: `Created new node ${value} (Height: 1, BF: 0).`,
          highlightedNodeIds: [newNode.id],
          secondaryHighlightedNodeIds: [],
          activePointerIds: [newNode.id],
        });

        return newNode;
      }

      if (value === node.value) {
        steps.push({
          stepIndex: stepCount++,
          operation: 'DUPLICATE_REJECTED',
          description: `Key ${value} already exists. Duplicates not permitted in AVL trees.`,
          highlightedNodeIds: [node.id],
          secondaryHighlightedNodeIds: [],
          activePointerIds: [node.id],
        });
        return node;
      }

      const isSmaller = value < node.value;
      steps.push({
        stepIndex: stepCount++,
        operation: 'NAVIGATE',
        description: `Comparing insert key ${value} with node ${node.value} (${value} ${isSmaller ? '<' : '>'} ${node.value}).`,
        highlightedNodeIds: [node.id],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [node.id],
      });

      if (isSmaller) {
        node.left = insertHelper(node.left);
      } else {
        node.right = insertHelper(node.right);
      }

      // Update height & balance factor on unwind
      this.updateNodeMetrics(node);

      steps.push({
        stepIndex: stepCount++,
        operation: 'UPDATE_METRICS',
        description: `Unwinding to node ${node.value}: Height updated to ${node.height}, Balance Factor: ${node.balanceFactor}.`,
        highlightedNodeIds: [node.id],
        secondaryHighlightedNodeIds: [],
        activePointerIds: [node.id],
      });

      // Check for rotation cases
      const bf = node.balanceFactor;

      // CASE 1: Left-Heavy (bf > 1)
      if (bf > 1) {
        const leftChild = node.left!;
        const leftBf = leftChild.balanceFactor;

        // LL Case: Left-Left Imbalance
        if (leftBf >= 0) {
          steps.push({
            stepIndex: stepCount++,
            operation: 'IMBALANCE_DETECTED_LL',
            description: `Left-Left (LL) imbalance detected at node ${node.value} (BF = +${bf}). Triggering Right Rotation around ${node.value}.`,
            highlightedNodeIds: [node.id, leftChild.id],
            secondaryHighlightedNodeIds: [],
            activePointerIds: [node.id],
            callout: 'LL Case: Single Right Rotation restores balance.',
          });

          return rotateRight(node);
        }

        // LR Case: Left-Right Imbalance
        if (leftBf < 0) {
          steps.push({
            stepIndex: stepCount++,
            operation: 'IMBALANCE_DETECTED_LR',
            description: `Left-Right (LR) imbalance detected at node ${node.value} (BF = +${bf}, child BF = ${leftBf}). Performing double rotation: Left Rotate child ${leftChild.value}, then Right Rotate ${node.value}.`,
            highlightedNodeIds: [node.id, leftChild.id, leftChild.right?.id || ''],
            secondaryHighlightedNodeIds: [],
            activePointerIds: [node.id],
            callout: 'LR Case: Left rotate child first to convert to LL, then right rotate parent.',
          });

          node.left = rotateLeft(node.left!);
          return rotateRight(node);
        }
      }

      // CASE 2: Right-Heavy (bf < -1)
      if (bf < -1) {
        const rightChild = node.right!;
        const rightBf = rightChild.balanceFactor;

        // RR Case: Right-Right Imbalance
        if (rightBf <= 0) {
          steps.push({
            stepIndex: stepCount++,
            operation: 'IMBALANCE_DETECTED_RR',
            description: `Right-Right (RR) imbalance detected at node ${node.value} (BF = ${bf}). Triggering Left Rotation around ${node.value}.`,
            highlightedNodeIds: [node.id, rightChild.id],
            secondaryHighlightedNodeIds: [],
            activePointerIds: [node.id],
            callout: 'RR Case: Single Left Rotation restores balance.',
          });

          return rotateLeft(node);
        }

        // RL Case: Right-Left Imbalance
        if (rightBf > 0) {
          steps.push({
            stepIndex: stepCount++,
            operation: 'IMBALANCE_DETECTED_RL',
            description: `Right-Left (RL) imbalance detected at node ${node.value} (BF = ${bf}, child BF = +${rightBf}). Performing double rotation: Right Rotate child ${rightChild.value}, then Left Rotate ${node.value}.`,
            highlightedNodeIds: [node.id, rightChild.id, rightChild.left?.id || ''],
            secondaryHighlightedNodeIds: [],
            activePointerIds: [node.id],
            callout: 'RL Case: Right rotate child first to convert to RR, then left rotate parent.',
          });

          node.right = rotateRight(node.right!);
          return rotateLeft(node);
        }
      }

      return node;
    };

    const rotateRight = (y: AVLNode): AVLNode => {
      const x = y.left!;
      const t2 = x.right;

      steps.push({
        stepIndex: stepCount++,
        operation: 'ROTATING_RIGHT',
        description: `Right Rotation: Node ${x.value} becomes new subtree root; node ${y.value} becomes its right child; subtree T2 moves to y.left.`,
        highlightedNodeIds: [x.id, y.id],
        secondaryHighlightedNodeIds: t2 ? [t2.id] : [],
        activePointerIds: [x.id],
      });

      // Perform rotation
      x.right = y;
      y.left = t2;

      // Update metrics (y first, then x)
      this.updateNodeMetrics(y);
      this.updateNodeMetrics(x);

      steps.push({
        stepIndex: stepCount++,
        operation: 'ROTATION_COMPLETE',
        description: `Right rotation complete. Root is now ${x.value} (BF = ${x.balanceFactor}), right child is ${y.value} (BF = ${y.balanceFactor}).`,
        highlightedNodeIds: [x.id],
        secondaryHighlightedNodeIds: [y.id],
        activePointerIds: [x.id],
      });

      return x;
    };

    const rotateLeft = (x: AVLNode): AVLNode => {
      const y = x.right!;
      const t2 = y.left;

      steps.push({
        stepIndex: stepCount++,
        operation: 'ROTATING_LEFT',
        description: `Left Rotation: Node ${y.value} becomes new subtree root; node ${x.value} becomes its left child; subtree T2 moves to x.right.`,
        highlightedNodeIds: [y.id, x.id],
        secondaryHighlightedNodeIds: t2 ? [t2.id] : [],
        activePointerIds: [y.id],
      });

      // Perform rotation
      y.left = x;
      x.right = t2;

      // Update metrics (x first, then y)
      this.updateNodeMetrics(x);
      this.updateNodeMetrics(y);

      steps.push({
        stepIndex: stepCount++,
        operation: 'ROTATION_COMPLETE',
        description: `Left rotation complete. Root is now ${y.value} (BF = ${y.balanceFactor}), left child is ${x.value} (BF = ${x.balanceFactor}).`,
        highlightedNodeIds: [y.id],
        secondaryHighlightedNodeIds: [x.id],
        activePointerIds: [y.id],
      });

      return y;
    };

    const newRoot = insertHelper(initialState.root);
    const finalState: AVLTreeState = {
      root: newRoot,
      nodeCount: this.countNodes(newRoot),
      height: this.getNodeHeight(newRoot),
    };

    // Attach snapshots
    steps.forEach((s) => {
      if (!s.stateSnapshot) {
        s.stateSnapshot = this.cloneState(finalState);
      }
    });

    return {
      nextState: finalState,
      trace: {
        id: `trace-avl-insert-${value}-${Date.now()}`,
        visualizerId: 'avl',
        title: `Insert ${value} into AVL Tree`,
        totalSteps: steps.length,
        steps,
        initialState,
        finalState,
      },
    };
  }
}
