import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Terminal, Cpu, Code2, Network, Layers, Boxes, Database, ArrowRight } from 'lucide-react';
import { SUBJECTS } from '../../data/subjects';
import { LESSONS } from '../../data/lessons';
import { SubjectCategory } from '../../types';

export const ExploreView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const getInitialCategory = (): SubjectCategory | 'all' => {
    if (location.pathname === '/languages') return 'programming-languages';
    if (location.pathname === '/subjects') return 'core-cs';
    return 'all';
  };

  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'all'>(getInitialCategory());

  useEffect(() => {
    if (location.pathname === '/languages') setSelectedCategory('programming-languages');
    else if (location.pathname === '/subjects') setSelectedCategory('core-cs');
  }, [location.pathname]);

  const filteredSubjects = SUBJECTS.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-5 h-5 text-blue-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'Network': return <Network className="w-5 h-5 text-violet-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-amber-400" />;
      case 'Boxes': return <Boxes className="w-5 h-5 text-rose-400" />;
      case 'Database': return <Database className="w-5 h-5 text-emerald-400" />;
      default: return <Terminal className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Search & Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Knowledge Catalog & Curricula
          </h1>
          <p className="text-sm text-slate-400">
            Browse structured computer science subjects, programming tracks, and interactive laboratories.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search concepts, languages, subjects..."
              className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            {(['all', 'programming-languages', 'core-cs'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all'
                  ? 'All Subjects'
                  : cat === 'programming-languages'
                  ? 'Languages'
                  : 'Core CS'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map(sub => {
          const matchingLessons = LESSONS.filter(l => l.id.startsWith(sub.slug));

          return (
            <div
              key={sub.id}
              className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    {getSubjectIcon(sub.icon)}
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                    {sub.totalLessons} Lessons
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-base mb-2">{sub.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{sub.description}</p>
              </div>

              {/* Sample Lessons */}
              <div>
                <div className="border-t border-slate-800/80 pt-3 mb-4 space-y-2">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                    Featured Lessons:
                  </span>
                  {matchingLessons.length > 0 ? (
                    matchingLessons.map(l => (
                      <button
                        key={l.id}
                        onClick={() => navigate(`/lessons/${l.id}`)}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800/60 text-xs text-slate-300 font-medium flex items-center justify-between group transition cursor-pointer"
                      >
                        <span className="truncate pr-2">{l.title.split(':')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">Curriculum under authoring</div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const firstLesson = matchingLessons[0] || LESSONS[0];
                    navigate(`/lessons/${firstLesson.id}`);
                  }}
                  className="w-full py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-semibold border border-blue-500/20 hover:border-blue-500 transition text-center cursor-pointer"
                >
                  Explore Curriculum
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
