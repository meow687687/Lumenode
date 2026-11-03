# Lumenode Security Policy & Sandbox Architecture

## 1. Security Philosophy

Lumenode follows a zero-compromise security posture regarding code execution, educational accuracy, and browser isolation.

**Fundamental Invariant:**
Arbitrary learner code is **never** executed inside the application server process or the main browser UI thread.

---

## 2. In-Browser Execution Sandboxes (Client-Side)

### 2.1 Python Execution (Pyodide WebAssembly)
- **Runtime**: Pyodide (CPython 3.12 compiled to WebAssembly via Emscripten).
- **Isolation Boundary**: Runs inside a dedicated HTML5 Web Worker (`src/workers/python.worker.ts`).
- **DOM / Storage Access**: Dedicated Workers have no direct access to `window`, `document`, or `localStorage`.
- **Network Boundaries**: In-browser Python runs in an isolated scope. Unrestricted socket or raw TCP access is prevented by browser WebAssembly security boundaries.
- **Resource Limits & Timeouts**: 
  - Standard execution timeout: **6,000ms**.
  - If Python enters an infinite loop (e.g. `while True: pass`), the host service forcefully calls `worker.terminate()` and instantiates a clean replacement worker, ensuring the user interface remains completely responsive.
- **Standard IO Capture**: `sys.stdout` and `sys.stderr` are captured into internal `io.StringIO` buffers per execution and flushed upon completion.

### 2.2 SQL Execution (SQLite WebAssembly via sql.js)
- **Runtime**: Official SQLite 3 compiled to WebAssembly.
- **Isolation Boundary**: Runs in a dedicated Web Worker (`src/workers/sqlite.worker.ts`).
- **Storage**: In-memory database (`:memory:`). User mutations (INSERT, UPDATE, DROP) alter transient worker RAM only and do not persist to physical disk or client storage unless explicitly exported.
- **Data Reset**: Instant reset command (`RESET`) destroys the current database instance and re-seeds canonical academic tables (`students`, `courses`, `enrollments`).
- **Timeout Protection**: Queries exceeding **5,000ms** trigger worker termination and database re-initialization.

---

## 3. Remote Compiler Sandbox Requirements (Planned Phase 2B for C & C++)

Native compiled languages (C and C++) cannot execute safely via client-side interpreted WebAssembly without significant runtime emulation overhead. Their execution is routed to an isolated remote container gateway:

1. **Host Isolation**: Hardened container sandboxing (e.g., Linux `cgroups v2`, `namespaces`, and `isolate` / Judge0).
2. **Network Isolation**: Strict `--net=none` configuration to prevent egress calls, reverse shells, or network scans.
3. **Resource Ceilings**:
   - Memory limit: 64 MB maximum address space.
   - CPU execution limit: 3.0 seconds maximum.
   - Max file descriptors: 32.
   - Process limit: 16 maximum threads/subprocesses.
   - Output buffer cap: 64 KB stdout/stderr truncation.
4. **Filesystem**: Read-only root with temporary, volatile ramdisk for source compilation and binary execution.

---

## 4. Content Sanitization & XSS Prevention

- Educational content is data-driven and validated using **Zod runtime schemas** (`@lumenode/shared-types`).
- All code blocks, comparisons, callouts, and Markdown strings are sanitized before DOM rendering.
- No raw `dangerouslySetInnerHTML` is used without strict sanitization.

---

## 5. Vulnerability Disclosure

To report a technical or security vulnerability, please email `security@lumenode.dev` or file a private security report on GitHub.
