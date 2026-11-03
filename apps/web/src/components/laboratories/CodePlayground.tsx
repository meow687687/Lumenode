import React, { useState, useEffect } from 'react';
import { Play, Copy, RotateCcw, Check, Terminal, Cpu, Clock, Info, Sparkles } from 'lucide-react';
import { SupportedLanguageId, ExecutionResult } from '../../types';
import { pythonRunner } from '../../services/pythonRunner';

interface CodePlaygroundProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguageId;
}

const TEMPLATES: Record<SupportedLanguageId, { filename: string; code: string }> = {
  python: {
    filename: 'script.py',
    code: `# Lumenode Genuine Python 3 Runtime (Pyodide WASM)
import sys

def fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print(f"Python version: {sys.version.split()[0]}")
fib_numbers = fibonacci(10)
print(f"Fibonacci(10): {fib_numbers}")
print("Algorithm execution completed successfully!")
`,
  },
  c: {
    filename: 'main.c',
    code: `#include <stdio.h>

int main() {
    int val = 1337;
    int *ptr = &val;
    
    printf("Value: %d\\n", val);
    printf("Pointer Address: %p\\n", (void*)ptr);
    printf("Dereferenced: %d\\n", *ptr);
    
    return 0;
}`,
  },
  cpp: {
    filename: 'solution.cpp',
    code: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "Vector Size: " << numbers.size() << "\\n";
    std::cout << "Sum: " << sum << "\\n";
    return 0;
}`,
  },
  java: {
    filename: 'Main.java',
    code: `public class Main { public static void main(String[] args) { System.out.println("Java Sandbox"); } }`,
  },
  rust: {
    filename: 'main.rs',
    code: `fn main() { println!("Rust Sandbox"); }`,
  },
};

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode,
  initialLanguage,
}) => {
  const [lang, setLang] = useState<SupportedLanguageId>(initialLanguage || 'python');
  const [code, setCode] = useState<string>(initialCode || TEMPLATES[initialLanguage || 'python'].code);
  const [output, setOutput] = useState<string>('Ready for execution.\nSelect "Run" to execute program.');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // Synchronize when initial props change (e.g. from lesson "Run in Playground")
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
    if (initialLanguage) {
      setLang(initialLanguage);
    }
  }, [initialCode, initialLanguage]);

  const handleLangChange = (newLang: SupportedLanguageId) => {
    setLang(newLang);
    setCode(TEMPLATES[newLang].code);
    setOutput(`Switched to ${newLang.toUpperCase()}.\nReady for execution.`);
    setExecutionResult(null);
  };

  const handleRun = async () => {
    if (lang === 'c' || lang === 'cpp') {
      setOutput(
        `[STATUS: COMPILER GATEWAY PENDING]\n` +
        `C (GCC) and C++ (Clang) require remote sandboxed execution container infrastructure (Phase 2B).\n\n` +
        `To run code directly in the browser right now, switch to the "Python (Pyodide)" tab above!`
      );
      setExecutionResult({
        executionId: `pending-${Date.now()}`,
        language: lang,
        status: 'unsupported',
        stdout: '',
        stderr: '',
        durationMs: 0,
      });
      return;
    }

    if (lang === 'python') {
      setIsRunning(true);
      setOutput('Initializing Pyodide WebAssembly runtime and executing...');

      try {
        const res = await pythonRunner.execute(code, 6000);
        setExecutionResult(res);

        let formattedOutput = '';
        if (res.stdout) {
          formattedOutput += res.stdout;
        }
        if (res.stderr) {
          formattedOutput += `\n[STDERR]:\n${res.stderr}`;
        }
        if (res.error) {
          formattedOutput += `\n[PYTHON EXCEPTION]:\n${res.error}`;
        }
        if (!formattedOutput) {
          formattedOutput = `(Program executed with status: ${res.status} and produced no stdout/stderr output)`;
        }

        setOutput(formattedOutput);
      } catch (err: any) {
        setOutput(`Execution worker error: ${err.message || String(err)}`);
      } finally {
        setIsRunning(false);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(TEMPLATES[lang].code);
    setOutput('Reset editor to default code template.');
    setExecutionResult(null);
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
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-100 text-lg">Code Execution Laboratory</h3>
              {lang === 'python' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Browser WASM Ready
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 font-semibold">
                  Remote Gateway Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'python'
                ? 'Genuine Python 3.12 WebAssembly runtime executed in a dedicated background worker'
                : 'Native compiled language sandbox scheduled for isolated remote gateway integration'}
            </p>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center space-x-2">
          {(['python', 'c', 'cpp'] as SupportedLanguageId[]).map(l => (
            <button
              key={l}
              onClick={() => handleLangChange(l)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
                lang === l
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {l === 'python' ? 'Python (Pyodide WASM)' : l === 'c' ? 'C (GCC 13)' : 'C++ (Clang 17)'}
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
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition cursor-pointer"
                title="Reset code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
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
              Standard Output (stdout / stderr)
            </span>
            {executionResult && (
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" />
                  {executionResult.durationMs} ms
                </span>
                <span className={executionResult.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                  Status: {executionResult.status.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Output Pre */}
          <pre className="flex-1 p-4 font-mono text-xs text-emerald-400/90 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
            {output}
          </pre>

          {/* Environment Status Badge */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            {lang === 'python' ? (
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pyodide WebAssembly Worker • 6s timeout • Safe in-memory scope</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-amber-400">
                <Info className="w-3.5 h-3.5" />
                <span>Remote Compiler Gateway required for C/C++ execution (Phase 2B)</span>
              </div>
            )}
            {executionResult?.exitCode !== undefined && (
              <span className="text-slate-300">Exit Code: {executionResult.exitCode}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
