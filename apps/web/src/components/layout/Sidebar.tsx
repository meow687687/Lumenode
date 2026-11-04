import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Terminal, 
  Network, 
  Layers, 
  Database, 
  BookOpen, 
  CheckCircle2, 
  Zap,
  Award,
  HelpCircle,
  MessageSquarePlus
} from 'lucide-react';
import { LESSONS } from '../../data/lessons';
import { useProgress } from '../../context/ProgressContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTour?: () => void;
  onOpenFeedback?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenTour,
  onOpenFeedback,
}) => {
  const { completedLessons } = useProgress();
  const location = useLocation();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isCurrent = (path: string) => location.pathname === path;

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
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isCurrent('/')
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/explore"
              onClick={handleLinkClick}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isCurrent('/explore')
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Subjects</span>
            </Link>

            <Link
              to="/practice"
              onClick={handleLinkClick}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isCurrent('/practice')
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Practice & Quizzes</span>
            </Link>

            <button
              onClick={() => {
                if (onOpenTour) onOpenTour();
                handleLinkClick();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition cursor-pointer text-left"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Platform Tour</span>
            </button>

            <button
              onClick={() => {
                if (onOpenFeedback) onOpenFeedback();
                handleLinkClick();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition cursor-pointer text-left"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-400" />
              <span>Give Feedback</span>
            </button>
          </div>

          {/* Interactive Laboratories */}
          <div>
            <div className="px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center">
              <Zap className="w-3 h-3 mr-1 text-amber-400" />
              Laboratories
            </div>
            <div className="space-y-1">
              <Link
                to="/labs/dsa"
                onClick={handleLinkClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isCurrent('/labs/dsa')
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
              </Link>

              <Link
                to="/labs/memory"
                onClick={handleLinkClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isCurrent('/labs/memory')
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
              </Link>

              <Link
                to="/labs/sql"
                onClick={handleLinkClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isCurrent('/labs/sql')
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
              </Link>

              <Link
                to="/labs/code"
                onClick={handleLinkClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isCurrent('/labs/code')
                    ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  <span>Code Sandbox</span>
                </div>
                <span className="text-[10px] font-mono text-violet-400 bg-violet-950 px-1.5 py-0.5 rounded">
                  Python/C/C++
                </span>
              </Link>
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
                const isActive = isCurrent(`/lessons/${l.id}`);
                const isCompleted = completedLessons.has(l.id);

                return (
                  <Link
                    key={l.id}
                    to={`/lessons/${l.id}`}
                    onClick={handleLinkClick}
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
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
