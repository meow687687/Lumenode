# Lumenode Architecture Documentation

## 1. System Overview

Lumenode is designed as a **modular monolith** with clean boundary separation across distinct domains. While developed as a monorepo, each package and domain module is strictly isolated to allow eventual service decomposition if needed, without incurring premature operational complexity.

```mermaid
graph TD
    Client["Web Client (apps/web)"]
    
    subgraph UI & Presentation Layer
        Shell["App Shell & Navigation (React Router)"]
        Router["Path-Based Declarative Routes (/explore, /lessons/:id, /labs/:id)"]
        Theme["Dark-First Theme & Design System"]
    end
    
    subgraph Core Engines & Dedicated Web Workers
        ZodValidator["Runtime Schema Validator (Zod)"]
        LessonRenderer["lesson-renderer<br/>(Structured Block Renderer + Error Boundary)"]
        VisualCore["visualization-core<br/>(Step Tracing & Educational Simulations)"]
        PythonWorker["Dedicated Python Worker<br/>(Pyodide WASM Runtime)"]
        SQLiteWorker["Dedicated SQLite Worker<br/>(sql.js WASM In-Memory DB)"]
        ProgressEngine["progress-engine<br/>(Local-first Storage with Clean Init)"]
        SharedTypes["packages/shared-types<br/>(Zod Schemas & TypeScript Types)"]
    end

    subgraph Interactive Laboratories
        DSALab["DSA Visualizer (Linked Lists, Binary Search)"]
        MemoryLab["Memory & Pointer Simulator (Stack/Heap/Pointers)"]
        SQLLab["SQL Playground (Genuine SQLite WASM)"]
        CodePlayground["Code Sandbox (Pyodide WASM + Truthful Indicators)"]
    end

    Client --> Shell
    Shell --> Router
    Router --> LessonRenderer
    Router --> Interactive Laboratories
    
    LessonRenderer --> ZodValidator
    LessonRenderer --> VisualCore
    
    CodePlayground --> PythonWorker
    SQLLab --> SQLiteWorker
    
    LessonRenderer --> ProgressEngine
    Interactive Laboratories --> ProgressEngine
    
    ZodValidator -.-> SharedTypes
```

## 2. Core Principles of the Architecture

1. **Local-First and Zero-Friction:**
   - Learners can access core content, run SQL queries in-browser (via SQLite WASM in dedicated web workers), step through DSA visualizers, run authentic Python 3 programs, and track progress offline without mandatory cloud connectivity.

2. **Data-Driven & Schema-Validated Content:**
   - Lessons are structured data validated via **Zod runtime schemas** (`LessonSchema`, `ContentBlockSchema`). Unrecognized or malformed blocks trigger an explicit authoring error boundary rather than failing silently.

3. **Decoupled Execution in Dedicated Web Workers:**
   - User code execution never runs in the application server process or main UI thread.
   - Client-side Python runs in `src/workers/python.worker.ts` with Pyodide WASM, capturing `sys.stdout` and `sys.stderr` with hard timeouts.
   - Client-side SQL runs in `src/workers/sqlite.worker.ts` with `sql.js` WASM on an in-memory database.
   - Compiled languages (C and C++) display truthful status indicators awaiting the Phase 2B remote container gateway.

4. **Canonical Concepts vs. Language Implementations:**
   - Concepts (e.g., `dsa.singly-linked-list`, `memory.pointers-intro`) are language-agnostic first-class entities. Language implementations bind to concepts without duplicating core theory.

## 3. Directory and Package Layout

```
lumenode/
├── apps/
│   └── web/                   # Main React 19 + Vite SPA application
│       ├── src/
│       │   ├── components/    # Layout, lessons, visualizers, laboratories
│       │   ├── context/       # Local-first progress state management
│       │   ├── data/          # Canonical subjects, lessons, exercises
│       │   ├── services/      # Python and SQLite Web Worker adapters
│       │   ├── workers/       # Dedicated Pyodide and SQLite WASM Web Workers
│       │   └── test/          # Vitest & Testing Library test suites
├── packages/
│   └── shared-types/          # Canonical Zod schemas, TypeScript types, validators
├── docs/                      # Architectural, technical, security, and audit specs
└── README.md
```
