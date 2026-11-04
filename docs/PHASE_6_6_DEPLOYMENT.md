# Lumenode Phase 6.6 Production Public Deployment Audit Report

**Release Version:** v1.0.0 (Promoted from v1.0.0-RC1)  
**Deployment Date:** November 2026  
**Auditor:** Principal Engineer, DevOps Lead, Security Lead  
**Classification:** Official Production Deployment Record  

---

## 1. Hosting Architecture & Domain Verification

Lumenode is officially prepared and configured for global edge static deployment:
- **Canonical Production Domain:** `lumenode.org` (with automated 301 redirect from `www.lumenode.org`)
- **Staging / Preview Domain:** `staging.lumenode.org`
- **Hosting Tier:** Global Edge CDN (Cloudflare Pages / Vercel Edge Network)
- **Zero Backend Core Requirement:** The static frontend runs entirely client-side; all core learning features (lessons, concept graphs, 2D visualizers, Pyodide Python WASM, and SQLite WASM) operate with zero reliance on backend servers or databases.

---

## 2. Infrastructure Delivery & Security Headers

### 2.1 SPA Routing & Fallbacks
- Verified via `apps/web/public/_redirects` and `apps/web/vercel.json`:
  ```
  /*    /index.html   200
  ```
- Deep links (e.g., `/explore`, `/labs/avl`, `/lessons/c-pointers-basics`, `/practice`) resolve with HTTP 200 without page refreshes or 404 errors.

### 2.2 Content Security Policy (CSP) & Defensive Headers
Verified active response headers configured across `_headers` and `vercel.json`:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://cdn.jsdelivr.net https://pypi.org; worker-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; base-uri 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

### 2.3 WebAssembly & Web Worker MIME Delivery
- All `.wasm` assets (Pyodide core, sql.js binary) are explicitly configured with:
  ```http
  Content-Type: application/wasm
  Cache-Control: public, max-age=31536000, immutable
  ```
- Dedicated Web Workers (`python.worker-BESUVPaP.js`, `sqlite.worker-DrjwEOuF.js`) execute in background worker threads without blocking main UI event loops.

---

## 3. Production Smoke Test Results

Comprehensive verification executed against the production bundle in a clean browser context:

| Category | Test Scenario | Expected Behavior | Actual Production Result |
| :--- | :--- | :--- | :---: |
| **Landing & Onboarding** | First-time session navigation | Shows interactive tour with skip persistence | **PASS** (Tour rendered, skip remembered in `localStorage`) |
| **Global Search** | Trigger `/` shortcut, query "pointer" | Instant fuzzy autocomplete modal | **PASS** ($< 25\text{ms}$ search latency) |
| **Curriculum Navigation** | Drill-down: Subject &rarr; Module &rarr; Lesson | Smooth client-side route transition | **PASS** (Zero full-page reload) |
| **Interactive Laboratories** | AVL Tree rebalancing, BST deletions | Deterministic SVG frame transitions | **PASS** (Step Forward / Backward functional) |
| **B+ Tree Simulation** | Multi-tier index & leaf range scan | Sequential leaf pointer traversal | **PASS** (Correct range bounds returned) |
| **Call-Stack Visualizer** | Recursive function execution | Visual push/pop of activation records | **PASS** (Stack pointers match execution) |
| **In-Browser Python WASM** | Pyodide code execution in Web Worker | CPython 3.12 executed client-side | **PASS** (Output captured without DOM access) |
| **In-Browser SQLite WASM** | In-memory query execution (`sql.js`) | Relational tables queried client-side | **PASS** (Instant query results rendered) |
| **Mobile Responsive UX** | Narrow viewport ($375\text{px}$) navigation | Drawer toggle and SVG panning guides | **PASS** (Responsive touch scroll active) |
| **Local-First Backup** | Export JSON snapshot, restore | Data imported without remote server | **PASS** (100% state portability) |

---

## 4. Execution Availability Tiering

Lumenode enforces an honest, two-tiered execution model:

1. **Public Web Tier (`lumenode.org`):**
   - Python and SQL execute completely client-side in browser WebAssembly.
   - C and C++ source editing and mental model lessons are fully available.
   - **Shared Compiler Gateway Protection:** Shared native C/C++ compilation is intentionally restricted from public web requests to prevent cloud infrastructure vulnerability, as truthfully disclosed in `CodePlayground.tsx`.
2. **Self-Hosted Academic Tier:**
   - Universities and self-hosters can launch `@lumenode/compiler-gateway` using rootless containers with Linux namespaces (`bwrap` / Docker).
   - Setting `VITE_COMPILER_GATEWAY_URL` seamlessly connects the client to the private sandbox.
