/**
 * SQLite WASM Service Adapter
 * Coordinates dedicated SQLite Web Worker, real query execution, schema inspection, and database reset.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export type TableSchemas = Record<string, TableColumn[]>;

export interface SQLQueryResult {
  columns: string[];
  values: (string | number | null)[][];
  durationMs: number;
  rowCount: number;
  rowsModified?: number;
  error?: string;
}

export class SQLRunner {
  private worker: Worker | null = null;
  private isReady = false;
  private currentSchemas: TableSchemas = {};
  private pendingRequests = new Map<
    string,
    {
      resolve: (res: any) => void;
      reject: (err: Error) => void;
      timeoutTimer: ReturnType<typeof setTimeout>;
    }
  >();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return;
    }

    try {
      this.worker = new Worker(
        new URL('../workers/sqlite.worker.ts', import.meta.url),
        { type: 'module' }
      );
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
    } catch (e) {
      console.error('Failed to instantiate SQLite Web Worker:', e);
    }
  }

  private handleWorkerMessage(event: MessageEvent) {
    const data = event.data;
    if (!data || !data.id) return;

    const pending = this.pendingRequests.get(data.id);
    if (!pending) return;

    clearTimeout(pending.timeoutTimer);
    this.pendingRequests.delete(data.id);

    if (data.schemas) {
      this.currentSchemas = data.schemas;
    }

    if (data.type === 'INIT_SUCCESS') {
      this.isReady = true;
      pending.resolve(data.schemas);
    } else if (data.type === 'EXECUTE_SUCCESS') {
      const firstResult = data.results && data.results.length > 0 ? data.results[0] : null;
      pending.resolve({
        columns: firstResult ? firstResult.columns : [],
        values: firstResult ? firstResult.values : [],
        durationMs: data.durationMs,
        rowCount: firstResult ? firstResult.values.length : 0,
        rowsModified: data.rowsModified,
      } as SQLQueryResult);
    } else if (data.type === 'EXECUTE_ERROR') {
      pending.resolve({
        columns: [],
        values: [],
        durationMs: data.durationMs || 0,
        rowCount: 0,
        error: data.error,
      } as SQLQueryResult);
    } else if (data.type === 'RESET_SUCCESS') {
      pending.resolve(data.schemas);
    } else {
      pending.reject(new Error(data.error || 'Unknown SQLite Worker response'));
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('SQLite Worker Error:', error);
    for (const [_id, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timeoutTimer);
      req.resolve({
        columns: [],
        values: [],
        durationMs: 0,
        rowCount: 0,
        error: `Worker crashed: ${error.message}`,
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
    this.initWorker();
  }

  public async initialize(): Promise<TableSchemas> {
    if (this.isReady) return this.currentSchemas;

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Web Workers not supported in current environment'));
        return;
      }

      const id = `init-${Date.now()}`;
      const timeoutTimer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('SQLite WASM initialization timed out'));
      }, 15000);

      this.pendingRequests.set(id, {
        resolve: () => resolve(this.currentSchemas),
        reject,
        timeoutTimer,
      });

      this.worker.postMessage({ type: 'INIT', id });
    });
  }

  public async execute(sql: string, timeoutMs = 5000): Promise<SQLQueryResult> {
    if (!this.worker) {
      return {
        columns: [],
        values: [],
        durationMs: 0,
        rowCount: 0,
        error: 'Web Workers are not available in this environment.',
      };
    }

    const id = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    return new Promise(resolve => {
      const timeoutTimer = setTimeout(() => {
        this.pendingRequests.delete(id);
        this.restartWorker();
        resolve({
          columns: [],
          values: [],
          durationMs: timeoutMs,
          rowCount: 0,
          error: `Query execution timed out after ${timeoutMs}ms. Database connection reset.`,
        });
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve,
        reject: err => {
          resolve({
            columns: [],
            values: [],
            durationMs: 0,
            rowCount: 0,
            error: err.message,
          });
        },
        timeoutTimer,
      });

      this.worker!.postMessage({ type: 'EXECUTE', id, sql });
    });
  }

  public async reset(): Promise<TableSchemas> {
    if (!this.worker) return {};

    const id = `reset-${Date.now()}`;
    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Database reset timed out'));
      }, 10000);

      this.pendingRequests.set(id, {
        resolve: () => resolve(this.currentSchemas),
        reject,
        timeoutTimer,
      });

      this.worker!.postMessage({ type: 'RESET', id });
    });
  }

  public getSchemas(): TableSchemas {
    return this.currentSchemas;
  }
}

export const sqlRunner = new SQLRunner();
