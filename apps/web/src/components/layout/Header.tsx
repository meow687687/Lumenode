import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, GitBranch, Menu } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { completedLessons } = useProgress();
  const location = useLocation();

  const isNavActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#0A0F1D]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to="/"
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-100 tracking-tight text-lg leading-none">
              Lumenode
            </span>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mt-0.5">
              Explore. Understand. Build.
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Quick navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isNavActive('/') && location.pathname === '/'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/explore"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isNavActive('/explore') || isNavActive('/languages') || isNavActive('/subjects')
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Explore Subjects
        </Link>
        <Link
          to="/labs/dsa"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isNavActive('/labs')
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Laboratories
        </Link>
        <Link
          to="/practice"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isNavActive('/practice')
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Practice
        </Link>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{completedLessons.size} completed</span>
        </div>

        <Link
          to="/explore"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
          title="Search lessons"
        >
          <Search className="w-4 h-4" />
        </Link>

        <a
          href="https://github.com/your-username/lumenode"
          target="_blank"
          rel="noreferrer"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
          title="Open-source repository"
        >
          <GitBranch className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
