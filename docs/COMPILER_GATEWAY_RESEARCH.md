# Lumenode C/C++ Compiler Gateway Technical Research

**Author:** Lumenode Architecture Team  
**Date:** November 2026  
**Status:** Approved Architectural Research  
**Document Reference:** `docs/COMPILER_GATEWAY_RESEARCH.md`  

---

## 1. Executive Summary & Problem Context

Lumenode aims to provide deep, hands-on systems education in C and C++, including memory address arithmetic, pointer dereferencing, struct memory layout, call stack frames, and manual dynamic allocation (`malloc`/`free`). 

While interpreted languages (Python via Pyodide) and relational engines (SQLite via `sql.js`) run efficiently and safely in-browser via WebAssembly, native compiled systems languages (C11, C++17/20) present fundamental architectural challenges:

1. **Compilation overhead**: A full Clang/GCC compiler binary is 50MB–150MB, creating unacceptable initial payload penalties for browser loading.
2. **Missing architectural characteristics in WASM**: Standard WebAssembly (`wasm32-unknown-emscripten`) runs on an abstract 32-bit linear memory model. Pointers are indexes into an array, stack frames are isolated in an unaddressable shadow stack, and invalid dereferences result in untyped JS trap exceptions rather than genuine architectural signals (e.g. `SIGSEGV`, `SIGBUS`).
3. **Execution safety**: Running arbitrary native binary code on server infrastructure requires strict, defense-in-depth isolation against remote code execution, container escapes, fork bombs, network exfiltration, and resource starvation.

This research paper evaluates the three primary technical alternatives for providing genuine C and C++ execution for Lumenode, benchmarks their capabilities, and outlines the production gateway architecture.

---

## 2. Technical Evaluation of Architectural Options

### Option A: Self-Hosted Judge0 Community Edition (CE)

