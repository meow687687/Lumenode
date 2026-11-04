import {
  NormalizedGainResult,
  ConceptAssessmentSession,
  EvaluatedQuestionResponse,
  QuestionConfidenceLevel,
} from '@lumenode/shared-types';

const CONFIDENCE_WEIGHTS: Record<QuestionConfidenceLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Calculates Hake's Normalized Learning Gain (g):
 * g = (postScore - preScore) / (100 - preScore)
 * 
 * When preScore == 100, if postScore == 100, g = 1.0 (perfect mastery sustained).
 * If learner regresses (postScore < preScore), g is negative.
 */
export function calculateNormalizedGain(
  conceptId: string,
  preSession: ConceptAssessmentSession,
  postSession: ConceptAssessmentSession,
  retentionSession?: ConceptAssessmentSession
): NormalizedGainResult {
  const preScore = preSession.scorePercent;
  const postScore = postSession.scorePercent;

  let normalizedGain = 0;
  if (preScore >= 100) {
    normalizedGain = postScore >= 100 ? 1.0 : (postScore - 100) / 100;
  } else {
    normalizedGain = (postScore - preScore) / (100 - preScore);
  }

  // Round to 3 decimal places
  normalizedGain = Math.round(normalizedGain * 1000) / 1000;

  // Determine effect category according to Hake (1998)
  // High gain: g >= 0.7
  // Medium gain: 0.3 <= g < 0.7
  // Low gain: 0 <= g < 0.3
  // Negative: g < 0
  let effectCategory: NormalizedGainResult['effectCategory'] = 'low_gain';
  if (normalizedGain >= 0.7) {
    effectCategory = 'high_gain';
  } else if (normalizedGain >= 0.3) {
    effectCategory = 'medium_gain';
  } else if (normalizedGain >= 0) {
    effectCategory = 'low_gain';
  } else {
    effectCategory = 'negative';
  }

  // Calculate confidence shift
  const preAvgConf = averageConfidence(preSession.responses);
  const postAvgConf = averageConfidence(postSession.responses);
  const confidenceShift = Math.round((postAvgConf - preAvgConf) * 100) / 100;

  let normalizedRetentionLoss: number | undefined;
  if (retentionSession) {
    const retentionScore = retentionSession.scorePercent;
    if (postScore > 0) {
      normalizedRetentionLoss = Math.round(((postScore - retentionScore) / postScore) * 1000) / 1000;
    } else {
      normalizedRetentionLoss = 0;
    }
  }

  return {
    conceptId,
    preScore,
    postScore,
    retentionScore: retentionSession?.scorePercent,
    normalizedGain,
    normalizedRetentionLoss,
    confidenceShift,
    effectCategory,
  };
}

function averageConfidence(responses: EvaluatedQuestionResponse[]): number {
  if (!responses.length) return 0;
  const total = responses.reduce((acc, r) => acc + (CONFIDENCE_WEIGHTS[r.confidence] || 2), 0);
  return total / responses.length;
}

const STORAGE_PREFIX = 'lumenode_effectiveness_';

export function saveAssessmentSession(session: ConceptAssessmentSession): void {
  try {
    const key = `${STORAGE_PREFIX}${session.conceptId}_${session.stage}`;
    localStorage.setItem(key, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to persist assessment session to localStorage:', e);
  }
}

export function getAssessmentSession(
  conceptId: string,
  stage: ConceptAssessmentSession['stage']
): ConceptAssessmentSession | null {
  try {
    const key = `${STORAGE_PREFIX}${conceptId}_${stage}`;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ConceptAssessmentSession) : null;
  } catch {
    return null;
  }
}

export function getConceptEffectiveness(conceptId: string): NormalizedGainResult | null {
  const pre = getAssessmentSession(conceptId, 'pre_assessment');
  const post = getAssessmentSession(conceptId, 'post_assessment');
  const ret = getAssessmentSession(conceptId, 'retention_assessment');

  if (!pre || !post) return null;
  return calculateNormalizedGain(conceptId, pre, post, ret || undefined);
}
