import React, { useState } from 'react';
import { Layers, Play, RotateCcw, ArrowRight, CornerDownRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MemoryStep {
  step: number;
  code: string;
  explanation: string;
  stackVars: { name: string; type: string; address: string; value: string; pointsTo?: string }[];
  heapBlocks: { id: string; address: string; size: string; value: string; status: 'active' | 'freed' }[];
  activeVar?: string;
}

const STEPS: MemoryStep[] = [
  {
    step: 1,
    code: 'int age = 42;',
    explanation: 'Stack allocates 4 bytes for integer "age" at address 0x7FFE_40. It stores value 42.',
    stackVars: [
      { name: 'age', type: 'int (4 bytes)', address: '0x7FFE_40', value: '42' }
    ],
    heapBlocks: [],
    activeVar: 'age'
  },
  {
    step: 2,
    code: 'int *ptr = &age;',
    explanation: 'Stack allocates 8 bytes for pointer "ptr" at address 0x7FFE_48. Its stored value is the memory address of age (0x7FFE_40).',
    stackVars: [
      { name: 'age', type: 'int (4 bytes)', address: '0x7FFE_40', value: '42' },
      { name: 'ptr', type: 'int* (8 bytes)', address: '0x7FFE_48', value: '0x7FFE_40', pointsTo: '0x7FFE_40' }
    ],
    heapBlocks: [],
    activeVar: 'ptr'
  },
  {
    step: 3,
    code: '*ptr = 99; // Dereference write',
    explanation: 'The CPU follows the address stored in ptr (0x7FFE_40) and overwrites the bytes with 99. Notice variable "age" is modified without mentioning its name!',
    stackVars: [
      { name: 'age', type: 'int (4 bytes)', address: '0x7FFE_40', value: '99' },
      { name: 'ptr', type: 'int* (8 bytes)', address: '0x7FFE_48', value: '0x7FFE_40', pointsTo: '0x7FFE_40' }
    ],
    heapBlocks: [],
    activeVar: 'age'
  },
  {
    step: 4,
    code: 'int *hPtr = (int*)malloc(sizeof(int));',
    explanation: 'malloc() requests 4 bytes from the operating system on the HEAP. The OS allocates memory at 0x6000_10 and returns this address to stack variable "hPtr".',
    stackVars: [
      { name: 'age', type: 'int (4 bytes)', address: '0x7FFE_40', value: '99' },
      { name: 'ptr', type: 'int* (8 bytes)', address: '0x7FFE_48', value: '0x7FFE_40', pointsTo: '0x7FFE_40' },
      { name: 'hPtr', type: 'int* (8 bytes)', address: '0x7FFE_50', value: '0x6000_10', pointsTo: '0x6000_10' }
    ],
    heapBlocks: [
      { id: 'hb1', address: '0x6000_10', size: '4 bytes', value: 'uninitialized (garbage)', status: 'active' }
    ],
    activeVar: 'hPtr'
  },
  {
    step: 5,
    code: '*hPtr = 500;',
    explanation: 'Dereference write to heap memory address 0x6000_10 sets the stored value to 500.',
    stackVars: [
      { name: 'age', type: 'int (4 bytes)', address: '0x7FFE_40', value: '99' },
      { name: 'ptr', type: 'int* (8 bytes)', address: '0x7FFE_48', value: '0x7FFE_40', pointsTo: '0x7FFE_40' },
      { name: 'hPtr', type: 'int* (8 bytes)', address: '0x7FFE_50', value: '0x6000_10', pointsTo: '0x6000_10' }
    ],
    heapBlocks: [
      { id: 'hb1', address: '0x6000_10', size: '4 bytes', value: '500', status: 'active' }
    ],
    activeVar: 'hPtr'
  },
  {
    step: 6,
    code: 'free(hPtr);',
    explanation: 'The memory block at 0x6000_10 is released back to the OS allocator. Warning: hPtr still holds 0x6000_10 (dangling pointer) until set to NULL!',
    stackVars: [
      { name: 'age', type: 'int (4 bytes)', address: '0x7FFE_40', value: '99' },
      { name: 'ptr', type: 'int* (8 bytes)', address: '0x7FFE_48', value: '0x7FFE_40', pointsTo: '0x7FFE_40' },
      { name: 'hPtr', type: 'int* (8 bytes)', address: '0x7FFE_50', value: '0x6000_10 (dangling)' }
    ],
    heapBlocks: [
      { id: 'hb1', address: '0x6000_10', size: '4 bytes', value: '<freed memory>', status: 'freed' }
    ]
  }
];

export const MemorySimulator: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const current = STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(s => s - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Simulator Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E1526]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg">Memory & Pointer Simulator</h3>
            <p className="text-xs text-slate-400">Low-Level Stack Frames, Heap Segments & Memory Addresses</p>
          </div>
        </div>

        {/* Stepper controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs font-medium border border-slate-700"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-slate-400 px-2">
            Step {currentStepIdx + 1} / {STEPS.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentStepIdx === STEPS.length - 1}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded text-xs font-medium flex items-center space-x-1"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700"
            title="Reset simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Banner */}
      <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500">Executing C:</span>
          <code className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-cyan-300 font-mono text-sm font-semibold">
            {current.code}
          </code>
        </div>
      </div>

      {/* Main Memory Diagram */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STACK FRAME */}
        <div className="bg-[#0A0F1D] rounded-xl border border-slate-800 p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h4 className="font-semibold text-slate-200 text-sm">Stack Segment (LIFO)</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Frame: main()</span>
          </div>

          <div className="space-y-3 flex-1">
            {current.stackVars.map(v => {
              const isActive = current.activeVar === v.name;
              return (
                <div
                  key={v.name}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-blue-950/60 border-blue-400 ring-1 ring-blue-400 shadow-md'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-slate-200">{v.name}</span>
                    <span className="font-mono text-[11px] text-cyan-400">{v.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="text-[10px] text-slate-500">{v.type}</span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-100 font-semibold">
                      Value: {v.value}
                    </span>
                  </div>
                  {v.pointsTo && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center text-[11px] font-mono text-emerald-400">
                      <CornerDownRight className="w-3.5 h-3.5 mr-1" />
                      <span>Points to address {v.pointsTo}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-4 text-center">Grows downward • Automatically cleaned on return</p>
        </div>

        {/* HEAP SEGMENT */}
        <div className="bg-[#0A0F1D] rounded-xl border border-slate-800 p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <h4 className="font-semibold text-slate-200 text-sm">Heap Segment (Dynamic)</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">malloc() / free()</span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {current.heapBlocks.length === 0 ? (
              <div className="text-center py-12 text-slate-600 text-xs italic">
                No active heap allocations in this step.
              </div>
            ) : (
              current.heapBlocks.map(hb => (
                <div
                  key={hb.id}
                  className={`p-4 rounded-lg border transition-all ${
                    hb.status === 'active'
                      ? 'bg-violet-950/40 border-violet-500/60 shadow-md'
                      : 'bg-slate-900/40 border-rose-900/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-semibold text-violet-300">Heap Block ({hb.size})</span>
                    <span className="font-mono text-[11px] text-violet-400">{hb.address}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono text-center text-slate-200 font-bold">
                    {hb.value}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className={`font-mono ${hb.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Status: {hb.status.toUpperCase()}
                    </span>
                    {hb.status === 'freed' && (
                      <span className="text-rose-400 flex items-center text-[10px]">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Ready for reallocation
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-4 text-center">Grows upward • Must be manually freed</p>
        </div>
      </div>

      {/* Explanation Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-start space-x-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed font-sans">{current.explanation}</p>
      </div>
    </div>
  );
};
