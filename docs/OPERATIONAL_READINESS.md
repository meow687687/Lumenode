# Lumenode Operational Readiness & Site Reliability Guide

**Scope:** Production Service Availability, Monitoring, Incident Response, and Disaster Recovery  
**Version:** 1.0  
**Date:** November 2026  

---

## 1. Service Level Indicators (SLIs) & Objectives (SLOs)

| Service Dimension | Metric / SLI | SLO Target | Monitoring Strategy |
| :--- | :--- | :---: | :--- |
| **Static Edge Availability** | Edge HTTP 200/304 response rate | **$99.95\%$** | Synthetic global health probes via CDN edge status |
| **Edge TTFB Latency** | Time-To-First-Byte for cached assets | **$< 100\text{ms}$** | Edge CDN telemetry (Cloudflare / Vercel Analytics) |
| **Client Sandbox Reliability** | Worker initialization crash rate | **$< 0.1\%$** | Client-side error telemetry boundary (`ErrorBoundary.tsx`) |
| **Compiler Gateway Availability** | `GET /health` HTTP 200 rate | **$99.5\%$** | Automated 30-second synthetic polling from uptime monitor |
| **Compiler Gateway Latency** | Median response time for standard C submission | **$< 800\text{ms}$** | Internal execution timer reported in JSON response |

---

## 2. Compiler Gateway Health & Capacity Monitoring

The Compiler Gateway exposes an unauthenticated health probe at `GET /health`:
```json
{
  "status": "ok",
  "service": "lumenode-compiler-gateway",
  "activeExecutions": 1,
  "maxConcurrent": 4,
  "timestamp": 1730722300000
}
```

### Alert Thresholds:
- **P1 Incident (Gateway Unreachable):** 3 consecutive failed health checks over 90 seconds. Triggers automated restart via systemd or container orchestrator.
- **P2 Warning (High Concurrency):** `activeExecutions >= maxConcurrent` for $> 30$ seconds. Signals that incoming requests may receive HTTP 503 (Gateway Busy).
- **P2 Warning (Rate Limit Elevation):** Spike in HTTP 429 responses indicating potential DoS flood or abusive script submission.

---

## 3. Privacy-Preserving Telemetry & Zero PII Guarantee

Lumenode follows strict privacy-conscious engineering:
1. **Zero Source Code Logging:** Submitted C/C++ or Python source code is processed strictly in volatile ephemeral memory and is **never** written to persistent server log files or shared telemetry backends.
2. **Zero Student Personal Data:** No email addresses, student names, IP addresses, or device identifiers are retained in analytics databases.
3. **Anonymized Error Diagnostics:** Client-side exception logging is restricted to stack traces originating from Lumenode components; local code contents are scrubbed before dispatch.

---

## 4. Operational Recovery Runbooks

### Runbook A: Compiler Gateway Service Restart
```bash
# Check service status
systemctl status lumenode-compiler-gateway

# View recent operational logs
journalctl -u lumenode-compiler-gateway -n 50 --no-pager

# Restart service safely
systemctl restart lumenode-compiler-gateway
```

### Runbook B: Purging Volatile Temporary Scratchboxes
Under normal operation, ephemeral workspaces (`/tmp/lumenode-box-<uuid>`) are deleted in the runner's `finally` block. In the rare event of a host crash during execution:
```bash
# Inspect any orphaned scratch directories older than 1 hour
find /tmp -maxdepth 1 -name "lumenode-box-*" -mmin +60

# Safe purge of orphaned directories
find /tmp -maxdepth 1 -name "lumenode-box-*" -mmin +60 -exec rm -rf {} +
```

### Runbook C: Instant CDN Edge Rollback
If a critical client regression is discovered in production:
1. Access the deployment console (Cloudflare Pages or Vercel).
2. Select the previous verified build hash (e.g. Phase 6 release candidate).
3. Click "Promote to Production". Traffic reroutes globally in $< 15$ seconds.
