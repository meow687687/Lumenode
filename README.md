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

- [Product Requirements Document (PRD)](file:///home/sumeet/LumeNode/docs/PRD.md)
- [System Architecture](file:///home/sumeet/LumeNode/docs/ARCHITECTURE.md)
- [Technical Design](file:///home/sumeet/LumeNode/docs/TECHNICAL_DESIGN.md)
- [Data Model & Schemas](file:///home/sumeet/LumeNode/docs/DATA_MODEL.md)
- [Execution Roadmap](file:///home/sumeet/LumeNode/docs/ROADMAP.md)

---

## 📄 License

- **Platform Software**: [Apache License 2.0](LICENSE)
- **Educational Content**: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)
- **Code Examples**: MIT License
