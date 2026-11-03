# Lumenode Content Authoring Guide

## 1. Contributor Workflow

Lumenode uses a structured, code-first content pipeline. Content is authored directly in TypeScript files under `apps/web/src/data/` and strictly validated against Zod schemas in `@lumenode/shared-types`.

Follow this workflow when proposing new curriculum material:

```
1. Identify Canonical Concept ──► 2. Add Multi-Language Implementations
              │
              ▼
3. Author Structured Lesson  ──► 4. Run Automated Validation Suite
                                              │
                                              ▼
                                 5. Review & Submit Pull Request
```

---

## 2. Authoring a Canonical Concept

1. Open `apps/web/src/data/concepts.ts`.
2. Add a new `Concept` entry conforming to `ConceptSchema`:

```typescript
{
  id: 'dsa.binary-search-tree',
  subjectId: 'dsa',
  title: 'Binary Search Trees (BST)',
  slug: 'binary-search-trees',
  description: 'A rooted binary tree data structure with the BST invariant: left subtrees contain keys <= node key, and right subtrees contain keys >= node key.',
  difficulty: 'intermediate',
  prerequisiteConceptIds: ['dsa.binary-trees'],
  relatedConceptIds: ['dsa.binary-search'],
  learningObjectives: [
    'Define the binary search tree ordering invariant.',
    'Implement average-case O(log n) search, insertion, and deletion.',
    'Analyze worst-case degeneration to O(n) un-balanced linked list.',
  ],
  tags: ['trees', 'bst', 'algorithms', 'dsa'],
  implementations: [
    {
      languageId: 'cpp',
      title: 'C++ BST Node & Pointer Struct',
      summary: 'Node with unique_ptr child links and recursive traversal.',
      codeSnippet: `struct TreeNode {\n    int val;\n    std::unique_ptr<TreeNode> left;\n    std::unique_ptr<TreeNode> right;\n};`,
      memorySemantics: 'Nodes allocated on the heap via std::make_unique; automatically cleaned up on tree destruction.',
      keyDifferences: [
        'Automatic recursive deallocation prevents memory leaks.',
        'Null pointers represent absent children.',
      ],
    },
    {
      languageId: 'python',
      title: 'Python BST Node Class',
      summary: 'Dynamic object references for left and right attributes.',
      codeSnippet: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right`,
      memorySemantics: 'Node references are PyObjects on heap; garbage collected when unreachable.',
      keyDifferences: [
        'Dynamic typing allows heterogeneous values if desired.',
        'Recursive traversal may hit sys.getrecursionlimit() on degenerated trees.',
      ],
    },
  ],
}
```

---

## 3. Authoring a Structured Lesson

1. Open `apps/web/src/data/lessons.ts`.
2. Add a new `Lesson` object:

```typescript
{
  id: 'dsa-lesson-05',
  conceptId: 'dsa.binary-search-tree',
  languageId: 'cpp',
  title: 'Binary Search Trees: Structure & Search',
  slug: 'bst-structure-search',
  summary: 'Master binary search tree properties, heap node layouts, and O(log n) lookup mechanics.',
  difficulty: 'intermediate',
  estimatedMinutes: 20,
  order: 5,
  version: '1.0.0',
  learningObjectives: [
    'Enforce the BST invariant across child nodes.',
    'Trace recursive lookup in assembly and C++.',
  ],
  sections: [
    { type: 'heading', level: 2, text: 'The BST Ordering Property' },
    { type: 'markdown', content: 'In a Binary Search Tree, every node satisfies...' },
    {
      type: 'math',
      formula: 'T(n) = T(n/2) + O(1) \\implies O(\\log n)',
      explanation: 'Balanced BST search recurrence relation.',
    },
    {
      type: 'walkthrough',
      title: 'Recursive Search Step-by-Step',
      steps: [
        {
          stepNumber: 1,
          title: 'Base Case: Check for Null or Target',
          description: 'If current node is null or val equals target, return.',
          codeSnippet: 'if (!root || root->val == target) return root;',
          highlightLines: [1],
        },
      ],
    },
    {
      type: 'references',
      title: 'Academic References',
      items: [
        {
          title: 'Introduction to Algorithms (CLRS)',
          author: 'Cormen, Leiserson, Rivest, Stein',
          year: 2022,
        },
      ],
    },
  ],
}
```

---

## 4. Content Authoring CLI Commands

Lumenode provides four automated validation commands:

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
- [ ] Code examples are syntactically valid and have `executable: true` if runnable in the lab.
- [ ] Comparison tables have identical column counts in every row.
- [ ] Walkthrough steps have sequential `stepNumber`s (1, 2, 3...).
- [ ] No fake or simulated output is present.
- [ ] Production build succeeds (`pnpm build`).
