# Lumenode Assessment Engine & Coding Challenge Specification

**Document Reference:** `docs/ASSESSMENT_ENGINE.md`  
**Phase:** 3  
**Status:** Implemented & Verified  

---

## 1. Assessment Philosophy

Assessment in computer science must measure genuine comprehension, algorithmic tracing, and implementation capability rather than rote recall. A student who can memorize the definition of an AVL tree might still fail to calculate balance factors during a left-rotation or identify an off-by-one pointer error in a C linked list.

Lumenode's Assessment Engine provides:
1. **8 Distinct Assessment Archetypes** spanning multiple cognitive modalities.
2. **Deterministic Evaluation & Scaffolding**: Structured hints with progressive penalty curves.
3. **Genuine Code Execution**: Test case evaluation powered by Pyodide (Python), SQLite WASM (SQL), and the Compiler Gateway (C/C++).

---

## 2. Assessment Archetypes & Scoring Rules

Located in [`apps/web/src/services/assessment/assessmentEngine.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/assessment/assessmentEngine.ts).

| Archetype ID | Category | Description | Evaluation Logic |
| :--- | :--- | :--- | :--- |
| `single_choice` | Conceptual | Standard multiple-choice with deep technical distractors. | Exact string/index match. |
| `multiple_choice` | Architectural | Multi-select questions where multiple design properties apply. | Symmetric set equality: all correct options selected, zero distractors selected. |
| `code_tracing` | Systems Debugging | Tracing variable mutations, loop invariants, or output through snippets. | Normalized trimmed string match against computed output. |
| `memory_calculation` | Hardware & Systems | Calculating hex address byte offsets, struct padding, and pointer math. | Hexadecimal or integer equality (e.g. `0x1008` or byte offset `16`). |
| `sql_prediction` | Relational Data | Predicting query plan results, row counts, or join tables. | Row-by-row normalized string or value match. |
| `complexity_analysis` | Algorithmics | Determining worst-case Big-O time and auxiliary space complexity. | Canonical Big-O normalization (e.g. `O(n log n)`, `O(1)`). |
| `ordering_sequence` | Structural Process | Reordering algorithmic steps (e.g. 2-child BST deletion or AVL rotation). | Exact array permutation index match. |
| `coding_challenge` | Implementation | Writing code that compiles and passes automated input/output test suites. | Automated runner execution against test cases. |

### 2.1 Hint Economy & Penalty Curve
To encourage self-reliance while preventing frustration:
- Each question defines structured hints ordered by increasing specificity.
- Viewing a hint deducts **20%** of the potential base score for that question.
- **Score Floor**: The score cannot drop below **20%** if the question is ultimately solved correctly, ensuring students who need guidance are still rewarded for finishing.

$$\text{Final Score} = \max(20, \text{Base Score} \times (1 - 0.20 \times \text{hintsUsed}))$$

---

## 3. Automated Coding Challenge Evaluation

Located in [`apps/web/src/services/assessment/codingChallengeRunner.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/assessment/codingChallengeRunner.ts).

### 3.1 Test Case Execution Protocol
Challenges specify structured test cases:
```typescript
interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}
```

### 3.2 Multi-Runtime Dispatch
1. **Python 3 Challenges**:
   - Executed locally in the browser via Pyodide Web Worker.
   - Standard input is virtualized using `sys.stdin = StringIO(input)`.
   - Standard output is captured and trimmed against `expectedOutput`.
   - Execution is sandboxed with a 5,000ms timeout.

2. **SQL Challenges**:
   - Executed against an ephemeral SQLite WASM database via `sql.js`.
   - Returns structured rows and verifies table projections against expected query output.

3. **C and C++ Challenges**:
   - Dispatched to the Compiler Gateway (`CompilerGatewayClient`).
   - If the gateway is configured, compiles with `-Wall -Wextra -O2` and runs each test case with stdin.
   - If unconfigured, truthfully sets `isCompilerGatewayRequired: true` and guides the user without fabricating test passes.
