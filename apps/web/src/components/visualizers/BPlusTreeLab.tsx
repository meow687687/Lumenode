/**
 * B+ Tree Laboratory Component.
 * Visualizes multi-tier B+ Tree Index Architecture, Leaf Splitting, Separator Promotion,
 * Range Scans, and horizontal leaf sibling chaining.
 */

import React, { useState } from 'react';
import { Plus, Search, RotateCcw, ArrowRight, Layers, Database } from 'lucide-react';
import { BPlusModel, BPlusTreeState, BPlusNode } from '../../services/visualization/bplusModel';
import { SimulationEngine } from '../../services/visualization/simulationEngine';
import { SimulationPlayer } from './SimulationPlayer';

export const BPlusTreeLab: React.FC = () => {
  const [treeState, setTreeState] = useState<BPlusTreeState>(() => {
    let initial = BPlusModel.createEmptyState(3);
    [10, 20, 30, 40, 50, 60].forEach((k) => {
      initial = BPlusModel.insert(initial, k).nextState;
    });
    return initial;
  });

  const [activeEngine, setActiveEngine] = useState<SimulationEngine<BPlusTreeState> | null>(null);
  const [insertKey, setInsertKey] = useState<string>('25');
  const [rangeStart, setRangeStart] = useState<string>('20');
  const [rangeEnd, setRangeEnd] = useState<string>('50');
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [rangeResults, setRangeResults] = useState<number[] | null>(null);

  const handleInsert = () => {
    const val = parseInt(insertKey, 10);
    if (isNaN(val)) return;

    const { nextState, trace } = BPlusModel.insert(treeState, val);
    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
    setTreeState(nextState);
    setRangeResults(null);
  };

  const handleRangeSearch = () => {
    const start = parseInt(rangeStart, 10);
    const end = parseInt(rangeEnd, 10);
    if (isNaN(start) || isNaN(end)) return;

    const { matchedKeys, trace } = BPlusModel.rangeSearch(treeState, start, end);
    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
    setRangeResults(matchedKeys);
  };

  const handleOrderChange = (newOrder: number) => {
    let fresh = BPlusModel.createEmptyState(newOrder);
    [10, 20, 30, 40, 50].forEach((k) => {
      fresh = BPlusModel.insert(fresh, k).nextState;
    });
    setTreeState(fresh);
    setActiveEngine(null);
    setRangeResults(null);
  };

  const handleReset = () => {
    setTreeState(BPlusModel.createEmptyState(treeState.order));
    setActiveEngine(null);
    setHighlightedNodeIds([]);
    setRangeResults(null);
  };

  // Group nodes by tree level for tiered rendering
  const levels: BPlusNode[][] = [];
  const collectLevels = (node: BPlusNode, depth: number) => {
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    if (!node.isLeaf && node.children) {
      node.children.forEach((c) => collectLevels(c, depth + 1));
    }
  };
  collectLevels(treeState.root, 0);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-400" />
            B+ Tree Laboratory (Database Storage Engine Index)
          </h2>
          <p className="text-sm text-slate-400">
            Internal routing separators partition search spaces; leaf nodes hold actual records linked horizontally for O(1) range queries.
          </p>
        </div>

        {/* Tree Metrics */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-300">
            <span>Order (M):</span>
            <select
              value={treeState.order}
              onChange={(e) => handleOrderChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-indigo-400 font-bold focus:outline-none"
            >
              <option value={3}>3 (2 keys/node)</option>
              <option value={4}>4 (3 keys/node)</option>
              <option value={5}>5 (4 keys/node)</option>
            </select>
          </div>
          <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300">
            Height: <strong className="text-white">{treeState.height}</strong>
          </span>
          <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300">
            Total Keys: <strong className="text-white">{treeState.totalKeys}</strong>
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-900 p-3 border border-slate-800">
        {/* Key Insert */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={insertKey}
            onChange={(e) => setInsertKey(e.target.value)}
            className="w-20 rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm font-mono text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Key"
          />
          <button
            onClick={handleInsert}
            className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <Plus className="h-3.5 w-3.5" /> Insert Key
          </button>
        </div>

        {/* Range Query */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Range:</span>
          <input
            type="number"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-mono text-white"
          />
          <span className="text-slate-500">to</span>
          <input
            type="number"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-mono text-white"
          />
          <button
            onClick={handleRangeSearch}
            className="flex items-center gap-1 rounded bg-emerald-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
          >
            <Search className="h-3.5 w-3.5" /> Execute Range Scan
          </button>
        </div>
      </div>

      {/* Range query result indicator */}
      {rangeResults !== null && (
        <div className="rounded border border-emerald-800 bg-emerald-950/40 p-2.5 text-xs text-emerald-300 flex items-center justify-between font-mono">
          <span>Range Query [{rangeStart} - {rangeEnd}] Results: [{rangeResults.join(', ')}]</span>
          <span className="font-sans text-slate-400">Scanned sequentially across leaf linked list</span>
        </div>
      )}

      {/* Multi-Tier Tree Diagram */}
      <div className="flex flex-col gap-6 overflow-auto rounded-lg border border-slate-800 bg-slate-900/60 p-6 min-h-[300px]">
        {levels.map((levelNodes, depth) => {
          const isLeafLevel = depth === levels.length - 1;

          return (
            <div key={`level-${depth}`} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                {isLeafLevel ? 'Leaf Level (Record Buckets & Linked Chain)' : `Internal Level ${depth} (Separators)`}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 py-2">
                {levelNodes.map((node, _nodeIdx) => {
                  const isHighlighted = highlightedNodeIds.includes(node.id);

                  return (
                    <div key={node.id} className="flex items-center gap-3">
                      <div
                        className={`flex items-center divide-x rounded-lg border px-1 py-1 font-mono text-sm transition-all duration-300 ${
                          node.isLeaf
                            ? 'border-emerald-700 bg-emerald-950/30 divide-emerald-800'
                            : 'border-indigo-700 bg-indigo-950/40 divide-indigo-800'
                        } ${isHighlighted ? 'ring-2 ring-sky-400 shadow-lg scale-105' : ''}`}
                      >
                        {node.keys.length === 0 ? (
                          <span className="px-3 py-1 text-xs text-slate-500 italic">Empty</span>
                        ) : (
                          node.keys.map((k, kIdx) => (
                            <span
                              key={kIdx}
                              className={`px-3 py-1 font-bold ${
                                node.isLeaf ? 'text-emerald-300' : 'text-indigo-300'
                              }`}
                            >
                              {k}
                            </span>
                          ))
                        )}
                      </div>

                      {/* Horizontal leaf link pointer */}
                      {isLeafLevel && node.nextLeaf && (
                        <div className="flex items-center text-emerald-500/70" title="nextLeaf horizontal pointer">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Playback Controller */}
      {activeEngine && (
        <SimulationPlayer
          engine={activeEngine}
          onStepChange={(step) => {
            if (step) {
              setHighlightedNodeIds(step.highlightedNodeIds || []);
            }
          }}
        />
      )}
    </div>
  );
};
