# LUMENODE
## Product Vision, PRD, Technical Design & Execution Roadmap

**Project:** Lumenode  
**Tagline:** Explore. Understand. Build.  
**Version:** 0.1 — Foundational Specification  
**Status:** Proposed / Pre-development  
**Product Type:** Open-source Computer Science Learning Platform  
**License Strategy:** Open-source software + open educational content  
**Primary Audience:** University students and self-taught developers

---

# PART I — PRODUCT VISION

## 1. Executive Summary

Lumenode is an open-source, completely free, interactive computer science learning platform designed to make complex technical concepts easier to understand through structured education, visual explanations, executable code, practical experimentation, and interconnected knowledge.

Traditional programming education frequently separates theoretical explanations from practical implementation. Students memorize definitions without understanding how algorithms execute, how memory behaves, how databases operate, or how programming languages differ internally.

Lumenode addresses this gap.

The platform combines:

- Structured computer science curriculum.
- Programming language education.
- Interactive 2D and 3D visualizations.
- Real code execution.
- Algorithm and data structure laboratories.
- SQL playgrounds.
- Memory and pointer simulators.
- Assessments and coding challenges.
- Cross-language concept comparisons.
- Personalized learning paths.
- Community contributions.

The objective is to create a comprehensive learning environment rather than another collection of programming tutorials.

## 2. Problem Statement

Existing learning experiences often suffer from the following problems:

1. Fragmented educational resources.
2. Abstract explanations without practical visualizations.
3. Inconsistent teaching quality.
4. Language-specific tutorials that fail to explain underlying concepts.
5. Limited opportunities for experimentation.
6. Weak connections between university curricula and practical engineering.
7. Expensive educational resources.
8. Limited accessibility for learners with different backgrounds and learning requirements.

Lumenode should address these problems through a unified and accessible educational ecosystem.

## 3. Vision

Make computer science understandable, interactive, accessible, and free for everyone.

## 4. Mission

Help learners develop genuine computer science understanding through a combination of theory, visualization, experimentation, programming, and practical application.

## 5. Product Principles

### Principle 1: Concept before syntax
Teach the underlying computer science concept before introducing language-specific implementations.

### Principle 2: Learn through experimentation
Learners should be able to manipulate data structures, execute algorithms, inspect memory, and experiment with SQL.

### Principle 3: Visualize difficult concepts
Abstract ideas should become interactive experiences whenever visualization materially improves comprehension.

### Principle 4: Connect knowledge
Lessons should connect to prerequisites, related concepts, and advanced topics.

### Principle 5: No artificial knowledge restrictions
Essential lessons, educational content, and core learning functionality remain free.

### Principle 6: Technical accuracy
Educational explanations and simulations must accurately represent the concepts they claim to teach.

### Principle 7: Accessibility
Support mobile devices, low-bandwidth environments, keyboard navigation, and different learning speeds.

---

# PART II — PRODUCT REQUIREMENTS DOCUMENT

## 6. Target Users

### Persona A: University Student
Needs:
- Understand university subjects.
- Prepare for examinations.
- Practice programming.
- Understand theoretical concepts.
- Access concise revision resources.

### Persona B: Self-taught Developer
Needs:
- Structured learning paths.
- Deeper computer science fundamentals.
- Practical programming exercises.
- Language comparisons.
- Technical interview preparation.

### Persona C: Language-switching Developer
Needs:
- Understand how concepts differ between languages.
- Compare implementations.
- Learn language-specific memory and runtime behavior.
- Practice unfamiliar syntax.

### Persona D: Educator and Contributor
Needs:
- Create educational material.
- Contribute explanations and examples.
- Create assessments.
- Improve existing lessons.
- Share learning resources.

## 7. Platform Structure

Lumenode will have four primary divisions.

### Division A: Programming Languages

Initial languages:
1. C
2. C++
3. Python

Future languages:
4. Java
5. Rust
6. JavaScript
7. TypeScript
8. Go
9. C#
10. Kotlin
11. Swift

