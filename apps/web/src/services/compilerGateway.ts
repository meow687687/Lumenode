/**
 * Standardized C/C++ Compiler Gateway Client
 * Implements the Lumenode Compiler Gateway Protocol (ADR 0004).
 * Communicates with Judge0-compatible remote execution sandboxes or custom runners.
 * Accurately parses compilation diagnostics, runtime signals, and resource analytics.
 * Strictly adheres to truthfulness: never fabricates or simulates execution results.
 */

export type CompilerLanguage = 'c' | 'cpp';

export type CompilerExecutionStatus =
  | 'success'
  | 'compilation_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'gateway_unreachable'
  | 'gateway_not_configured';

export interface CompilerRequestOptions {
  sourceCode: string;
  language: CompilerLanguage;
  stdin?: string;
  compilerOptions?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface CompilerExecutionResult {
  status: CompilerExecutionStatus;
  stdout: string;
  stderr: string;
  compileOutput?: string;
  exitCode?: number;
  durationMs: number;
  compileDurationMs?: number;
  memoryKb?: number;
  signal?: string;
  message: string;
  gatewayUrl: string | null;
}

// Judge0 Language IDs
const LANGUAGE_IDS: Record<CompilerLanguage, number> = {
  c: 50, // C (GCC 11.2.0)
  cpp: 54, // C++ (GCC 11.2.0 / C++17)
};

export class CompilerGatewayClient {
  private gatewayUrl: string | null;

  constructor(customUrl?: string) {
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_COMPILER_GATEWAY_URL
      : undefined;

    this.gatewayUrl = customUrl || envUrl || null;
  }

  /**
   * Returns whether a compiler gateway endpoint has been configured.
   */
  public isConfigured(): boolean {
    return Boolean(this.gatewayUrl && this.gatewayUrl.trim().length > 0);
  }

  /**
   * Returns the currently configured gateway URL.
   */
  public getGatewayUrl(): string | null {
    return this.gatewayUrl;
  }

  /**
   * Verifies connectivity to the gateway.
   */
  public async checkHealth(): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const url = new URL('/health', this.gatewayUrl!).toString();
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Submits C or C++ source code to the execution gateway.
   */
  public async execute(options: CompilerRequestOptions): Promise<CompilerExecutionResult> {
    const { sourceCode, language, stdin = '', compilerOptions, timeoutMs = 8000 } = options;

    if (!this.isConfigured()) {
      return {
        status: 'gateway_not_configured',
        stdout: '',
        stderr: '',
        message:
          'Compiler Gateway is not configured. Set VITE_COMPILER_GATEWAY_URL to enable remote sandboxed C/C++ execution. Alternatively, inspect memory and activation frames using the Call-Stack or Memory Simulator labs.',
        durationMs: 0,
        gatewayUrl: null,
      };
    }

    const defaultFlags =
      language === 'c'
        ? '-Wall -Wextra -O2 -std=c11'
        : '-Wall -Wextra -O2 -std=c++17';

    const payload = {
      source_code: sourceCode,
      language_id: LANGUAGE_IDS[language],
      stdin,
      compiler_options: compilerOptions || defaultFlags,
      cpu_time_limit: 2.0,
      wall_time_limit: 5.0,
      memory_limit: 65536, // 64 MB
    };

    const startTime = performance.now();
    const endpoint = `${this.gatewayUrl!.replace(/\/$/, '')}/submissions?wait=true`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: options.signal || controller.signal,
      });

