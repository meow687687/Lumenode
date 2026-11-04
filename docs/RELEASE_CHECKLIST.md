# Lumenode Production Release Checklist

**Target Version:** 0.5.0-beta  
**Scope:** Production Deployment Gate & Verification Protocol  
**Date:** November 2026

---

## 1. Pre-Release Verification Gates

Before deploying any release candidate to public hosting:

- [ ] **Type Safety:** `pnpm typecheck` executes with **0 errors** across monorepo packages.
- [ ] **Unit & Component Tests:** `pnpm test` executes with **100% pass rate** (97+ tests green).
- [ ] **Real Browser E2E Tests:** `pnpm test:e2e` executes with **100% pass rate** (all 9 real-browser Chromium journeys passing).
- [ ] **Code Quality & Linting:** `pnpm lint` reports **0 errors**.
- [ ] **Curriculum Schema Validation:** `pnpm content:validate` verifies all subjects, modules, topics, concepts, and lessons.
- [ ] **Code Snippet Verification:** `pnpm content:check-code` validates all 73 executable curriculum examples against GCC, G++, Python, and SQLite.
- [ ] **Production Build:** `pnpm build` completes without Rollup chunk size warnings, and output is generated in `apps/web/dist/`.

---

## 2. Static Asset & Security Header Checks

Verify that `apps/web/public/` contains:
- [ ] `sql-wasm.wasm` and `sql-wasm-browser.wasm` present with valid binary signatures.
- [ ] `_redirects` file configured for single page application routing (`/* /index.html 200`).
- [ ] `_headers` file configured with:
  - `Content-Type: application/wasm` on `/*.wasm`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] No private environment keys or development tokens are baked into client bundles.

---

## 3. Deployment Steps (Cloudflare Pages / Vercel)

### 3.1 Cloudflare Pages
```bash
# Direct CLI deploy or GitHub Actions CI
pnpm build
# Output directory: apps/web/dist
```
- Set Root directory: `apps/web`
- Build command: `pnpm run build`
- Output directory: `dist`
- Node version: `20`

### 3.2 Vercel
- Root directory: `apps/web`
- Framework Preset: `Vite`
- Build command: `pnpm run build`
- Output directory: `dist`

---

## 4. Post-Deployment Smoke Test (Live URL)

Within 5 minutes of DNS propagation / edge deployment:
- [ ] **Root Landing Page:** Visit `https://lumenode.org/`, verify onboarding tour renders.
- [ ] **Direct Deep Link:** Visit `https://lumenode.org/lessons/c-compilation-pipeline`, verify no 404 error.
- [ ] **In-Browser SQLite WASM:** Visit `https://lumenode.org/labs/sql`, click "Run SQL", verify table rows populate.
- [ ] **In-Browser Python WASM:** Visit `https://lumenode.org/labs/code`, run sample Python script, verify stdout terminal displays output.
- [ ] **Interactive Visualizer:** Visit `https://lumenode.org/labs/bst`, step through an insertion simulation, verify SVG nodes highlight.
- [ ] **Global Search:** Press `Cmd+K` or `/`, search for "pointers", verify results appear and navigate properly.
- [ ] **Feedback Modal:** Click feedback icon in header, submit a test comment, verify local confirmation.
- [ ] **Data Export/Import:** Export JSON backup, clear browser cache, import backup, confirm restored state.

---

## 5. Rollback Procedure

If a critical issue occurs (e.g., WASM load panic, broken routing):
1. **Immediate CDN Revert:** In Cloudflare Pages or Vercel dashboard, click "Rollback to deployment" on the previous passing build ID. Revert completes in $< 30\text{ seconds}$ worldwide.
2. **Post-Mortem Analysis:** Reproduce the regression locally using `pnpm preview` and Playwright tests.
3. **Data Safety Assurance:** Because all student progress resides in local browser `localStorage`, static asset rollbacks will not corrupt or alter student learning history.
