import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Code2,
  Cpu,
  Terminal,
  Network,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { CONCEPTS } from '../../data/concepts';
import { LESSONS } from '../../data/lessons';
import { SUBJECTS } from '../../data/subjects';

export const ConceptView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const concept = CONCEPTS.find(c => c.id === id);

  // Initial selected language
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  if (!concept) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full w-max mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Concept Not Found</h2>
        <p className="text-sm text-slate-400">
          The canonical concept <code className="font-mono text-cyan-400">"{id}"</code> could not be located in the curriculum graph.
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

  const subject = SUBJECTS.find(s => s.id === concept.subjectId);
  const associatedLessons = LESSONS.filter(l => l.conceptId === concept.id || (concept.lessonIds && concept.lessonIds.includes(l.id)));
  const implementations = concept.implementations || [];

  const activeLang = selectedLang || (implementations[0]?.languageId ?? null);
  const currentImpl = implementations.find(i => i.languageId === activeLang) || implementations[0];

  const handleOpenPlaygroundWithCode = (code: string, language: string) => {
    navigate('/labs/code', {
      state: {
        code,
        language: language.toLowerCase() === 'python' ? 'python' : language.toLowerCase() === 'cpp' ? 'cpp' : 'c',
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
        <Link to="/explore" className="hover:text-slate-200 transition">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-slate-300 capitalize">{subject?.title || concept.subjectId}</span>
        <span>/</span>
        <span className="text-cyan-400 font-semibold">{concept.id}</span>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-semibold uppercase">
              Canonical Concept
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-mono capitalize">
              {concept.difficulty}
            </span>
          </div>

          <span className="font-mono text-xs text-slate-500">
            ID: <span className="text-slate-400">{concept.id}</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
          {concept.title}
        </h1>

        <p className="text-base text-slate-300 leading-relaxed max-w-4xl font-normal">
          {concept.description}
        </p>

        {/* Prerequisites */}
        {concept.prerequisiteConceptIds && concept.prerequisiteConceptIds.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Prerequisites:</span>
            {concept.prerequisiteConceptIds.map(prereqId => {
              const prereq = CONCEPTS.find(c => c.id === prereqId);
              return (
                <Link
                  key={prereqId}
                  to={`/concepts/${prereqId}`}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
                >
                  <Network className="w-3 h-3 text-cyan-400" />
                  <span>{prereq?.title || prereqId}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Learning Objectives */}
      {concept.learningObjectives && concept.learningObjectives.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/90 space-y-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Key Learning Objectives</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {concept.learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Language Implementation Comparison */}
      {implementations.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase font-mono text-cyan-400">
                <Layers className="w-4 h-4" />
                <span>Language-Independent Architecture</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                Cross-Language Implementation Comparison
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Observe how the same canonical concept is materialized across different runtime architectures, compilers, and memory models.
              </p>
            </div>

            {/* Language Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800/90">
              {implementations.map(impl => {
                const isSelected = impl.languageId === activeLang;
                return (
                  <button
                    key={impl.languageId}
                    onClick={() => setSelectedLang(impl.languageId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span className="uppercase">{impl.languageId}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentImpl && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-200">
                    {currentImpl.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{currentImpl.summary}</p>
                </div>
                <button
                  onClick={() => handleOpenPlaygroundWithCode(currentImpl.codeSnippet, currentImpl.languageId)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Launch in Lab</span>
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span className="uppercase font-semibold text-blue-400">
                    {currentImpl.languageId} Syntax & Idioms
                  </span>
                  <span>Read-Only Snippet</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{currentImpl.codeSnippet}</code>
                </pre>
              </div>

              {/* Memory Semantics & Tradeoffs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
                    <Cpu className="w-4 h-4" />
                    <span>Memory & Runtime Model</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentImpl.memorySemantics}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
                    <Terminal className="w-4 h-4" />
                    <span>Language-Specific Mechanics & Differences</span>
                  </div>
                  <ul className="space-y-1.5">
                    {currentImpl.keyDifferences.map((diff, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <span className="text-cyan-400 font-bold leading-none mt-1">•</span>
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Associated Lessons in Curriculum */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Curriculum Lessons for This Concept</span>
        </h3>

        {associatedLessons.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 text-center text-xs text-slate-400">
            No interactive lessons currently assigned to this concept.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {associatedLessons.map(lesson => (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.id}`}
                className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 transition flex items-center justify-between cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                    <span className="uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      {lesson.languageId ? lesson.languageId.toUpperCase() : 'CORE CS'}
                    </span>
                    <span>•</span>
                    <span>{lesson.estimatedMinutes} mins</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-300 transition">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{lesson.summary}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0 ml-4 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Related Concepts */}
      {concept.relatedConceptIds && concept.relatedConceptIds.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>Connected Concepts in Knowledge Graph</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {concept.relatedConceptIds.map(relId => {
              const rel = CONCEPTS.find(c => c.id === relId);
              return (
                <Link
                  key={relId}
                  to={`/concepts/${relId}`}
                  className="p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-1 group cursor-pointer"
                >
                  <span className="text-[10px] font-mono uppercase text-slate-500">
                    {rel?.subjectId || 'Concept'}
                  </span>
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                    {rel?.title || relId}
                  </h5>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {rel?.description || ''}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
