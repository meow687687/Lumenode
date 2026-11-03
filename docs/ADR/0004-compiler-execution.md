# ADR 0004: Remote Compiler Gateway Architecture for Native Systems Languages

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Lumenode Architecture Team
- **Consulted:** System Engineers, Computer Science Educators
- **Informed:** Core Contributors

---

## Context and Problem Statement

Lumenode provides foundational education in computer science, computer systems, and programming languages. While high-level interpreted languages (such as Python) and embedded relational engines (SQLite) can execute safely and deterministically inside modern browsers using WebAssembly Web Workers, native compiled systems languages (specifically C11 and C++17) pose unique technical requirements:

1. Real hardware memory addressing and native pointer behaviors (segmentation faults on unmapped dereference, pointer arithmetic, byte alignment, stack frames).
2. Compilation speed and compiler toolchain availability without imposing 50MB+ WebAssembly binary download penalties on learners.
3. Strict execution security preventing malicious code from compromising host infrastructure.

How should Lumenode architect C and C++ execution to maximize security, educational fidelity, and operational sustainability?

---

## Decision Drivers

- **Educational Fidelity:** Learners must observe genuine native compiler warnings, compilation errors, stack memory behaviors, and OS signals (e.g. `SIGSEGV` on null dereference) rather than simulated or synthetic outputs.
- **Security & Sandboxing:** Arbitrary learner-submitted code must run in an ephemeral, strictly isolated sandbox with zero access to host networks, host filesystems, or persistent state.
- **Client Performance:** Web application initial load time must remain under 1 second. No massive 50MB+ LLVM WebAssembly packages should block client startup.
- **Operational Feasibility:** The architecture must be open-source, self-hostable by universities and open-source contributors, and support zero-cost development environments.
- **Integrity & Truthfulness:** When a compiler gateway is not configured or offline, the UI must explicitly report its status rather than mocking or faking execution output.

---

## Considered Options

1. **Option 1: Browser-based Clang/LLVM WebAssembly (`clang.wasm`)**
2. **Option 2: Self-hosted Judge0 CE / Open REST Compiler Gateway**
3. **Option 3: Custom MicroVM / Container Runner (`lumenode-runner` with `nsjail`)**
4. **Option 4: Local Client-Side Toolchain Integration (CLI / Native Messaging)**

---

## Decision Outcome

**Chosen Option:** **Option 2 (Judge0-Compatible Open REST Compiler Gateway)** combined with **Tier 1 Client-Side WASM for Python & SQL**.

### Architecture & Specification

1. **Execution Protocol:** Lumenode standardizes on an open, Judge0-compatible REST submission protocol (`POST /submissions?wait=true`).
2. **Client Gateway Adapter:** A resilient TypeScript client adapter (`CompilerGatewayClient`) is integrated into `@lumenode/web`. It:
   - Configures target gateway URL via `import.meta.env.VITE_COMPILER_GATEWAY_URL`.
   - Sends source code with strict compiler flags (`-Wall -Wextra -O2 -std=c11`, `-std=c++17`).
   - Parses compiler diagnostic outputs separately from program `stdout` / `stderr`.
   - Captures wall-clock time, CPU execution time, memory usage, and exit codes.
   - Categorizes failures into deterministic states: `compilation_error`, `runtime_error` (`SIGSEGV`, `SIGFPE`), `time_limit_exceeded`, `memory_limit_exceeded`, `gateway_offline`, and `gateway_not_configured`.
3. **Graceful Fallback & Educational Guidance:**
   - If `VITE_COMPILER_GATEWAY_URL` is omitted, the playground displays an informative status banner explaining that remote compiler integration is pending deployment, provides local Docker setup instructions, and links to interactive visual simulation labs (Call-Stack & Memory Simulator).
   - The platform **never** manufactures synthetic or random execution results.

---

## Sandbox Security Constraints

Remote compilation workers enforce the following OS-level constraints via Linux namespaces, `cgroups v2`, and `seccomp`:

- **Execution Timeout:** Max 2.0 seconds CPU time, 5.0 seconds wall-clock time.
- **Memory Ceiling:** Max 64 MB virtual address space.
- **Process Limits:** Max 16 PIDs (prevents fork-bomb vulnerabilities).
- **Network Isolation:** `--net=none` (unshared network namespace, zero egress/ingress).
- **Filesystem Isolation:** Read-only system root, transient 10MB tmpfs RAM disk for binary execution, cleaned up immediately after termination.
- **User Permissions:** Execution runs as an unprivileged user (`nobody` / UID 65534).

---

## Consequences

### Positive
- **Complete Educational Accuracy:** Learners receive true GCC/Clang diagnostics, accurate line numbers, and authentic runtime signal crashes.
- **Zero Client Bloat:** The browser client remains lightweight (~200 KB gzipped total application bundle).
- **Interchangeable Gateways:** Institutions can connect their existing Judge0 cluster or run a lightweight local Docker container.
- **Multi-language Expansion:** The gateway protocol easily scales to Rust, Java, and Go without altering frontend UI contracts.

### Negative / Trade-offs
- C and C++ execution requires network connectivity and a running gateway service (unlike Python and SQL which run completely offline).
- Hosting the gateway incurs minor server infrastructure costs for public deployments.

---

## Links and References
- Technical Research: `docs/COMPILER_GATEWAY_RESEARCH.md`
- Security Specification: `docs/SECURITY.md`
- Client Adapter: `apps/web/src/services/compilerGateway.ts`
