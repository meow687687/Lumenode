# Lumenode Simulation & Visualization Engine Architecture

**Document Reference:** `docs/VISUALIZATION_ENGINE.md`  
**Phase:** 3  
**Status:** Implemented & Verified  

---

## 1. Architectural Philosophy

Computer science concepts involving dynamic memory mutation, tree balancing, recursive activation frames, and relational query plans cannot be mastered solely through static diagrams or text descriptions. Learners require interactive, step-by-step observable models where every internal pointer update and memory byte transition can be paused, inspected, and reversed.

Traditional educational platforms build visualizations as ad-hoc React animations using `setTimeout` or CSS transitions. This leads to common defects:
- State cannot be reversed or scrubbed backwards.
- Non-deterministic timing bugs occur when scrubbing rapidly.
- Animation logic becomes tangled with React rendering logic, making automated testing impossible.

Lumenode solves this with a **Deterministic Simulation Engine** based on pure state-transition functions and snapshot-indexed execution traces.

```
       [User Operation] (e.g. Insert key 42)
              │
              ▼
    [Pure Model Transition] (e.g. avlModel.insertKey)
              │
              ▼
   [Deterministic Step Trace] (Array of SimulationStep<T>)
              │
              ▼
      [SimulationEngine] ── Snapshot Cache (Every 10 steps)
              │
    ┌─────────┴─────────┐
    ▼                   ▼
[Headless Vitest]    [SimulationPlayer UI]
(100% testable)      (Keyboard shortcuts, scrub bar, speed)
```

---

## 2. Core Simulation Engine (`SimulationEngine`)

Located in [`apps/web/src/services/visualization/simulationEngine.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/visualization/simulationEngine.ts).

### 2.1 Pure Execution Traces
A simulation trace is an immutable array of `SimulationStep<T>`:
```typescript
interface SimulationStep<T = unknown> {
  stepIndex: number;
  title: string;
  description: string;
  state: T;
  highlightedIds?: string[];
  activePointerIds?: string[];
  actionType?: string;
}
```

### 2.2 Time-Traveling & Snapshot Indexing
To enable instant forward and backward scrubbing without recalculating hundreds of steps, the engine maintains an indexed snapshot cache at configured intervals (default: every 10 steps).
- **Stepping Forward**: Advances current step pointer $O(1)$.
- **Stepping Backward**: Decrements current step pointer $O(1)$.
- **Jumping / Scrubbing**: Jumps to the nearest cached snapshot index $\le \text{targetStep}$ and applies forward delta transitions up to the target step.

### 2.3 Playback Controls & Keyboard Interaction
The engine supports autoplay with dynamic speed multipliers (`0.5x`, `1.0x`, `2.0x`, `4.0x`).
The standard player component ([`SimulationPlayer.tsx`](file:///home/sumeet/LumeNode/apps/web/src/components/visualizers/SimulationPlayer.tsx)) registers global accessible keyboard shortcuts:
- `Space`: Toggle play / pause
- `ArrowRight`: Step forward one atomic operation
- `ArrowLeft`: Step backward one atomic operation
- `R`: Reset playback to step 0

---

## 3. Interactive Laboratory Implementations

### 3.1 Binary Search Tree Laboratory ([`BSTLab.tsx`](file:///home/sumeet/LumeNode/apps/web/src/components/visualizers/BSTLab.tsx))
- **Model Engine**: [`bstModel.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/visualization/bstModel.ts)
- **Supported Operations**:
  - `Insert Key`: Deterministic path traversal highlighting comparisons ($k < \text{node}$ or $k > \text{node}$) until an empty child pointer is discovered.
  - `Search Key`: Visual traversal tracking search path, terminating with success highlight or `NULL` pointer warning.
  - `Delete Key`: Step-by-step visual handling of all 3 canonical BST deletion cases:
    - *Case 1 (Leaf)*: Direct pointer decoupling.
    - *Case 2 (Single Child)*: Child splice into parent link.
    - *Case 3 (Two Children)*: Inorder successor discovery (minimum key in right subtree), value overwrite, and successor leaf splice.
  - `Traversals`: Step-by-step animated Inorder, Preorder, Postorder, and Breadth-First Search (Level-order).

### 3.2 AVL Self-Balancing Tree Laboratory ([`AVLLab.tsx`](file:///home/sumeet/LumeNode/apps/web/src/components/visualizers/AVLLab.tsx))
- **Model Engine**: [`avlModel.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/visualization/avlModel.ts)
- **Mathematical Invariant**: Balance Factor $\text{BF}(N) = \text{height}(N.\text{left}) - \text{height}(N.\text{right}) \in \{-1, 0, 1\}$.
- **Rotations Supported**:
  - **Left-Left (LL)**: Single Right Rotation at unbalanced root.
  - **Right-Right (RR)**: Single Left Rotation at unbalanced root.
  - **Left-Right (LR)**: Double Rotation (Left Rotation on left child followed by Right Rotation on root).
  - **Right-Left (RL)**: Double Rotation (Right Rotation on right child followed by Left Rotation on root).
- **Inspection**: Nodes render real-time height indicators and color-coded balance badges (green for balanced, red for $|BF| > 1$).

### 3.3 B+ Tree Database Index Laboratory ([`BPlusTreeLab.tsx`](file:///home/sumeet/LumeNode/apps/web/src/components/visualizers/BPlusTreeLab.tsx))
- **Model Engine**: [`bplusModel.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/visualization/bplusModel.ts)
- **Storage Engine Context**: Visualizes the foundational storage architecture of relational database indexes (PostgreSQL, SQLite, MySQL InnoDB).
- **Core Features**:
  - Configurable tree order $M \in \{3, 4, 5\}$.
  - **Leaf Split vs. Internal Split**: Demonstrates the vital architectural difference between leaf node splitting (copying separator up while retaining key in data leaf) and internal node splitting (extracting median key to parent).
  - **Horizontal Leaf Linked List**: Renders pointer links connecting all leaf nodes horizontally for rapid sequential range scanning.
  - **Range Query Operation**: Visualizes `RANGE(min, max)` by finding the start key via root-to-leaf binary search and sequentially traversing the leaf linked list.

### 3.4 C Call-Stack & Activation Record Simulator ([`CallStackLab.tsx`](file:///home/sumeet/LumeNode/apps/web/src/components/visualizers/CallStackLab.tsx))
- **Model Engine**: [`callStackModel.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/visualization/callStackModel.ts)
- **Pedagogical Goal**: De-mystify how the CPU execution stack behaves during function calls, recursive algorithms, parameter passing, and return address unwinding.
- **Hardware Architecture Representation**:
  - Stack pointer `%rsp` growing downward from high memory (`0x7FFF_FFFF_FC00`) toward low memory.
  - Activation frame boundaries showing saved frame pointer (`%rbp`), return address (`RIP`), passed parameters, and local variables with hex addresses.
  - Built-in simulation programs:
    - `Factorial Recursion (n=4)`: Demonstrates stack growth depth, base condition return, and frame destruction.
    - `Fibonacci Recursion (n=3)`: Demonstrates branch call trees and stack frame reuse.
  - **ABI Educational Disclaimer**: Explicitly explains System V AMD64 ABI conventions vs simulation model abstractions.

---

## 4. Verification Baseline
All visualizer models are 100% headless testable. The test suite includes 34 tests validating deterministic execution:
- `apps/web/src/test/simulationEngine.test.ts`
- `apps/web/src/test/bstModel.test.ts`
- `apps/web/src/test/avlModel.test.ts`
- `apps/web/src/test/bplusModel.test.ts`
- `apps/web/src/test/callStackModel.test.ts`
