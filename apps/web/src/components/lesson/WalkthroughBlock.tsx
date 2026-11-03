import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, ListOrdered } from 'lucide-react';
import { WalkthroughBlock as WalkthroughBlockType, WalkthroughStep } from '../../types';

interface WalkthroughBlockProps {
  block: WalkthroughBlockType;
}

export const WalkthroughBlock: React.FC<WalkthroughBlockProps> = ({ block }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: WalkthroughStep[] = block.steps || [];
  if (steps.length === 0) return null;

  const currentStep = steps[activeStepIndex] || steps[0];

  return (
    <div className="my-6 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-800/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{block.title}</h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Step {activeStepIndex + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* Step indicator pills */}
        <div className="flex items-center space-x-1.5">
          {steps.map((_, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`w-6 h-6 rounded-md text-[11px] font-mono font-semibold transition cursor-pointer flex items-center justify-center ${
                idx === activeStepIndex
                  ? 'bg-blue-600 text-white shadow-sm'
                  : idx < activeStepIndex
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {idx < activeStepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <div>
          <h5 className="text-base font-bold text-slate-100 mb-1">
            {currentStep.title}
          </h5>
          <p className="text-sm text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {currentStep.codeSnippet && (
          <div className="rounded-xl overflow-hidden border border-slate-800/90 bg-slate-950">
            <div className="px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Code Focus</span>
              {currentStep.highlightLines && currentStep.highlightLines.length > 0 && (
                <span className="text-amber-400/90">
                  Highlighted lines: {currentStep.highlightLines.join(', ')}
                </span>
              )}
            </div>
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>
                {currentStep.codeSnippet.split('\n').map((line: string, lineIdx: number) => {
                  const lineNum = lineIdx + 1;
                  const isHighlighted = currentStep.highlightLines?.includes(lineNum);
                  return (
                    <div
                      key={lineIdx}
                      className={`${
                        isHighlighted
                          ? 'bg-amber-500/15 -mx-4 px-4 border-l-2 border-amber-400 text-amber-200 font-semibold'
                          : ''
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Stepper Navigation Controls */}
      <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
          disabled={activeStepIndex === 0}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        <button
          onClick={() => setActiveStepIndex(Math.min(steps.length - 1, activeStepIndex + 1))}
          disabled={activeStepIndex === steps.length - 1}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <span>Next Step</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
