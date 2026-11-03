import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { EXERCISES } from '../../data/quizzes';
import { useProgress } from '../../context/ProgressContext';
import { AssessmentEngine } from '../../services/assessment/assessmentEngine';

interface QuizBlockProps {
  exerciseId: string;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({ exerciseId }) => {
  const exercise = EXERCISES[exerciseId];
  const { recordExerciseAttempt } = useProgress();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<ReturnType<typeof AssessmentEngine.evaluate> | null>(null);

  if (!exercise) {
    return null;
  }

  const handleSubmit = () => {
    if (!selectedOption) return;
    const res = AssessmentEngine.evaluate(exercise, {
      exerciseId,
      selectedOptionId: selectedOption,
      hintsRevealedCount: hintsRevealed,
    });
    setEvaluation(res);
    setSubmitted(true);

    recordExerciseAttempt(exercise.conceptId, {
      exerciseId,
      type: exercise.type,
      passed: res.isCorrect,
      score: res.score,
      hintsUsed: hintsRevealed,
      feedback: res.feedback,
      userAnswer: selectedOption,
    });
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setEvaluation(null);
  };

  const handleRevealHint = () => {
    if (exercise.hints && hintsRevealed < exercise.hints.length) {
      setHintsRevealed((prev) => prev + 1);
    }
  };

  return (
    <div className="my-8 rounded-xl border border-blue-500/30 bg-[#0E1526] p-6 shadow-xl text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md">
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
            Concept Check • {exercise.type.replace('_', ' ')}
          </span>
        </div>

        {/* Hint button */}
        {!submitted && exercise.hints && exercise.hints.length > 0 && (
          <button
            onClick={handleRevealHint}
            disabled={hintsRevealed >= exercise.hints.length}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-40"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>
              {hintsRevealed === 0 ? 'Need a hint?' : `Hint (${hintsRevealed}/${exercise.hints.length})`}
            </span>
          </button>
        )}
      </div>

      <h4 className="text-base font-semibold text-slate-100 mb-3">{exercise.question}</h4>

      {exercise.codeSnippet && (
        <div className="p-3.5 bg-[#0A0F1D] rounded-lg border border-slate-800 font-mono text-xs text-slate-200 mb-4 overflow-x-auto">
          <pre>{exercise.codeSnippet.code}</pre>
        </div>
      )}

      {/* Hints display */}
      {hintsRevealed > 0 && exercise.hints && (
        <div className="space-y-1.5 mb-4">
          {exercise.hints.slice(0, hintsRevealed).map((h, i) => (
            <div key={i} className="rounded border-l-2 border-amber-500 bg-amber-950/30 p-2.5 text-xs text-amber-200">
              <strong className="text-amber-300">Hint {i + 1}: </strong>
              {h}
            </div>
          ))}
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2.5 mb-5">
        {exercise.options?.map((opt) => {
          const isSelected = selectedOption === opt.id;
          let borderClass = 'border-slate-800 bg-slate-900/60 hover:border-slate-700';

          if (submitted) {
            if (opt.id === exercise.correctOptionId) {
              borderClass = 'border-emerald-500 bg-emerald-950/30 text-emerald-200';
            } else if (isSelected) {
              borderClass = 'border-rose-500 bg-rose-950/30 text-rose-200';
            }
          } else if (isSelected) {
            borderClass = 'border-blue-500 bg-blue-950/40 text-blue-200';
          }

          return (
            <div
              key={opt.id}
              onClick={() => !submitted && setSelectedOption(opt.id)}
              className={`p-3.5 rounded-lg border text-sm cursor-pointer transition flex items-center justify-between ${borderClass}`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-xs font-mono">
                  {opt.id.slice(-1)}
                </span>
                <span className="font-medium text-slate-200">{opt.text}</span>
              </div>
              {submitted && opt.id === exercise.correctOptionId && (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {submitted && isSelected && opt.id !== exercise.correctOptionId && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Action / Results */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Verify Answer</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div
            className={`p-4 rounded-lg border text-xs leading-relaxed ${
              evaluation?.isCorrect
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1.5 text-sm">
              <span>{evaluation?.isCorrect ? 'Correct!' : 'Incorrect'}</span>
              <span className="font-mono text-xs">
                Score: {evaluation?.score} / 100 {hintsRevealed > 0 && `(${hintsRevealed} hint penalty)`}
              </span>
            </div>
            <p className="mb-2 text-slate-200">{evaluation?.feedback}</p>
            <p className="text-slate-400 text-[11px] border-t border-slate-800/80 pt-2">
              <strong className="text-slate-300">Explanation: </strong>
              {evaluation?.explanation}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
