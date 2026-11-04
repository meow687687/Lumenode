# Contributing to Lumenode

Thank you for your interest in contributing to Lumenode! We are building an open-source, completely free computer science learning platform designed to make complex systems and algorithms intuitive through interactive visualizers, runnable code, and structured curricula.

---

## 1. Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect and empathy.

---

## 2. Project Architecture

Lumenode is organized as a pnpm monorepo:

- **`packages/shared-types`**: Core domain models, Zod validation schemas, and TypeScript interfaces (Curriculum, Concepts, Visualizations, Assessments, Mastery).
- **`apps/web`**: Single Page Application built with React, Vite, Tailwind CSS, Lucide Icons, and WebAssembly execution runners (Pyodide for Python, SQLite WASM).
- **`docs/`**: Architecture Decision Records (ADRs), specifications, curriculum maps, and technical designs.
- **`scripts/`**: Automation tools for curriculum validation, linting, and code checks.

---

## 3. Getting Started

### 3.1 Prerequisites
- **Node.js**: $\ge 20.0.0$
- **pnpm**: $\ge 9.0.0$ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Git**

### 3.2 Setup
```bash
# Clone the repository
git clone https://github.com/lumenode/lumenode.git
cd lumenode

# Install dependencies
pnpm install

# Start local development server
pnpm dev
```
The application will be accessible at `http://localhost:5173`.

---

## 4. Development Workflow & Commands

| Command | Purpose |
| :--- | :--- |
| `pnpm dev` | Start the Vite development server with Hot Module Replacement |
| `pnpm build` | Compile shared packages and generate production web bundle |
| `pnpm test` | Run automated unit and integration tests via Vitest |
| `pnpm lint` | Run ESLint across packages and applications |
| `pnpm typecheck` | Run TypeScript compiler type checking across the workspace |
| `pnpm content:validate` | Validate curriculum structure, concept linkages, and metadata |
| `pnpm content:check-code` | Verify syntax and compilation validity of code examples |

---

## 5. Adding or Modifying Curriculum Content

Content in Lumenode is educational infrastructure. Before proposing a new lesson or concept:
1. Review [`docs/KNOWLEDGE_MODEL.md`](docs/KNOWLEDGE_MODEL.md) and [`docs/CONTENT_AUTHORING.md`](docs/CONTENT_AUTHORING.md).
2. Ensure new concepts define clear prerequisites, learning objectives, and avoid cyclic dependencies.
3. Validate your additions using:
   ```bash
   pnpm content:validate
   pnpm content:check-code
   ```

---

## 6. Pull Request Process

1. **Create a branch:** Use descriptive branch names (e.g., `feat/avl-rotation-visualizer` or `fix/pyodide-timeout`).
2. **Follow commit conventions:** Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
3. **Run local verification:** Ensure all verification checks pass before opening a PR:
   ```bash
   pnpm typecheck && pnpm test && pnpm lint && pnpm build && pnpm content:validate
   ```
4. **Submit a PR:** Fill out the [Pull Request Template](.github/pull_request_template.md). Link any relevant issues.

---

## 7. Reporting Issues & Security

- **Bugs & Feature Requests:** Open an issue using our [GitHub Issue Templates](.github/ISSUE_TEMPLATE/).
- **Security Vulnerabilities:** Please review [`docs/SECURITY.md`](docs/SECURITY.md) and disclose vulnerabilities responsibly to `security@lumenode.org`.
