/**
 * Python Execution Service Adapter
 * Manages dedicated Pyodide Web Worker lifecycle, timeout cancellation, and stdout/stderr capture.
 */

import { ExecutionResult } from '../types';

export class PythonRunner {
  private worker: Worker | null = null;
  private isReady = false;
  private isInitializing = false;
  private pendingRequests = new Map<
    string,
    {
      resolve: (res: ExecutionResult) => void;
      reject: (err: Error) => void;
      timeoutTimer: ReturnType<typeof setTimeout>;
      startTime: number;
    }
  >();

  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return;
    }

    try {
      this.worker = new Worker(
        new URL('../workers/python.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
    } catch (e) {
      console.error('Failed to instantiate Python Web Worker:', e);
    }
  }

  private handleWorkerMessage(event: MessageEvent) {
    const data = event.data;
    if (!data || !data.id) return;

    const pending = this.pendingRequests.get(data.id);
    if (!pending) return;

    clearTimeout(pending.timeoutTimer);
    this.pendingRequests.delete(data.id);

    if (data.type === 'EXECUTE_RESULT') {
      pending.resolve({
        executionId: data.id,
        language: 'python',
        status: data.status,
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        error: data.error,
        durationMs: data.durationMs,
        exitCode: data.status === 'success' ? 0 : 1,
      });
    } else if (data.type === 'INIT_SUCCESS') {
      this.isReady = true;
      pending.resolve({
        executionId: data.id,
        language: 'python',
        status: 'success',
        stdout: 'Python 3 runtime initialized successfully.\n',
        stderr: '',
        durationMs: data.durationMs || 0,
        exitCode: 0,
      });
    } else if (data.type === 'INIT_ERROR') {
      pending.reject(new Error(data.error || 'Failed to initialize Python runtime'));
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Python Worker Error:', error);
    for (const [id, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timeoutTimer);
      req.resolve({
        executionId: id,
        language: 'python',
        status: 'runtime_error',
        stdout: '',
        stderr: '',
        error: `Worker crashed: ${error.message}`,
        durationMs: Math.round(performance.now() - req.startTime),
        exitCode: 1,
      });
    }
    this.pendingRequests.clear();
    this.restartWorker();
  }

  private restartWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    this.isInitializing = false;
    this.initPromise = null;
    this.initWorker();
  }

  public async preloadRuntime(): Promise<void> {
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Web Workers not supported in current environment'));
        return;
      }

      const id = `init-${Date.now()}`;
      const timeoutTimer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Python runtime initialization timed out after 30 seconds'));
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: () => resolve(),
        reject,
        timeoutTimer,
        startTime: performance.now(),
      });

      this.worker.postMessage({ type: 'INIT', id });
    });

    return this.initPromise;
  }

  public async execute(code: string, timeoutMs = 5000): Promise<ExecutionResult> {
    if (!this.worker) {
      return {
        executionId: `err-${Date.now()}`,
        language: 'python',
        status: 'runtime_error',
        stdout: '',
        stderr: '',
        error: 'Web Workers are not supported in this environment.',
        durationMs: 0,
        exitCode: 1,
      };
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();

    return new Promise<ExecutionResult>(resolve => {
      const timeoutTimer = setTimeout(() => {
        this.pendingRequests.delete(executionId);
        // Force terminate hung worker (e.g. while True: pass)
        this.restartWorker();

        resolve({
          executionId,
          language: 'python',
          status: 'timeout',
          stdout: '',
          stderr: '',
          error: `Execution timed out after ${timeoutMs}ms limit. Process was terminated.`,
          durationMs: timeoutMs,
          exitCode: 124,
        });
      }, timeoutMs);

      this.pendingRequests.set(executionId, {
        resolve,
        reject: err => {
          resolve({
            executionId,
            language: 'python',
            status: 'runtime_error',
            stdout: '',
            stderr: '',
            error: err.message,
            durationMs: Math.round(performance.now() - startTime),
            exitCode: 1,
          });
        },
        timeoutTimer,
        startTime,
      });

      this.worker!.postMessage({
        type: 'EXECUTE',
        id: executionId,
        code,
      });
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Global singleton instance for application reuse
export const pythonRunner = new PythonRunner();
