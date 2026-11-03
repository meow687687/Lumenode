import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Plus, Trash2, ArrowRight, Zap, Info, SkipForward } from 'lucide-react';

interface ListNode {
  id: string;
  value: number;
  memoryAddr: string;
}

export const DSAVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'linked-list' | 'binary-search'>('linked-list');

  // --- Linked List State ---
  const [list, setList] = useState<ListNode[]>([
    { id: 'n1', value: 10, memoryAddr: '0x2A40' },
    { id: 'n2', value: 25, memoryAddr: '0x2A68' },
    { id: 'n3', value: 42, memoryAddr: '0x2AF0' },
    { id: 'n4', value: 88, memoryAddr: '0x2B14' },
  ]);
  const [inputValue, setInputValue] = useState<number>(50);
  const [traversalIndex, setTraversalIndex] = useState<number | null>(null);
  const [isTraversing, setIsTraversing] = useState<boolean>(false);
  const [logMessage, setLogMessage] = useState<string>('Linked list initialized with 4 nodes on the heap.');

  // Traversal loop
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isTraversing && traversalIndex !== null) {
      if (traversalIndex < list.length - 1) {
        timer = setTimeout(() => {
          setTraversalIndex(prev => (prev !== null ? prev + 1 : 0));
        }, 800);
      } else {
        setIsTraversing(false);
        setLogMessage('Reached tail node (next == NULL). Traversal finished in O(N) time.');
      }
    }
    return () => clearTimeout(timer);
  }, [isTraversing, traversalIndex, list.length]);

  const handleAppend = () => {
    const newAddr = '0x' + (0x2b00 + Math.floor(Math.random() * 0x0500)).toString(16).toUpperCase();
    const newNode: ListNode = {
      id: `n-${Date.now()}`,
      value: inputValue,
      memoryAddr: newAddr,
    };
    setList(prev => [...prev, newNode]);
    setLogMessage(`malloc() allocated 16 bytes at ${newAddr}. Tail's next pointer updated to ${newAddr}.`);
  };

  const handlePrepend = () => {
    const newAddr = '0x' + (0x2100 + Math.floor(Math.random() * 0x0400)).toString(16).toUpperCase();
    const newNode: ListNode = {
      id: `n-${Date.now()}`,
      value: inputValue,
      memoryAddr: newAddr,
    };
    setList(prev => [newNode, ...prev]);
    setLogMessage(`Node prepended at ${newAddr} in O(1) time. Head pointer now references ${newAddr}.`);
  };

  const handleDeleteHead = () => {
    if (list.length === 0) return;
    const removed = list[0];
    setList(prev => prev.slice(1));
    setLogMessage(`Head node freed (free(${removed.memoryAddr})). Head pointer updated to next node.`);
  };

  const startTraversal = () => {
    if (list.length === 0) return;
    setTraversalIndex(0);
    setIsTraversing(true);
    setLogMessage(`Traversal initiated. current = head (${list[0].memoryAddr}). Value: ${list[0].value}`);
  };

  const resetList = () => {
    setList([
      { id: 'n1', value: 10, memoryAddr: '0x2A40' },
      { id: 'n2', value: 25, memoryAddr: '0x2A68' },
      { id: 'n3', value: 42, memoryAddr: '0x2AF0' },
      { id: 'n4', value: 88, memoryAddr: '0x2B14' },
    ]);
    setTraversalIndex(null);
    setIsTraversing(false);
    setLogMessage('Reset linked list to baseline state.');
  };

  // --- Binary Search State ---
  const sortedArray = [3, 7, 11, 19, 24, 38, 45, 59, 72, 86, 94];
  const [bsTarget, setBsTarget] = useState<number>(38);
  const [bsLow, setBsLow] = useState<number>(0);
  const [bsHigh, setBsHigh] = useState<number>(sortedArray.length - 1);
  const [bsMid, setBsMid] = useState<number>(Math.floor((sortedArray.length - 1) / 2));
  const [bsFound, setBsFound] = useState<boolean | null>(null);
  const [bsStepCount, setBsStepCount] = useState<number>(0);
  const [bsLog, setBsLog] = useState<string>('Click "Step Forward" to bisect the search space.');

  const handleBsStep = () => {
    if (bsFound !== null) return;
    if (bsLow > bsHigh) {
      setBsFound(false);
      setBsLog(`Target ${bsTarget} not found in array. Search terminated.`);
      return;
    }

    const mid = Math.floor((bsLow + bsHigh) / 2);
    setBsMid(mid);
    const midVal = sortedArray[mid];

    if (midVal === bsTarget) {
      setBsFound(true);
      setBsStepCount(s => s + 1);
      setBsLog(`Match found! arr[${mid}] == ${bsTarget} in ${bsStepCount + 1} steps (O(log N)).`);
    } else if (midVal < bsTarget) {
      setBsStepCount(s => s + 1);
      setBsLow(mid + 1);
      setBsLog(`arr[${mid}] (${midVal}) < target (${bsTarget}). Discarding left half. low becomes ${mid + 1}.`);
    } else {
      setBsStepCount(s => s + 1);
      setBsHigh(mid - 1);
      setBsLog(`arr[${mid}] (${midVal}) > target (${bsTarget}). Discarding right half. high becomes ${mid - 1}.`);
    }
  };

  const resetBs = () => {
    setBsLow(0);
    setBsHigh(sortedArray.length - 1);
    setBsMid(Math.floor((sortedArray.length - 1) / 2));
    setBsFound(null);
    setBsStepCount(0);
    setBsLog('Binary search initialized. Array size N = ' + sortedArray.length);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header / Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E1526] gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-100 text-lg">Interactive DSA Laboratory</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                Idealized Educational Simulation
              </span>
            </div>
            <p className="text-xs text-slate-400">Deterministic Step-by-Step Algorithm & Memory Visualizer</p>
          </div>
        </div>

        <div className="flex space-x-2 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('linked-list')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'linked-list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Singly Linked List
          </button>
          <button
            onClick={() => setActiveTab('binary-search')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'binary-search'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Binary Search O(log N)
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="p-6">
        {activeTab === 'linked-list' ? (
          <div>
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-[#0A0F1D] rounded-lg border border-slate-800/80">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={e => setInputValue(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Val"
                />
                <button
                  onClick={handlePrepend}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 transition cursor-pointer"
                  title="Insert at head (O(1))"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prepend Head (O(1))</span>
                </button>
                <button
                  onClick={handleAppend}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 transition cursor-pointer"
                  title="Insert at tail"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Append Tail</span>
                </button>
                <button
                  onClick={handleDeleteHead}
                  disabled={list.length === 0}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-md text-xs font-medium border border-rose-800/60 transition disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Head</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={startTraversal}
                  disabled={isTraversing || list.length === 0}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Traverse Nodes</span>
                </button>
                <button
                  onClick={resetList}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-md border border-slate-700 cursor-pointer"
                  title="Reset List"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Node Diagram */}
            <div className="min-h-[220px] bg-[#0A0F1D]/80 rounded-xl p-6 border border-slate-800 flex items-center overflow-x-auto">
              <div className="flex items-center space-x-3">
                {/* Head Pointer Label */}
                <div className="flex flex-col items-center mr-4">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">
                    HEAD
                  </span>
                  <ArrowRight className="w-5 h-5 text-amber-400 mt-2" />
                  <span className="text-[10px] text-slate-500 font-mono mt-1">
                    {list.length > 0 ? list[0].memoryAddr : 'NULL'}
                  </span>
                </div>

                {list.length === 0 ? (
                  <div className="text-slate-500 italic text-sm">Linked list is empty (HEAD == NULL).</div>
                ) : (
                  list.map((node, index) => {
                    const isCurrent = traversalIndex === index;
                    return (
                      <React.Fragment key={node.id}>
                        {/* Node Card */}
                        <div
                          className={`relative flex flex-col rounded-lg transition-all duration-300 border ${
                            isCurrent
                              ? 'bg-blue-950/80 border-blue-400 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                              : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {/* Address Header */}
                          <div className="px-3 py-1 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>Addr:</span>
                            <span className="text-blue-400 font-semibold">{node.memoryAddr}</span>
                          </div>

                          {/* Data & Next Ptr Container */}
                          <div className="flex divide-x divide-slate-800">
                            {/* Data Compartment */}
                            <div className="px-4 py-3 flex flex-col items-center justify-center min-w-[70px]">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">data</span>
                              <span className="text-xl font-bold font-mono text-slate-100">{node.value}</span>
                            </div>

                            {/* Next Pointer Compartment */}
                            <div className="px-3 py-3 flex flex-col items-center justify-center bg-slate-950/40 min-w-[65px]">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">next</span>
                              <span className="text-[11px] font-mono font-semibold text-emerald-400">
                                {index < list.length - 1 ? list[index + 1].memoryAddr : 'NULL'}
                              </span>
                            </div>
                          </div>

                          {isCurrent && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-md">
                              CURRENT
                            </div>
                          )}
                        </div>

                        {/* Arrow to Next Node */}
                        <div className="flex items-center text-slate-500">
                          <ArrowRight className="w-6 h-6 text-emerald-500/80" />
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                {/* NULL Terminator */}
                {list.length > 0 && (
                  <div className="flex flex-col items-center ml-2">
                    <span className="px-3 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-rose-400 font-bold">
                      NULL
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Console / Log */}
            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-xs flex items-center justify-between">
              <span className="text-slate-400">
                <span className="text-blue-400 mr-2 font-bold">[Trace]</span>
                {logMessage}
              </span>
              <span className="text-slate-500 text-[11px] flex items-center">
                <Info className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Addresses are simulated heap illustrations
              </span>
            </div>
          </div>
        ) : (
          /* Binary Search Tab */
          <div>
            {/* Binary Search Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-[#0A0F1D] rounded-lg border border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-300 font-medium">Search Target:</span>
                <select
                  value={bsTarget}
                  onChange={e => {
                    setBsTarget(Number(e.target.value));
                    resetBs();
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 font-mono cursor-pointer"
                >
                  {sortedArray.map(val => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                  <option value={999}>999 (Not Present)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBsStep}
                  disabled={bsFound !== null}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition disabled:opacity-50 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Step Forward</span>
                </button>
                <button
                  onClick={resetBs}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-md border border-slate-700 cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Array Cells */}
            <div className="p-6 bg-[#0A0F1D]/80 rounded-xl border border-slate-800 overflow-x-auto">
              <div className="flex items-end justify-center space-x-2 min-w-max pb-6">
                {sortedArray.map((val, idx) => {
                  const isLow = idx === bsLow;
                  const isHigh = idx === bsHigh;
                  const isMid = idx === bsMid;
                  const inRange = idx >= bsLow && idx <= bsHigh;
                  const isTarget = val === bsTarget && bsFound === true && isMid;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      {/* Pointers Labels */}
                      <div className="h-6 flex items-center space-x-1 text-[10px] font-mono font-bold mb-1">
                        {isLow && <span className="text-cyan-400">L</span>}
                        {isMid && <span className="text-amber-400 bg-amber-950 px-1 rounded">MID</span>}
                        {isHigh && <span className="text-violet-400">H</span>}
                      </div>

                      {/* Cell Block */}
                      <div
                        className={`w-12 h-14 rounded-lg flex items-center justify-center font-mono font-bold text-base transition-all ${
                          isTarget
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/50 scale-110 shadow-lg'
                            : isMid
                            ? 'bg-amber-600/90 text-white ring-2 ring-amber-400'
                            : inRange
                            ? 'bg-slate-800 text-slate-100 border border-slate-700'
                            : 'bg-slate-900/40 text-slate-600 border border-slate-800/40 opacity-40'
                        }`}
                      >
                        {val}
                      </div>

                      {/* Index Label */}
                      <span className="text-[10px] font-mono text-slate-500 mt-1">[{idx}]</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trace Log */}
            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
              <span className="text-slate-300">
                <span className="text-blue-400 font-bold mr-2">[Step {bsStepCount}]</span>
                {bsLog}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Time Complexity: <span className="text-emerald-400">O(log N)</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
