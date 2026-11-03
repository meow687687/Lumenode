# Lumenode Technical Design

## 1. Technical Objectives

1. **Deterministic Visualizations**: Ensure data structure operations, memory allocations, and OOP inheritance lookups are represented step-by-step with zero visual jitter and reproducible replay controls.
2. **Accessible by Default**: Fully functional on low-bandwidth connections, standard student hardware, touchscreens, and screen readers.
3. **Safe & Responsive Code Sandbox**:
   - Client-side SQLite WASM in Web Workers for instant queries with zero server cost.
   - Decoupled remote compiler gateway for C, C++, and Python with strict memory, timeout, and output truncation limits.
4. **Resilient Local Persistence**: State stored in IndexedDB using Dexie.js / idb with immediate read/write response.

## 2. Frontend Technology Selection

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript | Concurrent rendering, modern hooks, robust ecosystem. |
| **Bundler** | Vite 6+ | Rapid HMR, optimized tree-shaking, fast ES module serving. |
| **Styling** | Tailwind CSS v4 | Dark-first technical palette, rapid responsive development. |
| **Animation** | Motion (`motion/react`) | Fluid layout transitions, reduced-motion compliance. |
| **Icons** | Lucide React | Clean, consistent developer-centric icons. |
| **Code Editor** | Monaco Editor / CodeMirror | High-fidelity syntax highlighting, editing, and error markers. |
| **SQL Engine** | SQLite WASM via Web Worker | Fast, zero-server SQL execution in browser sandbox. |
| **Diagrams/Flow** | SVG + React Flow | Clear node-based graphs for memory layouts, ASTs, and pointers. |
| **3D Engine** | Three.js / React Three Fiber | Lazy-loaded for 3D hardware and memory architecture scenes. |

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

- Execution timeout: 5.0 seconds maximum.
- Memory ceiling: 64MB per run.
- Stdout / Stderr buffer limit: 64KB (truncated with warning).
- File system access: Virtualized temporary ramdisk only.
- Network access: Fully disabled (`--net=none` container level).
- System calls: Strictly restricted using seccomp / isolate sandboxing.
