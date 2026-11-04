/**
 * Binary Search Tree (BST) Laboratory Component.
 * Interactive SVG visualization supporting Insert, Search, Delete, Traversals,
 * and deterministic playback.
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, RotateCcw, ListOrdered, ArrowDown } from 'lucide-react';
import { BSTModel, BSTTreeState, BSTNode } from '../../services/visualization/bstModel';
import { SimulationEngine } from '../../services/visualization/simulationEngine';
import { SimulationPlayer } from './SimulationPlayer';

interface NodeLayout {
  id: string;
  value: number;
  x: number;
  y: number;
  left?: NodeLayout | null;
  right?: NodeLayout | null;
}

export const BSTLab: React.FC = () => {
  // Tree state managed via simulation traces
  const [treeState, setTreeState] = useState<BSTTreeState>(() => {
    let initial = BSTModel.createEmptyState();
    [50, 25, 75, 15, 35, 65, 85].forEach((v) => {
      initial = BSTModel.insert(initial, v).nextState;
    });
    return initial;
  });

  const [activeEngine, setActiveEngine] = useState<SimulationEngine<BSTTreeState> | null>(null);
  const [inputValue, setInputValue] = useState<string>('42');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [secondaryNodes, setSecondaryNodes] = useState<string[]>([]);

  // Calculate 2D layout for SVG tree
  const layout = useMemo(() => {
    if (!treeState.root) return null;

    let index = 0;
    const computeCoordinates = (node: BSTNode | null, depth: number): NodeLayout | null => {
      if (!node) return null;

      const leftLayout = computeCoordinates(node.left, depth + 1);
      const xPos = index++ * 55 + 50;
      const yPos = depth * 65 + 45;
      const rightLayout = computeCoordinates(node.right, depth + 1);

      return {
        id: node.id,
        value: node.value,
        x: xPos,
        y: yPos,
        left: leftLayout,
        right: rightLayout,
      };
    };

    return computeCoordinates(treeState.root, 0);
  }, [treeState.root]);

  // Flatten nodes and edges for SVG rendering
  const { renderedNodes, renderedEdges, svgWidth, svgHeight } = useMemo(() => {
    const nodes: Array<{ id: string; value: number; x: number; y: number }> = [];
    const edges: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }> = [];
    let maxX = 500;
    let maxY = 320;

    const traverse = (item: NodeLayout | null) => {
      if (!item) return;
      nodes.push({ id: item.id, value: item.value, x: item.x, y: item.y });
      maxX = Math.max(maxX, item.x + 60);
      maxY = Math.max(maxY, item.y + 60);

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

  const handleInsert = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const { nextState, trace } = BSTModel.insert(treeState, val);
    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
    setTreeState(nextState);
  };

  const handleSearch = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const trace = BSTModel.search(treeState, val);
    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
  };

  const handleDelete = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const { nextState, trace } = BSTModel.delete(treeState, val);
    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
    setTreeState(nextState);
  };

  const handleTraverse = (type: 'inorder' | 'preorder' | 'postorder' | 'levelorder') => {
    const { trace } = BSTModel.traverse(treeState, type);
    const engine = new SimulationEngine({ trace });
    setActiveEngine(engine);
  };

  const handleReset = () => {
    const empty = BSTModel.createEmptyState();
    setTreeState(empty);
    setActiveEngine(null);
    setHighlightedNodes([]);
    setSecondaryNodes([]);
  };

  const handlePreset = (preset: number[]) => {
    let next = BSTModel.createEmptyState();
    preset.forEach((v) => {
      next = BSTModel.insert(next, v).nextState;
    });
    setTreeState(next);
    setActiveEngine(null);
  };

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-sky-500 animate-pulse" />
            Binary Search Tree (BST) Laboratory
          </h2>
          <p className="text-sm text-slate-400">
            Interactive BST with strict ordering invariants, in-place deletion mechanics, and multi-order traversals.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300">
            Nodes: <strong className="text-white">{treeState.nodeCount}</strong>
          </span>
          <span className="rounded bg-slate-800 px-2.5 py-1 text-slate-300">
            Height: <strong className="text-white">{treeState.height}</strong>
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
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-900 p-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-24 rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-mono text-white focus:border-sky-500 focus:outline-none"
            placeholder="Key"
          />
          <button
            onClick={handleInsert}
            className="flex items-center gap-1 rounded bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
          >
            <Plus className="h-3.5 w-3.5" /> Insert
          </button>
          <button
            onClick={handleSearch}
            className="flex items-center gap-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
          >
            <Search className="h-3.5 w-3.5" /> Search
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 rounded bg-rose-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>

        <div className="h-5 w-px bg-slate-700 hidden sm:block" />

        {/* Traversals */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <ListOrdered className="h-3.5 w-3.5" /> Traverse:
          </span>
          <button
            onClick={() => handleTraverse('inorder')}
            className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            In-Order
          </button>
          <button
            onClick={() => handleTraverse('preorder')}
            className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Pre-Order
          </button>
          <button
            onClick={() => handleTraverse('postorder')}
            className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Post-Order
          </button>
          <button
            onClick={() => handleTraverse('levelorder')}
            className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Level-Order
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-xs">
          <span className="text-slate-500">Presets:</span>
          <button
            onClick={() => handlePreset([50, 25, 75, 12, 37, 62, 87])}
            className="rounded bg-slate-800/80 px-2 py-0.5 text-slate-400 hover:text-slate-200"
          >
            Balanced
          </button>
          <button
            onClick={() => handlePreset([10, 20, 30, 40, 50])}
            className="rounded bg-slate-800/80 px-2 py-0.5 text-slate-400 hover:text-slate-200"
          >
            Skewed (Linked List)
          </button>
        </div>
      </div>

      {/* Interactive SVG Diagram */}
      <div className="relative min-h-[360px] overflow-x-auto overflow-y-hidden rounded-lg border border-slate-800 bg-slate-900/60 p-4 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="sm:hidden text-[10px] text-slate-500 mb-2 flex items-center justify-between">
          <span>&larr; Swipe to pan wide trees &rarr;</span>
        </div>
        {treeState.root === null ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500">
            <ArrowDown className="h-8 w-8 animate-bounce mb-2 text-slate-600" />
            <p className="text-base font-semibold">Tree is currently empty</p>
            <p className="text-xs text-slate-600">Enter a number above and click "Insert" to begin building the tree.</p>
          </div>
        ) : (
          <svg
            width={Math.max(600, svgWidth)}
            height={Math.max(340, svgHeight)}
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
              const isPrimary = highlightedNodes.includes(n.id);
              const isSecondary = secondaryNodes.includes(n.id);

              let fillColor = '#0f172a';
              let strokeColor = '#38bdf8';
              let textColor = '#f8fafc';

              if (isPrimary) {
                fillColor = '#0284c7';
                strokeColor = '#38bdf8';
                textColor = '#ffffff';
              } else if (isSecondary) {
                fillColor = '#d97706';
                strokeColor = '#fbbf24';
                textColor = '#ffffff';
              }

              return (
                <g key={n.id} className="transition-all duration-300">
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={22}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isPrimary ? 3 : 2}
                    className="cursor-pointer transition-colors duration-200"
                  />
                  <text
                    x={n.x}
                    y={n.y + 5}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={13}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {n.value}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Simulation Playback Player */}
      {activeEngine && (
        <SimulationPlayer
          engine={activeEngine}
          onStepChange={(step) => {
            if (step) {
              setHighlightedNodes(step.highlightedNodeIds || []);
              setSecondaryNodes(step.secondaryHighlightedNodeIds || []);
            }
          }}
        />
      )}
    </div>
  );
};
