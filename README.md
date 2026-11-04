# Lumenode

> **Explore. Understand. Build.**  
> An open-source, completely free, interactive computer science learning platform designed to make complex technical concepts transparent and accessible.

---

## 🌟 Vision & Mission

Traditional programming education frequently separates theoretical explanations from practical implementation. Students memorize definitions without understanding how algorithms execute, how memory behaves, how databases operate, or how programming languages differ internally.

**Lumenode** addresses this gap by combining:
- **Concept Before Syntax**: Core CS principles taught before language-specific boilerplate.
- **Interactive Visual Laboratories**: 2D/3D step-by-step visualizers for algorithms, pointer memory maps, and OOP inheritance.
- **In-Browser Experimentation**: Safe execution sandboxes, live code runners, and local SQLite playgrounds.
- **Cross-Language Comparisons**: See how the same data structure or memory pattern manifests across C, C++, Python, and more.
- **Zero Paywalls**: 100% free and open-source software and educational content.

---

## 📂 Repository Structure

```
lumenode/
├── apps/
│   └── web/                   # Main React 19 + TypeScript + Vite web application
├── packages/
│   ├── shared-types/          # Canonical schemas, interfaces, enums
│   ├── design-system/         # Tailwind CSS design tokens and core UI components
│   ├── content-engine/        # Markdown/MDX parser, validator, search indexing
│   ├── lesson-renderer/       # Dynamic block-based lesson rendering engine
│   ├── visualization-core/    # Reusable step-based animation & playback framework
│   ├── execution-adapter/     # Local/remote code execution and SQLite WASM client
│   ├── assessment-engine/     # Quiz, predict-the-output, and coding challenge runner
│   └── progress-engine/       # IndexedDB storage and local progress tracker
├── content/
│   ├── subjects/              # Subject metadata and course structures
│   ├── concepts/              # Language-independent concept definitions
│   ├── lessons/               # Concrete lesson content blocks
│   └── exercises/             # Question banks, challenges, mock tests
├── docs/                      # Architectural, technical, and PRD specifications
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL_DESIGN.md
│   ├── DATA_MODEL.md
│   └── ROADMAP.md
└── README.md
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (`motion/react`), Lucide React
- **Visualization**: Interactive SVG, React Flow, Three.js / React Three Fiber
- **Code Editor**: Monaco Editor
- **Databases & Storage**: SQLite WASM via Web Workers, IndexedDB for local progress
- **Execution**: Sandboxed remote compiler gateway (Judge0 compatible) + client-side runtimes

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/your-username/lumenode.git
cd lumenode

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

## 📜 Documentation

- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Technical Design](docs/TECHNICAL_DESIGN.md)
- [Accessibility Audit & Standards (WCAG 2.2 AA)](docs/ACCESSIBILITY.md)
- [Performance & Bundle Architecture](docs/PERFORMANCE.md)
- [Production Deployment Guide](docs/DEPLOYMENT.md)
- [Public Beta Testing Plan](docs/BETA_TEST_PLAN.md)
- [Security Policy & Sandbox Architecture](docs/SECURITY.md)
- [Phase 4 Hardening & Implementation Report](docs/PHASE_4_IMPLEMENTATION.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

---

## 🧪 Verification & Quality Checks

Run the complete verification pipeline locally:
```bash
# Type check TypeScript workspaces
pnpm typecheck

# Run unit, integration, and E2E learner journey tests
pnpm test

# Lint code
pnpm lint

# Production build with chunk analysis
pnpm build

# Validate curriculum schema integrity
pnpm content:validate

# Verify executable code samples
pnpm content:check-code
```

---

## 📄 License

- **Platform Software**: [Apache License 2.0](LICENSE)
- **Educational Content**: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)
- **Code Examples**: MIT License
