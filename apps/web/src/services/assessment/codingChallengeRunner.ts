/**
 * Coding Challenge Evaluation Service.
 * Evaluates coding challenges against structured test cases.
 * Uses genuine local/browser execution (Pyodide for Python, SQLite WASM for SQL).
 * Honestly flags C/C++ compilation availability status.
 */

import { TestCase, SupportedLanguageId } from '@lumenode/shared-types';
import { pythonRunner } from '../pythonRunner';
import { sqlRunner } from '../sqlRunner';
import { compilerGateway } from '../compilerGateway';

export type ChallengeLanguage = SupportedLanguageId | 'sql';

export interface TestCaseResult {
  testIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface ChallengeEvaluationReport {
  language: ChallengeLanguage;
  allPassed: boolean;
  totalTests: number;
  passedCount: number;
  score: number; // 0 to 100
  testResults: TestCaseResult[];
  statusMessage: string;
  isCompilerGatewayRequired?: boolean;
}

export class CodingChallengeRunner {
  public static async evaluateChallenge(
    code: string,
    language: ChallengeLanguage,
    testCases: TestCase[]
  ): Promise<ChallengeEvaluationReport> {
    if ((language === 'c' || language === 'cpp') && !compilerGateway.isConfigured()) {
      return {
        language,
        allPassed: false,
        totalTests: testCases.length,
        passedCount: 0,
        score: 0,
        testResults: [],
        statusMessage:
          'C/C++ execution requires the Compiler Gateway. Configure VITE_COMPILER_GATEWAY_URL to enable remote sandboxed compilation and automated test case evaluation.',
        isCompilerGatewayRequired: true,
      };
    }

    if (testCases.length === 0) {
      // Default smoke test if no test cases defined
      testCases = [{ input: '', expectedOutput: '' }];
    }

    const testResults: TestCaseResult[] = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const startTime = performance.now();

      if (language === 'c' || language === 'cpp') {
        const res = await compilerGateway.execute({
          sourceCode: code,
          language,
          stdin: tc.input,
          timeoutMs: 6000,
        });

        const durationMs = res.durationMs || Math.round(performance.now() - startTime);
        const actualOutput = res.stdout.trim();
        const expected = tc.expectedOutput.trim();
        const passed = res.status === 'success' && actualOutput === expected;

        if (passed) passedCount++;

        testResults.push({
          testIndex: i + 1,
          input: tc.input,
          expectedOutput: expected,
          actualOutput: res.compileOutput || res.stderr || actualOutput,
          passed,
          error: res.compileOutput || (res.status !== 'success' ? res.message : undefined),
          durationMs,
        });
      } else if (language === 'python') {
        // Prepend input harness if input is provided
        const wrappedCode = tc.input
          ? `import sys\nfrom io import StringIO\nsys.stdin = StringIO("""${tc.input}""")\n${code}`
          : code;

        const res = await pythonRunner.execute(wrappedCode, 5000);
        const durationMs = Math.round(performance.now() - startTime);
        const actualOutput = res.stdout.trim();
        const expected = tc.expectedOutput.trim();
        const passed = res.status === 'success' && actualOutput === expected;

        if (passed) passedCount++;

        testResults.push({
          testIndex: i + 1,
          input: tc.input,
          expectedOutput: expected,
          actualOutput: res.error || actualOutput,
          passed,
          error: res.error,
          durationMs,
        });
      } else if (language === 'sql') {
        const res = await sqlRunner.execute(code);
        const durationMs = Math.round(performance.now() - startTime);

        // Simple table row match
        const actualOutput = res.values.map(row => row.join(',')).join('\n').trim();
        const expected = tc.expectedOutput.trim();
        const passed = !res.error && (expected === '' || actualOutput === expected);

        if (passed) passedCount++;

        testResults.push({
          testIndex: i + 1,
          input: tc.input,
          expectedOutput: expected,
          actualOutput: res.error || actualOutput,
          passed,
          error: res.error,
          durationMs,
        });
      } else {
        testResults.push({
          testIndex: i + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          passed: false,
          error: `Unsupported language ${language}`,
          durationMs: 0,
        });
      }
    }

    const allPassed = passedCount === testCases.length;
    const score = Math.round((passedCount / testCases.length) * 100);

    return {
      language,
      allPassed,
      totalTests: testCases.length,
      passedCount,
      score,
      testResults,
      statusMessage: allPassed
        ? `All ${testCases.length} test cases passed!`
        : `Passed ${passedCount} of ${testCases.length} test cases.`,
    };
  }
}
