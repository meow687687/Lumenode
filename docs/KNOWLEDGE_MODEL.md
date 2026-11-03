# Lumenode Knowledge Architecture & Canonical Concept Model

## 1. Architectural Philosophy

Traditional computer science platforms tightly couple programming syntax to theoretical computer science concepts. As a consequence:
- Foundational concepts (such as pointer indirection, linked list topology, or dynamic dispatch) are repetitively re-explained from scratch in each language course.
- Conceptual explanations vary wildly in quality and pedagogical depth across courses.
- Students fail to grasp that a linked list or virtual method table is a universal data organization pattern rather than a C++ or Java specific construct.

**Lumenode decouples theory from syntax.**

In Lumenode:
1. **Concepts are canonical, language-independent entities.** A concept models a pure computer science truth (e.g., `dsa.singly-linked-list` or `memory.pointers-intro` or `oops.inheritance`).
2. **Implementations are language-specific projections.** A canonical concept links to multiple language implementations (C, C++, Python, Rust, Java), detailing how that concept is realized in each runtime, compiler, and memory architecture.
3. **The Concept Graph is a Directed Acyclic Graph (DAG).** Concepts declare prerequisites and related nodes. Cycle detection guarantees an ordered progression path for learners.

```
                  ┌─────────────────────────────────────┐
                  │          Canonical Concept          │
                  │       (memory.pointers-intro)       │
                  │   - Universal Memory Architecture   │
                  │   - Virtual Addresses & Byte Offsets│
                  │   - Indirection & Dereferencing     │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│   C Implementation │    │  C++ Implementation│    │Rust Implementation │
│- Raw virtual addr  │    │- Raw & References  │    │- Ownership & Borrows
│- Pointer arithmetic│    │- RAII unique_ptr   │    │- Safe &mut T rules │
│- Manual lifetime   │    │- Reference aliases │    │- Zero-cost memory  │
└────────────────────┘    └────────────────────┘    └────────────────────┘
```

---

## 2. Canonical Knowledge Entity Schema

The canonical knowledge model is defined with runtime validation using Zod in `@lumenode/shared-types`.

### 2.1 Concept Schema (`Concept`)

```typescript
export const ConceptSchema = z.object({
  id: z.string().min(1),               // Unique canonical ID, e.g. 'dsa.singly-linked-list'
  subjectId: z.string().min(1),        // Associated subject, e.g. 'dsa'
  title: z.string().min(1),            // Human-readable title
  slug: z.string().min(1),             // URL-safe slug
  description: z.string(),             // Language-independent theoretical overview
  difficulty: DifficultyLevelSchema,   // 'beginner' | 'intermediate' | 'advanced'
  prerequisiteConceptIds: z.array(z.string()).default([]), // DAG prerequisite dependencies
  relatedConceptIds: z.array(z.string()).default([]),      // Knowledge graph associations
  learningObjectives: z.array(z.string()).default([]),     // Discrete pedagogical goals
  tags: z.array(z.string()).default([]),                   // Search and taxonomy tags
  implementations: z.array(LanguageImplementationSchema).default([]), // Multi-language projections
  lessonIds: z.array(z.string()).default([]),              // Associated curriculum lessons
  exerciseIds: z.array(z.string()).default([]),            // Associated coding exercises
});
```

### 2.2 Language Implementation Schema (`LanguageImplementation`)

```typescript
export const LanguageImplementationSchema = z.object({
  languageId: SupportedLanguageIdSchema, // 'c' | 'cpp' | 'python' | 'rust' | 'java'
  title: z.string().min(1),              // e.g. 'C Raw Pointers'
  summary: z.string(),                   // How the language addresses the concept
  codeSnippet: z.string(),               // Representative, idiomatic code sample
  memorySemantics: z.string(),           // Stack/heap layout, memory layout, runtime guarantees
  keyDifferences: z.array(z.string()),   // Language idioms, trade-offs, and hazards
});
```

---

## 3. Graph Invariants & Validation

The knowledge graph enforces four core invariants:

1. **DAG Invariant (No Cyclic Dependencies):**  
   If concept $A$ has prerequisite $B$, concept $B$ (and its transitive prerequisites) must never depend on $A$. The automated content validator (`pnpm content:validate`) runs a Depth-First Search with recursion stack tracking over all concepts to guarantee cycle freedom.

2. **Referential Integrity:**  
   Every entry in `prerequisiteConceptIds` and `relatedConceptIds` must correspond to a valid canonical concept registered in `CONCEPTS`.

3. **Curriculum Reachability:**  
   Every lesson registered in the curriculum must declare a valid `conceptId` referencing an existing canonical concept.

4. **Multi-Language Parity:**  
   Whenever a concept presents cross-language comparison, each language implementation must specify concrete code snippets, accurate memory semantics, and explicit language-specific tradeoffs.

---

## 4. Concept Explorer & Multi-Language Comparison UI

The platform provides a dedicated route for exploring canonical concepts:

- **Route:** `/concepts/:id`
- **Component:** `ConceptView.tsx`
- **Capabilities:**
  - Interactive language switcher (C, C++, Python, Rust, Java).
  - Syntax snippet inspector with direct **"Launch in Lab"** integration.
  - Architectural memory model cards comparing manual pointers, RAII smart pointers, Python PyObject reference counters, and Rust borrow checkers side-by-side.
  - Interactive prerequisite traversal chips.
  - Direct links to associated curriculum lessons.
