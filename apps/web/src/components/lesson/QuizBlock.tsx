import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { EXERCISES } from '../../data/quizzes';
import { useProgress } from '../../context/ProgressContext';

interface QuizBlockProps {
  exerciseId: string;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({ exerciseId }) => {
  const exercise = EXERCISES[exerciseId];
  const { recordQuizScore, quizScores } = useProgress();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!exercise) {
    return null;
  }

  const existingAttempt = quizScores[exerciseId];
  const isCorrect = submitted && selectedOption === exercise.correctOptionId;

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);
    const passed = selectedOption === exercise.correctOptionId;
    recordQuizScore(exerciseId, passed);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <div className="my-8 rounded-xl border border-blue-500/30 bg-[#0E1526] p-6 shadow-xl">
      <div className="flex items-center space-x-2.5 mb-4">
        <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md">
          <HelpCircle className="w-4 h-4" />
        </div>
        <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
          Concept Check • {exercise.type.replace('_', ' ')}
        </span>
      </div>

      <h4 className="text-base font-semibold text-slate-100 mb-3">{exercise.question}</h4>

      {exercise.codeSnippet && (
        <div className="p-3.5 bg-[#0A0F1D] rounded-lg border border-slate-800 font-mono text-xs text-slate-200 mb-4 overflow-x-auto">
          <pre>{exercise.codeSnippet.code}</pre>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2.5 mb-5">
        {exercise.options?.map(opt => {
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
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold font-mono ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCorrect ? '✓ CORRECT ANSWER' : '✗ INCORRECT'}
            </span>
            <button onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-200 underline">
              Try Again
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{exercise.explanation}</p>
        </div>
      )}
    </div>
  );
};
