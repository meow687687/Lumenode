import React, { useState } from 'react';
import { Award, BookOpen, Layers } from 'lucide-react';
import { EXERCISES } from '../../data/quizzes';
import { QuizBlock } from '../lesson/QuizBlock';
import { useProgress } from '../../context/ProgressContext';
import { CONCEPT_EFFECTIVENESS_ASSESSMENTS } from '../../data/learningEffectiveness';
import { LearningCycleCard } from '../effectiveness/LearningCycleCard';

export const PracticeView: React.FC = () => {
  const { quizScores } = useProgress();
  const [activeTab, setActiveTab] = useState<'effectiveness' | 'exercises'>('effectiveness');
  const exerciseList = Object.values(EXERCISES);
  const assessmentList = Object.values(CONCEPT_EFFECTIVENESS_ASSESSMENTS);

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
            Measure learning gains, complete 6-stage concept mastery cycles, and test systems reasoning.
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

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab('effectiveness')}
          className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'effectiveness'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          6-Stage Learning Cycles ({assessmentList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exercises')}
          className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'exercises'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          All Concept Exercises ({exerciseList.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'effectiveness' ? (
        <div className="space-y-4">
          <div className="p-4 bg-sky-950/20 border border-sky-800/30 rounded-xl text-xs text-sky-300">
            <span className="font-bold">Pedagogical Framework:</span> Each concept guides you through a 6-stage cycle: Pre-assessment &rarr; Guided lesson &rarr; Interactive simulation &rarr; Practice &rarr; Post-assessment &rarr; 14-day retention check. Hake&apos;s normalized gain (<span className="font-mono">g</span>) objectively measures your conceptual understanding.
          </div>
          {assessmentList.map((pair) => (
            <LearningCycleCard key={pair.conceptId} assessmentPair={pair} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {exerciseList.map(ex => (
            <QuizBlock key={ex.id} exerciseId={ex.id} />
          ))}
        </div>
      )}
    </div>
  );
};
