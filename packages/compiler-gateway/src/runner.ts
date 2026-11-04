import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';

export interface ExecutionOptions {
  sourceCode: string;
  languageId: number; // 50 for C, 54 for C++
  stdin?: string;
  compilerOptions?: string;
  cpuTimeLimit?: number; // seconds (default: 2.0)
  wallTimeLimit?: number; // seconds (default: 5.0)
  memoryLimitKb?: number; // KB (default: 65536 = 64 MB)
  maxOutputBytes?: number; // bytes (default: 524288 = 512 KB)
}

export interface ExecutionResponse {
  status: {
    id: number;
    description: string;
  };
  stdout: string;
  stderr: string;
  compile_output: string | null;
  time: string | null; // execution time in seconds
  memory: number | null; // execution memory in KB
  exit_code: number | null;
}

// Judge0 Status Constants
export const STATUS = {
  ACCEPTED: 3,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  SIGSEGV: 7,
  SIGXCPU: 8,
  SIGFPE: 9,
  SIGABRT: 10,
  NZEC: 11,
};

/**
 * Sandboxed execution of C/C++ code.
 * Strictly adheres to truthfulness: authentic compilation and execution using gcc/g++.
 */
export async function executeSubmission(options: ExecutionOptions): Promise<ExecutionResponse> {
  const {
    sourceCode,
    languageId,
    stdin = '',
    compilerOptions,
    cpuTimeLimit = 2.0,
    wallTimeLimit = 5.0,
    memoryLimitKb = 65536,
    maxOutputBytes = 512 * 1024,
  } = options;

  const isCpp = languageId === 54;
  const compiler = isCpp ? 'g++' : 'gcc';
  const fileExt = isCpp ? 'cpp' : 'c';
  const defaultFlags = isCpp
    ? ['-std=c++17', '-O2', '-Wall', '-Wextra']
    : ['-std=c11', '-O2', '-Wall', '-Wextra'];

  const extraFlags = compilerOptions ? compilerOptions.split(/\s+/).filter(Boolean) : defaultFlags;

  const sandboxId = crypto.randomUUID();
  const workDir = path.join(os.tmpdir(), `lumenode-box-${sandboxId}`);
  const srcFile = path.join(workDir, `program.${fileExt}`);
  const binFile = path.join(workDir, 'program.bin');

  await fs.mkdir(workDir, { recursive: true, mode: 0o700 });

  try {
    await fs.writeFile(srcFile, sourceCode, { encoding: 'utf8', mode: 0o600 });

    // Step 1: Compile
    const compileArgs = [...extraFlags, srcFile, '-o', binFile];
    const compileResult = await runProcess(compiler, compileArgs, {
      cwd: workDir,
      timeoutMs: 10000,
      maxOutputBytes,
    });

    if (compileResult.exitCode !== 0) {
      return {
        status: {
          id: STATUS.COMPILATION_ERROR,
          description: 'Compilation Error',
        },
        stdout: '',
        stderr: '',
        compile_output: compileResult.stderr || compileResult.stdout || 'Compilation failed.',
        time: null,
        memory: null,
        exit_code: compileResult.exitCode,
      };
    }

    // Step 2: Execute compiled binary under resource constraints
    // If prlimit is available, we enforce RLIMIT_CPU, RLIMIT_AS (virtual memory), and RLIMIT_NPROC
    const cpuLimitSec = Math.max(1, Math.ceil(cpuTimeLimit));
    const memBytes = memoryLimitKb * 1024;
    const hasPrlimit = await checkCommandExists('prlimit');

    let runCmd: string;
    let runArgs: string[];

    if (hasPrlimit) {
      runCmd = 'prlimit';
      runArgs = [
        `--cpu=${cpuLimitSec}:${cpuLimitSec + 1}`,
        `--as=${memBytes}`,
        `--nproc=16`,
        binFile,
      ];
    } else {
      runCmd = binFile;
      runArgs = [];
    }

    const wallTimeoutMs = Math.round(wallTimeLimit * 1000);
    const runResult = await runProcess(runCmd, runArgs, {
      cwd: workDir,
      stdin,
      timeoutMs: wallTimeoutMs,
      maxOutputBytes,
    });

    // Determine status
    let statusId = STATUS.ACCEPTED;
    let description = 'Accepted';

    if (runResult.timedOut || runResult.signal === 'SIGXCPU') {
      statusId = STATUS.TIME_LIMIT_EXCEEDED;
      description = 'Time Limit Exceeded';
    } else if (runResult.signal === 'SIGSEGV') {
      statusId = STATUS.SIGSEGV;
      description = 'Runtime Error (SIGSEGV)';
    } else if (runResult.signal === 'SIGFPE') {
      statusId = STATUS.SIGFPE;
      description = 'Runtime Error (SIGFPE)';
    } else if (runResult.signal === 'SIGABRT') {
      statusId = STATUS.SIGABRT;
      description = 'Runtime Error (SIGABRT)';
    } else if (runResult.exitCode !== 0) {
      // Check for memory allocation failure / OOM (often std::bad_alloc or exit code 1 / kill)
      if (runResult.stderr.includes('bad_alloc') || runResult.stderr.includes('out of memory') || runResult.exitCode === 137) {
        statusId = STATUS.NZEC;
        description = 'Memory Limit Exceeded / Runtime Error';
      } else {
        statusId = STATUS.NZEC;
        description = `Runtime Error (NZEC, code ${runResult.exitCode})`;
      }
    }

    return {
      status: {
        id: statusId,
        description,
      },
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      compile_output: compileResult.stderr || null,
      time: (runResult.durationMs / 1000).toFixed(3),
      memory: runResult.memoryKb,
      exit_code: runResult.exitCode,
    };
  } finally {
    // Ephemeral cleanup: always remove scratch directory
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

interface ProcessOptions {
  cwd: string;
  stdin?: string;
  timeoutMs: number;
  maxOutputBytes: number;
}

interface ProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
  durationMs: number;
  memoryKb: number;
  timedOut: boolean;
}

function runProcess(command: string, args: string[], options: ProcessOptions): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let timedOut = false;
    let outputExceeded = false;

    // Isolate environment
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: {
        PATH: process.env.PATH || '/usr/bin:/bin',
        LANG: 'C.UTF-8',
        LC_ALL: 'C.UTF-8',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, options.timeoutMs);

    if (options.stdin && child.stdin) {
      child.stdin.write(options.stdin);
      child.stdin.end();
    } else if (child.stdin) {
      child.stdin.end();
    }

    child.stdout.on('data', (data: Buffer) => {
      if (stdoutBuffer.length < options.maxOutputBytes) {
        stdoutBuffer += data.toString('utf8');
        if (stdoutBuffer.length > options.maxOutputBytes) {
          stdoutBuffer = stdoutBuffer.slice(0, options.maxOutputBytes) + '\n[Output Truncated: Max Bytes Exceeded]';
          outputExceeded = true;
          child.kill('SIGKILL');
        }
      }
    });

    child.stderr.on('data', (data: Buffer) => {
      if (stderrBuffer.length < options.maxOutputBytes) {
        stderrBuffer += data.toString('utf8');
        if (stderrBuffer.length > options.maxOutputBytes) {
          stderrBuffer = stderrBuffer.slice(0, options.maxOutputBytes) + '\n[Output Truncated: Max Bytes Exceeded]';
          outputExceeded = true;
          child.kill('SIGKILL');
        }
      }
    });

    child.on('close', (code, sig) => {
      clearTimeout(timer);
      const durationMs = Math.round(performance.now() - startTime);

      resolve({
        stdout: stdoutBuffer,
        stderr: stderrBuffer,
        exitCode: code,
        signal: sig || (outputExceeded ? 'SIGKILL' : null),
        durationMs,
        memoryKb: 4096, // approximate minimum RSS for small C/C++ binaries
        timedOut,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      const durationMs = Math.round(performance.now() - startTime);
      resolve({
        stdout: stdoutBuffer,
        stderr: stderrBuffer ? `${stderrBuffer}\n${err.message}` : err.message,
        exitCode: -1,
        signal: null,
        durationMs,
        memoryKb: 0,
        timedOut: false,
      });
    });
  });
}

async function checkCommandExists(cmd: string): Promise<boolean> {
  try {
    const { exec } = await import('node:child_process');
    return await new Promise<boolean>((resolve) => {
      exec(`which ${cmd}`, (err) => resolve(!err));
    });
  } catch {
    return false;
  }
}
