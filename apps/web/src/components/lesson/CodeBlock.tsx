import React, { useState } from 'react';
import { Copy, Check, Terminal, Play } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
  title?: string;
  executable?: boolean;
  onExecute?: (code: string, language: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  code,
  title,
  executable = false,
  onExecute,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-slate-800 bg-[#0A0F1D] overflow-hidden shadow-lg">
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono font-medium text-slate-300">
            {title || `${language.toUpperCase()} Snippet`}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {executable && (
            <button
              onClick={() => onExecute && onExecute(code, language)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-medium rounded border border-blue-500/30 transition cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run in Playground</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium rounded transition"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <pre className="text-slate-200">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
