/**
 * Pure, Deterministic C Call-Stack & Activation Record Simulator Model.
 * Simulates function activation records, stack growth/shrinkage, parameter passing,
 * return address preservation, and recursion.
 *
 * NOTE: The C ISO standard does not specify a physical stack frame layout.
 * This simulator illustrates standard educational and x86-64 System V AMD64
 * calling convention concepts. Real optimizing compilers may inline functions,
 * pass parameters via registers, or eliminate frames entirely via tail-call optimization.
 */

import { SimulationStep, SimulationTrace } from '@lumenode/shared-types';

export interface ActivationRecord {
  frameId: string;
  functionName: string;
  parameters: Record<string, number | string>;
  localVariables: Record<string, number | string>;
  returnAddressLabel: string;
  savedFramePointer: string;
  returnValue?: number | string;
  depth: number;
  state: 'entering' | 'executing' | 'returning' | 'popped';
}

export interface CallStackState {
  programId: string;
  programTitle: string;
  cCode: string;
  frames: ActivationRecord[];
  maxDepth: number;
  stdout: string[];
  currentLine?: number;
  abiNote: string;
}

export interface ProgramPreset {
  id: string;
  title: string;
  description: string;
  cCode: string;
  generator: () => SimulationTrace<CallStackState>;
}

export class CallStackModel {
  public static readonly ARCHITECTURE_DISCLAIMER =
    'Pedagogical Architecture Model: The ISO C standard specifies abstract program behavior, not a physical hardware stack layout. This model illustrates the System V AMD64 ABI convention (RBP frame pointers, return addresses, and parameter passing). In real production code, GCC/Clang with optimizations (-O2) may pass parameters exclusively in CPU registers (RDI, RSI, RDX), inline functions, or eliminate stack frames via Tail-Call Optimization (TCO).';

  public static createEmptyState(programId: string = 'simple', title: string = 'Function Call Demo', cCode: string = ''): CallStackState {
    return {
      programId,
      programTitle: title,
      cCode,
      frames: [],
      maxDepth: 0,
      stdout: [],
      abiNote: this.ARCHITECTURE_DISCLAIMER,
    };
  }

  public static cloneState(state: CallStackState): CallStackState {
    return {
      programId: state.programId,
      programTitle: state.programTitle,
      cCode: state.cCode,
      frames: state.frames.map((f) => ({
        ...f,
        parameters: { ...f.parameters },
        localVariables: { ...f.localVariables },
      })),
      maxDepth: state.maxDepth,
      stdout: [...state.stdout],
      currentLine: state.currentLine,
      abiNote: state.abiNote,
    };
  }

