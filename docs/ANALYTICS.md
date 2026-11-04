# Lumenode Privacy-Conscious Product Analytics Specification

**Status:** Implemented & Verified  
**Standard:** Local-First Privacy, Zero-PII, GDPR & CCPA Aligned  
**Service:** `apps/web/src/services/telemetry/analyticsService.ts`

---

## 1. Analytics Philosophy & Privacy Principles

Lumenode rejects invasive surveillance capitalism. Traditional educational technology platforms embed invasive commercial analytics trackers that monitor student keystrokes, fingerprint devices, and collect personal identity information.

Lumenode operates under the following **privacy invariants**:
1. **Zero Personal Identifiable Information (PII):** Never log names, email addresses, IP addresses, or device fingerprints.
2. **Zero Student Code Logging:** Never record arbitrary learner code snippets, solutions, or comments in telemetry events.
3. **Zero Third-Party Trackers:** No Google Analytics, Segment, Meta Pixels, Amplitude, or advertising beacons are loaded.
4. **Strict Consent Enforcement:** Telemetry is disabled by default until explicit learner consent is granted, and honors the browser's `navigator.doNotTrack` header regardless of local settings.
5. **Local-First Inspectability:** All recorded events are kept in a visible, learner-inspectable local ring buffer (max 100 events) that can be reviewed, exported as JSON, or purged at any time.

---

## 2. Permitted Learning Events

Telemetry is restricted exclusively to coarse-grained pedagogical milestones:

| Event Name | Trigger Condition | Permitted Payload Keys | Prohibited Data |
| :--- | :--- | :--- | :--- |
| `lesson_opened` | Learner navigates to a lesson page | `lessonId`, `timestamp` | Learner identity, referrer URL |
| `lesson_completed` | Learner completes all lesson sections | `lessonId`, `totalCompleted` | Time spent reading |
| `exercise_attempted` | Learner submits an answer to a quiz | `conceptId`, `exerciseId`, `exerciseType`, `passed`, `score`, `hintsUsed` | Learner code, keystrokes, raw text answer |
| `exercise_completed` | Learner successfully passes an exercise | `conceptId`, `exerciseId`, `score` | Student identity, IP address |
| `visualization_explored` | Learner steps through an algorithm simulation | `visualizerId`, `stepCount` | Screen coordinates, mouse movements |
| `search_performed` | Learner conducts a global search | `queryLength`, `resultsCount` | Literal search text, sensitive queries |
| `path_progressed` | Learner advances a curriculum module | `subjectId`, `moduleId`, `progressPercent` | Gradebook identity |
| `error_encountered` | Client encounter runtime failure | `errorCategory`, `sourceModule` | Stack traces containing local file paths |

---

## 3. Data Sanitization & Enforcement Pipeline

The `AnalyticsService` enforces an automated key-sanitization filter before buffering:
```ts
// apps/web/src/services/telemetry/analyticsService.ts
const sanitizedPayload: Record<string, string | number | boolean> = {};
for (const [key, value] of Object.entries(payload)) {
  const lowerKey = key.toLowerCase();
  // Strip sensitive or code-like keys
  if (
    lowerKey.includes('pass') ||
    lowerKey.includes('code') ||
    lowerKey.includes('email') ||
    lowerKey.includes('token') ||
    lowerKey.includes('ip')
  ) {
    continue;
  }

  // Enforce string length bounds
  if (typeof value === 'string') {
    sanitizedPayload[key] = value.slice(0, 100);
  } else {
    sanitizedPayload[key] = value;
  }
}
```

---

## 4. Consent Lifecycle & Do Not Track (DNT)

### 4.1 Do Not Track Precedence
If a learner configures their browser with `Do Not Track` (`navigator.doNotTrack === '1'`), the telemetry service immediately ceases all tracking operations, regardless of stored consent:
```ts
if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
  return false; // Tracking unconditionally blocked
}
```

### 4.2 Consent Revocation
If a learner changes their preference from `granted` to `denied`:
1. The consent flag in `localStorage` is set to `'denied'`.
2. The local event buffer is immediately purged from both RAM and `localStorage`.
3. No further telemetry events are queued.

---

## 5. Local Inspection & Data Portability

Learners have full sovereignty over their data:
- **Inspect:** Run `analytics.getBufferedEvents()` in the browser developer console.
- **Export:** Run `analytics.exportAnalyticsJson()` to download a machine-readable JSON snapshot.
- **Clear:** Run `analytics.clearBuffer()` or use the Settings panel to wipe all traces.

---

## 6. Self-Hosting & Telemetry Forwarding (Optional)

For university departments or institutions self-hosting Lumenode:
- An optional environment variable `VITE_TELEMETRY_ENDPOINT` can be configured to point to an internal endpoint.
- If unconfigured (default), telemetry remains strictly local to the learner's browser session.
