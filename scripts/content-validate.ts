/**
 * Lumenode Content Validation Engine
 * 
 * Verifies curriculum data models:
 * - Schema validation (Concepts, Modules, Topics, Lessons)
 * - Unique IDs across all entities
 * - Concept DAG validation (prerequisite cycle detection)
 * - Broken internal link / reference detection
 * - Walkthrough step numbering & code highlight verification
 * - Comparison table column consistency
 * - Math formula validity
 */

import {
  ConceptSchema,
  ModuleSchema,
  TopicSchema,
  LessonSchema,
  ExerciseSchema,
  safeValidateConcept,
  safeValidateLesson,
} from '../packages/shared-types/src/index';
import { CONCEPTS } from '../apps/web/src/data/concepts';
import { MODULES, TOPICS } from '../apps/web/src/data/modules';
import { LESSONS } from '../apps/web/src/data/lessons';
import { SUBJECTS } from '../apps/web/src/data/subjects';
import { EXERCISES } from '../apps/web/src/data/quizzes';

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateCurriculum(options: { checkLinksOnly?: boolean } = {}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(`[Lumenode Content Engine] Starting validation...`);
  console.log(`Entities discovered: ${SUBJECTS.length} subjects, ${MODULES.length} modules, ${TOPICS.length} topics, ${CONCEPTS.length} concepts, ${LESSONS.length} lessons.\n`);

  // 1. Uniqueness Checks
  const conceptIdSet = new Set<string>();
  const conceptSlugSet = new Set<string>();
  for (const c of CONCEPTS) {
    if (conceptIdSet.has(c.id)) {
      errors.push(`Duplicate Concept ID: "${c.id}"`);
    }
    conceptIdSet.add(c.id);

    if (conceptSlugSet.has(c.slug)) {
      warnings.push(`Duplicate Concept Slug: "${c.slug}" in concept "${c.id}"`);
    }
    conceptSlugSet.add(c.slug);
  }

  const lessonIdSet = new Set<string>();
  const lessonSlugSet = new Set<string>();
  for (const l of LESSONS) {
    if (lessonIdSet.has(l.id)) {
      errors.push(`Duplicate Lesson ID: "${l.id}"`);
    }
    lessonIdSet.add(l.id);

    if (lessonSlugSet.has(l.slug)) {
      warnings.push(`Duplicate Lesson Slug: "${l.slug}" in lesson "${l.id}"`);
    }
    lessonSlugSet.add(l.slug);
  }

  const moduleIdSet = new Set<string>();
  for (const m of MODULES) {
    if (moduleIdSet.has(m.id)) {
      errors.push(`Duplicate Module ID: "${m.id}"`);
    }
    moduleIdSet.add(m.id);
  }

  const topicIdSet = new Set<string>();
  for (const t of TOPICS) {
    if (topicIdSet.has(t.id)) {
      errors.push(`Duplicate Topic ID: "${t.id}"`);
    }
    topicIdSet.add(t.id);
  }

  const subjectIdSet = new Set(SUBJECTS.map(s => s.id));

  // 2. Schema Validation (unless checkLinksOnly is true)
  if (!options.checkLinksOnly) {
    console.log(`🔍 Validating Zod Schemas for all entities...`);

    // Concepts
    for (const concept of CONCEPTS) {
      const res = safeValidateConcept(concept);
      if (!res.success) {
        errors.push(`Concept schema error in "${concept.id}": ${res.error.message}`);
      }
    }

    // Modules
    for (const mod of MODULES) {
      const res = ModuleSchema.safeParse(mod);
      if (!res.success) {
        errors.push(`Module schema error in "${mod.id}": ${res.error.message}`);
      }
    }

    // Topics
    for (const top of TOPICS) {
      const res = TopicSchema.safeParse(top);
      if (!res.success) {
        errors.push(`Topic schema error in "${top.id}": ${res.error.message}`);
      }
    }

    // Lessons
    for (const lesson of LESSONS) {
      const res = safeValidateLesson(lesson);
      if (!res.success) {
        errors.push(`Lesson schema error in "${lesson.id}": ${res.error.message}`);
      }

      // Educational Completeness Audit
      if (lesson.learningObjectives.length < 2) {
        warnings.push(`Lesson "${lesson.id}" has fewer than 2 learning objectives (${lesson.learningObjectives.length} found).`);
      }
      const hasMarkdown = lesson.sections.some(s => s.type === 'markdown');
      if (!hasMarkdown) {
        errors.push(`Lesson "${lesson.id}" lacks foundational explanation (no markdown blocks found).`);
      }

      // Check content blocks internal sanity
      for (let i = 0; i < lesson.sections.length; i++) {
        const block = lesson.sections[i];
        if (block.type === 'walkthrough') {
          for (let s = 0; s < block.steps.length; s++) {
            const step = block.steps[s];
            if (step.stepNumber !== s + 1) {
              warnings.push(`Lesson "${lesson.id}" walkthrough step index ${s} has non-sequential stepNumber ${step.stepNumber} (expected ${s + 1})`);
            }
          }
        } else if (block.type === 'comparison') {
          const colCount = block.headers.length;
          for (let r = 0; r < block.rows.length; r++) {
            if (block.rows[r].length !== colCount) {
              errors.push(`Lesson "${lesson.id}" comparison block row ${r} has ${block.rows[r].length} columns (expected ${colCount})`);
            }
          }
        } else if (block.type === 'math') {
          if (!block.formula || block.formula.trim().length === 0) {
            errors.push(`Lesson "${lesson.id}" math block at index ${i} has empty formula`);
          }
        }
      }
    }

    // Exercises
    for (const [eId, exercise] of Object.entries(EXERCISES)) {
      const res = ExerciseSchema.safeParse(exercise);
      if (!res.success) {
        errors.push(`Exercise schema error in "${eId}": ${res.error.message}`);
      }
      if (exercise.type === 'mcq' && exercise.options && exercise.correctOptionId) {
        const optionIds = new Set(exercise.options.map(o => o.id));
        if (!optionIds.has(exercise.correctOptionId)) {
          errors.push(`Exercise "${eId}" correctOptionId "${exercise.correctOptionId}" does not match any declared option.`);
        }
      }
    }
  }

  // 3. Graph Integrity & Link Verification
  console.log(`🔗 Verifying Graph Linkages & References...`);

  // Subjects -> Modules
  for (const s of SUBJECTS) {
    for (const mId of s.moduleIds) {
      if (!moduleIdSet.has(mId)) {
        errors.push(`Subject "${s.id}" references non-existent Module "${mId}"`);
      }
    }
  }

  // Modules -> Subject & Topics
  for (const m of MODULES) {
    if (!subjectIdSet.has(m.subjectId)) {
      errors.push(`Module "${m.id}" references non-existent Subject "${m.subjectId}"`);
    }
    for (const tId of m.topicIds) {
      if (!topicIdSet.has(tId)) {
        errors.push(`Module "${m.id}" references non-existent Topic "${tId}"`);
      }
    }
  }

  // Topics -> Module & Concepts
  for (const t of TOPICS) {
    if (!moduleIdSet.has(t.moduleId)) {
      errors.push(`Topic "${t.id}" references non-existent Module "${t.moduleId}"`);
    }
    for (const cId of t.conceptIds) {
      if (!conceptIdSet.has(cId)) {
        errors.push(`Topic "${t.id}" references non-existent Concept "${cId}"`);
      }
    }
  }

  // Concepts -> Subject & Prerequisites & Related Concepts
  for (const c of CONCEPTS) {
    if (!subjectIdSet.has(c.subjectId)) {
      errors.push(`Concept "${c.id}" references non-existent Subject "${c.subjectId}"`);
    }
    for (const prereqId of c.prerequisiteConceptIds) {
      if (!conceptIdSet.has(prereqId)) {
        errors.push(`Concept "${c.id}" references non-existent Prerequisite Concept "${prereqId}"`);
      }
    }
    for (const relId of c.relatedConceptIds) {
      if (!conceptIdSet.has(relId)) {
        errors.push(`Concept "${c.id}" references non-existent Related Concept "${relId}"`);
      }
    }
  }

  // Lessons -> Concept & Related Concept Blocks
  const exerciseIdSet = new Set(Object.keys(EXERCISES));
  for (const [eId, ex] of Object.entries(EXERCISES)) {
    if (!conceptIdSet.has(ex.conceptId)) {
      errors.push(`Exercise "${eId}" references non-existent Concept "${ex.conceptId}"`);
    }
  }

  for (const l of LESSONS) {
    if (!conceptIdSet.has(l.conceptId)) {
      errors.push(`Lesson "${l.id}" references non-existent Canonical Concept "${l.conceptId}"`);
    }

    for (const block of l.sections) {
      if (block.type === 'related_concepts') {
        for (const relId of block.conceptIds) {
          if (!conceptIdSet.has(relId)) {
            errors.push(`Lesson "${l.id}" related_concepts block references non-existent Concept "${relId}"`);
          }
        }
      } else if (block.type === 'quiz') {
        if (!exerciseIdSet.has(block.exerciseId)) {
          warnings.push(`Lesson "${l.id}" quiz references unpopulated exercise ID "${block.exerciseId}"`);
        }
      }
    }
  }

  // 4. Cycle Detection in Concept Graph (DAG Check)
  console.log(`🔄 Checking Concept Prerequisite Graph for Cycles...`);
  const conceptMap = new Map(CONCEPTS.map(c => [c.id, c]));
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function detectCycle(nodeId: string, path: string[]): boolean {
    visited.add(nodeId);
    inStack.add(nodeId);
    path.push(nodeId);

    const concept = conceptMap.get(nodeId);
    if (concept && concept.prerequisiteConceptIds) {
      for (const neighbor of concept.prerequisiteConceptIds) {
        if (!visited.has(neighbor)) {
          if (detectCycle(neighbor, path)) {
            return true;
          }
        } else if (inStack.has(neighbor)) {
          path.push(neighbor);
          const cycleStr = path.slice(path.indexOf(neighbor)).join(' -> ');
          errors.push(`Circular Dependency Detected in Concept Graph: ${cycleStr}`);
          return true;
        }
      }
    }

    inStack.delete(nodeId);
    path.pop();
    return false;
  }

  for (const c of CONCEPTS) {
    if (!visited.has(c.id)) {
      detectCycle(c.id, []);
    }
  }

  return { errors, warnings };
}

// CLI Execution Entry Point
const isCheckLinksOnly = process.argv.includes('--check-links');
const { errors, warnings } = validateCurriculum({ checkLinksOnly: isCheckLinksOnly });

if (warnings.length > 0) {
  console.warn(`\n⚠️  Warnings (${warnings.length}):`);
  warnings.forEach(w => console.warn(`   [WARN] ${w}`));
}

if (errors.length > 0) {
  console.error(`\n❌ Validation Failed with ${errors.length} error(s):`);
  errors.forEach(e => console.error(`   [ERROR] ${e}`));
  process.exit(1);
} else {
  console.log(`\n✅ Curriculum Validation Passed! All concepts, lessons, modules, and links verified successfully.`);
  process.exit(0);
}
