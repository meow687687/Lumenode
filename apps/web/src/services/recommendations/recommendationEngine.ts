/**
 * Deterministic Learning Recommendation Engine.
 * Traverses the canonical Concept DAG and analyzes learner mastery records
 * to generate transparent, explainable recommendations.
 *
 * Recommendation Types:
 * - prerequisite_remediation: Learner struggled with a concept; recommend reviewing its prerequisites.
 * - review_decayed: Previously mastered concept has decayed (>14 days) or failed review.
 * - practice_reinforcement: Concept is in 'practicing' state; needs additional passed exercise for mastery.
 * - next_in_path: All prerequisites satisfied; learner is primed to start this new concept.
 */

import {
  Concept,
  ConceptMasteryRecord,
  LearningRecommendation,
  Lesson,
} from '@lumenode/shared-types';

export class RecommendationEngine {
  public static generateRecommendations(
    masteryRecords: Record<string, ConceptMasteryRecord>,
    concepts: Concept[],
    lessons: Lesson[]
  ): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = [];
    const conceptMap = new Map<string, Concept>(concepts.map((c) => [c.id, c]));
    const lessonByConcept = new Map<string, Lesson>();

    lessons.forEach((l) => {
      lessonByConcept.set(l.conceptId, l);
    });

    // 1. Check for Remediation on Struggling Concepts
    for (const concept of concepts) {
      const record = masteryRecords[concept.id];
      const isStruggling = record && (record.state === 'needs_review' || (record.attemptsCount > 0 && record.lastScore < 60));

      if (isStruggling && concept.prerequisiteConceptIds.length > 0) {
        for (const prereqId of concept.prerequisiteConceptIds) {
          const prereqConcept = conceptMap.get(prereqId);
          const prereqRecord = masteryRecords[prereqId];
          const prereqLesson = lessonByConcept.get(prereqId);

          if (!prereqRecord || prereqRecord.state !== 'demonstrated') {
            recommendations.push({
              id: `rec-prereq-${concept.id}-${prereqId}`,
              conceptId: prereqId,
              conceptTitle: prereqConcept ? prereqConcept.title : prereqId,
              type: 'prerequisite_remediation',
              urgency: 'high',
              reason: `You faced difficulties with "${concept.title}". Revisiting foundational prerequisite "${prereqConcept?.title || prereqId}" will clarify the core mechanics.`,
              suggestedLessonId: prereqLesson?.id,
            });
            break; // Recommend the primary unmastered prerequisite
          }
        }
      }
    }

    // 2. Check for Decayed Mastery
    for (const concept of concepts) {
      const record = masteryRecords[concept.id];
      if (record && record.decayAlert && record.demonstratedAt) {
        const lesson = lessonByConcept.get(concept.id);
        recommendations.push({
          id: `rec-decay-${concept.id}`,
          conceptId: concept.id,
          conceptTitle: concept.title,
          type: 'review_decayed',
          urgency: 'medium',
          reason: `It has been over 14 days since you demonstrated "${concept.title}". Complete a quick review exercise to refresh your recall.`,
          suggestedLessonId: lesson?.id,
          suggestedExerciseId: concept.exerciseIds[0],
        });
      }
    }

    // 3. Check for Practice Reinforcement (practicing -> demonstrated)
    for (const concept of concepts) {
      const record = masteryRecords[concept.id];
      if (record && record.state === 'practicing') {
        const lesson = lessonByConcept.get(concept.id);
        recommendations.push({
          id: `rec-reinforce-${concept.id}`,
          conceptId: concept.id,
          conceptTitle: concept.title,
          type: 'practice_reinforcement',
          urgency: 'medium',
          reason: `You have made good progress on "${concept.title}". Pass 1 more exercise to achieve full Demonstrated Mastery!`,
          suggestedLessonId: lesson?.id,
          suggestedExerciseId: concept.exerciseIds[0],
        });
      }
    }

    // 4. Check for Next-In-Path (all prerequisites demonstrated or practicing, concept not started)
    for (const concept of concepts) {
      const record = masteryRecords[concept.id];
      const isUnstarted = !record || record.state === 'not_started';

      if (isUnstarted) {
        // Check if all prerequisites are fulfilled
        const prereqsFulfilled = concept.prerequisiteConceptIds.every((pId) => {
          const pRecord = masteryRecords[pId];
          return pRecord && (pRecord.state === 'demonstrated' || pRecord.state === 'practicing');
        });

        if (prereqsFulfilled) {
          const lesson = lessonByConcept.get(concept.id);
          recommendations.push({
            id: `rec-next-${concept.id}`,
            conceptId: concept.id,
            conceptTitle: concept.title,
            type: 'next_in_path',
            urgency: 'low',
            reason: concept.prerequisiteConceptIds.length === 0
              ? `Foundational entry point: Start your journey with "${concept.title}".`
              : `You have satisfied all prerequisites for "${concept.title}". You are ready for this topic!`,
            suggestedLessonId: lesson?.id,
          });
        }
      }
    }

    // Sort by priority (high > medium > low) and return top recommendations
    const priorityWeight = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityWeight[a.urgency] - priorityWeight[b.urgency]).slice(0, 5);
  }
}
