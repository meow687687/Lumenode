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
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus trap and focus restoration to trigger
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
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
        badge: 'Chapter',
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
        badge: 'Proof',
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
        badge: 'Treatise',
      });
    });

    // 4. Languages
    const languages = [
      { name: 'C (C11)', desc: 'Low-level systems programming with raw pointers & manual memory', lang: 'c' },
      { name: 'C++ (C++17)', desc: 'High-performance RAII, templates & smart pointer models', lang: 'cpp' },
      { name: 'Python (3.12)', desc: 'High-level algorithmic mechanics with Pyodide WASM', lang: 'python' },
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
    if (!q) return allItems.slice(0, 8);

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
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      const focusable = modalContainerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
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
        return <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />;
      case 'concept':
        return <Layers className="w-3.5 h-3.5 text-[var(--cyan)]" />;
      case 'subject':
        return <Compass className="w-3.5 h-3.5 text-[var(--green)]" />;
      case 'language':
        return <Terminal className="w-3.5 h-3.5 text-[var(--amber)]" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
      onClick={onClose}
    >
      <div 
        ref={modalContainerRef}
        className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-strong)] rounded shadow-[var(--shadow)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{ borderTop: '3px solid var(--accent)' }}
      >
        {/* Monograph Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border)] bg-[var(--bg-elevated)] font-sans">
          <Search className="w-4 h-4 text-[var(--accent)] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search lessons, concepts, languages, treatises... (ESC to exit)"
            className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none font-serif"
            aria-label="Search curriculum"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--muted)] hover:text-[var(--text)] transition cursor-pointer"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block ml-3 px-1.5 py-0.5 text-[9px] font-mono rounded bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[var(--border)]">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center space-y-2 font-serif">
              <Search className="w-7 h-7 text-[var(--muted)] mx-auto opacity-50" />
              <p className="text-base text-[var(--muted)]">No matching treatise or inquiry found</p>
              <p className="text-xs text-[var(--subtle)] font-sans">Try searching for &quot;pointers&quot;, &quot;binary search tree&quot;, or &quot;C&quot;</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded cursor-pointer transition ${
                    isSelected ? 'bg-[var(--accent-soft)] border-l-2 border-[var(--accent)]' : 'hover:bg-[var(--surface-hover)]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-4">
                    <div className="p-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-serif font-bold truncate ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                          {item.title}
                        </span>
                        <span className="text-[9px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)] font-serif truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition ${isSelected ? 'text-[var(--accent)] translate-x-1' : 'text-[var(--subtle)]'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--muted)] font-mono">
          <span>Navigate: <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">↓</kbd></span>
          <span>Open: <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};
