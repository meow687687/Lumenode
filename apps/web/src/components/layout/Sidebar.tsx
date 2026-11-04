import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Terminal, 
  Network, 
  Layers, 
  Database, 
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
        className={`fixed lg:static top-0 lg:top-[64px] bottom-0 left-0 z-50 lg:z-30 w-[260px] lg:w-[252px] bg-[var(--bg-elevated)] border-r border-[var(--border)] flex flex-col transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-[var(--border)]">
          <div>
            <div className="font-serif font-bold text-[var(--text)] text-base">Lumenode</div>
            <div className="font-sans text-[10px] text-[var(--muted)] uppercase tracking-wider">CS Monograph</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation drawer"
            className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded hover:bg-[var(--surface)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 flex-1 flex flex-col justify-between font-sans">
          <div className="space-y-6">
            {/* Table of Contents Group */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] font-sans">
                Table of Contents
              </div>
              <nav className="space-y-1 text-xs" aria-label="Monograph divisions">
                <Link
                  to="/"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded transition ${
                    isCurrent('/') && location.pathname === '/'
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border-l-2 border-[var(--accent)]'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  <Home className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                  <span>I. Overview &amp; Folio</span>
                </Link>

                <Link
                  to="/explore"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded transition ${
                    isCurrent('/explore')
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border-l-2 border-[var(--accent)]'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/explore') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                    <span>II. Treatises (Curricula)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted)]">07</span>
                </Link>

                <Link
                  to="/practice"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded transition ${
                    isCurrent('/practice')
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border-l-2 border-[var(--accent)]'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/practice') ? 'page' : undefined}
                >
                  <Award className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                  <span>IV. Problem Sets</span>
                </Link>
              </nav>
            </div>

            {/* Scientific Apparatus / Laboratories Group */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] font-sans">
                III. Visual Apparatus
              </div>
              <nav className="space-y-1 text-xs" aria-label="Interactive visualizers">
                <Link
                  to="/labs/dsa"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded transition ${
                    isCurrent('/labs/dsa')
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/labs/dsa') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Network className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>DSA Tree Apparatus</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--green)]">2D</span>
                </Link>

                <Link
                  to="/labs/memory"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded transition ${
                    isCurrent('/labs/memory')
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/labs/memory') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--cyan)]" />
                    <span>Memory &amp; Stack Sim</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--cyan)]">Stack</span>
                </Link>

                <Link
                  to="/labs/sql"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded transition ${
                    isCurrent('/labs/sql')
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/labs/sql') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-3.5 h-3.5 text-[var(--green)]" />
                    <span>Relational Engine</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--green)]">WASM</span>
                </Link>

                <Link
                  to="/labs/code"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded transition ${
                    isCurrent('/labs/code')
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/labs/code') ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-3.5 h-3.5 text-[var(--amber)]" />
                    <span>Compiler Sandboxes</span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--amber)]">C/C++</span>
                </Link>

                <Link
                  to="/glossary"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition ${
                    isCurrent('/glossary')
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                  aria-current={isCurrent('/glossary') ? 'page' : undefined}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>Compendium Index</span>
                </Link>
              </nav>
            </div>

            {/* Core Lessons Syllabus */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] font-sans">
                Foundational Chapters
              </div>
              <nav className="space-y-0.5 max-h-52 overflow-y-auto pr-1" aria-label="Curriculum chapters">
                {LESSONS.slice(0, 8).map((l, idx) => {
                  const isActive = isCurrent(`/lessons/${l.id}`);
                  const isCompleted = completedLessons.has(l.id);

                  return (
                    <Link
                      key={l.id}
                      to={`/lessons/${l.id}`}
                      onClick={handleLinkClick}
                      className={`w-full text-left px-2.5 py-1 rounded text-[11px] transition flex items-center justify-between ${
                        isActive
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <span className="font-mono text-[10px] text-[var(--subtle)]">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="truncate">{l.title.split(':')[0]}</span>
                      </div>
                      {isCompleted && (
                        <span className="text-[var(--accent)] text-[10px] font-serif font-bold">&sect;</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Colophon & Scholarly Local Preservation */}
          <div className="space-y-3 pt-3 border-t border-[var(--border)]">
            <div className="p-3 rounded bg-[var(--surface)] border border-[var(--border)] text-[11px]">
              <div className="font-serif font-bold text-[var(--accent)] text-xs mb-1">
                Colophon &amp; Offline Preservation
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                All notes, proofs, and evaluations are preserved offline in browser storage. Zero tracking.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 font-sans">
              <div className="w-7 h-7 rounded border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center font-serif font-bold text-[var(--accent)] text-xs shrink-0">
                &sect;
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[var(--text)] truncate">Learner Folio</div>
                <div className="text-[9px] font-mono text-[var(--muted)] truncate">Offline Ledger</div>
              </div>
              <button
                onClick={() => {
                  if (onOpenTour) onOpenTour();
                  handleLinkClick();
                }}
                title="Monograph Guide"
                aria-label="Platform Tour & Guide"
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded hover:bg-[var(--surface)] cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
