import React, { useState } from 'react';
import {
  ConceptAssessmentPair,
} from '../../data/learningEffectiveness';
import {
  ConceptAssessmentSession,
  EvaluatedQuestionResponse,
  QuestionConfidenceLevel,
  NormalizedGainResult,
} from '@lumenode/shared-types';
import {
  calculateNormalizedGain,
  getAssessmentSession,
  saveAssessmentSession,
} from '../../services/learningEffectivenessEngine';

interface LearningCycleCardProps {
  assessmentPair: ConceptAssessmentPair;
}

export const LearningCycleCard: React.FC<LearningCycleCardProps> = ({ assessmentPair }) => {
  const { conceptId, conceptTitle, lessonId, labRoute, preQuestions, postQuestions, retentionQuestions } = assessmentPair;

  const [preSession, setPreSession] = useState<ConceptAssessmentSession | null>(() =>
    getAssessmentSession(conceptId, 'pre_assessment')
  );
  const [postSession, setPostSession] = useState<ConceptAssessmentSession | null>(() =>
    getAssessmentSession(conceptId, 'post_assessment')
  );
  const [retentionSession, setRetentionSession] = useState<ConceptAssessmentSession | null>(() =>
    getAssessmentSession(conceptId, 'retention_assessment')
  );

  const [activeStage, setActiveStage] = useState<'idle' | 'pre' | 'post' | 'retention'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [confidences, setConfidences] = useState<QuestionConfidenceLevel[]>([]);

  const questions =
    activeStage === 'pre'
      ? preQuestions
      : activeStage === 'post'
      ? postQuestions
      : retentionQuestions;

  const handleStart = (stage: 'pre' | 'post' | 'retention') => {
    setActiveStage(stage);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setConfidences([]);
  };

  const handleAnswer = (optionIndex: number, confidence: QuestionConfidenceLevel) => {
    const nextAnswers = [...selectedAnswers, optionIndex];
    const nextConfidences = [...confidences, confidence];
    setSelectedAnswers(nextAnswers);
    setConfidences(nextConfidences);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed current assessment
      const responses: EvaluatedQuestionResponse[] = questions.map((q, idx) => ({
        questionId: q.id,
        selectedOptionIndex: nextAnswers[idx],
        isCorrect: nextAnswers[idx] === q.correctIndex,
        confidence: nextConfidences[idx] || 'medium',
        timeSpentMs: 3000,
      }));

      const correctCount = responses.filter((r) => r.isCorrect).length;
      const scorePercent = Math.round((correctCount / questions.length) * 100);

      const session: ConceptAssessmentSession = {
        id: `sess-${Date.now()}`,
        conceptId,
        stage:
          activeStage === 'pre'
            ? 'pre_assessment'
            : activeStage === 'post'
            ? 'post_assessment'
            : 'retention_assessment',
        scorePercent,
        completedAt: Date.now(),
        responses,
      };

      saveAssessmentSession(session);
      if (activeStage === 'pre') setPreSession(session);
      else if (activeStage === 'post') setPostSession(session);
      else if (activeStage === 'retention') setRetentionSession(session);

      setActiveStage('idle');
    }
  };

  let gainResult: NormalizedGainResult | null = null;
  if (preSession && postSession) {
    gainResult = calculateNormalizedGain(conceptId, preSession, postSession, retentionSession || undefined);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
            6-Stage Learning Cycle
          </span>
          <h3 className="text-lg font-bold text-slate-100">{conceptTitle}</h3>
        </div>
        {gainResult && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                gainResult.effectCategory === 'high_gain'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : gainResult.effectCategory === 'medium_gain'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              Hake Gain (g): {gainResult.normalizedGain} ({gainResult.effectCategory.replace('_', ' ')})
            </span>
          </div>
        )}
      </div>

      {/* Progress Flow Steps */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4 text-xs text-center">
        <div
          className={`p-2 rounded border ${
            preSession
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <div className="font-semibold">1. Pre-Assessment</div>
          <div>{preSession ? `${preSession.scorePercent}%` : 'Pending'}</div>
        </div>

        <a
          href={`/lessons/${lessonId}`}
          className="p-2 rounded border bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 transition-colors"
        >
          <div className="font-semibold">2. Guided Lesson</div>
          <div className="text-sky-400 underline">Open Lesson</div>
        </a>

        {labRoute ? (
          <a
            href={labRoute}
            className="p-2 rounded border bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 transition-colors"
          >
            <div className="font-semibold">3. Interactive Lab</div>
            <div className="text-emerald-400 underline">Open Lab</div>
          </a>
        ) : (
          <div className="p-2 rounded border bg-slate-800 border-slate-700 text-slate-400">
            <div className="font-semibold">3. Visualizer</div>
            <div>Integrated</div>
          </div>
        )}

        <div className="p-2 rounded border bg-slate-800 border-slate-700 text-slate-300">
          <div className="font-semibold">4. Practice</div>
          <div>Exercises</div>
        </div>

        <div
          className={`p-2 rounded border ${
            postSession
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <div className="font-semibold">5. Post-Assessment</div>
          <div>{postSession ? `${postSession.scorePercent}%` : 'Pending'}</div>
        </div>

        <div
          className={`p-2 rounded border ${
            retentionSession
              ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <div className="font-semibold">6. Retention (14d)</div>
          <div>{retentionSession ? `${retentionSession.scorePercent}%` : 'Pending'}</div>
        </div>
      </div>

      {/* Active Assessment Form */}
      {activeStage !== 'idle' ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>
              {activeStage.toUpperCase()} QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            <button
              onClick={() => setActiveStage('idle')}
              className="text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <p className="text-sm font-medium text-slate-200 mb-3">{questions[currentIndex].prompt}</p>

          {questions[currentIndex].codeSnippet && (
            <pre className="bg-slate-900 border border-slate-800 text-sky-300 p-2.5 rounded font-mono text-xs mb-3 overflow-x-auto">
              {questions[currentIndex].codeSnippet}
            </pre>
          )}

          <div className="space-y-2 mb-4">
            {questions[currentIndex].options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAnswer(optIdx, 'high')}
                  className="w-full text-left p-2.5 rounded text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
                >
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                  {opt}
                </button>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 text-right">
            Click an option above to answer and advance.
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/60">
          {!preSession && (
            <button
              onClick={() => handleStart('pre')}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
            >
              Start Pre-Assessment
            </button>
          )}
          {preSession && !postSession && (
            <button
              onClick={() => handleStart('post')}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Take Post-Assessment
            </button>
          )}
          {preSession && postSession && (
            <>
              <button
                onClick={() => handleStart('retention')}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                {retentionSession ? 'Retake Retention Check' : 'Take 14-Day Retention Check'}
              </button>
              <button
                onClick={() => handleStart('pre')}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
              >
                Reset Pre-Test
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
