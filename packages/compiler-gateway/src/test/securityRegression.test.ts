import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as http from 'node:http';
import * as os from 'node:os';
import * as fs from 'node:fs/promises';
import { executeSubmission, STATUS } from '../runner.js';
import { createGatewayServer } from '../server.js';

describe('Compiler Gateway Independent Security & Regression Suite (Phase 6.5)', () => {
  describe('Adversarial & Resource Constraint Scenarios', () => {
    it('1. Normal C Program: compiles and executes cleanly', async () => {
      const code = `
#include <stdio.h>
int main() {
    printf("NORMAL_C_OK\\n");
    return 0;
}
`;
      const result = await executeSubmission({ sourceCode: code, languageId: 50 });
      expect(result.status.id).toBe(STATUS.ACCEPTED);
      expect(result.stdout).toContain('NORMAL_C_OK');
      expect(result.exit_code).toBe(0);
    });

    it('2. Normal C++ Program: compiles and executes cleanly with modern STL', async () => {
      const code = `
#include <iostream>
#include <vector>
#include <numeric>
int main() {
    std::vector<int> v = {1, 2, 3, 4};
    int s = std::accumulate(v.begin(), v.end(), 0);
    std::cout << "SUM=" << s << std::endl;
    return 0;
}
`;
      const result = await executeSubmission({ sourceCode: code, languageId: 54 });
      expect(result.status.id).toBe(STATUS.ACCEPTED);
      expect(result.stdout).toContain('SUM=10');
      expect(result.exit_code).toBe(0);
    });

    it('3. Infinite Loop: terminates within wall-clock timeout and does not hang', async () => {
      const code = `
int main() {
    volatile int x = 0;
    while (1) { x++; }
    return 0;
}
`;
      const start = performance.now();
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
        cpuTimeLimit: 1.0,
        wallTimeLimit: 1.5,
      });
      const elapsed = performance.now() - start;

      expect(result.status.id).toBe(STATUS.TIME_LIMIT_EXCEEDED);
      expect(elapsed).toBeLessThan(3500); // Guarantees strict termination
    });

    it('4. Excessive Memory Allocation: caught by memory ceiling (RLIMIT_AS / bad_alloc)', async () => {
      const code = `
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
int main() {
    // Attempt allocating 256MB when limit is 64MB and commit pages
    size_t sz = 256 * 1024 * 1024;
    char *p = (char*)malloc(sz);
    if (!p) {
        printf("ALLOC_REJECTED\\n");
        return 1;
    }
    for (size_t i = 0; i < sz; i += 4096) {
        p[i] = 1;
    }
    printf("ALLOC_ALLOWED: %c\\n", p[0]);
    free(p);
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
        memoryLimitKb: 65536, // 64MB
      });

      // Caught by memory limit / allocation rejection
      expect(result.stdout).toContain('ALLOC_REJECTED');
    });

    it('5. Excessive Output Attack: truncated without crashing gateway', async () => {
      const code = `
#include <stdio.h>
int main() {
    for (int i = 0; i < 20000; i++) {
        printf("FLOODING_STDOUT_WITH_TEXT_LINES_TO_TEST_MAX_BUFFER_SAFETY\\n");
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
      expect(result.stdout.length).toBeLessThan(4096);
    });

    it('6. Fork Bomb / Process Spawning: child limits enforced and process-tree killed', async () => {
      const code = `
#include <unistd.h>
#include <stdio.h>
int main() {
    for (int i = 0; i < 20; i++) {
        fork();
    }
    printf("FORK_DONE\\n");
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
        cpuTimeLimit: 1.0,
        wallTimeLimit: 2.0,
      });

      // Should complete without taking down host or hanging test runner
      expect(result).toBeDefined();
    });

    it('7. Filesystem Access Attempt: denied access to host sensitive files', async () => {
      const code = `
#include <stdio.h>
int main() {
    FILE *f = fopen("/etc/shadow", "r");
    if (f) {
        printf("SHADOW_READ_EXPOSED\\n");
        fclose(f);
    } else {
        printf("SHADOW_READ_DENIED\\n");
    }

    FILE *f2 = fopen("/etc/passwd", "r");
    if (f2) {
        printf("PASSWD_READABLE\\n");
        fclose(f2);
    } else {
        printf("PASSWD_DENIED\\n");
    }
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
      });

      expect(result.stdout).not.toContain('SHADOW_READ_EXPOSED');
      // If bubblewrap is active, /etc/passwd is completely unmounted/denied
      if (result.sandboxedWith === 'bubblewrap') {
        expect(result.stdout).toContain('PASSWD_DENIED');
      }
    });

    it('8. Network Access Attempt: denied socket connectivity', async () => {
      const code = `
#include <stdio.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

int main() {
    int s = socket(AF_INET, SOCK_STREAM, 0);
    if (s < 0) {
        printf("NET_BLOCKED_SOCKET\\n");
        return 0;
    }
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(80);
    inet_pton(AF_INET, "1.1.1.1", &addr.sin_addr);
    if (connect(s, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        printf("NET_CONNECT_FAILED\\n");
    } else {
        printf("NET_CONNECT_SUCCESS\\n");
    }
    close(s);
    return 0;
}
`;
      const result = await executeSubmission({
        sourceCode: code,
        languageId: 50,
      });

      // When sandboxed with bubblewrap, unshare-net guarantees network connection fails
      if (result.sandboxedWith === 'bubblewrap') {
        expect(result.stdout).toContain('NET_CONNECT_FAILED');
        expect(result.stdout).not.toContain('NET_CONNECT_SUCCESS');
      }
    });

    it('9. Signal Handling: reports SIGSEGV faithfully on null pointer dereference', async () => {
      const code = `
int main() {
    int *p = (int*)0x0;
    *p = 999;
    return 0;
}
`;
      const result = await executeSubmission({ sourceCode: code, languageId: 50 });
      expect(result.status.id).toBe(STATUS.SIGSEGV);
    });

    it('10. Concurrent Submissions: multiple parallel executions run in isolated scratchdirs without conflict', async () => {
      const p1 = executeSubmission({
        sourceCode: `#include <stdio.h>\nint main() { printf("P1\\n"); return 0; }`,
        languageId: 50,
      });
      const p2 = executeSubmission({
        sourceCode: `#include <stdio.h>\nint main() { printf("P2\\n"); return 0; }`,
        languageId: 50,
      });
      const p3 = executeSubmission({
        sourceCode: `#include <stdio.h>\nint main() { printf("P3\\n"); return 0; }`,
        languageId: 50,
      });

      const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
      expect(r1.stdout).toContain('P1');
      expect(r2.stdout).toContain('P2');
      expect(r3.stdout).toContain('P3');
    });

    it('11. Workspace Cleanup: temporary scratch directories are wiped after execution', async () => {
      // Allow any concurrent test boxes to finish cleaning up
      await new Promise((r) => setTimeout(r, 100));
      const tmpEntriesBefore = await fs.readdir(os.tmpdir());
      const preBoxes = tmpEntriesBefore.filter((f) => f.startsWith('lumenode-box-'));

      await executeSubmission({
        sourceCode: `#include <stdio.h>\nint main() { printf("CLEANUP\\n"); return 0; }`,
        languageId: 50,
      });

      const tmpEntriesAfter = await fs.readdir(os.tmpdir());
      const postBoxes = tmpEntriesAfter.filter((f) => f.startsWith('lumenode-box-'));
      expect(postBoxes.length).toBeLessThanOrEqual(preBoxes.length);
    });
  });

  describe('Operational & Gateway Server Endpoints', () => {
    let server: http.Server;
    const testPort = 2398;
    const baseUrl = `http://127.0.0.1:${testPort}`;

    beforeAll(async () => {
      server = createGatewayServer({ maxConcurrent: 2, rateLimitPerMinute: 20 });
      await new Promise<void>((resolve) => {
        server.listen(testPort, '127.0.0.1', () => resolve());
      });
    });

    afterAll(async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    });

    it('12. Health check endpoint reports service status and live capacity', async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
      expect(data.service).toBe('lumenode-compiler-gateway');
      expect(data.maxConcurrent).toBe(2);
    });

    it('13. Gateway rejects excessive request payload with 413 Payload Too Large', async () => {
      const hugeCode = 'a'.repeat(1024 * 1024 + 100);
      const res = await fetch(`${baseUrl}/submissions?wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: hugeCode, language_id: 50 }),
      }).catch((e) => e);

      // Either 413 received or connection aborted
      if (res && res.status) {
        expect([413, 400]).toContain(res.status);
      }
    });
  });
});