      clearTimeout(timer);
      const durationMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        return {
          status: 'gateway_unreachable',
          stdout: '',
          stderr: '',
          message: `Gateway responded with HTTP status ${response.status}: ${response.statusText}`,
          durationMs,
          gatewayUrl: this.gatewayUrl,
        };
      }

      const data = await response.json();
      return this.mapJudge0Response(data, durationMs);
    } catch (err: unknown) {
      clearTimeout(timer);
      const durationMs = Math.round(performance.now() - startTime);

      if (err instanceof DOMException && err.name === 'AbortError') {
        return {
          status: 'time_limit_exceeded',
          stdout: '',
          stderr: '',
          message: `Execution timed out after ${timeoutMs}ms.`,
          durationMs,
          gatewayUrl: this.gatewayUrl,
        };
      }

      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        status: 'gateway_unreachable',
        stdout: '',
        stderr: '',
        message: `Unable to connect to Compiler Gateway at ${this.gatewayUrl}: ${errMsg}`,
        durationMs,
        gatewayUrl: this.gatewayUrl,
      };
    }
  }

  /**
   * Maps Judge0 API response to Lumenode CompilerExecutionResult.
   */
  private mapJudge0Response(data: Record<string, unknown>, durationMs: number): CompilerExecutionResult {
    const statusObj = (data.status as { id?: number; description?: string }) || {};
    const statusId = statusObj.id || 0;
    const stdout = (data.stdout as string) || '';
    const stderr = (data.stderr as string) || '';
    const compileOutput = (data.compile_output as string) || '';
    const exitCode = typeof data.exit_code === 'number' ? data.exit_code : undefined;
    const memoryKb = typeof data.memory === 'number' ? data.memory : undefined;

    // Time from Judge0 is in seconds as string or number
    const execTimeSec = parseFloat(String(data.time || '0'));
    const reportedDurationMs = execTimeSec > 0 ? Math.round(execTimeSec * 1000) : durationMs;

    // Judge0 Status ID mapping
    // 3: Accepted
    // 5: Time Limit Exceeded
    // 6: Compilation Error
    // 7: Runtime Error (SIGSEGV)
    // 8: Runtime Error (SIGXCPU)
    // 9: Runtime Error (SIGFPE)
    // 10: Runtime Error (SIGABRT)
    // 11: Runtime Error (NZEC)
    // 12: Runtime Error (Other)
    if (statusId === 3) {
      return {
        status: 'success',
        stdout,
        stderr,
        compileOutput: compileOutput || undefined,
        exitCode: exitCode ?? 0,
        durationMs: reportedDurationMs,
        memoryKb,
        message: 'Program compiled and executed successfully.',
        gatewayUrl: this.gatewayUrl,
      };
    }

    if (statusId === 6) {
      return {
        status: 'compilation_error',
        stdout: '',
        stderr: '',
        compileOutput: compileOutput || stderr || 'Compilation failed with syntax or type errors.',
        exitCode: exitCode ?? 1,
        durationMs: reportedDurationMs,
        message: 'Compilation failed. Inspect compiler diagnostic output below.',
        gatewayUrl: this.gatewayUrl,
      };
    }

    if (statusId === 5) {
      return {
        status: 'time_limit_exceeded',
        stdout,
        stderr,
        exitCode,
        durationMs: reportedDurationMs,
        message: 'Program exceeded the maximum CPU execution time limit (2.0s).',
        gatewayUrl: this.gatewayUrl,
      };
    }

    // Runtime errors / Signals
    let signal: string | undefined;
    if (statusId === 7) signal = 'SIGSEGV';
    else if (statusId === 8) signal = 'SIGXCPU';
    else if (statusId === 9) signal = 'SIGFPE';
    else if (statusId === 10) signal = 'SIGABRT';

    const isMemLimit = memoryKb && memoryKb >= 65536;

    return {
      status: isMemLimit ? 'memory_limit_exceeded' : 'runtime_error',
      stdout,
      stderr,
      compileOutput: compileOutput || undefined,
      exitCode: exitCode ?? 1,
      durationMs: reportedDurationMs,
      memoryKb,
      signal,
      message: signal
        ? `Runtime crash: ${statusObj.description || signal} (Signal: ${signal})`
        : statusObj.description || 'Program encountered a runtime error.',
      gatewayUrl: this.gatewayUrl,
    };
  }
}

// Global default singleton instance
export const compilerGateway = new CompilerGatewayClient();
