import React, { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';

interface Term {
  term: string;
  category: 'systems' | 'dsa' | 'dbms' | 'oop';
  definition: string;
  example?: string;
}

const GLOSSARY_TERMS: Term[] = [
  {
    term: 'Pointer Dereference (*)',
    category: 'systems',
    definition: 'Accessing or mutating the value stored at a specific virtual memory address referenced by a pointer variable.',
    example: 'int a = 10; int *p = &a; *p = 20; // a is now 20',
  },
  {
    term: 'Stack Frame',
    category: 'systems',
    definition: 'A contiguous memory region pushed onto the call stack containing local variables, return addresses, and register states for a function invocation.',
  },
  {
    term: 'Heap Memory',
    category: 'systems',
    definition: 'Dynamically allocated memory managed at runtime via malloc/free (in C) or garbage collection. Persists until explicitly deallocated or runtime exits.',
  },
  {
    term: 'Time Complexity O(log N)',
    category: 'dsa',
    definition: 'Logarithmic growth rate where the problem search space is halved at each step, characteristic of Binary Search and balanced binary search trees.',
  },
  {
    term: 'Singly Linked List',
    category: 'dsa',
    definition: 'A linear data structure whose elements (nodes) are stored arbitrarily in heap memory, each holding a data payload and a pointer to the successor node.',
  },
  {
    term: 'Relational Join (INNER JOIN)',
    category: 'dbms',
    definition: 'An operation that combines columns from two tables based on matching values in common foreign key / primary key fields.',
  },
  {
    term: 'RAII (Resource Acquisition Is Initialization)',
    category: 'oop',
    definition: 'A C++ idiom binding the lifecycle of resources (memory, file handles, locks) to the lifetime of stack-allocated objects with deterministic destructors.',
  },
];

export const GlossaryView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'all' | 'systems' | 'dsa' | 'dbms' | 'oop'>('all');

  const filtered = GLOSSARY_TERMS.filter(t => {
    const matchesCat = selectedCat === 'all' || t.category === selectedCat;
    const matchesSearch =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div>
        <div className="flex items-center space-x-2.5 mb-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Computer Science Glossary
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Core technical definitions, memory architecture terminology, and algorithm principles.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search definitions..."
            className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {(['all', 'systems', 'dsa', 'dbms', 'oop'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition cursor-pointer ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2.5 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-base">{item.term}</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {item.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.definition}</p>
            {item.example && (
              <div className="pt-2">
                <code className="block p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  {item.example}
                </code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
