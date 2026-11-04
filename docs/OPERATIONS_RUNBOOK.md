# Lumenode Operations Runbook & SRE Guidelines

**Scope:** Production Deployment, Incident Response, Disaster Recovery, and Operational Monitoring  
**Target Release:** v1.0.0  
**Date:** November 2026  

---

## 1. Routine Deployment Procedures

### 1.1 Automated Production Deployment (CI/CD)
Production deployments are triggered by tagging a release commit on `main`:
```bash
# Tag release
git tag -a v1.0.0 -m "Release Lumenode v1.0.0"
git push origin v1.0.0
```
The GitHub Actions workflow (`.github/workflows/ci.yml`) executes:
1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm content:validate`
5. `pnpm content:check-code`
6. `pnpm test`
7. `pnpm test:e2e`
8. `pnpm build`
9. Uploads `apps/web/dist` to Cloudflare Pages / Vercel Edge.

### 1.2 Manual Fallback Deployment (CLI)
```bash
# 1. Clean build
pnpm build

# 2. Deploy via Wrangler (Cloudflare Pages)
npx wrangler pages deploy apps/web/dist --project-name=lumenode

# Or Deploy via Vercel CLI
npx vercel deploy apps/web/dist --prod
```

---

## 2. Emergency Incident Response & Rollback Runbooks

### 2.1 P0 Critical Rollback (Client Regression)
If a faulty bundle causes browser exceptions or breaks navigation:
1. Navigate to the Cloudflare Pages or Vercel dashboard.
2. Under "Deployments", locate the previous stable deployment hash (e.g. `v1.0.0-RC1`).
3. Click "Rollback to this deployment".
4. **Guaranteed Zero Data Loss:** Because learner progress is versioned in `localStorage`, rollbacks will not corrupt or purge stored student progress.

### 2.2 In-Browser WebAssembly Failure Recovery
- **Python Pyodide Timeout:** If a student executes an infinite loop (`while True: pass`), the host service automatically calls `worker.terminate()` after 6,000ms and spawns a fresh worker instance. The main UI thread never freezes.
- **SQLite Database Crash:** If a malformed query corrupts the transient in-memory database, clicking "Reset Database" destroys the worker and re-instantiates a clean academic database schema.

---

## 3. Operational Monitoring & Health Check Automation

### 3.1 Edge CDN Monitoring
- **SLO Target:** $99.95\%$ HTTP 200/304 response availability.
- **Uptime Probes:** Automated 60-second synthetic HTTP GET probes against `https://lumenode.org/` and `https://lumenode.org/explore`.

### 3.2 Optional Compiler Gateway Monitoring
For self-hosted instances offering native execution:
- **Endpoint:** `GET https://<compiler-url>/health`
- **Expected Status:** HTTP 200 with JSON payload `{ "status": "ok", "service": "lumenode-compiler-gateway" }`.
- **Systemd Service Management:**
  ```bash
  # Check status
  systemctl status lumenode-compiler-gateway
  
  # Restart service
  systemctl restart lumenode-compiler-gateway
  
  # View recent logs
  journalctl -u lumenode-compiler-gateway -n 50 --no-pager
  ```

---

## 4. Privacy-Preserving Telemetry & First 30-Day Metrics

Lumenode tracks high-level platform health **without collecting PII or learner code**:

| Operational Metric | Measurement Method | Privacy Guardrail |
| :--- | :--- | :--- |
| **Site Availability** | External synthetic uptime pings | Zero learner data involved |
| **Browser Worker Failures** | Aggregated error counts in Local Storage | No personal code logged |
| **Lesson Completions** | Local milestone counter in browser | Anonymous aggregate counter |
| **Exercise Pass Rate** | Quiz completion percentages | Anonymous aggregate counter |
| **Laboratory Usage** | Step forward / backward engagement | Anonymous session count |
| **Community Feedback** | Feedback modal submissions | Optional email, opt-in only |
