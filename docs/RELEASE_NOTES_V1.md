# Lumenode v1.0.0 Release Notes

**Release Date:** November 2026  
**License:** Open-Source Software (Apache-2.0) & Open Educational Content (CC BY-SA 4.0)  
**Tag:** `v1.0.0` (Promoted from `v1.0.0-RC1`)  

---

## 1. Executive Announcement

We are proud to announce the official **v1.0.0 general release of Lumenode** — an open-source, completely free computer science learning platform engineered to bridge theoretical computer science concepts with authentic execution state, interactive 2D simulations, and measurable learning outcomes.

Traditional programming education frequently presents abstract syntax detached from systems architecture, memory layouts, and database storage engines. Lumenode bridges this gap with client-side WebAssembly runtimes, deterministic interactive laboratories, and a local-first privacy posture.

---

## 2. Core Capabilities in v1.0.0

### 2.1 Canonical Knowledge Engine & Curriculum
- **7 Core Academic Subjects:** C, C++, Python, Data Structures & Algorithms, Database Management Systems, Computer Systems & Memory, and Interactive Laboratories.
- **38 Canonical Concepts & 37 Comprehensive Lessons:** Built upon an interconnected directed acyclic knowledge graph with prerequisite validation.
- **Data-Driven Integrity:** 100% of curriculum entities are validated at compile time with Zod runtime schemas.

### 2.2 In-Browser Zero-Backend Execution Sandboxes
- **Python 3.12 via Pyodide WASM:** Authentic CPython runtime running inside a dedicated HTML5 Web Worker. Code executes with zero backend server dependencies and automatic timeout termination on infinite loops.
- **Relational SQL via SQLite WASM:** Real in-memory SQL database running inside a dedicated worker. Complete DDL/DML support with instant schema resets.

### 2.3 Interactive Visual Laboratory Engines
- **Binary Search Tree (BST) Lab:** Deterministic insertion, deletion, and level-order traversal with time-travel step controls.
- **AVL Tree Self-Balancing Lab:** Real-time balance factor visualization ($BF = H_L - H_R$) and automated single/double rotation animations (LL, RR, LR, RL).
- **B+ Tree Storage Engine Lab:** Multi-tier index tree with horizontal linked-leaf scans, mirroring production database storage engines.
- **Call-Stack & Memory Simulator:** Physical stack pointer manipulation, stack frame allocations, and activation record inspections.

### 2.4 Empirical Learning Effectiveness Framework
- **6-Stage Active Learning Cycle:** Pre-assessment &rarr; Guided lesson &rarr; Interactive simulation &rarr; Practice &rarr; Post-assessment &rarr; 14-day retention check.
- **Quantitative Measurement:** Hake's normalized learning gain ($g$) objectively measuring conceptual mastery.

### 2.5 Local-First Privacy & Zero Third-Party Tracking
- **Zero Required Accounts:** Students can study without signing in, creating passwords, or providing emails.
- **Client Storage:** 100% of progress, quiz scores, and spaced retrieval intervals are stored in the browser's `localStorage`.
- **Complete Portability:** Instant JSON backup export and import for seamless cross-device migration.

---

## 3. Supported Compiler Standards & Sandbox Tiering

- **C:** ISO/IEC 9899:2011 (C11) via GCC.
- **C++:** ISO/IEC 14882:2017 (C++17) via G++.
- **Python:** Python 3.12.7 (CPython via Pyodide WASM).
- **SQL:** SQLite 3.46 (via WebAssembly).

> **Public Security Disclosure:**  
> To protect cloud infrastructure against arbitrary code execution exploits, shared remote C/C++ execution is disabled on the public web tier. Learners can execute C/C++ code locally using our isolated `@lumenode/compiler-gateway` microservice (`pnpm compiler-gateway:start`).

---

## 4. Software Bill of Materials (SBOM) & Dependency Licensing

A comprehensive automated audit verified **307 direct and transitive dependencies**:
- **Permissive Open-Source Licenses:** MIT (235 packages), Apache-2.0 (20 packages), ISC (14 packages), BSD-2-Clause (8 packages), BSD-3-Clause (3 packages), Python-2.0 (1 package), 0BSD (1 package).
- **Copyleft Assurance:** 0 GPL/AGPL copyleft dependencies present in production bundles.

---

## 5. Getting Started & Local Installation

### Prerequisites
- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$
- GCC / G++ (Optional, for native C/C++ compilation)

### Clone & Run
```bash
# Clone the repository
git clone https://github.com/lumenode/lumenode.git
cd lumenode

# Install workspace dependencies
pnpm install --frozen-lockfile

# Start development server
pnpm dev

# Build production bundle
pnpm build

# Run unit and E2E test suites
pnpm test
pnpm test:e2e
```