Each language should contain:
- Introduction and environment.
- Syntax and fundamentals.
- Variables and data types.
- Control structures.
- Functions.
- Data structures.
- Memory management where applicable.
- Object-oriented programming where applicable.
- Advanced language concepts.
- Error handling.
- Practical projects.
- Language-specific exercises.

*Note:* Do not force concepts into languages that do not support them natively. For example, Rust should teach ownership, borrowing, traits, and composition instead of pretending it has conventional class inheritance.

### Division B: Core Computer Science

Initial subjects:
1. Data Structures and Algorithms.
2. Object-Oriented Programming.
3. Pointers and Memory Management.
4. Database Management Systems.

Future subjects:
5. Operating Systems.
6. Computer Networks.
7. Computer Architecture.
8. Discrete Mathematics.
9. Software Engineering.
10. Compiler Design.
11. Distributed Systems.
12. Cybersecurity.
13. Artificial Intelligence and Machine Learning.

### Division C: Interactive Laboratories

- DSA Visualizer.
- Algorithm Execution Visualizer.
- Memory and Pointer Simulator.
- OOP Inheritance Builder.
- Object Lifecycle Visualizer.
- SQL Playground.
- Database Schema Designer.
- Code Playground.
- Complexity Analyzer.

### Division D: Learning and Assessment

- Learning paths.
- Topic-wise exercises.
- Multiple-choice questions.
- Predict-the-output challenges.
- Debugging exercises.
- Coding assignments.
- Mock university examinations.
- Interview preparation.
- Progress dashboard.
- Learning recommendations.

---

## 8. Functional Requirements

### FR-01: Learning Management
The platform must support:
- Subject browsing.
- Topic browsing.
- Lesson navigation.
- Lesson completion tracking.
- Bookmarks.
- Search.
- Previous and next lesson navigation.
- Prerequisite identification.
- Related concept navigation.

### FR-02: Lesson Engine
Every lesson should support structured content blocks:
- Heading.
- Text explanation.
- Code snippet.
- Interactive diagram.
- Image.
- Video or animation.
- Mathematical expression.
- Quiz.
- Coding exercise.
- Callout.
- Comparison table.
- Related lesson.

Lessons must be data-driven rather than hardcoded into individual React pages.

### FR-03: Code Playground
Initial language support:
- C.
- C++.
- Python.

Features:
- Syntax highlighting.
- Editable code.
- Standard input.
- Standard output.
- Compilation or execution errors.
- Reset.
- Example templates.
- Copy code.
- Execution status.
- Configurable execution limits.

Code execution must occur in a restricted sandbox.

### FR-04: Visualization Engine
The platform should support:
- Animated 2D diagrams.
- Interactive SVG diagrams.
- 3D scenes.
- Execution-step animations.
- Object inspection.
- Camera controls.
- Playback controls.
- Labels and annotations.
- Reduced-motion alternatives.

### FR-05: DSA Laboratory
Initial algorithms and structures:
- Arrays.
- Linked lists.
- Stacks.
- Queues.
- Binary search.
- Sorting algorithms.
- Binary trees.
- Binary search trees.
- Graph traversal.
- BFS.
- DFS.
- Recursion.

Visualizations should expose each meaningful operation, comparison, traversal, and mutation.

### FR-06: SQL Laboratory
Support:
- Table creation.
- Inserting data.
- Updating records.
- Deleting records.
- SELECT statements.
- WHERE.
- ORDER BY.
- GROUP BY.
- Joins.
- Subqueries.
- Indexing demonstrations.

Initial implementation should use SQLite WASM for local execution.

### FR-07: Assessment System
Support:
- MCQs.
- Short-answer questions.
- Predict-the-output.
- Find-the-error.
- Coding exercises.
- Timed examinations.

Provide explanations after submission.

### FR-08: Learning Progress
Track:
- Completed lessons.
- Completed exercises.
- Quiz scores.
- Current learning path.
- Bookmarked content.
- Weak topics.
- Recommended next lessons.

Progress should initially be stored locally.

### FR-09: Cross-Language Learning
A canonical concept should support multiple language implementations.

Example:
Concept: Linked List.
Implementations:
- C.
- C++.
- Python.
- Java.
- Rust.

