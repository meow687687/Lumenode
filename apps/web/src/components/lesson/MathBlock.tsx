import React from 'react';
import { Sigma } from 'lucide-react';
import { MathBlock as MathBlockType } from '../../types';

interface MathBlockProps {
  block: MathBlockType;
}

export const MathBlock: React.FC<MathBlockProps> = ({ block }) => {
  return (
    <div className="my-5 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
          <Sigma className="w-4 h-4" />
          <span>Mathematical Formulation</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Notation
        </span>
      </div>

      <div className="py-3 px-4 rounded-xl bg-slate-950 border border-slate-800/90 overflow-x-auto text-center font-mono text-sm sm:text-base text-amber-200 tracking-wide">
        {block.formula}
      </div>

      {block.explanation && (
        <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800/60">
          {block.explanation}
        </p>
      )}
    </div>
  );
};
