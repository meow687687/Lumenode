# Lumenode Architecture Documentation

## 1. System Overview

Lumenode is designed as a **modular monolith** with clean boundary separation across distinct domains. While developed as a monorepo, each package and domain module is strictly isolated to allow eventual service decomposition if needed, without incurring premature operational complexity.

```mermaid
graph TD
    Client["Web Client (apps/web)"]
    
    subgraph UI & Presentation Layer
        Shell["App Shell & Navigation"]
        Router["Declarative Router"]
        Theme["Theme & Design System"]
    end
    
    subgraph Core Engines (packages/)
        ContentEngine["content-engine<br/>(Markdown/MDX, Ast, Metadata)"]
        LessonRenderer["lesson-renderer<br/>(Structured Block Renderer)"]
        VisualCore["visualization-core<br/>(Step Tracing, 2D/3D Canvas)"]
        ExecAdapter["execution-adapter<br/>(Isolated Execution, SQLite WASM)"]
        AssessEngine["assessment-engine<br/>(MCQ, Tracing, Coding Checks)"]
        ProgressEngine["progress-engine<br/>(IndexedDB, Local-first Sync)"]
        SharedTypes["shared-types<br/>(Zod Schemas, Domain Models)"]
    end

    subgraph Interactive Laboratories
        DSALab["DSA Visualizer"]
        MemoryLab["Memory & Pointer Simulator"]
        InheritLab["OOP Inheritance Lab"]
        SQLLab["SQL Playground (SQLite WASM)"]
        CodePlayground["Code Playground"]
    end

    Client --> Shell
    Shell --> Router
    Router --> LessonRenderer
    Router --> Interactive Laboratories
    
    LessonRenderer --> ContentEngine
    LessonRenderer --> VisualCore
    LessonRenderer --> AssessEngine
    
    Interactive Laboratories --> ExecAdapter
    Interactive Laboratories --> VisualCore
    
    AssessEngine --> ProgressEngine
    LessonRenderer --> ProgressEngine
    
    ContentEngine -.-> SharedTypes
    ProgressEngine -.-> SharedTypes
    ExecAdapter -.-> SharedTypes
```

## 2. Core Principles of the Architecture

1. **Local-First and Zero-Friction:**
   - Learners can access core content, run SQL queries in-browser (via SQLite WASM), step through DSA visualizers, and track progress offline via IndexedDB without requiring immediate mandatory account creation or cloud connectivity.

2. **Data-Driven Content:**
   - Lessons are not hardcoded React pages. They are structured data schemas (JSON/Markdown frontmatter + structured content blocks) that the `lesson-renderer` compiles into rich, accessible views.

3. **Decoupled Execution:**
   - User code execution never runs in the application server process. Local executions (e.g. SQLite WASM, client-side simulations) run in Web Workers; remote language runs (C, C++, Python) route via `execution-adapter` to a sandboxed gateway (e.g., Judge0 or isolated runner) with strict CPU, memory, and timeout bounds.

4. **Canonical Concepts vs. Language Implementations:**
   - Concepts (e.g., `dsa.linked-lists`, `memory.pointers`) are language-agnostic first-class entities. Language implementations (C, C++, Python, Rust) bind to the concept, preventing duplicated educational theory.

## 3. Directory and Package Layout

```
lumenode/
├── apps/
│   └── web/                   # Main React 19 + Vite SPA application
├── packages/
│   ├── shared-types/          # Canonical schemas, interfaces, enums (TypeScript + Zod)
│   ├── design-system/         # Reusable Tailwind components, tokens, themes
│   ├── content-engine/        # Content loader, validator, search indexing
│   ├── lesson-renderer/       # Dynamic block-based lesson rendering
│   ├── visualization-core/    # State-driven animation, playback controls, step tracers
│   ├── execution-adapter/     # Local/remote execution abstraction + SQLite WASM worker
│   ├── assessment-engine/     # Quiz, predict-output, code testing evaluations
│   └── progress-engine/       # IndexedDB storage and local progress tracker
├── content/
│   ├── subjects/              # Subject metadata
│   ├── concepts/              # Language-independent concept definitions
│   ├── lessons/               # Concrete lesson content blocks & code
│   └── exercises/             # Question banks, challenges, mock tests
└── docs/                      # Architectural, technical, and product specifications
```
