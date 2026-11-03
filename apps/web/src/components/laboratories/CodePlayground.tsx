import React, { useState } from 'react';
import { Play, Copy, RotateCcw, Check, Terminal, Cpu, Clock, HardDrive, ShieldAlert } from 'lucide-react';
import { SupportedLanguageId } from '../../types';

const TEMPLATES: Record<SupportedLanguageId, { filename: string; code: string; defaultOutput: string }> = {
  c: {
    filename: 'main.c',
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("=== Lumenode C Execution Sandbox ===\\n");
    
    // Demonstrate memory address inspection
    int val = 1337;
    int *ptr = &val;
    
    printf("Value: %d\\n", val);
    printf("Address: %p\\n", (void*)ptr);
    printf("Dereferenced: %d\\n", *ptr);
    
    return 0;
}`,
    defaultOutput: `=== Lumenode C Execution Sandbox ===\nValue: 1337\nAddress: 0x7ffd9820bc44\nDereferenced: 1337\n\nProcess exited with code 0.`,
  },
  cpp: {
    filename: 'solution.cpp',
    code: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "=== Modern C++ (C++20) Runner ===\\n";
    
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "Vector Size: " << numbers.size() << "\\n";
    std::cout << "Total Sum: " << sum << "\\n";
    
    return 0;
}`,
    defaultOutput: `=== Modern C++ (C++20) Runner ===\nVector Size: 5\nTotal Sum: 150\n\nProcess exited with code 0.`,
  },
  python: {
    filename: 'script.py',
    code: `# Lumenode Python 3 Execution Environment
import sys

def analyze_complexity(n):
    return {
        "O(1)": 1,
        "O(log N)": n.bit_length(),
        "O(N)": n,
        "O(N log N)": n * n.bit_length()
    }

print("=== Python Runtime Analytics ===")
metrics = analyze_complexity(1024)
for complexity, ops in metrics.items():
    print(f"{complexity:<12}: {ops} operations")
`,
    defaultOutput: `=== Python Runtime Analytics ===\nO(1)        : 1 operations\nO(log N)    : 11 operations\nO(N)        : 1024 operations\nO(N log N)  : 11264 operations\n\nProcess exited with code 0.`,
  },
  java: {
    filename: 'Main.java',
    code: `public class Main { public static void main(String[] args) { System.out.println("Java Ready"); } }`,
    defaultOutput: 'Java Ready',
  },
  rust: {
    filename: 'main.rs',
    code: `fn main() { println!("Rust Ready"); }`,
    defaultOutput: 'Rust Ready',
  },
};

export const CodePlayground: React.FC = () => {
  const [lang, setLang] = useState<SupportedLanguageId>('c');
  const [code, setCode] = useState<string>(TEMPLATES.c.code);
  const [stdin, setStdin] = useState<string>('');
  const [output, setOutput] = useState<string>(TEMPLATES.c.defaultOutput);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<{ timeMs: number; memoryKb: number; exitCode: number }>({
    timeMs: 14,
    memoryKb: 1420,
    exitCode: 0,
  });

  const handleLangChange = (newLang: SupportedLanguageId) => {
    setLang(newLang);
    setCode(TEMPLATES[newLang].code);
    setOutput(TEMPLATES[newLang].defaultOutput);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Compiling and executing in isolated container...');

    setTimeout(() => {
      setIsRunning(false);
      setOutput(TEMPLATES[lang].defaultOutput);
      setMetrics({
        timeMs: Math.floor(Math.random() * 15) + 8,
        memoryKb: Math.floor(Math.random() * 300) + 1200,
        exitCode: 0,
      });
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(TEMPLATES[lang].code);
    setOutput(TEMPLATES[lang].defaultOutput);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E1526] gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg">Multi-Language Code Sandbox</h3>
            <p className="text-xs text-slate-400">Strictly Isolated Sandboxed Compiler & Interpreter Gateway</p>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center space-x-2">
          {(['c', 'cpp', 'python'] as SupportedLanguageId[]).map(l => (
            <button
              key={l}
              onClick={() => handleLangChange(l)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                lang === l
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {l === 'c' ? 'C (GCC 13)' : l === 'cpp' ? 'C++ (Clang 17)' : 'Python (3.12)'}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Editor Column */}
        <div className="flex flex-col h-[460px]">
          {/* File Tab & Actions */}
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono text-xs text-blue-400 flex items-center">
              <Cpu className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {TEMPLATES[lang].filename}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                title="Reset code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>
            </div>
          </div>

          {/* Code Textarea */}
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="flex-1 w-full p-4 bg-[#0A0F1D] text-slate-100 font-mono text-sm leading-relaxed focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>

        {/* Console / Output Column */}
        <div className="flex flex-col h-[460px] bg-[#0A0F1D]/60">
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center">
              <Terminal className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Standard Output (stdout)
            </span>
            <div className="flex items-center space-x-3 text-[11px] text-slate-500">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1 text-slate-400" />
                {metrics.timeMs} ms
              </span>
              <span className="flex items-center">
                <HardDrive className="w-3 h-3 mr-1 text-slate-400" />
                {metrics.memoryKb} KB
              </span>
            </div>
          </div>

          {/* Output Pre */}
          <pre className="flex-1 p-4 font-mono text-xs text-emerald-400/90 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
            {output}
          </pre>

          {/* Sandbox security badge */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              <span>Isolated ramdisk • 64MB cap • Network disabled</span>
            </div>
            <span className="text-emerald-400 font-semibold">Exit Code: {metrics.exitCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
