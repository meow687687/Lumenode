# Lumenode Learner Mastery Progression & Decay Model

**Document Reference:** `docs/MASTERY_MODEL.md`  
**Phase:** 3  
**Status:** Implemented & Verified  

---

## 1. Educational Philosophy

Traditional educational platforms treat progress as a monotonic checklist: once a student marks a lesson "complete" or passes a quiz once, the topic is permanently checked off. In real computer science education, this leads to the "illusion of competence"—students forget core memory addressing or tree properties after several weeks of inactivity.

Lumenode implements a **Dynamic Competency Mastery Model** featuring:
1. Multi-stage state machine tracking depth of understanding.
2. Consecutive pass thresholds before granting full mastery.
3. Time-based memory decay modeled on the Ebbinghaus forgetting curve.
4. Topological prerequisite graph traversal to suggest targeted remediation.

---

## 2. Mastery State Machine

Every canonical concept in the knowledge graph is tracked by a state machine with 5 discrete states:

```
               ┌───────────────────────────────┐
               │          NOT_STARTED          │
               └──────────────┬────────────────┘
                              │
                              │ (Reads lesson content)
                              ▼
               ┌───────────────────────────────┐
               │           LEARNING            │
               └──────────────┬────────────────┘
                              │
                              │ (Attempts 1st quiz/exercise)
                              ▼
               ┌───────────────────────────────┐
               │          PRACTICING           │
               └───────┬───────────────▲───────┘
                       │               │
 (2 consecutive passes │               │ (Fails quiz /
  with score >= 70%)   │               │  reset by student)
                       ▼               │
               ┌───────────────────────┴───────┐
               │         DEMONSTRATED          │
               └──────────────┬────────────────┘
                              │
                              │ (14 days without practice
                              │  or failed review check)
                              ▼
               ┌───────────────────────────────┐
               │         NEEDS_REVIEW          │
               └───────────────────────────────┘
```

### 2.1 State Definitions
- `not_started`: Learner has neither viewed the associated lesson nor submitted an assessment.
- `learning`: Learner has completed the reading material or interactive lab but has not yet passed practical assessments.
- `practicing`: Learner has completed assessments with mixed results (e.g. 1 pass, or score < 70%).
- `demonstrated`: Learner has satisfied mastery criteria:
  - Reading completed.
  - At least **2 consecutive passed assessments** with a score of at least **70%**.
- `needs_review`: Concepts in `demonstrated` state that have exceeded the retention decay threshold (14 days) or where a downstream prerequisite check identified knowledge gaps.

### 2.2 Record Data Contract
```typescript
interface ConceptMasteryRecord {
  conceptId: string;
  state: 'not_started' | 'learning' | 'practicing' | 'demonstrated' | 'needs_review';
  lessonCompleted: boolean;
  attemptsCount: number;
  passedCount: number;
  consecutivePasses: number;
  lastScore?: number;
  lastAttemptAt?: number;
  lastDemonstratedAt?: number;
}
```

---

## 3. Memory Decay & Prerequisite Remediation Engine

Located in [`apps/web/src/services/recommendations/recommendationEngine.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/recommendations/recommendationEngine.ts).

### 3.1 Decay Policy
- Retention half-life threshold: **14 days** ($14 \times 86,400,000\text{ ms}$).
- When `now - lastAttemptAt > 14 days`, the mastery engine automatically flags the concept as `needs_review`.
- The recommendation engine elevates decayed concepts with `urgency: 'high'` and `type: 'review_decayed'`.

### 3.2 Graph-Aware Prerequisite Remediation
When a student struggles with an advanced concept (e.g. `dsa.singly-linked-list` or `dsa.binary-search-tree` enters `needs_review` or has multiple failures):
1. The recommendation engine traverses the canonical concept DAG upstream to inspect its direct prerequisites (`memory.pointers-intro`, `memory.dynamic-allocation`).
2. If any upstream prerequisite is not in `demonstrated` state, it generates a top-priority **Prerequisite Remediation** recommendation:
   - Reason: `"Prerequisite concept 'Pointers and Virtual Memory Addressing' requires reinforcement to succeed with this topic."`
   - Target: Direct link to the foundational prerequisite lesson.

---

## 4. Local-First Storage & Schema Migration

Located in [`apps/web/src/services/persistence/storageService.ts`](file:///home/sumeet/LumeNode/apps/web/src/services/persistence/storageService.ts).

- **Local-First Privacy**: Progress, bookmarks, and mastery records are stored strictly on the learner's device in `localStorage`. No mandatory cloud account or telemetry is required.
- **V1 &rarr; V2 Auto-Migration**: Automatically converts legacy flat lesson completion arrays and simple quiz score maps into structured V2 `ConceptMasteryRecord` entries upon initial load.
- **Backup Portability**: Learners can export their full profile snapshot (`LearnerProfileSnapshot`) as a single JSON file and import it across devices with schema validation via Zod.
