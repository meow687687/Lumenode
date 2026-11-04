import * as http from 'node:http';
import { executeSubmission, ExecutionOptions } from './runner.js';

export interface ServerConfig {
  port?: number;
  host?: string;
}

export function createGatewayServer(): http.Server {
  const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    // GET /health
    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'lumenode-compiler-gateway' }));
      return;
    }

    // POST /submissions?wait=true
    if (req.method === 'POST' && (url.pathname === '/submissions' || url.pathname === '/submissions/')) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        // Cap payload to 1MB
        if (body.length > 1024 * 1024) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Payload Too Large' }));
          req.destroy();
        }
      });

      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          const options: ExecutionOptions = {
            sourceCode: payload.source_code || '',
            languageId: Number(payload.language_id) || 50,
            stdin: payload.stdin || '',
            compilerOptions: payload.compiler_options,
            cpuTimeLimit: Number(payload.cpu_time_limit) || 2.0,
            wallTimeLimit: Number(payload.wall_time_limit) || 5.0,
            memoryLimitKb: Number(payload.memory_limit) || 65536,
          };

          const result = await executeSubmission(options);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid Submission Request', details: errMsg }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  return server;
}

if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  const port = parseInt(process.env.PORT || '2358', 10);
  const host = process.env.HOST || '127.0.0.1';
  const server = createGatewayServer();
  server.listen(port, host, () => {
    console.log(`Lumenode Compiler Gateway listening on http://${host}:${port}`);
  });
}
