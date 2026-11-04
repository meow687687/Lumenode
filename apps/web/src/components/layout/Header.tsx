import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Menu, 
  HelpCircle, 
  MessageSquarePlus, 
  Sun, 
  Moon, 
  GitBranch 
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

  // Determine current breadcrumb name
  const getCrumbTitle = () => {
    if (location.pathname === '/') return 'Home';
    if (location.pathname.startsWith('/explore')) return 'Explore';
    if (location.pathname.startsWith('/lessons')) return 'Lessons';
    if (location.pathname.startsWith('/labs')) return 'Laboratories';
    if (location.pathname.startsWith('/practice')) return 'Practice';
    if (location.pathname.startsWith('/concepts')) return 'Concepts';
    if (location.pathname.startsWith('/glossary')) return 'Glossary';
    return 'Study';
  };

  return (
    <header className="sticky top-0 z-40 w-full h-[70px] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Drawer Trigger, Brand & Breadcrumbs */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          className="p-2 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-xl lg:hidden cursor-pointer transition border border-transparent hover:border-[var(--border)]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to="/"
          className="flex items-center space-x-2.5 cursor-pointer group"
          aria-label="Lumenode home"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-strong)] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[var(--text)] tracking-tight text-base sm:text-lg leading-none">
              lumenode<span className="text-[10px] font-mono text-[var(--muted)] ml-1 font-normal">1.1</span>
            </span>
          </div>
        </Link>

        {/* Breadcrumb Trail */}
        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-[var(--border)] text-xs text-[var(--muted)]">
          <span>Workspace</span>
          <span className="text-[var(--subtle)]">›</span>
          <span className="text-[var(--text-2)] font-semibold">{getCrumbTitle()}</span>
        </div>
      </div>

      {/* Middle: Semantic Top Navigation Links */}
      <nav className="hidden xl:flex items-center space-x-1" aria-label="Quick Navigation">
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            isNavActive('/') && location.pathname === '/'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
          }`}
          aria-current={location.pathname === '/' ? 'page' : undefined}
        >
          Dashboard
        </Link>
        <Link
          to="/explore"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            isNavActive('/explore') || isNavActive('/languages') || isNavActive('/subjects')
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
          }`}
          aria-current={isNavActive('/explore') ? 'page' : undefined}
        >
          Learning Paths
        </Link>
        <Link
          to="/labs/dsa"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            isNavActive('/labs')
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
          }`}
          aria-current={isNavActive('/labs') ? 'page' : undefined}
        >
          Laboratories
        </Link>
        <Link
          to="/practice"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            isNavActive('/practice')
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
          }`}
          aria-current={isNavActive('/practice') ? 'page' : undefined}
        >
          Practice
        </Link>
      </nav>

      {/* Right: Actions & Tools */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Global Search Trigger (Matching HTML Prototype) */}
        <button
          onClick={onOpenSearch}
          aria-label="Search lessons and concepts"
          className="flex items-center gap-2 px-2.5 sm:px-3 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--text)] rounded-xl border border-[var(--border)] text-xs transition cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline text-[11px]">Search lessons, concepts...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-[var(--surface-2)] text-[var(--muted)] rounded border border-[var(--border-strong)] ml-2">
            ⌘ K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch color theme (currently ${theme})`}
          title={`Switch color theme (currently ${theme})`}
          className="p-2 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-xl border border-transparent hover:border-[var(--border)] transition cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[var(--amber)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--accent)]" />
          )}
        </button>

        {/* Tour / Help Button */}
        <button
          onClick={onOpenTour}
          aria-label="Platform Tour & Guide"
          title="Platform Tour & Guide"
          className="p-2 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-xl border border-transparent hover:border-[var(--border)] transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Feedback Button */}
        <button
          onClick={onOpenFeedback}
          aria-label="Beta Feedback & Suggestions"
          title="Beta Feedback & Suggestions"
          className="p-2 text-[var(--text-2)] hover:text-[var(--amber)] hover:bg-[var(--surface)] rounded-xl border border-transparent hover:border-[var(--border)] transition cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
        </button>

        {/* Completed Lessons Badge */}
        <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono text-[var(--muted)] bg-[var(--surface)] px-2.5 py-1.5 rounded-xl border border-[var(--border)]">
          <span className="w-2 h-2 rounded-full bg-[var(--green)]" />
          <span>{completedLessons.size} completed</span>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/meow687687/Lumenode"
          target="_blank"
          rel="noreferrer"
          aria-label="Open-source repository on GitHub"
          className="p-2 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-xl border border-transparent hover:border-[var(--border)] transition"
          title="Open-source repository"
        >
          <GitBranch className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
