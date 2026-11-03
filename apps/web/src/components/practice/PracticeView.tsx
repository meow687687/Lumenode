import React from 'react';
import { Award } from 'lucide-react';
import { EXERCISES } from '../../data/quizzes';
import { QuizBlock } from '../lesson/QuizBlock';
import { useProgress } from '../../context/ProgressContext';

export const PracticeView: React.FC = () => {
  const { quizScores } = useProgress();
  const exerciseList = Object.values(EXERCISES);

  const passedCount = Object.values(quizScores).filter(q => q.passed).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Practice & Concept Verification
          </h1>
          <p className="text-sm text-slate-400">
            Interactive MCQs, output predictions, and systems reasoning challenges.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <span className="font-mono font-bold text-slate-100">{passedCount}</span>
            <span className="text-slate-400"> / {exerciseList.length} Solved</span>
          </div>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-6">
        {exerciseList.map(ex => (
          <QuizBlock key={ex.id} exerciseId={ex.id} />
        ))}
      </div>
    </div>
  );
};
