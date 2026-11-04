import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as http from 'node:http';
import { executeSubmission, STATUS } from '../runner.js';
import { createGatewayServer } from '../server.js';

describe('Compiler Gateway Service (ADR 0004)', () => {
  describe('Direct Execution Runner', () => {
    it('executes authentic C11 Hello World correctly', async () => {
      const code = `
#include <stdio.h>
int main() {
    printf("Hello from C11!\\n");
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50, // C
      });

      expect(result.status.id).toBe(STATUS.ACCEPTED);
      expect(result.stdout).toContain('Hello from C11!');
      expect(result.exit_code).toBe(0);
    });

    it('executes authentic C++17 Hello World correctly', async () => {
      const code = `
#include <iostream>
#include <string_view>

int main() {
    constexpr std::string_view msg = "Hello from C++17!";
    std::cout << msg << std::endl;
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 54, // C++
      });

      expect(result.status.id).toBe(STATUS.ACCEPTED);
      expect(result.stdout).toContain('Hello from C++17!');
      expect(result.exit_code).toBe(0);
    });

    it('handles standard input (stdin) properly', async () => {
      const code = `
#include <iostream>
#include <string>

int main() {
    std::string name;
    if (std::cin >> name) {
        std::cout << "Greetings, " << name << "!" << std::endl;
    }
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 54,
        stdin: 'Ada',
      });

      expect(result.status.id).toBe(STATUS.ACCEPTED);
      expect(result.stdout).toContain('Greetings, Ada!');
    });

    it('reports compilation errors with exact diagnostics', async () => {
      const code = `
#include <stdio.h>
int main() {
    syntax_error_here;
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
      });

      expect(result.status.id).toBe(STATUS.COMPILATION_ERROR);
      expect(result.compile_output).toBeTruthy();
      expect(result.compile_output).toContain('syntax_error_here');
    });

    it('reports runtime segmentation fault (SIGSEGV)', async () => {
      const code = `
#include <stdio.h>
int main() {
    int *ptr = NULL;
    *ptr = 42; // SIGSEGV
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
      });

      expect(result.status.id).toBe(STATUS.SIGSEGV);
      expect(result.status.description).toContain('SIGSEGV');
    });

    it('enforces execution timeout on infinite loops (Time Limit Exceeded)', async () => {
      const code = `
int main() {
    while (1) {}
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
        cpuTimeLimit: 1.0,
        wallTimeLimit: 1.5,
      });

      expect(result.status.id).toBe(STATUS.TIME_LIMIT_EXCEEDED);
      expect(result.status.description).toBe('Time Limit Exceeded');
    });

    it('prevents excessive output attacks by truncating output stream', async () => {
      const code = `
#include <stdio.h>
int main() {
    for (int i = 0; i < 50000; i++) {
        printf("A very long repetitive output line to test truncation safety.\\n");
    }
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
        maxOutputBytes: 1024,
      });

      expect(result.stdout).toContain('[Output Truncated: Max Bytes Exceeded]');
      expect(result.stdout.length).toBeLessThanOrEqual(2048);
    });
  });

  describe('REST HTTP Gateway Protocol', () => {
    let server: http.Server;
    const testPort = 2399;
    const baseUrl = `http://127.0.0.1:${testPort}`;

    beforeAll(async () => {
      server = createGatewayServer();
      await new Promise<void>((resolve) => {
        server.listen(testPort, '127.0.0.1', () => resolve());
      });
    });

    afterAll(async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    });

    it('answers GET /health with 200 OK', async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });

    it('executes submission via POST /submissions?wait=true', async () => {
      const res = await fetch(`${baseUrl}/submissions?wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: `#include <stdio.h>\nint main() { printf("REST OK\\n"); return 0; }`,
          language_id: 50,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status.id).toBe(STATUS.ACCEPTED);
      expect(data.stdout).toContain('REST OK');
    });
  });
});
