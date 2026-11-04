import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Layers, 
  Terminal, 
  ArrowRight, 
  X,
  Compass
} from 'lucide-react';
import { LESSONS } from '../../data/lessons';
import { CONCEPTS } from '../../data/concepts';
import { SUBJECTS } from '../../data/subjects';

export interface SearchResultItem {
  id: string;
  type: 'lesson' | 'concept' | 'subject' | 'language';
  title: string;
  subtitle: string;
  url: string;
  badge: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable index
  const allItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. Lessons
    LESSONS.forEach((lesson) => {
      items.push({
        id: `lesson-${lesson.id}`,
        type: 'lesson',
        title: lesson.title,
        subtitle: lesson.summary,
        url: `/lessons/${lesson.id}`,
        badge: 'Lesson',
      });
    });

    // 2. Concepts
    CONCEPTS.forEach((concept) => {
      items.push({
        id: `concept-${concept.id}`,
        type: 'concept',
        title: concept.title,
        subtitle: concept.description,
        url: `/concepts/${concept.id}`,
        badge: 'Concept',
      });
    });

    // 3. Subjects
    SUBJECTS.forEach((subject) => {
      items.push({
        id: `subject-${subject.id}`,
        type: 'subject',
        title: subject.title,
        subtitle: subject.description,
        url: `/explore`,
        badge: 'Subject',
      });
    });

    // 4. Languages
    const languages = [
      { name: 'C (C11)', desc: 'Systems programming with raw pointers & manual memory', lang: 'c' },
      { name: 'C++ (C++17)', desc: 'RAII, smart pointers & object models', lang: 'cpp' },
      { name: 'Python (3.12)', desc: 'High-level algorithms with in-browser Pyodide WASM', lang: 'python' },
    ];
    languages.forEach((l) => {
      items.push({
        id: `lang-${l.lang}`,
        type: 'language',
        title: l.name,
        subtitle: l.desc,
        url: `/labs/code`,
        badge: 'Language',
      });
    });

    return items;
  }, []);

  // Filtered search results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 8); // Top results initially

    return allItems
      .filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
        );
      })
      .slice(0, 10);
  }, [allItems, query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    navigate(item.url);
    onClose();
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'concept':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'subject':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'language':
        return <Terminal className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#0E1526]/80">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search lessons, concepts, languages, subjects... (or press Esc to exit)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none"
            aria-label="Search curriculum"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block ml-3 px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No matching educational content found</p>
              <p className="text-xs text-slate-400">Try searching for &quot;pointers&quot;, &quot;BST&quot;, &quot;joins&quot;, or &quot;C&quot;</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    isSelected ? 'bg-blue-600/15 border border-blue-500/30' : 'hover:bg-slate-800/40'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-4">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-blue-400 translate-x-1' : 'text-slate-600'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#0A0F1D] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Navigate with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↓</kbd></span>
          <span>Select with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};
