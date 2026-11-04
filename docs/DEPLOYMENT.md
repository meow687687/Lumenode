# Lumenode Production Deployment Guide

**Status:** Verified for Public Beta  
**Architecture:** Static Single Page Application (SPA) with optional remote compiler gateway microservice.

---

## 1. Overview & Hosting Architecture

Lumenode is designed as a zero-backend, client-first educational platform. The core application compiles to static assets (HTML, JS, CSS, SVG) and can be hosted on any static site provider or CDN:
- **Cloudflare Pages** (Recommended for global edge caching and free tier bandwidth)
- **Vercel**
- **Netlify**
- **AWS S3 + CloudFront**
- **GitHub Pages**

---

## 2. Build Pipeline

### 2.1 Prerequisites
- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### 2.2 Compilation Steps
```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Validate types and curriculum integrity
pnpm typecheck
pnpm content:validate
pnpm content:check-code

# 3. Execute automated test suite
pnpm test

# 4. Compile production bundles
pnpm build
```

Production output will be generated in `apps/web/dist/`.

---

## 3. Environment Configuration

Lumenode uses Vite environment variables (prefixed with `VITE_`):

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_APP_ENV` | `production` | Deployment stage (`development`, `staging`, `production`). |
| `VITE_COMPILER_GATEWAY_URL` | `""` (Empty) | Optional endpoint for remote C/C++ compiler microservice (e.g., `http://localhost:2358` or `https://compiler.lumenode.org`). When configured, authentic sandboxed C11/C++17 execution runs via the gateway. When omitted, client truthfully reports local execution is active for Python/SQL and indicates how to run the local gateway (`pnpm compiler-gateway:start`). |
| `VITE_ENABLE_ANALYTICS` | `false` | Privacy-preserving telemetry toggle. |

---

## 4. Compiler Gateway Deployment (`@lumenode/compiler-gateway`)

For environments offering authentic C11 and C++17 native execution:

### 4.1 Native Node.js Deployment
```bash
# Start compiler gateway on port 2358
pnpm compiler-gateway:start
```

### 4.2 Docker Container Deployment
```bash
# Build sandbox image
docker build -t lumenode/compiler-gateway:latest -f packages/compiler-gateway/Dockerfile .

# Run container with unshared network namespace and memory ceilings
docker run -d \
  --name lumenode-compiler \
  -p 2358:2358 \
  --pids-limit 64 \
  --memory 512m \
  lumenode/compiler-gateway:latest
```

---

## 5. Production Security Headers & Content Security Policy (CSP)

To maintain security, isolate Web Workers, and prevent clickjacking or unauthorized script injection, configure the web server or CDN with the following HTTP response headers:

### 4.1 Content Security Policy (CSP)
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://cdn.jsdelivr.net https://pypi.org; worker-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; base-uri 'self';
```
> **Note on `'unsafe-eval'`:** Required exclusively for WebAssembly instantiation (`WebAssembly.instantiate` / Pyodide compilation) in web browsers without CSP3 `wasm-unsafe-eval` support.

### 4.2 Cross-Origin Isolation (For High-Precision Timers / SharedArrayBuffer)
If enabling multi-threaded Pyodide or shared buffer WASM runtimes:
```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### 4.3 Standard Defensive Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

---

## 5. Provider Deployment Configuration

### 5.1 Cloudflare Pages (`_headers` and `_redirects`)
Create `apps/web/public/_redirects`:
```
/*    /index.html   200
```

Create `apps/web/public/_headers`:
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### 5.2 Vercel (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 6. Verification & Smoke Testing Procedure

After deploying to staging or production:
1. **HTTP 200 SPA Routing:** Visit `/`, `/explore`, `/labs`, `/practice`, and deep link `/lesson/c-intro-compilation`. Verify direct URL loads do not return 404.
2. **Python Sandbox Execution:** Open Python lab, run `print(sum([1, 2, 3, 4]))`, verify output `10` is returned from Pyodide without errors.
3. **SQLite Sandbox Execution:** Open SQL lab, run `CREATE TABLE t (id INT); INSERT INTO t VALUES (1); SELECT * FROM t;`, verify table results render properly.
4. **Offline / Disconnect Behavior:** Verify that curriculum, visualizers, and local code runners continue functioning without continuous network connectivity.
5. **Data Backup / Restore:** Create test progress, export backup JSON, clear browser data, import backup JSON, and confirm progress restores intact.

---

## 7. Rollback Strategy

Because Lumenode is deployed as immutable static assets:
1. **Instant CDN Rollback:** In Cloudflare Pages or Vercel, navigate to the Deployments tab and click "Rollback to this deployment" on the previous passing build hash.
2. **Data Safety Guarantee:** Because all learner state resides in local browser storage conforming to versioned schemas, rolling back frontend assets will not corrupt learner progress.
