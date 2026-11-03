/**
 * Reusable Simulation Playback Controller Component.
 * Supports Play/Pause, Step Forward, Step Backward, Seeking, Speed Control,
 * Keyboard shortcuts, and operation annotations.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from 'lucide-react';
import { SimulationEngine } from '../../services/visualization/simulationEngine';
import { SimulationStep } from '@lumenode/shared-types';

interface SimulationPlayerProps<TState extends object> {
  engine: SimulationEngine<TState> | null;
  onStepChange?: (step: SimulationStep<TState> | null, state: TState) => void;
  className?: string;
}

export function SimulationPlayer<TState extends object>({
  engine,
  onStepChange,
  className = '',
}: SimulationPlayerProps<TState>): React.ReactElement | null {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 4x, 0.5x
  const [currentIndex, setCurrentIndex] = useState<number>(engine ? engine.getCurrentStepIndex() : -1);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state with engine
  const updateFromEngine = useCallback(() => {
    if (!engine) return;
    const idx = engine.getCurrentStepIndex();
    setCurrentIndex(idx);
    if (onStepChange) {
      onStepChange(engine.getCurrentStep(), engine.getCurrentState());
    }
  }, [engine, onStepChange]);

  useEffect(() => {
    if (!engine) return;
    const unsubscribe = engine.subscribe(updateFromEngine);
    updateFromEngine();
    return () => {
      unsubscribe();
    };
  }, [engine, updateFromEngine]);

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying || !engine) return;

    if (!engine.canStepForward()) {
      setIsPlaying(false);
      return;
    }

    const intervalMs = Math.max(150, 1000 / speed);
    playTimerRef.current = setTimeout(() => {
      const advanced = engine.stepForward();
      if (!advanced) {
        setIsPlaying(false);
      }
    }, intervalMs);

    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
    };
  }, [isPlaying, currentIndex, speed, engine]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engine) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        engine.stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        engine.stepBackward();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsPlaying(false);
        engine.reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  if (!engine) {
    return null;
  }

  const totalSteps = engine.getTotalSteps();
  const currentStep = engine.getCurrentStep();

  return (
    <div className={`flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/90 p-4 text-slate-200 ${className}`}>
      {/* Operation & Annotation Header */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-sky-950 px-2 py-0.5 font-mono text-xs font-semibold text-sky-400 border border-sky-800/50">
            {currentStep?.operation || (currentIndex === -1 ? 'INITIAL_STATE' : 'COMPLETE')}
          </span>
          <span className="font-mono text-xs text-slate-400">
            Step {currentIndex + 1} of {totalSteps}
          </span>
        </div>
        {currentStep?.comparison && (
          <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-950/80 px-2.5 py-1 rounded border border-slate-700">
            <span className="text-amber-400">{String(currentStep.comparison.leftValue)}</span>
            <span className="text-slate-400">{currentStep.comparison.operator}</span>
            <span className="text-sky-400">{String(currentStep.comparison.rightValue)}</span>
            <span className="text-slate-500">→</span>
            <span className={currentStep.comparison.result ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {currentStep.comparison.result ? 'TRUE' : 'FALSE'}
            </span>
          </div>
        )}
      </div>

      {/* Explanatory description */}
      <div className="min-h-[2.5rem] flex items-center text-sm text-slate-300">
        <p className="leading-relaxed">
          {currentStep?.description || (currentIndex === -1 ? 'Initial simulation state loaded. Step forward or press Play to begin.' : 'Simulation execution complete.')}
        </p>
      </div>

      {/* Optional Callout */}
      {currentStep?.callout && (
        <div className="rounded border-l-2 border-indigo-500 bg-indigo-950/40 p-2 text-xs text-indigo-300">
          {currentStep.callout}
        </div>
      )}

      {/* Scrubber Progress Bar */}
      <div className="flex items-center gap-2 pt-1">
        <span className="font-mono text-xs text-slate-500">0</span>
        <input
          type="range"
          min={-1}
          max={totalSteps - 1}
          value={currentIndex}
          onChange={(e) => {
            setIsPlaying(false);
            engine.jumpToStep(parseInt(e.target.value, 10));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-sky-500 focus:outline-none"
        />
        <span className="font-mono text-xs text-slate-500">{totalSteps}</span>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5">
          {/* Reset */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              engine.reset();
            }}
            title="Reset to Initial State (R)"
            className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Step Back */}
          <button
            type="button"
            disabled={!engine.canStepBackward()}
            onClick={() => {
              setIsPlaying(false);
              engine.stepBackward();
            }}
            title="Step Backward (Left Arrow)"
            className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            title="Play / Pause (Space)"
            className="flex h-8 w-16 items-center justify-center gap-1 rounded bg-sky-600 font-semibold text-white hover:bg-sky-500"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span className="text-xs">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span className="text-xs">Play</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            type="button"
            disabled={!engine.canStepForward()}
            onClick={() => {
              setIsPlaying(false);
              engine.stepForward();
            }}
            title="Step Forward (Right Arrow)"
            className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-0.5">
            <FastForward className="h-3 w-3" /> Speed:
          </span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`rounded px-1.5 py-0.5 font-mono ${
                speed === s
                  ? 'bg-sky-600 font-bold text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
