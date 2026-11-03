# Lumenode Content Engine & Block Specification

## 1. Overview

Lumenode lessons are constructed using a modular, block-based architecture. Instead of monolithic HTML or unconstrained markdown, lessons are composed of typed, schema-validated content blocks.

Every content block is validated at build time and runtime via Zod (`ContentBlockSchema`). If an invalid block is authored, Lumenode renders a diagnostic error boundary identifying the offending block index and reason, rather than silently dropping content or crashing the application.

---

## 2. Block Type Catalog

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Lumenode Content Blocks                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Structure         │ Interactive       │ Advanced Pedagogical           │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ - heading         │ - code            │ - walkthrough                  │
│ - markdown        │ - quiz            │ - math                         │
│ - callout         │ - exercise        │ - related_concepts             │
│ - comparison      │ - visualization   │ - references                   │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 3. Block Schemas & Field Definitions

### 3.1 Structural Blocks

#### Heading Block (`heading`)
```typescript
{
  type: 'heading',
  level: 1 | 2 | 3 | 4,
  text: string
}
```

#### Markdown Block (`markdown`)
```typescript
{
  type: 'markdown',
  content: string // Rich markdown paragraph
}
```

#### Callout Block (`callout`)
```typescript
{
  type: 'callout',
  variant: 'info' | 'warning' | 'tip' | 'danger',
  title?: string,
  content: string
}
```

#### Comparison Table Block (`comparison`)
Used to contrast concepts, data structures, or paradigms side-by-side.
```typescript
{
  type: 'comparison',
  title: string,
  headers: string[], // Column names
  rows: string[][]   // Matrix of string cell values; length of each row must equal headers.length
}
```

---

### 3.2 Interactive & Laboratory Blocks

#### Code Block (`code`)
```typescript
{
  type: 'code',
  language: 'c' | 'cpp' | 'python' | 'sql' | 'javascript' | 'rust',
  code: string,
  title?: string,
  executable?: boolean, // Displays "Run in Playground" action when true
  lineHighlight?: number[]
}
```

#### Visualization Block (`visualization`)
Mounts an interactive visual laboratory directly into the lesson flow.
```typescript
{
  type: 'visualization',
  visualizerType: 'memory' | 'dsa' | 'sql' | 'custom',
  sequenceId?: string
}
```

#### Quiz Block (`quiz`)
Mounts an assessment question with immediate feedback and explanation.
```typescript
{
  type: 'quiz',
  exerciseId: string // Resolves to an Exercise in the exercise catalog
}
```

#### Exercise Block (`exercise`)
Mounts a hands-on coding challenge launcher.
```typescript
{
  type: 'exercise',
  exerciseId: string,
  title?: string,
  description?: string
}
```

---

### 3.3 Advanced Pedagogical Blocks

#### Walkthrough Block (`walkthrough`)
Provides interactive, step-by-step code analysis. Learners step forward and backward through steps with line highlights.
```typescript
{
  type: 'walkthrough',
  title: string,
  description?: string,
  steps: [
    {
      stepNumber: number, // 1-indexed sequential integer
      title: string,
      description: string,
      codeSnippet?: string,
      highlightLines?: number[] // Line numbers highlighted in the code snippet
    }
  ]
}
```

#### Math Block (`math`)
Renders mathematical formulas, complexity bounds, and recurrence relations with clean high-contrast typography and explanation.
```typescript
{
  type: 'math',
  formula: string,      // Mathematical formula or LaTeX expression (e.g. "T(n) = 2T(n/2) + O(n)")
  explanation?: string // Plain-language explanation of the mathematical components
}
```

#### Related Concepts Block (`related_concepts`)
Renders interactive knowledge graph cards linking to related canonical concepts.
```typescript
{
  type: 'related_concepts',
  title?: string,
  conceptIds: string[] // List of valid concept IDs registered in CONCEPTS
}
```

#### References Block (`references`)
Provides academic citations, books, and authoritative documentation links.
```typescript
{
  type: 'references',
  title?: string,
  items: [
    {
      title: string,
      author?: string,
      year?: number,
      url?: string
    }
  ]
}
```

---

## 4. Authoring Diagnostics & Error Boundaries

When content is parsed by `safeValidateLesson`, failures produce detailed diagnostics:

1. **Missing or Extra Columns:** Comparison tables where row lengths do not match headers are rejected with specific line and column counts.
2. **Non-sequential Steppers:** Walkthrough steps with out-of-order `stepNumber`s generate authoring warnings.
3. **Empty Formulas:** Math blocks with blank formulas fail validation.
4. **Malformed Block Fallback:** If an unrecognized block type is injected at runtime, `LessonRenderer` renders an explicit authoring banner:
   `[Authoring Error]: Unrecognized lesson block type at index 3: { ... }`
