import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CompilerGatewayClient } from '../services/compilerGateway';

describe('CompilerGatewayClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('honestly reports gateway_not_configured when endpoint is omitted', async () => {
    const client = new CompilerGatewayClient('');
    expect(client.isConfigured()).toBe(false);

    const res = await client.execute({
      sourceCode: 'int main() { return 0; }',
      language: 'c',
    });

    expect(res.status).toBe('gateway_not_configured');
    expect(res.gatewayUrl).toBeNull();
    expect(res.message).toContain('Set VITE_COMPILER_GATEWAY_URL');
  });

  it('handles successful C compilation and execution (status 3)', async () => {
    const client = new CompilerGatewayClient('https://compiler.lumenode.dev');
    expect(client.isConfigured()).toBe(true);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        token: 'test-token',
        status: { id: 3, description: 'Accepted' },
        stdout: 'Hello from C11!\n',
        stderr: null,
        compile_output: null,
        time: '0.005',
        memory: 1420,
        exit_code: 0,
      }),
    } as unknown as Response);

    const res = await client.execute({
      sourceCode: '#include <stdio.h>\nint main(void) { printf("Hello from C11!\\n"); return 0; }',
      language: 'c',
    });

    expect(res.status).toBe('success');
    expect(res.stdout).toBe('Hello from C11!\n');
    expect(res.exitCode).toBe(0);
    expect(res.durationMs).toBe(5);
    expect(res.memoryKb).toBe(1420);
  });

  it('handles compiler diagnostics and syntax errors (status 6)', async () => {
    const client = new CompilerGatewayClient('https://compiler.lumenode.dev');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        token: 'test-token',
        status: { id: 6, description: 'Compilation Error' },
        stdout: null,
        stderr: null,
        compile_output: "main.c:2:3: error: unknown type name 'foobar'\n",
        time: '0.010',
        memory: 0,
        exit_code: 1,
      }),
    } as unknown as Response);

    const res = await client.execute({
      sourceCode: 'int main() { foobar x; return 0; }',
      language: 'c',
    });

    expect(res.status).toBe('compilation_error');
    expect(res.compileOutput).toContain("unknown type name 'foobar'");
    expect(res.exitCode).toBe(1);
  });

  it('handles runtime crashes such as SIGSEGV segmentation violations (status 7)', async () => {
    const client = new CompilerGatewayClient('https://compiler.lumenode.dev');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        token: 'test-token',
        status: { id: 7, description: 'Runtime Error (SIGSEGV)' },
        stdout: '',
        stderr: 'Segmentation fault (core dumped)\n',
        time: '0.002',
        memory: 980,
        exit_code: 139,
      }),
    } as unknown as Response);

    const res = await client.execute({
      sourceCode: 'int main() { int *p = NULL; *p = 10; return 0; }',
      language: 'c',
    });

    expect(res.status).toBe('runtime_error');
    expect(res.signal).toBe('SIGSEGV');
    expect(res.stderr).toContain('Segmentation fault');
  });

  it('handles timeout and time limit exceeded (status 5)', async () => {
    const client = new CompilerGatewayClient('https://compiler.lumenode.dev');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        token: 'test-token',
        status: { id: 5, description: 'Time Limit Exceeded' },
        stdout: '',
        stderr: '',
        time: '2.001',
        memory: 1200,
        exit_code: null,
      }),
    } as unknown as Response);

    const res = await client.execute({
      sourceCode: 'int main() { while(1); return 0; }',
      language: 'c',
    });

    expect(res.status).toBe('time_limit_exceeded');
    expect(res.durationMs).toBe(2001);
  });

  it('truthfully handles network failure when gateway is unreachable', async () => {
    const client = new CompilerGatewayClient('https://unreachable-gateway.local');

    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch / Connection refused'));

    const res = await client.execute({
      sourceCode: 'int main() { return 0; }',
      language: 'c',
    });

    expect(res.status).toBe('gateway_unreachable');
    expect(res.message).toContain('Unable to connect to Compiler Gateway');
  });
});
