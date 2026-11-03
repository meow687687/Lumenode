# Lumenode Content Authoring Guide
**Version:** 2.0 (Phase 2C Standard)  
**Audience:** Curriculum Authors, Computer Science Educators, Open Source Contributors  

---

## 1. Contributor Workflow

Lumenode uses a structured, code-first content pipeline. Content is authored directly in TypeScript files under `apps/web/src/data/` and strictly validated against Zod schemas in `@lumenode/shared-types`.

Follow this workflow when proposing new curriculum material:

```
1. Identify Canonical Concept ──► 2. Add Multi-Language Implementations
              │
              ▼
3. Select Domain Template     ──► 4. Author 15-Part Structured Lesson
              │
              ▼
5. Add Practical Exercises    ──► 6. Run Automated Pipeline (Validate & Check-Code)
                                              │
                                              ▼
                                 7. Review & Submit Pull Request
```

---

## 2. The 15-Part Instructional Lesson Standard

Every comprehensive instructional lesson should contain:

1. **Title & Overview:** Clean, engaging, and pedagogically descriptive title and summary.
2. **Measurable Learning Objectives:** Concrete goals using Bloom's action verbs.
3. **Prerequisite Context:** Clear linkage to preceding concepts in the DAG.
4. **Intuitive Mental Model:** Conceptual analogy or high-level visual intuition.
5. **Formal Technical Definition:** Standard-compliant computer science specification.
6. **Syntax or Conceptual Representation:** Grammar, memory layout diagram, or relational schema.
7. **Complete Code Example:** Valid, syntactically clean code snippet with language tag.
8. **Step-by-Step Code Walkthrough (`walkthrough`):** Line-by-line stepper with highlighted lines.
9. **Interactive Visualization (`visualization`):** DSA visualizer, Memory Simulator, or SQL playground.
10. **Common Pitfalls & Mistakes (`callout`):** Warning on memory leaks, UB, or off-by-one errors.
11. **Practical Application:** Production systems and real-world engineering relevance.
12. **Hands-On Exercises (`quiz` / `exercise`):** Knowledge checks with progressive difficulty.
13. **Key Takeaway Summary:** Condensed recap reinforcing fundamental invariants.
14. **Connected Knowledge Graph (`related_concepts`):** Direct links to related canonical concepts.
15. **Authoritative References (`references`):** Academic citations, standard papers, and textbook links.

---

## 3. Reusable Domain Templates

Authors can set `templateType` in `Lesson` to one of 7 supported archetypes:

### 1. `fundamentals` (Syntax, Compilation, Types, Control Flow)
Focus on language mechanics, compilation phases, variables, operators, and control flow.
- *Key Blocks:* Heading &rarr; Markdown &rarr; Code &rarr; Walkthrough &rarr; Callout &rarr; Quiz &rarr; Related Concepts &rarr; References.

### 2. `data-structures` (Containers & Topologies)
Focus on node layouts, pointer links, dynamic sizing, memory fragmentation, and operations.
- *Key Blocks:* Heading &rarr; Markdown &rarr; Comparison Table &rarr; Visualization &rarr; Code &rarr; Walkthrough &rarr; Quiz &rarr; References.

### 3. `algorithms` (Procedures & Complexity Analysis)
Focus on invariants, recurrence relations, asymptotic proofs, and execution traces.
- *Key Blocks:* Heading &rarr; Math (Complexity) &rarr; Code &rarr; Walkthrough &rarr; Quiz &rarr; References.

### 4. `oop` (Encapsulation, Polymorphism, Resource Ownership)
Focus on class abstractions, access control, vtables, RAII, and object lifetime.
- *Key Blocks:* Heading &rarr; Markdown &rarr; Comparison &rarr; Code &rarr; Callout (Object Slicing/UB) &rarr; Quiz &rarr; References.

### 5. `dbms` (Relational Models, SQL, Transactions, Indexing)
Focus on relational algebra, declarative SQL queries, query execution plans, and ACID properties.
- *Key Blocks:* Heading &rarr; Schema/Table Comparison &rarr; SQL Code &rarr; Visualization (SQL Lab) &rarr; Callout (Engine Differences) &rarr; References.

### 6. `memory-systems` (Virtual Memory, Allocators, Stacks & Heaps)
Focus on byte offsets, pointer arithmetic, memory alignment, page faults, and cache lines.
- *Key Blocks:* Heading &rarr; Markdown &rarr; Visualization (Memory Simulator) &rarr; Code &rarr; Callout (UB Warning) &rarr; References.

### 7. `mathematical` (Discrete Math, Proofs & Recurrences)
Focus on formal recurrence relations, asymptotic bounds, and invariant proofs.
- *Key Blocks:* Heading &rarr; Math Formulas &rarr; Proof Markdown &rarr; Comparison &rarr; References.

---

## 4. Content Authoring CLI Commands

Lumenode provides five automated validation commands:

### `pnpm content:validate`
Validates every concept, module, topic, and lesson against Zod schemas, verifies uniqueness of IDs, detects cycles in the prerequisite graph, and checks content block integrity.

```bash
pnpm content:validate
```

### `pnpm content:check-links`
Runs link checking to ensure all `prerequisiteConceptIds`, `relatedConceptIds`, `conceptId`, and module/topic associations resolve to existing records.

```bash
pnpm content:check-links
```

### `pnpm content:check-code`
Extracts code examples from lessons and tests them:
- **C:** Runs `gcc -fsyntax-only` or compilation.
- **C++:** Runs `g++ -std=c++17 -fsyntax-only` or compilation.
- **Python:** Runs `/usr/bin/python3` in a controlled environment.
- **SQL:** Validates statements against SQLite WASM engine.

```bash
pnpm content:check-code
```

### `pnpm content:test`
Executes all automated unit tests including graph cycle checks and block rendering tests.

```bash
pnpm content:test
```

### `pnpm content:build`
Executes a full production compilation to verify bundle generation.

```bash
pnpm content:build
```

---

## 5. Review Rubric & Quality Checklist

Before submitting a content PR, verify that:

- [ ] All IDs are lowercase, hyphen-separated, and scoped (e.g. `dsa.singly-linked-list`).
- [ ] No cyclic dependencies exist (`pnpm content:validate` exits with code 0).
- [ ] Every lesson specifies at least 2 measurable `learningObjectives`.
- [ ] Code examples are syntactically valid and pass `pnpm content:check-code`.
- [ ] Comparison tables have identical column counts in every row.
- [ ] Walkthrough steps have sequential `stepNumber`s (1, 2, 3...).
- [ ] No fake or simulated output is present.
- [ ] Associated exercises exist in `quizzes.ts` with explanatory rationales.
- [ ] Production build succeeds (`pnpm build`).
