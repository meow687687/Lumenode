/**
 * Dedicated Web Worker for Pyodide (Python WASM Runtime)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare function importScripts(...urls: string[]): void;

let pyodide: any = null;
let isInitializing = false;

async function getPyodide() {
  if (pyodide) return pyodide;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 50));
    }
    return pyodide;
  }

  isInitializing = true;
  try {
    // Import Pyodide from jsDelivr CDN inside Web Worker
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js');
    const loadPyodideFn = (self as any).loadPyodide;
    if (!loadPyodideFn) {
      throw new Error('Failed to load Pyodide script from CDN');
    }

    pyodide = await loadPyodideFn({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/',
    });

    // Initialize standard IO redirection
    await pyodide.runPythonAsync(`
import sys
import io

class OutputCapture:
    def __init__(self):
        self.stdout_buf = io.StringIO()
        self.stderr_buf = io.StringIO()
    def start(self):
        self.stdout_buf = io.StringIO()
        self.stderr_buf = io.StringIO()
        sys.stdout = self.stdout_buf
        sys.stderr = self.stderr_buf
    def stop(self):
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__
        return self.stdout_buf.getvalue(), self.stderr_buf.getvalue()

_capture = OutputCapture()
`);

    return pyodide;
  } finally {
    isInitializing = false;
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, id, code } = event.data;

  if (type === 'INIT') {
    const startTime = performance.now();
    try {
      await getPyodide();
      self.postMessage({
        type: 'INIT_SUCCESS',
        id,
        durationMs: performance.now() - startTime,
      });
    } catch (err: any) {
      self.postMessage({
        type: 'INIT_ERROR',
        id,
        error: err?.message || String(err),
      });
    }
    return;
  }

  if (type === 'RESET') {
    try {
      if (pyodide) {
        // Clear user globals
        await pyodide.runPythonAsync(`
for key in list(globals().keys()):
    if not key.startswith('_') and key not in ['sys', 'io', 'OutputCapture']:
        del globals()[key]
`);
      }
      self.postMessage({ type: 'RESET_SUCCESS', id });
    } catch (err: any) {
      self.postMessage({ type: 'RESET_ERROR', id, error: err?.message || String(err) });
    }
    return;
  }

  if (type === 'EXECUTE') {
    const startTime = performance.now();
    try {
      const runtime = await getPyodide();
      
      // Start capturing stdout/stderr
      await runtime.runPythonAsync(`_capture.start()`);

      let evalResult: any = undefined;
      let errorStr: string | undefined = undefined;
      let status: 'success' | 'runtime_error' | 'compilation_error' = 'success';

      try {
        evalResult = await runtime.runPythonAsync(code);
      } catch (execErr: any) {
        status = 'runtime_error';
        errorStr = execErr?.message || String(execErr);
      }

      // Stop capture and get buffers
      const [stdout, stderr] = await runtime.runPythonAsync(`_capture.stop()`);

      const durationMs = Math.max(1, Math.round(performance.now() - startTime));

      self.postMessage({
        type: 'EXECUTE_RESULT',
        id,
        status,
        stdout: stdout || '',
        stderr: stderr || '',
        error: errorStr,
        evalResult: evalResult !== undefined ? String(evalResult) : undefined,
        durationMs,
      });
    } catch (err: any) {
      self.postMessage({
        type: 'EXECUTE_RESULT',
        id,
        status: 'runtime_error',
        stdout: '',
        stderr: '',
        error: err?.message || String(err),
        durationMs: Math.max(1, Math.round(performance.now() - startTime)),
      });
    }
  }
};
