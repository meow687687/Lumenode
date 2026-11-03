import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Terminal, 
  Cpu, 
  Code2, 
  Network, 
  Layers, 
  Boxes, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Bookmark, 
  Award,
  Zap,
  Sparkles
} from 'lucide-react';
import { SUBJECTS } from '../../data/subjects';
import { LESSONS } from '../../data/lessons';
import { useProgress } from '../../context/ProgressContext';

export const DashboardView: React.FC = () => {
  const { completedLessons, bookmarks, activeLessonId } = useProgress();
  const navigate = useNavigate();
  const currentLesson = LESSONS.find(l => l.id === activeLessonId) || LESSONS[0];

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-5 h-5 text-blue-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'Network': return <Network className="w-5 h-5 text-violet-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-amber-400" />;
      case 'Boxes': return <Boxes className="w-5 h-5 text-rose-400" />;
      case 'Database': return <Database className="w-5 h-5 text-emerald-400" />;
      default: return <Terminal className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {/* Hero / Continue Learning Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0E1526] to-[#0A0F1D] border border-blue-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Lumenode v0.1 • Interactive CS Learning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore. Understand. Build.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Bridge theoretical computer science and practical systems programming through real code execution, 
            interactive memory maps, and step-by-step algorithm laboratories.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to={`/lessons/${currentLesson.id}`}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume: {currentLesson.title.split(':')[0]}</span>
            </Link>

            <Link
              to="/labs/dsa"
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Open Visual Labs</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Progress Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-100">{completedLessons.size}</div>
            <div className="text-xs text-slate-400">Completed Lessons</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-100">{LESSONS.length}</div>
            <div className="text-xs text-slate-400">Curated Initial Lessons</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-100">{bookmarks.length}</div>
            <div className="text-xs text-slate-400">Bookmarked Concepts</div>
          </div>
        </div>
      </div>

      {/* Interactive Laboratories Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Interactive Laboratories</h2>
            <p className="text-xs text-slate-400">Real in-browser engines and step-by-step visualizations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/labs/dsa"
            className="p-5 rounded-xl bg-[#111827] border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group"
          >
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg w-max mb-3 group-hover:scale-105 transition">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-blue-400 transition">
              DSA Visualizer
            </h3>
            <p className="text-xs text-slate-400 mb-3">Linked lists, binary search & step traversal.</p>
            <span className="text-[11px] font-mono text-blue-400 flex items-center group-hover:translate-x-1 transition">
              Launch Lab <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </Link>

          <Link
            to="/labs/memory"
            className="p-5 rounded-xl bg-[#111827] border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer group"
          >
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg w-max mb-3 group-hover:scale-105 transition">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-cyan-400 transition">
              Memory & Pointer Sim
            </h3>
            <p className="text-xs text-slate-400 mb-3">Stack frames, heap blocks & address dereferencing.</p>
            <span className="text-[11px] font-mono text-cyan-400 flex items-center group-hover:translate-x-1 transition">
              Launch Lab <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </Link>

          <Link
            to="/labs/sql"
            className="p-5 rounded-xl bg-[#111827] border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group"
          >
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg w-max mb-3 group-hover:scale-105 transition">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-emerald-400 transition">
              SQL Playground
            </h3>
            <p className="text-xs text-slate-400 mb-3">Genuine SQLite WASM relational join sandbox.</p>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center group-hover:translate-x-1 transition">
              Launch Lab <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </Link>

          <Link
            to="/labs/code"
            className="p-5 rounded-xl bg-[#111827] border border-slate-800 hover:border-violet-500/50 transition cursor-pointer group"
          >
            <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-lg w-max mb-3 group-hover:scale-105 transition">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-violet-400 transition">
              Code Sandbox
            </h3>
            <p className="text-xs text-slate-400 mb-3">Pyodide WASM Python runner + C/C++ gateway.</p>
            <span className="text-[11px] font-mono text-violet-400 flex items-center group-hover:translate-x-1 transition">
              Launch Lab <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </Link>
        </div>
      </div>

      {/* Subjects Catalog Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Core Subject Catalog</h2>
            <p className="text-xs text-slate-400">Structured curricula designed with concept-before-syntax</p>
          </div>
          <Link
            to="/explore"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center"
          >
            Browse All Subjects <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map(sub => (
            <div
              key={sub.id}
              onClick={() => {
                const subLesson = LESSONS.find(l => l.id.startsWith(sub.slug)) || LESSONS[0];
                navigate(`/lessons/${subLesson.id}`);
              }}
              className="p-5 rounded-xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  {getSubjectIcon(sub.icon)}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {sub.totalLessons} Lessons
                </span>
              </div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-blue-400 transition">
                {sub.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {sub.description}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="capitalize">{sub.category.replace('-', ' ')}</span>
                <span className="text-blue-400 font-medium group-hover:translate-x-1 transition flex items-center">
                  Start Track <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
