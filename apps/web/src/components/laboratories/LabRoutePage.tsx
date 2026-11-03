import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { DSAVisualizer } from '../visualizers/DSAVisualizer';
import { MemorySimulator } from '../visualizers/MemorySimulator';
import { SQLPlayground } from './SQLPlayground';
import { CodePlayground } from './CodePlayground';
import { SupportedLanguageId } from '../../types';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const LabRoutePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Extract forwarded code/language from navigation state if available
  const state = location.state as { code?: string; language?: SupportedLanguageId } | null;

  if (id === 'dsa' || id === 'dsa-lab') {
    return (
      <div className="max-w-5xl mx-auto py-6">
        <DSAVisualizer />
      </div>
    );
  }

  if (id === 'memory' || id === 'memory-lab') {
    return (
      <div className="max-w-5xl mx-auto py-6">
        <MemorySimulator />
      </div>
    );
  }

  if (id === 'sql' || id === 'sql-lab') {
    return (
      <div className="max-w-5xl mx-auto py-6">
        <SQLPlayground />
      </div>
    );
  }

  if (id === 'code' || id === 'code-lab') {
    return (
      <div className="max-w-5xl mx-auto py-6">
        <CodePlayground
          initialCode={state?.code}
          initialLanguage={state?.language}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
      <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full w-max mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-100">Laboratory Not Found</h2>
      <p className="text-sm text-slate-400">
        The laboratory identifier <code className="font-mono text-cyan-400">"{id}"</code> is unrecognized.
      </p>
      <div className="pt-4 flex justify-center space-x-3">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/labs/code"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
        >
          <span>Open Code Sandbox</span>
        </Link>
      </div>
    </div>
  );
};
