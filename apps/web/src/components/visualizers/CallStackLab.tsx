/**
 * C Call-Stack & Activation Record Simulator Component.
 * Educational simulation of stack growth, activation frames, parameter passing,
 * return address preservation, and recursion.
 */

import React, { useState } from 'react';
import { Cpu, AlertCircle, ArrowUp, Code2, Terminal } from 'lucide-react';
import { CallStackModel, CallStackState } from '../../services/visualization/callStackModel';
import { SimulationEngine } from '../../services/visualization/simulationEngine';
import { SimulationPlayer } from './SimulationPlayer';

export const CallStackLab: React.FC = () => {
  const [activePreset, setActivePreset] = useState<'simple' | 'factorial' | 'nested' | 'fib'>('factorial');
  const [activeEngine, setActiveEngine] = useState<SimulationEngine<CallStackState>>(() => {
    const trace = CallStackModel.generateFactorialTrace(4);
    return new SimulationEngine({ trace });
  });

  const [currentLine, setCurrentLine] = useState<number | undefined>(undefined);
  const [currentState, setCurrentState] = useState<CallStackState>(() => activeEngine.getCurrentState());

  const handleSelectPreset = (preset: 'simple' | 'factorial' | 'nested' | 'fib') => {
    setActivePreset(preset);
    let trace;
    if (preset === 'simple') trace = CallStackModel.generateSimpleCallTrace();
    else if (preset === 'nested') trace = CallStackModel.generateNestedCallsTrace();
    else if (preset === 'fib') trace = CallStackModel.generateFibonacciTrace(3);
    else trace = CallStackModel.generateFactorialTrace(4);

    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
    setCurrentState(engine.getCurrentState());
    setCurrentLine(undefined);
  };

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-amber-400" />
            C Call-Stack & Activation Record Simulator
          </h2>
          <p className="text-sm text-slate-400">
            Activation records, stack frame allocation (RSP downward growth), parameters, and recursive unwinding.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleSelectPreset('simple')}
            className={`rounded px-2.5 py-1 text-xs font-semibold ${
              activePreset === 'simple'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Simple Call
          </button>
          <button
            onClick={() => handleSelectPreset('factorial')}
            className={`rounded px-2.5 py-1 text-xs font-semibold ${
              activePreset === 'factorial'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Recursive Factorial
          </button>
          <button
            onClick={() => handleSelectPreset('nested')}
            className={`rounded px-2.5 py-1 text-xs font-semibold ${
              activePreset === 'nested'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Nested Calls
          </button>
          <button
            onClick={() => handleSelectPreset('fib')}
            className={`rounded px-2.5 py-1 text-xs font-semibold ${
              activePreset === 'fib'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Recursive Fibonacci
          </button>
        </div>
      </div>

      {/* Architecture Disclaimer Alert */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-900/60 bg-amber-950/30 p-3 text-xs text-amber-300 leading-relaxed">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="text-amber-200">Architectural Note: </strong>
          The ISO C language standard describes abstract machine semantics, not a guaranteed CPU stack layout. This simulator illustrates the System V AMD64 ABI convention. Compilers with optimization (-O2) may pass arguments in registers (RDI, RSI), inline functions, or eliminate frames via Tail-Call Optimization (TCO).
        </div>
      </div>

      {/* Main Two-Column View: Code on Left, Call Stack on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: C Source Code */}
        <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs font-mono text-slate-400">
            <Code2 className="h-4 w-4 text-sky-400" />
            <span>{currentState.programTitle}.c</span>
          </div>
          <div className="p-4 font-mono text-xs overflow-auto leading-relaxed">
            {currentState.cCode.split('\n').map((line, idx) => {
              const lineNum = idx + 1;
              const isCurrent = lineNum === currentLine;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-2 py-0.5 rounded transition-colors ${
                    isCurrent ? 'bg-sky-950 text-sky-200 font-bold border-l-2 border-sky-400' : 'text-slate-300'
                  }`}
                >
                  <span className="w-6 text-right text-slate-600 select-none">{lineNum}</span>
                  <pre className="m-0 font-mono">{line}</pre>
                </div>
              );
            })}
          </div>

          {/* Simulated stdout */}
          {currentState.stdout.length > 0 && (
            <div className="border-t border-slate-800 bg-slate-950 p-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" /> Standard Output (stdout):
              </div>
              <div className="text-emerald-400 font-bold">
                {currentState.stdout.join('\n')}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Physical Stack Frames Visualization */}
        <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3.5 w-3.5 text-sky-400" /> Stack Top (RSP - Grows Downward in Address Space)
            </span>
            <span>Frames: {currentState.frames.length}</span>
          </div>

          {/* Frames list (rendered top-to-bottom, newest frame on top) */}
          <div className="flex flex-col-reverse gap-3 min-h-[300px]">
            {currentState.frames.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-center text-slate-500 text-xs">
                Stack empty (Execution halted)
              </div>
            ) : (
              currentState.frames.map((frame, fIdx) => {
                const isTop = fIdx === currentState.frames.length - 1;

                return (
                  <div
                    key={frame.frameId}
                    className={`rounded-lg border p-3 font-mono text-xs transition-all duration-300 ${
                      isTop
                        ? 'border-sky-500 bg-slate-950 shadow-md ring-1 ring-sky-500/40'
                        : 'border-slate-700 bg-slate-900 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                      <span className="font-bold text-sky-400">
                        {frame.functionName}() Frame [Depth {frame.depth}]
                      </span>
                      {isTop && (
                        <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-800">
                          Active (RBP/RSP)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Parameters:</span>
                        {Object.keys(frame.parameters).length === 0 ? (
                          <span className="text-slate-600 italic">None</span>
                        ) : (
                          Object.entries(frame.parameters).map(([k, v]) => (
                            <span key={k} className="text-amber-300 mr-2">
                              {k} = {v}
                            </span>
                          ))
                        )}
                      </div>

                      <div>
                        <span className="text-slate-500 block">Local Variables:</span>
                        {Object.keys(frame.localVariables).length === 0 ? (
                          <span className="text-slate-600 italic">None</span>
                        ) : (
                          Object.entries(frame.localVariables).map(([k, v]) => (
                            <span key={k} className="text-emerald-300 mr-2">
                              {k} = {v}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-2 border-t border-slate-800/80 pt-1 text-[10px] text-slate-500 flex justify-between">
                      <span>Saved RBP: {frame.savedFramePointer}</span>
                      <span>Return To: {frame.returnAddressLabel}</span>
                    </div>

                    {frame.returnValue !== undefined && (
                      <div className="mt-1.5 rounded bg-emerald-950/60 px-2 py-0.5 text-[11px] text-emerald-300 border border-emerald-800/50">
                        Return Value (RAX): <strong>{frame.returnValue}</strong>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <SimulationPlayer
        engine={activeEngine}
        onStepChange={(step, st) => {
          if (step) {
            setCurrentLine(step.codeLine);
            setCurrentState(st);
          }
        }}
      />
    </div>
  );
};
