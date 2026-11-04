# Lumenode Known Limitations & Beta Disclosures

**Status:** Public Beta (v0.5.0-beta)  
**Philosophy:** Transparent, Honest Engineering Disclosures  
**Date:** November 2026

---

## 1. Code Execution Sandboxes

### 1.1 Remote C & C++ Compiler Gateway
- **Status:** Architecture specified (ADR 0004); remote microservice integration pending.
- **Current Behavior:** The frontend truthfully displays `Remote Gateway Pending` and provides local compilation instructions via GCC/Clang.
- **Why we don't simulate it locally in WASM:** Compiling C/C++ to generic 32-bit linear WebAssembly suppresses critical systems mechanics—such as hardware segmentation faults (`SIGSEGV`), bus errors, variable alignment padding, and true 64-bit pointer layouts. Rather than providing an inaccurate simulation that teaches anti-patterns, native execution is deferred to a secure Linux container sandbox.

### 1.2 In-Browser Python (Pyodide)
- **Cold-Start Latency:** The initial load of the Pyodide WebAssembly runtime (~12 MB compressed) may take 1–3 seconds on slower mobile connections. Subsequent runs execute within milliseconds.
- **Network Access:** Python code running in browser WebAssembly cannot open raw TCP sockets or bind to local ports due to browser security boundaries.

### 1.3 In-Browser SQLite (sql.js)
- **In-Memory Volatility:** The SQL database runs entirely in browser worker memory (`:memory:`). Alterations (e.g. `CREATE TABLE`, `INSERT`, `DROP`) persist during the active session but reset to default academic schemas upon page reload or clicking "Reset DB".

---

## 2. Interactive Visualizations & Hardware Accommodations

### 2.1 Mobile Viewports & Tree Scaling
- Trees with height $\ge 4$ (e.g., AVL trees with $> 15$ nodes or wide B+ trees) require horizontal panning or landscape orientation on narrow mobile phone screens ($< 400\text{px}$ width). Responsive auto-fitting is optimized for tablet ($> 768\text{px}$) and desktop displays.

### 2.2 Hardware-Accelerated Animation
- For learners using low-power devices without dedicated GPU acceleration, complex multi-node tree rebalancing animations can be set to `0.5x` speed or stepped through frame-by-frame using the manual `Step Forward` and `Step Backward` controls.

---

## 3. Storage, Sync & Cross-Device Portability

### 3.1 Local-First Privacy Boundaries
- Lumenode operates strictly on local-first principles. There are **zero user accounts**, and student data is stored entirely in browser `localStorage`.
- **Cross-Device Sync:** Progress does not automatically synchronize between your phone and laptop in the cloud. To move progress between devices, learners must export a JSON backup via Settings and import it on the other device.

### 3.2 Private Browsing / Incognito Windows
- In Incognito / Private Browsing mode, modern browsers purge `localStorage` when the window is closed. Learners using private browsing must export their backup before closing if they wish to keep their progress.

---

## 4. Educational Content & Media

### 4.1 Modality Focus
- Lumenode focuses on concept-first interactive text, live runnable code, and deterministic 2D visual simulations. The platform does not currently host long-form video lectures, prioritize video streaming, or require high-bandwidth media downloads.

### 4.2 Language Curriculum Depth
- Initial beta curriculum deeply covers **C**, **C++**, **Python**, **Data Structures & Algorithms**, and **Relational Database Systems**. Additional planned tracks (Rust, Java, Computer Architecture) will roll out during subsequent curriculum expansion phases.
