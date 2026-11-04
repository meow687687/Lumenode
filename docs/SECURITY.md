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

## 3. Remote Compiler Sandbox Architecture (C & C++ Execution)

Native compiled languages (C and C++) require genuine operating system signals (`SIGSEGV`, `SIGBUS`, `SIGFPE`), pointer dereferencing, and accurate memory layouts that cannot be authentically represented in abstract 32-bit linear WebAssembly without misleading students.

Their execution is routed to an isolated remote container gateway conforming to the Lumenode Compiler Gateway Protocol (ADR 0004).

### 3.1 Defense-in-Depth Sandboxing Layers

1. **Linux Namespaces (Multi-Vector Process Isolation):**
   - `PID Namespace`: Execution process has PID 1 inside the sandbox and cannot discover or signal any external processes.
   - `Mount Namespace`: Sandbox mounts a minimalist root filesystem (`/bin`, `/lib`, `/usr/lib`) with `MS_RDONLY | MS_NODEV | MS_NOSUID`.
   - `Network Namespace`: Process is assigned an unshared, unconfigured network namespace (`--net=none`) with only a dummy loopback interface, completely preventing socket binds, remote reverse shells, or LAN port scans.
   - `IPC Namespace`: Isolated shared memory and semaphore segment prevents inter-process messaging with host services.
   - `UTS Namespace`: Hostname and domain name are anonymized.
   - `User Namespace`: User mapped to unprivileged `nobody:nogroup` (UID 65534). Root escalation within the container yields zero capabilities outside.

2. **Control Groups v2 (Strict Hardware Resource Ceilings):**
   - **CPU Quota (`cpu.max`)**: Maximum 2.0 seconds CPU execution time. Maximum 5.0 seconds wall-clock time.
   - **Memory Ceiling (`memory.max`, `memory.high`)**: Hard ceiling of **64 MB** virtual address space. Any execution exceeding this allocation triggers immediate kernel `OOM-killer` termination and is truthfully reported as `memory_limit_exceeded`.
   - **Process / Task Limit (`pids.max`)**: Hard ceiling of **16 PIDs** to neutralize fork-bomb exploits (`int main() { while(1) fork(); }`).
   - **File Descriptor Limit (`RLIMIT_NOFILE`)**: Max 32 concurrent open file handles.

3. **Seccomp System Call Filtering (`SECCOMP_RET_KILL`):**
   - Execution binaries run with a strict seccomp-bpf whitelist.
   - Allowed syscalls: Minimal subset required for POSIX runtime execution (`read`, `write`, `fstat`, `mmap`, `mprotect`, `munmap`, `brk`, `exit_group`, `nanosleep`, `clock_gettime`).
   - Explicitly Blocked / Killed Syscalls:
     - All socket and network calls (`socket`, `connect`, `bind`, `listen`, `accept`, `sendto`, `recvfrom`).
     - System administration calls (`reboot`, `mount`, `umount2`, `chroot`, `syslog`, `pivot_root`).
     - Kernel probing & BPF (`bpf`, `ptrace`, `perf_event_open`, `process_vm_readv`, `process_vm_writev`).
     - File system modifications outside volatile RAM (`unlink`, `rename`, `chmod`, `chown`).

4. **Ephemeral Ephemeral Storage & RAM Disk:**
   - Source compilation and binary output occur on an ephemeral `tmpfs` RAM disk with a strict 10 MB cap.
   - The directory is created with a unique UUID per run and recursively wiped upon process completion or timeout.

5. **Client Transparency & Honest Fallback:**
   - The frontend `CompilerGatewayClient` verifies gateway availability via health checks.
   - If the gateway is unconfigured or unreachable, the user interface explicitly indicates this status and provides guidance on running a local Docker gateway container. It **never** fakes execution metrics or fabricates synthetic outputs.

---

## 4. Content Sanitization & XSS Prevention

- Educational content is data-driven and validated using **Zod runtime schemas** (`@lumenode/shared-types`).
- All code blocks, comparisons, callouts, and Markdown strings are sanitized before DOM rendering.
- No raw `dangerouslySetInnerHTML` is used without strict sanitization.

---

## 5. Local-First Privacy & Zero Third-Party Tracking

Lumenode operates on a strict **local-first privacy architecture**:
- **Zero Required User Accounts:** Learners can access the full curriculum, interactive visualizers, code playgrounds, and assessments without creating an account or providing personal identity data.
- **Client-Side Progress Storage:** Learning history, quiz evaluations, spaced-repetition timestamps, and visualizer preferences are saved exclusively in browser `localStorage`.
- **Zero Third-Party Trackers:** No Google Analytics, Meta Pixels, commercial telemetry beacons, or advertising cookies are embedded.
- **Portability:** Learners can export a full JSON snapshot of their progress at any time and import it into another browser or device without data loss.

---

## 6. Vulnerability Disclosure & Bug Reporting

We take platform security, sandbox isolation, and student safety seriously.

### 6.1 Reporting Channels
If you discover a security vulnerability in Lumenode (such as a WebAssembly worker sandbox escape, remote compiler gateway bypass, or stored XSS vulnerability):
- **Email:** `security@lumenode.org`
- **GitHub Security Advisory:** File a confidential report via GitHub Security Advisories at `https://github.com/lumenode/lumenode/security/advisories/new`.

Please do not open public GitHub issues for undisclosed security vulnerabilities.

### 6.2 Response SLA
- **Initial Response & Acknowledgment:** Within 48 hours of report submission.
- **Triage & Severity Assessment:** Within 5 business days.
- **Remediation & Patch Release:** P0/P1 sandbox breaches prioritized for hotfix within 7 days.