Show language-specific differences without duplicating the entire conceptual lesson.

### FR-10: Search and Knowledge Navigation
Search should support:
- Subjects.
- Languages.
- Lessons.
- Concepts.
- Glossary terms.
- Code examples.

Related lessons should be discoverable through concept relationships.

---

## 9. Non-Functional Requirements

### Performance
- Fast initial loading.
- Lazy-loaded visualizations.
- Code splitting.
- Optimized images.
- Minimal unnecessary dependencies.
- Smooth operation on ordinary student laptops.

### Accessibility
- Keyboard navigation.
- Screen-reader-friendly controls.
- Adequate contrast.
- Reduced-motion support.
- Responsive design.
- Text alternatives for visual explanations.

### Reliability
- Error boundaries.
- Recoverable local progress.
- Graceful failure when compiler services are unavailable.
- Clear execution timeout handling.
- Automated testing.

### Security
- Never execute untrusted code directly in the application server process.
- Restrict execution time and memory.
- Disable unrestricted network access in code sandboxes.
- Apply rate limits to remote execution.
- Validate user-submitted content.
- Sanitize rendered educational Markdown.
- Protect authentication and user data if accounts are introduced.

---

# PART III — PRODUCT DESIGN

## 10. Design Direction

Visual identity:
- Dark navy foundation.
- Electric blue primary accent.
- Cyan and violet secondary accents.
- Neutral grey content surfaces.
- Clear typography.
- Subtle gradients.
- Minimal decorative glass effects.

The interface should feel like a modern technical learning environment, not a conventional school management system.

### Main Navigation
1. Home.
2. Explore.
3. Programming Languages.
4. Computer Science.
5. Laboratories.
6. Learning Paths.
7. Practice.
8. Glossary.
9. Community.

### Main Dashboard
Include:
- Continue learning.
- Current learning path.
- Recommended lessons.
- Recent activity.
- Subject progress.
- Saved lessons.
- Practice challenges.

### Lesson Interface
Desktop:
- Left navigation: course structure.
- Center: lesson content.
- Right: optional interactive concept panel.

Mobile:
- Single-column reading layout.
- Collapsible navigation.
- Touch-friendly diagrams.
- Responsive code editor.

---

# PART IV — TECHNICAL DESIGN

## 11. Technology Stack

### Frontend
- React 19+
- TypeScript
- Vite
- Tailwind CSS
- Motion for React
- Lucide React

### Visualization
- SVG.
- React Flow.
- Three.js.
- React Three Fiber.
- Drei.
- Canvas where appropriate.

### Code Editor
- Monaco Editor.

### SQL Engine
- SQLite WASM.
- Web Workers for isolated browser-side operations.

### Code Execution
Use an execution adapter supporting a restricted compiler service.
Preferred initial approach:
- Self-hosted Judge0 or an equivalent isolated execution service.
- Separate execution infrastructure from the frontend.
- Strict time, memory, process, and network restrictions.
- Never run arbitrary learner code in the primary web server.

### Data and Persistence
Initial:
- IndexedDB for local progress and offline data.
- Static content stored in the repository.
Later:
- PostgreSQL for accounts, synchronized progress, and community data.
- Object storage for media and user-generated attachments.

### Deployment
- Static frontend deployment.
- CDN for public assets.
- Separate sandbox execution infrastructure.
- Optional self-hosted deployment.

---

# PART V — OPEN-SOURCE GOVERNANCE

## 18. Licensing Strategy
- Platform Software: Apache License 2.0.
- Educational Content: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0).
- Code Examples: MIT License.

## 19. Community Governance
- CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, issue and PR templates.
- Educational correctness must be a merge requirement.

---

# PART VI — EXECUTION ROADMAP

### PHASE 0 — Product Foundation
### PHASE 1 — Platform Foundation
### PHASE 2 — Educational Content
### PHASE 3 — Visualization Engine
### PHASE 4 — Practical Laboratories
### PHASE 5 — Assessment Engine
### PHASE 6 — Platform Expansion
### PHASE 7 — Community and Public Launch
