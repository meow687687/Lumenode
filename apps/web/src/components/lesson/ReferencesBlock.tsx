import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { ReferencesBlock as ReferencesBlockType, ReferenceItem } from '../../types';

interface ReferencesBlockProps {
  block: ReferencesBlockType;
}

export const ReferencesBlock: React.FC<ReferencesBlockProps> = ({ block }) => {
  const items: ReferenceItem[] = block.items || [];
  if (items.length === 0) return null;

  return (
    <div className="my-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        <span>{block.title || 'Academic References & Canonical Sources'}</span>
      </div>

      <div className="divide-y divide-slate-800/80 pt-1">
        {items.map((ref: ReferenceItem, idx: number) => (
          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-slate-200">
                {ref.title}
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                {ref.author && <span>By {ref.author}</span>}
                {ref.year && (
                  <>
                    <span>•</span>
                    <span>({ref.year})</span>
                  </>
                )}
              </div>
            </div>

            {ref.url && (
              <a
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition shrink-0"
              >
                <span>Read Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
