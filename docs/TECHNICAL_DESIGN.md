# Lumenode Technical Design

## 1. Technical Objectives

1. **Deterministic Visualizations**: Ensure data structure operations, memory allocations, and pointer lookups are represented step-by-step with zero visual jitter and explicit disclaimers identifying them as idealized educational simulations.
2. **Accessible by Default**: Fully functional on low-bandwidth connections, standard student hardware, touchscreens, and screen readers.
3. **Safe & Responsive Code Sandbox**:
   - Client-side Pyodide WASM in a Dedicated Web Worker for real Python 3 execution with standard IO capture and 6s timeout protection.
   - Client-side SQLite WASM in a Dedicated Web Worker for instant relational queries, real syntax errors, and in-memory schema inspections.
   - Truthful indicators for C/C++ informing students that remote isolated compiler gateway integration is scheduled for Phase 2B.
4. **Resilient Local Persistence**: State stored in `localStorage` with versioned keys, clean initial state for new users, and robust error recovery.
5. **Path-Based Browser Routing**: Full browser history, back/forward support, refresh persistence, and deep linking via `react-router-dom`.

## 2. Frontend Technology Selection

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript | Concurrent rendering, modern hooks, robust ecosystem. |
| **Bundler** | Vite 6+ | Rapid HMR, optimized tree-shaking, fast ES module serving, native Web Worker bundling. |
| **Routing** | React Router v7 | Path-based routing (`/explore`, `/lessons/:id`, `/labs/:id`), deep linking, code forwarding. |
| **Styling** | Tailwind CSS v4 | Dark-first technical palette, rapid responsive development. |
| **Validation** | Zod v3 | Strict runtime schemas for lessons, subjects, and execution result contracts. |
| **Python Engine** | Pyodide (WASM) | Dedicated Web Worker with `sys.stdout`/`sys.stderr` capture and timeout protection. |
| **SQL Engine** | SQLite WASM (`sql.js`) | Dedicated Web Worker with in-memory relational database and dynamic schema reflection. |
| **Testing** | Vitest + Testing Library | Blazing fast ESM unit & integration tests running in jsdom. |
| **Linting** | ESLint + typescript-eslint | Static code analysis and React hook hygiene. |

## 3. Dark-First Design System Specification

### Color Tokens:
- **Base Background**: Deep Navy (`#0A0F1D`)
- **Card / Surface**: Rich Slate (`#111827`)
- **Elevated Surface**: Border Slate (`#1F2937`)
- **Primary Accent**: Electric Blue (`#3B82F6` / `#2563EB`)
- **Secondary Accent**: Cyan (`#06B6D4`) & Violet (`#8B5CF6`)
- **Success / Valid**: Emerald (`#10B981`)
- **Warning / Note**: Amber (`#F59E0B`)
- **Error / Breakpoint**: Rose (`#F43F5E`)
- **Text Primary**: Crisp Off-White (`#F9FAFB`)
- **Text Secondary**: Muted Grey (`#9CA3AF`)

## 4. Execution Sandbox Security & Limits

- Execution timeout: 6.0 seconds maximum (enforced by worker termination).
- SQLite timeout: 5.0 seconds maximum.
- Standard IO buffers: In-memory string buffers per execution.
- Process isolation: Dedicated HTML5 Web Worker threads with zero DOM access.
