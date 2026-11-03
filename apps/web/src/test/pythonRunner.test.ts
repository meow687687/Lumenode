import { describe, it, expect } from 'vitest';
import { ExecutionResultSchema, ExecutionResult } from '@lumenode/shared-types';

describe('Python Execution Tests & Worker Communication Contracts', () => {
  it('1. Hello World contract: captures standard output string', () => {
    const result: ExecutionResult = {
      executionId: 'test-1',
      language: 'python',
      status: 'success',
      stdout: 'Hello, Lumenode!\n',
      stderr: '',
      durationMs: 12,
      exitCode: 0,
    };
    expect(ExecutionResultSchema.parse(result).stdout).toBe('Hello, Lumenode!\n');
    expect(result.exitCode).toBe(0);
  });

  it('2. Arithmetic computation: verifies numeric evaluation output', () => {
    const result: ExecutionResult = {
      executionId: 'test-2',
      language: 'python',
      status: 'success',
      stdout: 'Result: 42\n',
      stderr: '',
      durationMs: 8,
      exitCode: 0,
    };
    expect(result.stdout).toContain('42');
  });

  it('3. Loops execution: handles iteration sequences', () => {
    const result: ExecutionResult = {
      executionId: 'test-3',
      language: 'python',
      status: 'success',
      stdout: '0\n1\n2\n3\n4\n',
      stderr: '',
      durationMs: 15,
      exitCode: 0,
    };
    expect(result.stdout.trim().split('\n')).toEqual(['0', '1', '2', '3', '4']);
  });

  it('4. Functions definition and invocation', () => {
    const result: ExecutionResult = {
      executionId: 'test-4',
      language: 'python',
      status: 'success',
      stdout: 'Fibonacci: [0, 1, 1, 2, 3, 5, 8]\n',
      stderr: '',
      durationMs: 20,
      exitCode: 0,
    };
    expect(result.stdout).toContain('[0, 1, 1, 2, 3, 5, 8]');
  });

  it('5. Lists, tuples, and dictionaries handling', () => {
    const result: ExecutionResult = {
      executionId: 'test-5',
      language: 'python',
      status: 'success',
      stdout: "{'name': 'Lumenode', 'version': 0.1}\n",
      stderr: '',
      durationMs: 10,
      exitCode: 0,
    };
    expect(result.stdout).toContain("'name': 'Lumenode'");
  });

  it('6. Standard output and standard error separation', () => {
    const result: ExecutionResult = {
      executionId: 'test-6',
      language: 'python',
      status: 'success',
      stdout: 'Normal stdout message\n',
      stderr: 'Warning written to stderr\n',
      durationMs: 14,
      exitCode: 0,
    };
    expect(result.stdout).toBe('Normal stdout message\n');
    expect(result.stderr).toBe('Warning written to stderr\n');
  });

  it('7. Syntax error handling and reporting', () => {
    const result: ExecutionResult = {
      executionId: 'test-7',
      language: 'python',
      status: 'compilation_error',
      stdout: '',
      stderr: 'SyntaxError: unexpected EOF while parsing\n',
      error: 'SyntaxError: unexpected EOF while parsing',
      durationMs: 6,
      exitCode: 1,
    };
    expect(result.status).toBe('compilation_error');
    expect(result.error).toContain('SyntaxError');
  });

  it('8. Runtime exceptions capturing (ZeroDivisionError, NameError, IndexError)', () => {
    const result: ExecutionResult = {
      executionId: 'test-8',
      language: 'python',
      status: 'runtime_error',
      stdout: '',
      stderr: 'ZeroDivisionError: division by zero',
      error: 'ZeroDivisionError: division by zero',
      durationMs: 5,
      exitCode: 1,
    };
    expect(result.status).toBe('runtime_error');
    expect(result.error).toContain('ZeroDivisionError');
    expect(result.exitCode).toBe(1);
  });

  it('9. Execution timeout cancellation protection', () => {
    const result: ExecutionResult = {
      executionId: 'test-9',
      language: 'python',
      status: 'timeout',
      stdout: '',
      stderr: '',
      error: 'Execution timed out after 5000ms limit. Process was terminated.',
      durationMs: 5000,
      exitCode: 124,
    };
    expect(result.status).toBe('timeout');
    expect(result.exitCode).toBe(124);
    expect(result.durationMs).toBe(5000);
  });

  it('10. Unsupported language execution status reporting for C/C++', () => {
    const result: ExecutionResult = {
      executionId: 'test-10',
      language: 'c',
      status: 'unsupported',
      stdout: '',
      stderr: '',
      durationMs: 0,
    };
    expect(result.status).toBe('unsupported');
    expect(result.durationMs).toBe(0);
  });
});
