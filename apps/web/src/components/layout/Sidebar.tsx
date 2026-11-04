import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Terminal, 
  Network, 
  Layers, 
  Database, 
  CheckCircle2, 
  Award,
  HelpCircle,
  BookOpen,
  X
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
}) => {
  const { completedLessons } = useProgress();
  const location = useLocation();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile backdrop scrim */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        id="sidebar"
        aria-label="Primary navigation"
        className={`fixed lg:static top-0 lg:top-[70px] bottom-0 left-0 z-50 lg:z-30 w-[260px] lg:w-[252px] bg-[var(--bg-elevated)] border-r border-[var(--border)] flex flex-col transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header on mobile drawer only */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-[var(--border)]">
          <span className="font-extrabold text-[var(--text)] tracking-tight text-base">
            lumenode<span className="text-[10px] font-mono text-[var(--muted)] ml-1">1.1</span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close navigation drawer"
            className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Workspace Group */}
            <div className="space-y-1.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
                Workspace
              </div>
              <nav className="space-y-1" aria-label="Workspace routes">
                <Link
                  to="/"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                    isCurrent('/') && location.pathname === '/'
                      ? 'bg-[var(--accent-soft)] text-[var(--text)] font-bold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  <Home className={`w-4 h-4 ${isCurrent('/') && location.pathname === '/' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                  <span>Home</span>
                </Link>

                <Link
                  to="/explore"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    isCurrent('/explore')
                      ? 'bg-[var(--accent-soft)] text-[var(--text)] font-bold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/explore') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Compass className={`w-4 h-4 ${isCurrent('/explore') ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                    <span>Learning Paths</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted)]">07</span>
                </Link>

                <Link
                  to="/practice"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                    isCurrent('/practice')
                      ? 'bg-[var(--accent-soft)] text-[var(--text)] font-bold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/practice') ? 'page' : undefined}
                >
                  <Award className={`w-4 h-4 ${isCurrent('/practice') ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                  <span>Practice & Quizzes</span>
                </Link>
              </nav>
            </div>

            {/* Study Tools Group */}
            <div className="space-y-1.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
                Study Tools
              </div>
              <nav className="space-y-1" aria-label="Interactive laboratories">
                <Link
                  to="/labs/dsa"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    isCurrent('/labs/dsa')
                      ? 'bg-[var(--accent-soft)] text-[var(--text)] font-bold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/labs/dsa') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Network className="w-4 h-4 text-[var(--accent)]" />
                    <span>DSA Visualizer</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--green)] bg-[color-mix(in_srgb,var(--green)_12%,transparent)] px-1.5 py-0.5 rounded">
                    2D
                  </span>
                </Link>

                <Link
                  to="/labs/memory"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    isCurrent('/labs/memory')
                      ? 'bg-[var(--accent-soft)] text-[var(--text)] font-bold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/labs/memory') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-[var(--cyan)]" />
                    <span>Memory Simulator</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--cyan)] bg-[color-mix(in_srgb,var(--cyan)_12%,transparent)] px-1.5 py-0.5 rounded">
                    Stack/Heap
                  </span>
                </Link>

                <Link
                  to="/labs/sql"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    isCurrent('/labs/sql')
                      ? 'bg-[var(--accent-soft)] text-[var(--text)] font-bold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/labs/sql') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-[var(--green)]" />
                    <span>SQL Playground</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--green)] bg-[color-mix(in_srgb,var(--green)_12%,transparent)] px-1.5 py-0.5 rounded">
                    WASM
                  </span>
                </Link>

                <Link
                  to="/labs/code"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    isCurrent('/labs/code')
                      ? 'bg-[var(--accent-soft)] text-[var(--text)] font-bold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/labs/code') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-[var(--amber)]" />
                    <span>Code Sandbox</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--amber)] bg-[color-mix(in_srgb,var(--amber)_12%,transparent)] px-1.5 py-0.5 rounded">
                    Py/C/C++
                  </span>
                </Link>

                <Link
                  to="/glossary"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                    isCurrent('/glossary')
                      ? 'bg-[var(--accent-soft)] text-[var(--text)] font-bold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/glossary') ? 'page' : undefined}
                >
                  <BookOpen className="w-4 h-4 text-[var(--muted)]" />
                  <span>Glossary</span>
                </Link>
              </nav>
            </div>

            {/* Foundational Curricula Snippet */}
            <div className="space-y-1.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
                Core Lessons
              </div>
              <nav className="space-y-0.5 max-h-56 overflow-y-auto pr-1" aria-label="Curriculum lessons">
                {LESSONS.slice(0, 8).map(l => {
                  const isActive = isCurrent(`/lessons/${l.id}`);
                  const isCompleted = completedLessons.has(l.id);

                  return (
                    <Link
                      key={l.id}
                      to={`/lessons/${l.id}`}
                      onClick={handleLinkClick}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center justify-between group ${
                        isActive
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 text-[var(--green)] shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--subtle)] shrink-0" />
                        )}
                        <span className="truncate">{l.title.split(':')[0]}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--subtle)] shrink-0 uppercase">
                        {l.languageId || 'CS'}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Bottom: Privacy Note & Profile */}
          <div className="space-y-3 pt-3 border-t border-[var(--border)]">
            <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[11px]">
              <div className="flex items-center gap-2 font-bold text-[var(--text-2)] text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[var(--green)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--green)_15%,transparent)]" />
                <span>Your progress stays yours</span>
              </div>
              <p className="text-[10px] text-[var(--muted)] mt-1.5 leading-relaxed">
                Your learning history is saved locally. Export a backup anytime from your dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--cyan)] flex items-center justify-center font-bold text-white text-xs shrink-0">
                LN
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[var(--text)] truncate">Learner Profile</div>
                <div className="text-[10px] font-mono text-[var(--muted)] truncate">Local Workspace</div>
              </div>
              <button
                onClick={() => {
                  if (onOpenTour) onOpenTour();
                  handleLinkClick();
                }}
                title="Platform Tour"
                aria-label="Platform Tour"
                className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface)] cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
