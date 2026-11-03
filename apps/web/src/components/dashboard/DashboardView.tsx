import React, { useRef, useState } from 'react';
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
  Award,
  Zap,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Compass,
  AlertTriangle,
  Flame,
  BookOpen
} from 'lucide-react';
import { SUBJECTS } from '../../data/subjects';
import { LESSONS } from '../../data/lessons';
import { CONCEPTS } from '../../data/concepts';
import { useProgress } from '../../context/ProgressContext';

export const DashboardView: React.FC = () => {
  const { 
    completedLessons, 
    activeLessonId, 
    masteryRecords, 
    recommendations, 
    exportBackup, 
    importBackup, 
    resetAllProgress 
  } = useProgress();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const currentLesson = LESSONS.find(l => l.id === activeLessonId) || LESSONS[0];

  // Count mastery states across all concepts
  const masteryCounts = {
    demonstrated: 0,
    practicing: 0,
    learning: 0,
    needs_review: 0,
    not_started: 0,
  };

  CONCEPTS.forEach(c => {
    const rec = masteryRecords[c.id];
    if (!rec || rec.state === 'not_started') {
      masteryCounts.not_started++;
    } else {
      masteryCounts[rec.state]++;
    }
  });

  const handleExportBackup = () => {
    const snapshot = exportBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lumenode-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = importBackup(text);
        if (res.success) {
          setImportStatus('Backup restored successfully!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus(`Import failed: ${res.error}`);
        }
      } catch {
        setImportStatus('Failed reading backup file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

      {/* Progress & Concept Mastery Summary */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-emerald-400">{masteryCounts.demonstrated}</div>
              <div className="text-xs text-slate-400">Mastered</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-blue-400">{masteryCounts.practicing}</div>
              <div className="text-xs text-slate-400">Practicing</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-amber-400">{masteryCounts.needs_review}</div>
              <div className="text-xs text-slate-400">Needs Review</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 bg-slate-800 text-slate-300 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-slate-200">{completedLessons.size} / {LESSONS.length}</div>
              <div className="text-xs text-slate-400">Lessons Finished</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Learning Path */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-slate-100">Recommended Next Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => {
              const targetLessonId = rec.suggestedLessonId || currentLesson.id;
              const recLesson = LESSONS.find(l => l.id === targetLessonId) || currentLesson;
              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-xl bg-[#111827] border border-slate-800 hover:border-blue-500/50 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                        rec.urgency === 'high'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {rec.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {recLesson.difficulty}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-100 text-sm">{rec.conceptTitle}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{rec.reason}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80">
                    <Link
                      to={`/lessons/${targetLessonId}`}
                      className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      Study Concept <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            <p className="text-xs text-slate-400 mb-3">Linked lists, BST, AVL trees & B+ tree index.</p>
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
            <p className="text-xs text-slate-400 mb-3">Stack frames, activation records & heap blocks.</p>
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

      {/* Local-first Data Portability / Backup Controls */}
      <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-200">Local-First Storage & Data Portability</h3>
          <p className="text-xs text-slate-400">
            All your mastery state, bookmarks, and quiz progress stay locally in your browser. Export or restore backups at any time.
          </p>
          {importStatus && (
            <p className="text-xs font-mono text-blue-400 mt-1">{importStatus}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={handleExportBackup}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition border border-slate-700 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset all progress, mastery records, and bookmarks?')) {
                resetAllProgress();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 rounded-lg text-xs font-mono transition border border-red-900/50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