[Judge0 CE](https://github.com/judge0/judge0) is an open-source, robust, API-driven code execution engine used across competitive programming platforms and online coding laboratories. It leverages GNU `isolate` on modern Linux kernels.

#### Architecture:
- Client &rarr; REST API (Ruby on Rails / Go backend) &rarr; Redis Job Queue &rarr; Asynchronous isolate worker daemon &rarr; Execution sandbox.
- Supports synchronous execution (`?wait=true`) and asynchronous polling.
- Sandboxing implemented via GNU `isolate` (Linux namespaces, `cgroups v1/v2`, `chroot`, Linux capabilities).

#### Key Strengths:
- **Battle-Tested Isolation**: Used by universities and coding platforms handling millions of arbitrary code submissions.
- **Language Support**: Out-of-the-box GCC 11/12, Clang 13+, with standard libraries, libc, and debug tools.
- **Rich Metric Reporting**: Accurate wall time, user CPU time, memory peak (via cgroups), exit codes, signal descriptions (e.g. `SIGSEGV`, `SIGFPE`).
- **Standardized REST API**: Straightforward JSON schema for source submission, compiler options, `stdin`, expected `stdout`, and CPU/memory quotas.

#### Limitations & Costs:
- Multi-container deployment footprint (Rails API, PostgreSQL, Redis, Worker) requires at least 2GB RAM and 1–2 vCPUs minimum for stable self-hosting.
- Adds queuing latency (typically 200ms–800ms per run under moderate load).

---

### Option B: Custom Dedicated Microservice (`lumenode-runner` with nsjail / Podman)

A bespoke execution gateway written in Go or Rust that exposes a lightweight REST/WebSocket endpoint and spawns transient execution environments using Google's [`nsjail`](https://github.com/google/nsjail) or OCI containers.

#### Architecture:
```
[Web Client] 
     │ (HTTPS / WebSocket)
     ▼
[Lumenode Compiler Gateway (Go)]
     │ (Spawns worker thread)
     ▼
[nsjail Sandbox Engine]
     ├── Linux Namespaces (PID, Mount, Net, IPC, UTS, User)
     ├── cgroups v2 (CPU: 2000ms, RAM: 64MB, Max PIDs: 16)
     ├── Seccomp Filter (Default DENY all syscalls except vetted whitelist)
     └── Read-only bind mounts (/lib, /usr/lib, /bin/gcc) + tmpfs RAM disk
```

#### Key Strengths:
- **Ultralight Footprint**: Single binary daemon without PostgreSQL or Redis dependencies. Can operate on a 512MB RAM instance.
- **Minimal Latency**: Sub-50ms daemon overhead; total round-trip dominated purely by GCC compilation time (~150ms–350ms).
- **Hardened Seccomp Filter**: Custom-tailored system call whitelist designed exclusively for educational C programs.

#### Limitations & Costs:
- Requires custom maintenance of C/C++ toolchain images, caching logic, and seccomp filters.
- Requires Linux host with root/privileged capabilities to configure namespaces and cgroups.

---

### Option C: In-Browser WebAssembly Clang (Browser-Native Compilation)

Running a WebAssembly-compiled build of LLVM/Clang (e.g., `clang.wasm`, `lld.wasm`) and executing the emitted WebAssembly module in the browser's native WASM engine.

#### Architecture:
- Clang WASM parses C/C++ source in a browser Web Worker and outputs `.wasm`.
- Web Worker instantiates the emitted WASM module with a virtual POSIX environment (WASI or custom Emscripten syscall bindings).

#### Key Strengths:
- **Zero Server Costs**: Completely serverless and 100% offline-compatible.
- **Zero Server Security Risk**: Arbitrary user code runs within the browser's WebAssembly sandbox.

#### Limitations & Critical Disqualifiers:
- **Huge Initial Asset Download**: Clang + LLVM + LLD WASM package is **45MB–85MB compressed**, which violates Lumenode's performance standards for fast loading.
- **Pedagogical Inaccuracy**: WebAssembly memory is a uniform byte vector index starting at 0. There is no true hardware MMU virtual address space, no kernel stack vs heap separation, and NULL pointer dereferences trigger JS traps instead of realistic OS signal interrupts.
- **Compilation Latency**: Browser WASM Clang takes 2.5s–6.0s to compile a simple 30-line C program on standard hardware.

---

## 3. Comparative Evaluation Matrix

| Metric / Dimension | Option A: Judge0 CE | Option B: Custom `nsjail` Runner | Option C: Browser `clang.wasm` |
| :--- | :--- | :--- | :--- |
| **Security & Sandbox Isolation** | **High** (GNU `isolate`, namespaces, cgroups) | **High** (`nsjail`, seccomp-bpf, cgroups v2) | **Very High** (Browser WASM sandbox) |
| **Operational & Infrastructure Cost** | Moderate ($15–$30/mo VPS) | Low ($5–$10/mo VPS) | **Zero** ($0 serverless) |
| **Execution Latency** | 300ms–900ms | **150ms–400ms** | 2,500ms–6,000ms |
| **Asset Download Size** | **0 KB** (Server-side) | **0 KB** (Server-side) | 45 MB – 85 MB |
| **Pedagogical Fidelity** | **100% Native x86_64 / arm64** | **100% Native x86_64 / arm64** | ~40% (Abstract WASM memory) |
| **Signal & Crash Reporting** | Accurate (`SIGSEGV`, `SIGFPE`) | Accurate (`SIGSEGV`, `SIGFPE`) | Inaccurate (Generic JS WebAssembly trap) |
| **Multi-File & Header Support** | Full stdlib, glibc, libc++ | Full stdlib, glibc, libc++ | Restricted standard headers |
| **Deployment Complexity** | Medium (Docker compose) | Low (Single static Go binary) | High (WASM worker orchestration) |

---

## 4. Architectural Decision & Hybrid Strategy

Based on this evaluation, Lumenode adopts a **Dual-Tier Hybrid Architecture**:

1. **Client-Side Tier (Default for Scripting & Data)**:
   - Python: Pyodide WebAssembly worker (zero latency, zero server cost).
   - SQL: SQLite WebAssembly worker via `sql.js` (zero latency, transient in-memory database).

2. **Server-Side Compiler Gateway Tier (For Native Systems Languages)**:
   - Lumenode establishes a standard, open **Compiler Gateway Protocol** compatible with the Judge0 REST specification.
   - The web client provides a resilient, standardized client adapter (`CompilerGatewayClient`) that communicates with any Judge0-compatible endpoint.
   - Developers and educational institutions can point `VITE_COMPILER_GATEWAY_URL` to:
     - A managed Judge0 cluster or self-hosted Docker deployment.
     - A lightweight `nsjail`-backed execution service.
   - **Strict Truthfulness Policy**: When `VITE_COMPILER_GATEWAY_URL` is omitted or the remote server is unreachable, the client **never** fakes results or fakes timing measurements. It reports explicit gateway configuration instructions and directs learners to interactive simulations or local toolchain execution.

---

## 5. Gateway Protocol Specification

### 5.1 Request Payload (`POST /submissions?wait=true`)
```json
{
  "source_code": "#include <stdio.h>\nint main(void) { printf(\"Hello Lumenode\\n\"); return 0; }",
  "language_id": 50,
  "stdin": "",
  "compiler_options": "-Wall -Wextra -O2 -std=c11",
  "cpu_time_limit": 2.0,
  "wall_time_limit": 5.0,
  "memory_limit": 65536
}
```
*Note: `language_id: 50` designates C (GCC 11.2+), and `54` designates C++ (GCC 11.2+ / C++17).*

### 5.2 Response Payload
```json
{
  "token": "79b38f83-e028-406b-b467-36e61f228b7e",
  "status": {
    "id": 3,
    "description": "Accepted"
  },
  "stdout": "Hello Lumenode\n",
  "stderr": null,
  "compile_output": null,
  "time": "0.004",
  "memory": 1928,
  "exit_code": 0
}
```

### 5.3 Error Status Identifiers
- Status ID `3`: `Accepted` (Program terminated normally with exit code 0).
- Status ID `6`: `Compilation Error` (Inspect `compile_output` for gcc warnings/errors).
- Status ID `5`: `Time Limit Exceeded` (Infinite loops or timeout).
- Status ID `11`: `Runtime Error (NZEC)` (Non-zero exit code or fatal uncaught signal).
- Status ID `12`: `Runtime Error (SIGSEGV)` (Segmentation violation / invalid pointer access).
- Status ID `13`: `Runtime Error (SIGXCPU)` (CPU limit exceeded).
- Status ID `14`: `Runtime Error (SIGFPE)` (Floating point exception / division by zero).

---

## 6. Implementation Roadmap

- **Phase 3C**: Complete formal ADR (`0004-compiler-execution.md`), sandbox limits in `docs/SECURITY.md`, and frontend `CompilerGatewayClient` adapter with error classification and unit tests.
- **Phase 4**: Publish turnkey `docker-compose.compiler.yml` for 1-command local or cloud deployment of the execution gateway.
