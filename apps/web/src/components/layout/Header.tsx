import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  HelpCircle, 
  MessageSquarePlus, 
  Sun, 
  Moon, 
  GitBranch,
  BookOpen
} from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch?: () => void;
  onOpenTour?: () => void;
  onOpenFeedback?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onOpenSearch, 
  onOpenTour,
  onOpenFeedback 
}) => {
  const { completedLessons } = useProgress();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isNavActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getCrumbTitle = () => {
    if (location.pathname === '/') return 'Overview & Folio';
    if (location.pathname.startsWith('/explore')) return 'Treatises';
    if (location.pathname.startsWith('/lessons')) return 'Lesson Reading';
    if (location.pathname.startsWith('/labs')) return 'Apparatus & Labs';
    if (location.pathname.startsWith('/practice')) return 'Problem Sets';
    if (location.pathname.startsWith('/concepts')) return 'Concepts Index';
    if (location.pathname.startsWith('/glossary')) return 'Compendium Glossary';
    return 'Study';
  };

  return (
    <header className="sticky top-0 z-40 w-full h-[64px] bg-[var(--bg)] border-b border-[var(--border)] px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Drawer Trigger, Brand & Monograph Edition */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          className="p-1.5 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md lg:hidden cursor-pointer transition border border-[var(--border)]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to="/"
          className="flex items-center space-x-2.5 cursor-pointer group text-decoration-none"
          aria-label="Lumenode home"
        >
          <div className="w-7 h-7 rounded border border-[var(--border-strong)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] group-hover:scale-105 transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-[var(--text)] text-lg leading-none tracking-tight">
              Lumenode
            </span>
          </div>
        </Link>

        {/* Scholarly Breadcrumb Trail & Edition Banner */}
        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-[var(--border)] text-xs text-[var(--muted)] font-sans">
          <span className="text-[11px] uppercase tracking-wider text-[var(--accent)] font-semibold">Volume I</span>
          <span className="text-[var(--subtle)]">&bull;</span>
          <span className="text-[var(--text-2)]">{getCrumbTitle()}</span>
        </div>
      </div>

      {/* Middle: Semantic Top Navigation Links */}
      <nav className="hidden xl:flex items-center space-x-1 font-sans text-xs" aria-label="Quick Navigation">
        <Link
          to="/"
          className={`px-3 py-1.5 rounded transition ${
            isNavActive('/') && location.pathname === '/'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
          }`}
          aria-current={location.pathname === '/' ? 'page' : undefined}
        >
          I. Folio
        </Link>
        <Link
          to="/explore"
          className={`px-3 py-1.5 rounded transition ${
            isNavActive('/explore') || isNavActive('/languages') || isNavActive('/subjects')
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
          }`}
          aria-current={isNavActive('/explore') ? 'page' : undefined}
        >
          II. Treatises
        </Link>
        <Link
          to="/labs/dsa"
          className={`px-3 py-1.5 rounded transition ${
            isNavActive('/labs')
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
          }`}
          aria-current={isNavActive('/labs') ? 'page' : undefined}
        >
          III. Apparatus
        </Link>
        <Link
          to="/practice"
          className={`px-3 py-1.5 rounded transition ${
            isNavActive('/practice')
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
          }`}
          aria-current={isNavActive('/practice') ? 'page' : undefined}
        >
          IV. Problem Sets
        </Link>
      </nav>

      {/* Right: Actions & Tools */}
      <div className="flex items-center space-x-2 font-sans">
        {/* Global Search Trigger (Matching Monograph Index Search) */}
        <button
          onClick={onOpenSearch}
          aria-label="Search lessons and concepts"
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--text)] rounded border border-[var(--border)] text-xs transition cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline text-[11px]">Index Search</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-[var(--surface-2)] text-[var(--muted)] rounded border border-[var(--border)] ml-1">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle Button (Toggle Tone) */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch color theme (currently ${theme})`}
          title={`Switch tone (${theme === 'dark' ? 'Warm Parchment' : 'Charcoal Monograph'})`}
          className="p-1.5 text-[var(--text-2)] hover:text-[var(--accent)] hover:bg-[var(--surface)] rounded border border-[var(--border)] transition cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[var(--amber)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--accent)]" />
          )}
        </button>

        {/* Tour / Guide Button */}
        <button
          onClick={onOpenTour}
          aria-label="Platform Tour & Guide"
          title="Platform Tour & Guide"
          className="p-1.5 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded border border-[var(--border)] transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Feedback Button */}
        <button
          onClick={onOpenFeedback}
          aria-label="Beta Feedback & Suggestions"
          title="Beta Feedback & Scholarly Suggestions"
          className="p-1.5 text-[var(--text-2)] hover:text-[var(--accent)] hover:bg-[var(--surface)] rounded border border-[var(--border)] transition cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
        </button>

        {/* Completed Lessons Monograph Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-[var(--muted)] bg-[var(--surface)] px-2.5 py-1 rounded border border-[var(--border)]">
          <span className="text-[var(--accent)] font-bold">&sect;</span>
          <span>{completedLessons.size} verified</span>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/meow687687/Lumenode"
          target="_blank"
          rel="noreferrer"
          aria-label="Open-source repository on GitHub"
          className="p-1.5 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded border border-[var(--border)] transition"
          title="Open-source repository"
        >
          <GitBranch className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
