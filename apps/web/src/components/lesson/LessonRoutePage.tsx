import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LESSONS } from '../../data/lessons';
import { LessonRenderer } from './LessonRenderer';
import { safeValidateLesson } from '@lumenode/shared-types';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { analytics } from '../../services/telemetry/analyticsService';

export const LessonRoutePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      analytics.track('lesson_opened', { lessonId: id });
    }
  }, [id]);

  const rawLesson = LESSONS.find(l => l.id === id);

  if (!rawLesson) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full w-max mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Lesson Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested lesson identifier <code className="font-mono text-cyan-400">"{id}"</code> does not exist in the curriculum catalog.
        </p>
        <div className="pt-4">
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  // Runtime Zod Schema Validation
  const validation = safeValidateLesson(rawLesson);
  if (!validation.success) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 space-y-3 font-mono text-xs">
          <div className="flex items-center space-x-2 font-bold text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>[Schema Validation Failure]: Malformed Lesson Data</span>
          </div>
          <p>Lesson "{rawLesson.id}" failed runtime Zod schema parsing:</p>
          <pre className="p-3 bg-black/50 rounded overflow-x-auto text-[11px] text-rose-300">
            {JSON.stringify(validation.error.format(), null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const lesson = validation.data;
  const currentIndex = LESSONS.findIndex(l => l.id === id);

  const handleNavigateLesson = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      navigate(`/lessons/${LESSONS[currentIndex - 1].id}`);
    } else if (direction === 'next' && currentIndex < LESSONS.length - 1) {
      navigate(`/lessons/${LESSONS[currentIndex + 1].id}`);
    }
  };

  const handleOpenPlaygroundWithCode = (code: string, language: string) => {
    navigate('/labs/code', {
      state: {
        code,
        language: language.toLowerCase() === 'python' ? 'python' : language.toLowerCase() === 'cpp' ? 'cpp' : 'c',
      },
    });
  };

  return (
    <LessonRenderer
      lesson={lesson}
      onNavigateLesson={handleNavigateLesson}
      onOpenPlaygroundWithCode={handleOpenPlaygroundWithCode}
    />
  );
};