  /**
   * Program Preset 1: Simple Function Call (add)
   */
  public static generateSimpleCallTrace(): SimulationTrace<CallStackState> {
    const cCode = `int add(int a, int b) {
    int sum = a + b;
    return sum;
}

int main(void) {
    int x = 3;
    int y = 4;
    int res = add(x, y);
    printf("%d", res);
    return 0;
}`;
    const state = this.createEmptyState('simple-call', 'Simple Function Invocation', cCode);
    const steps: SimulationStep<CallStackState>[] = [];
    let stepCount = 0;

    // Step 0: main entry
    const mainFrame: ActivationRecord = {
      frameId: 'frame-main-0',
      functionName: 'main',
      parameters: {},
      localVariables: { x: 3, y: 4 },
      returnAddressLabel: '__libc_start_main + 0x24',
      savedFramePointer: '0x7FFFFFFFE100',
      depth: 1,
      state: 'executing',
    };
    state.frames.push(mainFrame);
    state.maxDepth = 1;
    state.currentLine = 7;

    steps.push({
      stepIndex: stepCount++,
      operation: 'CALL_MAIN',
      description: 'Process starts: OS invokes main(). Stack frame for main allocated on top of stack (RSP grows downward).',
      codeLine: 7,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    // Step 1: Prep call to add(x, y)
    state.currentLine = 10;
    steps.push({
      stepIndex: stepCount++,
      operation: 'PREPARE_ARGUMENTS',
      description: 'main() evaluates arguments x (3) and y (4). In System V AMD64 ABI, parameters are passed in EDI and ESI.',
      codeLine: 10,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    // Step 2: Push add frame
    const addFrame: ActivationRecord = {
      frameId: 'frame-add-1',
      functionName: 'add',
      parameters: { a: 3, b: 4 },
      localVariables: {},
      returnAddressLabel: 'main: line 10 (+0x1C)',
      savedFramePointer: '0x7FFFFFFFE0E0 (main RBP)',
      depth: 2,
      state: 'entering',
    };
    state.frames.push(addFrame);
    state.maxDepth = 2;
    state.currentLine = 1;

    steps.push({
      stepIndex: stepCount++,
      operation: 'CALL_FUNCTION',
      description: 'CALL instruction executes: pushes return address (main line 10) onto stack, sets new base pointer (RBP), and allocates frame for add().',
      codeLine: 1,
      highlightedNodeIds: [addFrame.frameId],
      secondaryHighlightedNodeIds: [mainFrame.frameId],
      stateSnapshot: this.cloneState(state),
    });

    // Step 3: Compute sum
    addFrame.state = 'executing';
    addFrame.localVariables.sum = 7;
    state.currentLine = 2;

    steps.push({
      stepIndex: stepCount++,
      operation: 'EVALUATE_LOCAL',
      description: 'Inside add(): allocates local variable sum = a + b (3 + 4 = 7) on the stack frame.',
      codeLine: 2,
      highlightedNodeIds: [addFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    // Step 4: Return sum
    addFrame.state = 'returning';
    addFrame.returnValue = 7;
    state.currentLine = 3;

    steps.push({
      stepIndex: stepCount++,
      operation: 'RETURN_VALUE',
      description: 'Return statement: stores return value 7 in register EAX. Prepares to tear down frame.',
      codeLine: 3,
      highlightedNodeIds: [addFrame.frameId],
      secondaryHighlightedNodeIds: [mainFrame.frameId],
      stateSnapshot: this.cloneState(state),
    });

    // Step 5: Pop add frame
    state.frames.pop();
    mainFrame.localVariables.res = 7;
    state.currentLine = 10;

    steps.push({
      stepIndex: stepCount++,
      operation: 'POP_FRAME',
      description: 'RET instruction restores caller RBP and jumps to return address in main(). add() frame deallocated. main() receives res = 7.',
      codeLine: 10,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    // Step 6: Printf
    state.stdout.push('7');
    state.currentLine = 11;

    steps.push({
      stepIndex: stepCount++,
      operation: 'STDOUT',
      description: 'printf("%d", res) outputs "7" to standard output stream.',
      codeLine: 11,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    return {
      id: 'trace-call-simple',
      visualizerId: 'callstack',
      title: 'Simple Function Call Trace',
      totalSteps: steps.length,
      steps,
      initialState: this.createEmptyState('simple-call', 'Simple Function Invocation', cCode),
      finalState: state,
    };
  }

  /**
   * Program Preset 2: Recursive Factorial (n=4)
   */
  public static generateFactorialTrace(n: number = 4): SimulationTrace<CallStackState> {
    const cCode = `long factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main(void) {
    long result = factorial(${n});
    printf("%ld", result);
    return 0;
}`;
    const state = this.createEmptyState('recursive-factorial', `Recursive Factorial (${n}!)`, cCode);
    const steps: SimulationStep<CallStackState>[] = [];
    let stepCount = 0;

    // Main frame
    const mainFrame: ActivationRecord = {
      frameId: 'frame-main',
      functionName: 'main',
      parameters: {},
      localVariables: {},
      returnAddressLabel: '__libc_start_main',
      savedFramePointer: '0x7FFFFFFFE100',
      depth: 1,
      state: 'executing',
    };
    state.frames.push(mainFrame);
    state.maxDepth = 1;
    state.currentLine = 8;

    steps.push({
      stepIndex: stepCount++,
      operation: 'CALL_MAIN',
      description: `main() begins execution and calls factorial(${n}).`,
      codeLine: 8,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    // Recursive descent
    for (let currentN = n; currentN >= 1; currentN--) {
      const parentFrame = state.frames[state.frames.length - 1];
      const newFrame: ActivationRecord = {
        frameId: `frame-fact-${currentN}`,
        functionName: 'factorial',
        parameters: { n: currentN },
        localVariables: {},
        returnAddressLabel: currentN === n ? 'main: line 8' : `factorial(n=${currentN + 1}): line 5`,
        savedFramePointer: `RBP of ${parentFrame.functionName}`,
        depth: state.frames.length + 1,
        state: 'entering',
      };
      state.frames.push(newFrame);
      state.maxDepth = Math.max(state.maxDepth, state.frames.length);
      state.currentLine = 1;

      steps.push({
        stepIndex: stepCount++,
        operation: 'STACK_PUSH',
        description: `Calling factorial(${currentN}): Pushing new activation frame onto stack. Stack depth: ${state.frames.length}.`,
        codeLine: 1,
        highlightedNodeIds: [newFrame.frameId],
        secondaryHighlightedNodeIds: [parentFrame.frameId],
        stateSnapshot: this.cloneState(state),
      });

      state.currentLine = 2;
      newFrame.state = 'executing';

      if (currentN <= 1) {
        // Base case
        newFrame.returnValue = 1;
        newFrame.state = 'returning';
        state.currentLine = 3;

        steps.push({
          stepIndex: stepCount++,
          operation: 'BASE_CASE',
          description: `Base case reached: n = 1 <= 1. factorial(1) returns 1 without further recursion.`,
          codeLine: 3,
          highlightedNodeIds: [newFrame.frameId],
          secondaryHighlightedNodeIds: [],
          callout: 'Base case prevents unbounded recursion and catastrophic Stack Overflow.',
          stateSnapshot: this.cloneState(state),
        });
      } else {
        steps.push({
          stepIndex: stepCount++,
          operation: 'RECURSIVE_DESCENT',
          description: `Condition n <= 1 is false (${currentN} > 1). Evaluating n * factorial(${currentN - 1}). Suspending current frame to recurse.`,
          codeLine: 5,
          highlightedNodeIds: [newFrame.frameId],
          secondaryHighlightedNodeIds: [],
          stateSnapshot: this.cloneState(state),
        });
      }
    }

    // Recursive unwinding
    let accumulated = 1;
    for (let currentN = 1; currentN <= n; currentN++) {
      const _topFrame = state.frames.pop()!;
      if (currentN > 1) {
        accumulated *= currentN;
      }
      const callerFrame = state.frames[state.frames.length - 1];
      state.currentLine = 5;

      steps.push({
        stepIndex: stepCount++,
        operation: 'STACK_POP_UNWIND',
        description: `Unwinding: factorial(${currentN}) returns ${accumulated}. Frame deallocated from top of stack. Stack depth shrinks to ${state.frames.length}.`,
        codeLine: 5,
        highlightedNodeIds: [callerFrame.frameId],
        secondaryHighlightedNodeIds: [],
        stateSnapshot: this.cloneState(state),
      });
    }

    // Final result in main
    mainFrame.localVariables.result = accumulated;
    state.stdout.push(accumulated.toString());
    state.currentLine = 9;

    steps.push({
      stepIndex: stepCount++,
      operation: 'COMPLETED',
      description: `Factorial calculation finished: result = ${accumulated}. Output written to stdout.`,
      codeLine: 9,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    return {
      id: 'trace-call-factorial',
      visualizerId: 'callstack',
      title: `Recursive Factorial (${n}!) Trace`,
      totalSteps: steps.length,
      steps,
      initialState: this.createEmptyState('recursive-factorial', `Recursive Factorial (${n}!)`, cCode),
      finalState: state,
    };
  }

  /**
   * Program Preset 3: Nested Function Calls
   */
  public static generateNestedCallsTrace(): SimulationTrace<CallStackState> {
    const cCode = `int compute(int z) {
    return z * 2;
}

int helper(int y) {
    int doubled = compute(y);
    return doubled + 1;
}

int process(int x) {
    return helper(x + 10);
}

int main(void) {
    int val = process(5);
    return 0;
}`;
    const state = this.createEmptyState('nested-calls', 'Nested Function Invocations', cCode);
    const steps: SimulationStep<CallStackState>[] = [];
    let stepCount = 0;

    const mainFrame: ActivationRecord = {
      frameId: 'frame-nested-main',
      functionName: 'main',
      parameters: {},
      localVariables: {},
      returnAddressLabel: '__libc_start_main',
      savedFramePointer: '0x7FFFFFFFE100',
      depth: 1,
      state: 'executing',
    };
    state.frames.push(mainFrame);
    state.maxDepth = 1;
    state.currentLine = 14;

    steps.push({
      stepIndex: stepCount++,
      operation: 'CALL_MAIN',
      description: 'main() begins and initiates call to process(5).',
      codeLine: 14,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    // Call process(5)
    const processFrame: ActivationRecord = {
      frameId: 'frame-nested-process',
      functionName: 'process',
      parameters: { x: 5 },
      localVariables: {},
      returnAddressLabel: 'main: line 14',
      savedFramePointer: 'RBP of main',
      depth: 2,
      state: 'executing',
    };
    state.frames.push(processFrame);
    state.maxDepth = 2;
    state.currentLine = 10;

    steps.push({
      stepIndex: stepCount++,
      operation: 'CALL_PROCESS',
      description: 'process(x=5) frame pushed. Evaluates helper(x + 10 = 15).',
      codeLine: 10,
      highlightedNodeIds: [processFrame.frameId],
      secondaryHighlightedNodeIds: [mainFrame.frameId],
      stateSnapshot: this.cloneState(state),
    });

    // Call helper(15)
    const helperFrame: ActivationRecord = {
      frameId: 'frame-nested-helper',
      functionName: 'helper',
      parameters: { y: 15 },
      localVariables: {},
      returnAddressLabel: 'process: line 10',
      savedFramePointer: 'RBP of process',
      depth: 3,
      state: 'executing',
    };
    state.frames.push(helperFrame);
    state.maxDepth = 3;
    state.currentLine = 5;

    steps.push({
      stepIndex: stepCount++,
      operation: 'CALL_HELPER',
      description: 'helper(y=15) frame pushed. Evaluates compute(15).',
      codeLine: 5,
      highlightedNodeIds: [helperFrame.frameId],
      secondaryHighlightedNodeIds: [processFrame.frameId],
      stateSnapshot: this.cloneState(state),
    });

    // Call compute(15)
    const computeFrame: ActivationRecord = {
      frameId: 'frame-nested-compute',
      functionName: 'compute',
      parameters: { z: 15 },
      localVariables: {},
      returnAddressLabel: 'helper: line 5',
      savedFramePointer: 'RBP of helper',
      depth: 4,
      state: 'executing',
    };
    state.frames.push(computeFrame);
    state.maxDepth = 4;
    state.currentLine = 1;

    steps.push({
      stepIndex: stepCount++,
      operation: 'CALL_COMPUTE',
      description: 'compute(z=15) frame pushed. Stack reaches peak depth of 4 frames. Computes z * 2 = 30.',
      codeLine: 1,
      highlightedNodeIds: [computeFrame.frameId],
      secondaryHighlightedNodeIds: [helperFrame.frameId],
      callout: 'Call stack depth peaks at innermost nested invocation.',
      stateSnapshot: this.cloneState(state),
    });

    // Pop compute
    state.frames.pop();
    helperFrame.localVariables.doubled = 30;
    helperFrame.returnValue = 31;
    state.currentLine = 6;

    steps.push({
      stepIndex: stepCount++,
      operation: 'POP_COMPUTE',
      description: 'compute() returns 30 and pops. helper() stores doubled = 30 and returns 31.',
      codeLine: 6,
      highlightedNodeIds: [helperFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    // Pop helper
    state.frames.pop();
    processFrame.returnValue = 31;
    state.currentLine = 10;

    steps.push({
      stepIndex: stepCount++,
      operation: 'POP_HELPER',
      description: 'helper() returns 31 and pops. process() returns 31.',
      codeLine: 10,
      highlightedNodeIds: [processFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    // Pop process
    state.frames.pop();
    mainFrame.localVariables.val = 31;
    state.currentLine = 14;

    steps.push({
      stepIndex: stepCount++,
      operation: 'POP_PROCESS',
      description: 'process() returns 31 and pops. main() receives val = 31. Execution complete.',
      codeLine: 14,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    return {
      id: 'trace-call-nested',
      visualizerId: 'callstack',
      title: 'Nested Function Invocations Trace',
      totalSteps: steps.length,
      steps,
      initialState: this.createEmptyState('nested-calls', 'Nested Function Invocations', cCode),
      finalState: state,
    };
  }

  /**
   * Program Preset 4: Recursive Fibonacci (fib(4))
   */
  public static generateFibonacciTrace(n: number = 4): SimulationTrace<CallStackState> {
    const cCode = `int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

int main(void) {
    int res = fib(${n});
    return 0;
}`;
    const state = this.createEmptyState('recursive-fib', `Recursive Fibonacci (${n})`, cCode);
    const steps: SimulationStep<CallStackState>[] = [];
    let stepCount = 0;

    const mainFrame: ActivationRecord = {
      frameId: 'frame-fib-main',
      functionName: 'main',
      parameters: {},
      localVariables: {},
      returnAddressLabel: '__libc_start_main',
      savedFramePointer: '0x7FFFFFFFE100',
      depth: 1,
      state: 'executing',
    };
    state.frames.push(mainFrame);
    state.maxDepth = 1;

    steps.push({
      stepIndex: stepCount++,
      operation: 'CALL_MAIN',
      description: `main() calls fib(${n}). Binary recursion creates a branching tree of stack frames.`,
      codeLine: 6,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    const simulateFib = (k: number): number => {
      const parent = state.frames[state.frames.length - 1];
      const frame: ActivationRecord = {
        frameId: `frame-fib-${k}-${stepCount}`,
        functionName: 'fib',
        parameters: { n: k },
        localVariables: {},
        returnAddressLabel: `fib caller (depth ${state.frames.length})`,
        savedFramePointer: `RBP of ${parent.functionName}`,
        depth: state.frames.length + 1,
        state: 'entering',
      };
      state.frames.push(frame);
      state.maxDepth = Math.max(state.maxDepth, state.frames.length);

      steps.push({
        stepIndex: stepCount++,
        operation: 'CALL_FIB',
        description: `Push frame fib(n=${k}). Current stack depth: ${state.frames.length}.`,
        codeLine: 1,
        highlightedNodeIds: [frame.frameId],
        secondaryHighlightedNodeIds: [parent.frameId],
        stateSnapshot: this.cloneState(state),
      });

      if (k <= 1) {
        frame.returnValue = k;
        frame.state = 'returning';
        steps.push({
          stepIndex: stepCount++,
          operation: 'BASE_CASE',
          description: `Base case fib(${k}) = ${k}. Popping frame.`,
          codeLine: 2,
          highlightedNodeIds: [frame.frameId],
          secondaryHighlightedNodeIds: [],
          stateSnapshot: this.cloneState(state),
        });
        state.frames.pop();
        return k;
      }

      steps.push({
        stepIndex: stepCount++,
        operation: 'BRANCH_LEFT',
        description: `Evaluating left branch fib(${k - 1}) for node fib(${k}).`,
        codeLine: 3,
        highlightedNodeIds: [frame.frameId],
        secondaryHighlightedNodeIds: [],
        stateSnapshot: this.cloneState(state),
      });

      const left = simulateFib(k - 1);

      steps.push({
        stepIndex: stepCount++,
        operation: 'BRANCH_RIGHT',
        description: `Left branch returned ${left}. Evaluating right branch fib(${k - 2}) for node fib(${k}).`,
        codeLine: 3,
        highlightedNodeIds: [frame.frameId],
        secondaryHighlightedNodeIds: [],
        stateSnapshot: this.cloneState(state),
      });

      const right = simulateFib(k - 2);
      const total = left + right;

      frame.returnValue = total;
      frame.state = 'returning';

      steps.push({
        stepIndex: stepCount++,
        operation: 'SUM_BRANCHES',
        description: `fib(${k}) = ${left} + ${right} = ${total}. Popping frame.`,
        codeLine: 3,
        highlightedNodeIds: [frame.frameId],
        secondaryHighlightedNodeIds: [],
        stateSnapshot: this.cloneState(state),
      });

      state.frames.pop();
      return total;
    };

    const finalResult = simulateFib(n);
    mainFrame.localVariables.res = finalResult;

    steps.push({
      stepIndex: stepCount++,
      operation: 'COMPLETED',
      description: `Fibonacci simulation completed: fib(${n}) = ${finalResult}.`,
      codeLine: 7,
      highlightedNodeIds: [mainFrame.frameId],
      secondaryHighlightedNodeIds: [],
      stateSnapshot: this.cloneState(state),
    });

    return {
      id: 'trace-call-fib',
      visualizerId: 'callstack',
      title: `Recursive Fibonacci (${n}) Trace`,
      totalSteps: steps.length,
      steps,
      initialState: this.createEmptyState('recursive-fib', `Recursive Fibonacci (${n})`, cCode),
      finalState: state,
    };
  }
}
