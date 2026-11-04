# Lumenode Public Beta Testing Plan

**Status:** Ready for Public Beta Launch  
**Version:** 0.4.0-beta  
**Target Audiences:**
1. **University CS Undergraduates:** Students currently enrolled in CS1/CS2, Data Structures & Algorithms, or Computer Systems courses.
2. **Self-Taught Developers:** Learners transitioning from high-level languages (JavaScript, Python) to systems programming (C, C++, Rust).
3. **Computer Science Educators & Teaching Assistants:** Instructors seeking visual demonstrations and automated concept checks for classroom use.

---

## 1. Beta Objectives & Key Questions

1. **Pedagogical Clarity:** Do interactive visualizations (BST, AVL, Call Stack) demystify abstract algorithmic mechanics more effectively than static textbook diagrams?
2. **Execution Reliability:** Does the client-side Pyodide and SQLite WASM sandbox provide instantaneous, low-friction feedback without crashes or browser freezes?
3. **Mastery & Retention:** Does the spaced-repetition model accurately reflect learner proficiency and encourage timely reviews without frustration?
4. **Onboarding & Ergonomics:** Can a first-time learner understand platform capabilities within 60 seconds without feeling overwhelmed?
5. **Accessibility & Device Support:** Does the platform operate smoothly across different screen resolutions, input methods (mouse vs. keyboard), and assistive technologies?

---

## 2. Structured Participant Evaluation Script

Beta participants are asked to complete six sequential tasks and record observations:

### Task 1: First-Time Onboarding & Quick Discovery
- **Scenario:** You are a new learner arriving on Lumenode for the first time.
- **Action:**
  1. Complete or skim the 4-step welcome tour.
  2. Press `Cmd+K` (or `Ctrl+K` on Windows/Linux) to open Global Search.
  3. Search for "pointers" or "binary search tree".
  4. Jump directly to the found lesson.
- **Evaluation Criteria:**
  - Was the tour informative and easy to dismiss?
  - Did global search respond immediately with accurate categorization?

### Task 2: Systems Programming Concept & Translation Pipeline
- **Scenario:** You are learning how C code transforms into machine instructions.
- **Action:**
  1. Navigate to *C Translation Pipeline: Source to Binary*.
  2. Read the explanation of the Preprocessor, Compiler, Assembler, and Linker.
  3. Complete the interactive concept check quiz.
  4. Use a hint if needed to test scoring calibration.
- **Evaluation Criteria:**
  - Was the feedback for correct/incorrect answers clear?
  - Did the hint penalty feel balanced (maximum 30% reduction, floor of 70%)?

### Task 3: Interactive Visualizer & Time-Travel Simulation
- **Scenario:** You are studying self-balancing binary search trees (AVL Trees).
- **Action:**
  1. Open the *AVL Tree Rebalancing* interactive visualizer.
  2. Insert values that force a Left-Right or Right-Left rotation (e.g., `30, 10, 20`).
  3. Use the playback controls: Step forward, Step backward, change speed to `0.5x`, and scrub using the timeline slider.
- **Evaluation Criteria:**
  - Did the visualizer clearly explain *why* the balance factor triggered a rotation?
  - Did time-travel (stepping backward) work smoothly without state desynchronization?

### Task 4: In-Browser Code Execution & Laboratory Sandboxing
- **Scenario:** You want to experiment with Python algorithms and SQL relational schemas.
- **Action:**
  1. Open the Python Code Playground.
  2. Run a loop script with standard output (`print`).
  3. Open the SQL Playground.
  4. Create a table, insert 3 rows, and execute an aggregated `SELECT ... GROUP BY` query.
- **Evaluation Criteria:**
  - Did the code execute in-browser without network roundtrips?
  - Did table results render cleanly with columns and row counts?

### Task 5: Spaced Repetition & Retention Hub
- **Scenario:** You want to review concepts you practiced previously.
- **Action:**
  1. Open the Practice Hub (`/practice`).
  2. Inspect your current mastery levels (`Introduced`, `Practicing`, `Mastered`).
  3. Review concepts marked as `Due for Review`.
- **Evaluation Criteria:**
  - Did the practice hub distinguish between your demonstrated score and your review schedule?
  - Did successfully re-testing a due concept advance its review interval?

### Task 6: Data Portability & Backup
- **Scenario:** You are switching browsers or wish to safeguard your learning progress.
- **Action:**
  1. Navigate to Settings / Backup.
  2. Export a JSON progress snapshot to your computer.
  3. Clear browser site data or open an Incognito window.
  4. Import the snapshot file.
- **Evaluation Criteria:**
  - Did all completed lessons, quiz scores, and mastery streaks restore completely?

---

## 3. Feedback Collection & Bug Triage

### 3.1 Feedback Channels
- **GitHub Issues:** Pre-configured issue templates for `Bug Report`, `Feature Request`, and `Curriculum Content Proposal`.
- **Public Discussion:** GitHub Discussions forum for general feedback and pedagogical suggestions.
- **Direct Anonymous Survey:** Optional lightweight 5-question Google Form linked in the app header during beta.

### 3.2 Bug Severity Matrix
- **P0 (Blocker):** Data loss, browser crash/infinite worker loop, visualizer state corruption that halts progress.
- **P1 (High):** Erroneous quiz evaluation, broken routing/404 on valid lessons, accessibility barriers for keyboard users.
- **P2 (Medium):** Layout overflow on mobile/tablet viewports, minor typo in technical explanations.
- **P3 (Low):** Visual polish, cosmetic animation timing adjustments.

---

## 4. Success Criteria for Beta Exit (Release Candidate 1.0)
1. **Completion Rate:** $> 85\%$ of beta testers complete Tasks 1 through 4 without abandonment.
2. **Reliability:** 0 reported main-thread browser freezes from Pyodide or SQLite execution.
3. **Accessibility:** 100% keyboard navigability validated across all core learning flows.
4. **Mastery Validation:** Spaced-repetition scheduling validated over a multi-day test cohort.
