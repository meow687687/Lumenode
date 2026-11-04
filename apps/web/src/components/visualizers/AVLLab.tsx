/**
 * AVL Tree Balancing & Rotation Laboratory Component.
 * Demonstrates Balance Factors (BF = H_L - H_R), Imbalance Detection,
 * and Left-Left (LL), Right-Right (RR), Left-Right (LR), Right-Left (RL) Rotations.
 */

import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { AVLModel, AVLTreeState, AVLNode } from '../../services/visualization/avlModel';
import { SimulationEngine } from '../../services/visualization/simulationEngine';
import { SimulationPlayer } from './SimulationPlayer';

interface NodeLayout {
  id: string;
  value: number;
  height: number;
  balanceFactor: number;
  x: number;
  y: number;
  left?: NodeLayout | null;
  right?: NodeLayout | null;
}

export const AVLLab: React.FC = () => {
  const [treeState, setTreeState] = useState<AVLTreeState>(() => {
    let initial = AVLModel.createEmptyState();
    [40, 20, 60, 10, 30, 50, 70].forEach((v) => {
      initial = AVLModel.insert(initial, v).nextState;
    });
    return initial;
  });

  const [activeEngine, setActiveEngine] = useState<SimulationEngine<AVLTreeState> | null>(null);
  const [inputValue, setInputValue] = useState<string>('25');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  // 2D SVG Layout
  const layout = useMemo(() => {
    if (!treeState.root) return null;

    let index = 0;
    const computeCoordinates = (node: AVLNode | null, depth: number): NodeLayout | null => {
      if (!node) return null;

      const leftLayout = computeCoordinates(node.left, depth + 1);
      const xPos = index++ * 65 + 60;
      const yPos = depth * 70 + 50;
      const rightLayout = computeCoordinates(node.right, depth + 1);

      return {
        id: node.id,
        value: node.value,
        height: node.height,
        balanceFactor: node.balanceFactor,
        x: xPos,
        y: yPos,
        left: leftLayout,
        right: rightLayout,
      };
    };

    return computeCoordinates(treeState.root, 0);
  }, [treeState.root]);

  const { renderedNodes, renderedEdges, svgWidth, svgHeight } = useMemo(() => {
    const nodes: NodeLayout[] = [];
    const edges: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }> = [];
    let maxX = 550;
    let maxY = 340;

    const traverse = (item: NodeLayout | null) => {
      if (!item) return;
      nodes.push(item);
      maxX = Math.max(maxX, item.x + 70);
      maxY = Math.max(maxY, item.y + 70);

      if (item.left) {
        edges.push({
          id: `edge-${item.id}-${item.left.id}`,
          x1: item.x,
          y1: item.y,
          x2: item.left.x,
          y2: item.left.y,
        });
        traverse(item.left);
      }
      if (item.right) {
        edges.push({
          id: `edge-${item.id}-${item.right.id}`,
          x1: item.x,
          y1: item.y,
          x2: item.right.x,
          y2: item.right.y,
        });
        traverse(item.right);
      }
    };

    traverse(layout);
    return { renderedNodes: nodes, renderedEdges: edges, svgWidth: maxX, svgHeight: maxY };
  }, [layout]);

  const handleInsert = (valueToInsert?: number) => {
    const val = valueToInsert !== undefined ? valueToInsert : parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const { nextState, trace } = AVLModel.insert(treeState, val);
    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
    setTreeState(nextState);
  };

  const handleTriggerRotationPreset = (type: 'LL' | 'RR' | 'LR' | 'RL') => {
    let base = AVLModel.createEmptyState();
    let triggerKey = 10;

    if (type === 'LL') {
      base = AVLModel.insert(base, 30).nextState;
      base = AVLModel.insert(base, 20).nextState;
      triggerKey = 10;
    } else if (type === 'RR') {
      base = AVLModel.insert(base, 10).nextState;
      base = AVLModel.insert(base, 20).nextState;
      triggerKey = 30;
    } else if (type === 'LR') {
      base = AVLModel.insert(base, 30).nextState;
      base = AVLModel.insert(base, 10).nextState;
      triggerKey = 20;
    } else if (type === 'RL') {
      base = AVLModel.insert(base, 10).nextState;
      base = AVLModel.insert(base, 30).nextState;
      triggerKey = 20;
    }

    setTreeState(base);
    const { nextState, trace } = AVLModel.insert(base, triggerKey);
    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
    setTreeState(nextState);
  };

  const handleClear = () => {
    setTreeState(AVLModel.createEmptyState());
    setActiveEngine(null);
    setHighlightedNodes([]);
  };

  const isBalanced = AVLModel.validateAVLInvariants(treeState.root).valid;

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            AVL Tree Rotation & Self-Balancing Laboratory
          </h2>
          <p className="text-sm text-slate-400">
            Adelson-Velsky and Landis self-balancing binary search tree. Enforces balance factor invariant |BF| &le; 1.
          </p>
        </div>

        {/* Invariant status badge */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold ${isBalanced ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
            {isBalanced ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {isBalanced ? 'AVL Invariant Preserved (|BF| ≤ 1)' : 'Imbalance Detected'}
          </span>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Toolbar & Rotation Trigger Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-900 p-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-24 rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
            placeholder="Key"
          />
          <button
            onClick={() => handleInsert()}
            className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            <Plus className="h-3.5 w-3.5" /> Insert & Balance
          </button>
        </div>

        {/* 4 Rotation Case Triggers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> Trigger Rotation:
          </span>
          <button
            onClick={() => handleTriggerRotationPreset('LL')}
            className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-sky-400 hover:bg-slate-700 border border-sky-800/40"
            title="Left-Left: Single Right Rotation"
          >
            LL (Right Rotate)
          </button>
          <button
            onClick={() => handleTriggerRotationPreset('RR')}
            className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-purple-400 hover:bg-slate-700 border border-purple-800/40"
            title="Right-Right: Single Left Rotation"
          >
            RR (Left Rotate)
          </button>
          <button
            onClick={() => handleTriggerRotationPreset('LR')}
            className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-amber-400 hover:bg-slate-700 border border-amber-800/40"
            title="Left-Right: Left Rotate child then Right Rotate parent"
          >
            LR (Double Rotate)
          </button>
          <button
            onClick={() => handleTriggerRotationPreset('RL')}
            className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-slate-700 border border-rose-800/40"
            title="Right-Left: Right Rotate child then Left Rotate parent"
          >
            RL (Double Rotate)
          </button>
        </div>
      </div>

      {/* SVG Tree View */}
      <div className="relative min-h-[380px] overflow-x-auto overflow-y-hidden rounded-lg border border-slate-800 bg-slate-900/60 p-4 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="sm:hidden text-[10px] text-slate-500 mb-2 flex items-center justify-between">
          <span>&larr; Swipe to pan wide trees &rarr;</span>
        </div>
        {treeState.root === null ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500">
            <p className="text-base font-semibold">AVL Tree is empty</p>
            <p className="text-xs text-slate-600">Click any of the rotation triggers above to watch self-balancing in action.</p>
          </div>
        ) : (
          <svg
            width={Math.max(620, svgWidth)}
            height={Math.max(360, svgHeight)}
            className="mx-auto block"
          >
            {/* Edges */}
            {renderedEdges.map((e) => (
              <line
                key={e.id}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="#334155"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            ))}

            {/* Nodes */}
            {renderedNodes.map((n) => {
              const isHighlighted = highlightedNodes.includes(n.id);
              const isImbalanced = Math.abs(n.balanceFactor) > 1;

              let strokeColor = '#10b981';
              if (isImbalanced) strokeColor = '#f43f5e';
              else if (isHighlighted) strokeColor = '#38bdf8';

              return (
                <g key={n.id} className="transition-all duration-300">
                  {/* Node Circle */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={24}
                    fill={isHighlighted ? '#065f46' : '#0f172a'}
                    stroke={strokeColor}
                    strokeWidth={isImbalanced || isHighlighted ? 3 : 2}
                  />

                  {/* Value */}
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize={13}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {n.value}
                  </text>

                  {/* Balance Factor Badge */}
                  <rect
                    x={n.x + 14}
                    y={n.y - 24}
                    width={22}
                    height={16}
                    rx={4}
                    fill={isImbalanced ? '#e11d48' : '#1e293b'}
                    stroke={isImbalanced ? '#fda4af' : '#475569'}
                    strokeWidth={1}
                  />
                  <text
                    x={n.x + 25}
                    y={n.y - 12}
                    textAnchor="middle"
                    fill={isImbalanced ? '#ffffff' : '#94a3b8'}
                    fontSize={9}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {n.balanceFactor > 0 ? `+${n.balanceFactor}` : n.balanceFactor}
                  </text>

                  {/* Height annotation */}
                  <text
                    x={n.x}
                    y={n.y + 36}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={10}
                    fontFamily="monospace"
                  >
                    h={n.height}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Playback Controller */}
      {activeEngine && (
        <SimulationPlayer
          engine={activeEngine}
          onStepChange={(step) => {
            if (step) {
              setHighlightedNodes(step.highlightedNodeIds || []);
            }
          }}
        />
      )}
    </div>
  );
};
