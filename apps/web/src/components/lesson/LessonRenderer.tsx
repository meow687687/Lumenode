import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Bookmark,
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertOctagon,
  Target,
  Code2,
} from 'lucide-react';
import { Lesson, ContentBlock } from '../../types';
import { CodeBlock } from './CodeBlock';
import { Callout } from './Callout';
import { ComparisonTable } from './ComparisonTable';
import { QuizBlock } from './QuizBlock';
import { WalkthroughBlock } from './WalkthroughBlock';
import { MathBlock } from './MathBlock';
import { RelatedConceptsBlock } from './RelatedConceptsBlock';
import { ReferencesBlock } from './ReferencesBlock';
import { DSAVisualizer } from '../visualizers/DSAVisualizer';
import { MemorySimulator } from '../visualizers/MemorySimulator';
import { SQLPlayground } from '../laboratories/SQLPlayground';
import { useProgress } from '../../context/ProgressContext';
import { CONCEPTS } from '../../data/concepts';

interface LessonRendererProps {
  lesson: Lesson;
  onNavigateLesson?: (direction: 'prev' | 'next') => void;
  onOpenPlaygroundWithCode?: (code: string, language: string) => void;
}

export const LessonRenderer: React.FC<LessonRendererProps> = ({
  lesson,
  onNavigateLesson,
  onOpenPlaygroundWithCode,
}) => {
  const { completedLessons, markLessonComplete, toggleBookmark, isBookmarked } = useProgress();
  const isCompleted = completedLessons.has(lesson.id);
  const bookmarked = isBookmarked(lesson.id);

  const renderBlock = (section: ContentBlock, idx: number) => {
    switch (section.type) {
      case 'heading': {
        if (section.level === 1) {
          return (
            <h1 key={idx} className="font-bold tracking-tight text-slate-100 mt-8 mb-4 border-b border-slate-800/80 pb-2 text-2xl">
              {section.text}
            </h1>
          );
        }
        if (section.level === 2) {
          return (
            <h2 key={idx} className="font-bold tracking-tight text-slate-100 mt-8 mb-4 border-b border-slate-800/80 pb-2 text-xl">
              {section.text}
            </h2>
          );
        }
        if (section.level === 3) {
          return (
            <h3 key={idx} className="font-semibold tracking-tight text-slate-100 mt-6 mb-3 text-lg">
              {section.text}
            </h3>
          );
        }
        return (
          <h4 key={idx} className="font-semibold text-slate-100 mt-4 mb-2 text-base">
            {section.text}
          </h4>
        );
      }

      case 'markdown':
        return (
          <div
            key={idx}
            className="text-slate-300 leading-relaxed text-base space-y-4 font-sans font-normal"
          >
            <p>{section.content}</p>
          </div>
        );

      case 'code':
        return (
          <CodeBlock
            key={idx}
            language={section.language}
            code={section.code}
            title={section.title}
            executable={section.executable}
            onExecute={onOpenPlaygroundWithCode}
          />
        );

      case 'visualization':
        if (section.visualizerType === 'dsa') {
          return (
            <div key={idx} className="my-8">
              <DSAVisualizer />
            </div>
          );
        }
        if (section.visualizerType === 'memory') {
          return (
            <div key={idx} className="my-8">
              <MemorySimulator />
            </div>
          );
        }
        if (section.visualizerType === 'sql') {
          return (
            <div key={idx} className="my-8">
              <SQLPlayground />
            </div>
          );
        }
        return (
          <div key={idx} className="my-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-mono">
            Custom visualization [{section.visualizerType}] configured.
          </div>
        );

      case 'callout':
        return (
          <Callout
            key={idx}
            variant={section.variant}
            title={section.title}
            content={section.content}
          />
        );

      case 'comparison':
        return (
          <ComparisonTable
            key={idx}
            title={section.title}
            headers={section.headers}
            rows={section.rows}
          />
        );

      case 'walkthrough':
        return <WalkthroughBlock key={idx} block={section} />;

      case 'math':
        return <MathBlock key={idx} block={section} />;

      case 'related_concepts':
        return <RelatedConceptsBlock key={idx} block={section} />;

      case 'references':
        return <ReferencesBlock key={idx} block={section} />;

      case 'exercise':
        return (
          <div key={idx} className="my-6 p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                Hands-on Exercise
              </span>
              <h5 className="text-sm font-bold text-slate-100">
                {section.title || `Interactive Challenge: ${section.exerciseId}`}
              </h5>
              <p className="text-xs text-slate-400">
                Apply what you have learned by completing the associated coding challenge.
              </p>
            </div>
            <Link
              to="/labs/code"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Launch Lab</span>
            </Link>
          </div>
        );

      case 'quiz':
        return <QuizBlock key={idx} exerciseId={section.exerciseId} />;

      default:
        // Visible authoring fallback instead of silent drop
        return (
          <div key={idx} className="my-4 p-4 rounded-xl border border-rose-800/80 bg-rose-950/30 text-rose-300 text-xs font-mono flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
            <span>[Authoring Error]: Unrecognized lesson block type at index {idx}: {JSON.stringify(section)}</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header & Meta */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-semibold">
              {lesson.languageId ? lesson.languageId.toUpperCase() : 'CORE CS'}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {lesson.estimatedMinutes} mins
            </span>
            <span>•</span>
            <span className="capitalize text-slate-300 font-medium">Difficulty: {lesson.difficulty}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                toggleBookmark({
                  id: lesson.id,
                  type: 'lesson',
                  title: lesson.title,
                  url: `/lessons/${lesson.id}`,
                })
              }
              className={`p-2 rounded-lg border transition cursor-pointer ${
                bookmarked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => markLessonComplete(lesson.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100 mb-3">
          {lesson.title}
        </h1>
        <p className="text-base text-slate-400 leading-relaxed mb-4">{lesson.summary}</p>

        {/* Canonical Concept Link */}
        {(() => {
          const concept = CONCEPTS.find(c => c.id === lesson.conceptId);
          return (
            <div className="mt-4 p-3.5 rounded-xl border border-blue-500/30 bg-blue-950/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Canonical Concept:</span>
                <span className="font-semibold text-slate-200">
                  {concept ? concept.title : lesson.conceptId}
                </span>
                {concept && concept.implementations && concept.implementations.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                    {concept.implementations.length} Languages
                  </span>
                )}
              </div>
              <Link
                to={`/concepts/${lesson.conceptId}`}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
              >
                <span>Compare Language Implementations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })()}

        {/* Learning Objectives */}
        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <div className="mt-4 p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Learning Objectives</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {lesson.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold leading-none mt-1">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Render Structured Content Blocks */}
      <div className="space-y-6">
        {lesson.sections.map((section, idx) => renderBlock(section, idx))}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => onNavigateLesson && onNavigateLesson('prev')}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Lesson</span>
        </button>

        <button
          onClick={() => onNavigateLesson && onNavigateLesson('next')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white transition shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <span>Next Lesson</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
