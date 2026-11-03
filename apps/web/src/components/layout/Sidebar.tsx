import React from 'react';
import { 
  Home, 
  Compass, 
  Terminal, 
  Cpu, 
  Code2, 
  Network, 
  Layers, 
  Boxes, 
  Database, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Award
} from 'lucide-react';
import { SUBJECTS } from '../../data/subjects';
import { LESSONS } from '../../data/lessons';
import { useProgress } from '../../context/ProgressContext';
import { ActiveTab } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectLesson: (lessonId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigateTab,
  onSelectLesson,
}) => {
  const { completedLessons, activeLessonId } = useProgress();

  const handleLessonClick = (id: string) => {
    onSelectLesson(id);
    onNavigateTab('lesson');
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-72 bg-[#0E1526] border-r border-slate-800/80 flex flex-col transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigateTab('dashboard');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('explore');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'explore'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Subjects</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('practice');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'practice'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Practice & Quizzes</span>
            </button>
          </div>

          {/* Interactive Laboratories */}
          <div>
            <div className="px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center">
              <Zap className="w-3 h-3 mr-1 text-amber-400" />
              Laboratories
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onNavigateTab('dsa-lab');
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'dsa-lab'
                    ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Network className="w-3.5 h-3.5 text-blue-400" />
                  <span>DSA Visualizer</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                  2D
                </span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('memory-lab');
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'memory-lab'
                    ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Memory Simulator</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
                  Stack/Heap
                </span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('sql-lab');
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'sql-lab'
                    ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SQL Playground</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                  WASM
                </span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('code-lab');
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'code-lab'
                    ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  <span>Code Sandbox</span>
                </div>
                <span className="text-[10px] font-mono text-violet-400 bg-violet-950 px-1.5 py-0.5 rounded">
                  C/C++/Py
                </span>
              </button>
            </div>
          </div>

          {/* Lessons by Subject */}
          <div>
            <div className="px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center">
              <BookOpen className="w-3 h-3 mr-1 text-blue-400" />
              Foundational Curricula
            </div>

            <div className="space-y-1">
              {LESSONS.map(l => {
                const isActive = activeTab === 'lesson' && activeLessonId === l.id;
                const isCompleted = completedLessons.has(l.id);

                return (
                  <button
                    key={l.id}
                    onClick={() => handleLessonClick(l.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between group ${
                      isActive
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                      )}
                      <span className="truncate font-medium">{l.title.split(':')[0]}</span>
                    </div>

                    <span className="text-[10px] font-mono uppercase text-slate-500 shrink-0">
                      {l.languageId || 'CS'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
