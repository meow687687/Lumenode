import React from 'react';
import { CheckCircle2, Bookmark, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Lesson } from '../../types';
import { CodeBlock } from './CodeBlock';
import { Callout } from './Callout';
import { ComparisonTable } from './ComparisonTable';
import { QuizBlock } from './QuizBlock';
import { DSAVisualizer } from '../visualizers/DSAVisualizer';
import { MemorySimulator } from '../visualizers/MemorySimulator';
import { SQLPlayground } from '../laboratories/SQLPlayground';
import { useProgress } from '../../context/ProgressContext';

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
                  url: `#lesson-${lesson.id}`,
                })
              }
              className={`p-2 rounded-lg border transition ${
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
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
        <p className="text-base text-slate-400 leading-relaxed">{lesson.summary}</p>
      </div>

      {/* Render Structured Content Blocks */}
      <div className="space-y-6">
        {lesson.sections.map((section, idx) => {
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
              return null;

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

            case 'quiz':
              return <QuizBlock key={idx} exerciseId={section.exerciseId} />;

            default:
              return null;
          }
        })}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => onNavigateLesson && onNavigateLesson('prev')}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Lesson</span>
        </button>

        <button
          onClick={() => onNavigateLesson && onNavigateLesson('next')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white transition shadow-lg shadow-blue-600/20"
        >
          <span>Next Lesson</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
