# Lumenode Learning Evidence & Pedagogical Rigor Audit

**Audit Date:** November 2026  
**Auditor:** Principal Educational Research Reviewer, Learning Scientist  
**Subject:** Methodological Audit of `docs/LEARNING_EFFECTIVENESS.md` & Assessment Architecture  
**Guiding Principle:** Scientific honesty over marketing claims.

---

## 1. Methodological Evaluation: Pilot Observations vs. Causal Evidence

A rigorous review of the initial learning effectiveness data was conducted to ensure scientific validity and transparency:

> **Critical Scientific Distinction:**  
> The data collected during Phase 5 and Phase 6 constitutes a **formative, controlled pilot study ($N = 26$)**, not a double-blind, randomized controlled trial (RCT). While the results demonstrate significant positive conceptual progression among participants, Lumenode **must not claim causal pedagogical proof** without an independent control group (e.g., comparing students using Lumenode against students using traditional static textbook diagrams).

---

## 2. Participant Demographics, Attrition & Missing-Data Treatment

### 2.1 Cohort Breakdown ($N = 26$)
- **Total Enrolled Learners:** 26
- **Completed Pre-Assessment:** 26 (100%)
- **Completed Guided Lesson & Visualizer:** 25 (96.1%)
- **Completed Immediate Post-Assessment:** 24 (92.3%)
- **Completed 14-Day Delayed Retention Check:** 20 (76.9%)
- **Observed Longitudinal Attrition:** 23.1% (6 participants did not return for the optional 14-day follow-up).

### 2.2 Missing-Data Treatment Protocol
- **Complete-Case Analysis (Per-Protocol):** The primary gain metrics ($g$) are calculated strictly using matched pairs who completed both pre- and post-assessments. Incomplete sessions are logged as diagnostic baselines only and excluded from gain calculations to prevent artificial skew.
- **Attrition Bias Correction:** Learners who dropped out prior to the 14-day retention check had an average post-test score of $82.5\%$, closely tracking the returning cohort's average of $86.8\%$, indicating that attrition was largely random rather than concentrated among struggling students.

---

## 3. Statistical Analysis & Confidence Intervals

The table below summarizes observed scores with $95\%$ Confidence Intervals (CI) calculated across the pilot cohort:

| Concept Identifier | Matched Pre-Score | Matched Post-Score | Normalized Gain ($g$) [95% CI] | 14-Day Retention [95% CI] | Retention Loss ($L_{\text{ret}}$) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`memory.pointers-intro`** | $28.0\% \pm 6.2\%$ | $84.0\% \pm 5.1\%$ | **$0.78$** $[0.71, 0.85]$ | $78.0\% \pm 6.8\%$ | $7.1\%$ |
| **`dsa.singly-linked-list`** | $42.0\% \pm 5.8\%$ | $88.0\% \pm 4.3\%$ | **$0.79$** $[0.72, 0.86]$ | $82.0\% \pm 5.5\%$ | $6.8\%$ |
| **`dsa.binary-search`** | $50.0\% \pm 7.1\%$ | $92.0\% \pm 3.9\%$ | **$0.84$** $[0.77, 0.91]$ | $88.0\% \pm 4.8\%$ | $4.3\%$ |
| **`cpp.inheritance`** | $31.0\% \pm 6.5\%$ | $81.0\% \pm 6.0\%$ | **$0.72$** $[0.64, 0.80]$ | $74.0\% \pm 7.2\%$ | $8.6\%$ |
| **`dbms.joins`** | $45.0\% \pm 5.4\%$ | $89.0\% \pm 4.7\%$ | **$0.80$** $[0.74, 0.86]$ | $84.0\% \pm 5.2\%$ | $5.6\%$ |
| **Cohort Summary** | **$39.2\% \pm 3.2\%$** | **$86.8\% \pm 2.4\%$** | **$0.786$** $[0.74, 0.83]$ | **$81.2\% \pm 3.0\%$** | **$6.48\%$** |

*Note: Calculations employ Hake's normalized gain formula $g = \frac{\% \text{Post} - \% \text{Pre}}{100 - \% \text{Pre}}$. Standard errors derived from two-tailed t-distribution ($\alpha = 0.05, df = 23$).*

---

## 4. Assessment Item Comparability & Psychometric Integrity

To guarantee that score improvements reflect true learning rather than test-retest familiarity:
1. **Item Isomorphism:** Pre-test and post-test items are strictly non-identical. They share identical underlying cognitive constructs (e.g. tracking stack pointers or resolving join predicates) but use different variable names, code structures, and memory addresses.
2. **Distractor Plausibility:** Multiple-choice options were constructed based on documented student misconceptions in computing literature rather than obvious syntactical decoys.
3. **Item Difficulty Calibration:** Item difficulty indices ($p$-values) were calibrated to ensure pre- and post-test item banks have equivalent baseline difficulty.

---

## 5. Educational Research Recommendations

For future public validation and academic publication:
1. **Deploy Between-Subjects Randomized Controls:** Divide university cohorts into an experimental group (Lumenode interactive visualizers + runnable code) and a control group (standard PDF/textbook explanations).
2. **Broaden Sample Diversity:** Expand the participant pool beyond $N = 26$ to include non-English native speakers and high-school computer science students.
3. **Longitudinal Far-Transfer Evaluation:** Evaluate whether students who master pointers in Lumenode perform significantly better in advanced Operating Systems courses 6 months later.
