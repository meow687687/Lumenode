import { describe, it, expect } from 'vitest';
import { CONCEPTS } from '../data/concepts';
import { MODULES, TOPICS } from '../data/modules';
import { LESSONS } from '../data/lessons';
import { SUBJECTS } from '../data/subjects';
import {
  safeValidateConcept,
  safeValidateLesson,
  Concept,
} from '@lumenode/shared-types';

describe('Concept & Curriculum Knowledge Graph', () => {
  it('validates that the production concept prerequisite graph is a DAG (no cycles)', () => {
    const conceptMap = new Map(CONCEPTS.map(c => [c.id, c]));
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const cycles: string[] = [];

    function dfs(nodeId: string, path: string[]) {
      visited.add(nodeId);
      inStack.add(nodeId);
      path.push(nodeId);

      const concept = conceptMap.get(nodeId);
      if (concept && concept.prerequisiteConceptIds) {
        for (const prereqId of concept.prerequisiteConceptIds) {
          if (!visited.has(prereqId)) {
            dfs(prereqId, path);
          } else if (inStack.has(prereqId)) {
            path.push(prereqId);
            cycles.push(path.slice(path.indexOf(prereqId)).join(' -> '));
          }
        }
      }

      inStack.delete(nodeId);
      path.pop();
    }

    for (const concept of CONCEPTS) {
      if (!visited.has(concept.id)) {
        dfs(concept.id, []);
      }
    }

    expect(cycles).toHaveLength(0);
  });

  it('correctly detects a deliberate circular dependency in an isolated graph test', () => {
    const cyclicConcepts: Concept[] = [
      {
        id: 'cycle.a',
        subjectId: 'dsa',
        title: 'Node A',
        slug: 'node-a',
        description: 'Test A',
        difficulty: 'beginner',
        prerequisiteConceptIds: ['cycle.b'],
        relatedConceptIds: [],
        learningObjectives: ['A'],
        tags: [],
        implementations: [],
        lessonIds: [],
        exerciseIds: [],
      },
      {
        id: 'cycle.b',
        subjectId: 'dsa',
        title: 'Node B',
        slug: 'node-b',
        description: 'Test B',
        difficulty: 'beginner',
        prerequisiteConceptIds: ['cycle.c'],
        relatedConceptIds: [],
        learningObjectives: ['B'],
        tags: [],
        implementations: [],
        lessonIds: [],
        exerciseIds: [],
      },
      {
        id: 'cycle.c',
        subjectId: 'dsa',
        title: 'Node C',
        slug: 'node-c',
        description: 'Test C',
        difficulty: 'beginner',
        prerequisiteConceptIds: ['cycle.a'], // Cycle back to A
        relatedConceptIds: [],
        learningObjectives: ['C'],
        tags: [],
        implementations: [],
        lessonIds: [],
        exerciseIds: [],
      },
    ];

    const map = new Map(cyclicConcepts.map(c => [c.id, c]));
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const cycles: string[] = [];

    function dfs(nodeId: string, path: string[]) {
      visited.add(nodeId);
      inStack.add(nodeId);
      path.push(nodeId);

      const concept = map.get(nodeId);
      if (concept && concept.prerequisiteConceptIds) {
        for (const prereqId of concept.prerequisiteConceptIds) {
          if (!visited.has(prereqId)) {
            dfs(prereqId, path);
          } else if (inStack.has(prereqId)) {
            path.push(prereqId);
            cycles.push(path.slice(path.indexOf(prereqId)).join(' -> '));
          }
        }
      }

      inStack.delete(nodeId);
      path.pop();
    }

    dfs('cycle.a', []);
    expect(cycles.length).toBeGreaterThan(0);
    expect(cycles[0]).toContain('cycle.a -> cycle.b -> cycle.c -> cycle.a');
  });

  it('validates every concept conforms to ConceptSchema with valid prerequisites and implementations', () => {
    const conceptIds = new Set(CONCEPTS.map(c => c.id));
    const subjectIds = new Set(SUBJECTS.map(s => s.id));

    for (const concept of CONCEPTS) {
      const res = safeValidateConcept(concept);
      expect(res.success, `Concept "${concept.id}" failed validation`).toBe(true);

      expect(subjectIds.has(concept.subjectId), `Subject "${concept.subjectId}" missing for concept "${concept.id}"`).toBe(true);

      for (const prereq of concept.prerequisiteConceptIds) {
        expect(conceptIds.has(prereq), `Prereq "${prereq}" missing for concept "${concept.id}"`).toBe(true);
      }

      for (const related of concept.relatedConceptIds) {
        expect(conceptIds.has(related), `Related "${related}" missing for concept "${concept.id}"`).toBe(true);
      }

      if (concept.implementations) {
        for (const impl of concept.implementations) {
          expect(impl.codeSnippet.length).toBeGreaterThan(5);
          expect(impl.memorySemantics.length).toBeGreaterThan(5);
          expect(impl.keyDifferences.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('validates curriculum hierarchy linking: Subjects -> Modules -> Topics -> Concepts', () => {
    const subjectIds = new Set(SUBJECTS.map(s => s.id));
    const moduleIds = new Set(MODULES.map(m => m.id));
    const topicIds = new Set(TOPICS.map(t => t.id));
    const conceptIds = new Set(CONCEPTS.map(c => c.id));

    // Every module belongs to a known subject
    for (const mod of MODULES) {
      expect(subjectIds.has(mod.subjectId), `Module ${mod.id} has invalid subjectId ${mod.subjectId}`).toBe(true);
      for (const topId of mod.topicIds) {
        expect(topicIds.has(topId), `Module ${mod.id} has invalid topicId ${topId}`).toBe(true);
      }
    }

    // Every topic points to its module and valid concepts
    for (const top of TOPICS) {
      expect(moduleIds.has(top.moduleId), `Topic ${top.id} has invalid moduleId ${top.moduleId}`).toBe(true);
      for (const cId of top.conceptIds) {
        expect(conceptIds.has(cId), `Topic ${top.id} has invalid conceptId ${cId}`).toBe(true);
      }
    }
  });

  it('validates that every lesson has a valid canonical concept reference and schema', () => {
    const conceptIds = new Set(CONCEPTS.map(c => c.id));

    for (const lesson of LESSONS) {
      const res = safeValidateLesson(lesson);
      expect(res.success, `Lesson "${lesson.id}" failed schema validation`).toBe(true);
      expect(conceptIds.has(lesson.conceptId), `Lesson "${lesson.id}" points to non-existent concept "${lesson.conceptId}"`).toBe(true);
      expect(lesson.learningObjectives.length).toBeGreaterThan(0);
      expect(lesson.sections.length).toBeGreaterThan(0);
    }
  });
});
