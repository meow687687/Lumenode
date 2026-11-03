import React from 'react';
import { Link } from 'react-router-dom';
import { Network, ArrowUpRight } from 'lucide-react';
import { RelatedConceptsBlock as RelatedConceptsBlockType } from '../../types';
import { CONCEPTS } from '../../data/concepts';

interface RelatedConceptsBlockProps {
  block: RelatedConceptsBlockType;
}

export const RelatedConceptsBlock: React.FC<RelatedConceptsBlockProps> = ({ block }) => {
  const conceptMap = new Map(CONCEPTS.map(c => [c.id, c]));

  return (
    <div className="my-8 rounded-2xl border border-blue-500/20 bg-blue-950/10 p-5 space-y-4">
      <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
        <Network className="w-4 h-4" />
        <span>{block.title || 'Connected Knowledge & Related Concepts'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {block.conceptIds.map((conceptId: string) => {
          const concept = conceptMap.get(conceptId);
          if (!concept) {
            return (
              <div
                key={conceptId}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-400 font-mono"
              >
                Concept: {conceptId}
              </div>
            );
          }

          return (
            <Link
              key={concept.id}
              to={`/concepts/${concept.id}`}
              className="group p-3.5 rounded-xl border border-slate-800 hover:border-blue-500/40 bg-slate-900/80 hover:bg-slate-800/80 transition flex flex-col justify-between space-y-2 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                    {concept.subjectId}
                  </span>
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 mt-1.5 transition">
                    {concept.title}
                  </h5>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {concept.description}
              </p>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono pt-1">
                <span className="capitalize">{concept.difficulty}</span>
                {concept.implementations && concept.implementations.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-cyan-400">
                      {concept.implementations.length} language implementations
                    </span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
