import { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  // ==========================================
  // PATH 1 — C SYSTEMS PROGRAMMING (9 LESSONS)
  // ==========================================
  {
    id: 'c-compilation-pipeline',
    conceptId: 'c.compilation-pipeline',
    languageId: 'c',
    title: 'The C Compilation Pipeline: Preprocessor, Compiler, Assembler, Linker',
    slug: 'c-compilation-pipeline',
    summary: 'Trace how human-readable C code transforms into machine code through preprocessing, compilation, assembly, and linking.',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 15,
    order: 1,
    version: '1.0.0',
    learningObjectives: [
      'Identify the role and output of the four C translation phases.',
      'Inspect preprocessor macro expansion and header inclusion.',
      'Differentiate between compile-time syntax errors and linker symbol errors.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'From Source Code to Machine Executable',
      },
      {
        type: 'markdown',
        content: `Unlike interpreted languages like Python or JavaScript, C is an **ahead-of-time compiled language**. A C source file (.c) does not execute directly. Instead, it passes through four distinct transformation phases before producing an executable ELF or Mach-O binary.

Understanding this pipeline is fundamental: it reveals why header files are structured with header guards, why undefined function references trigger *linker* errors rather than *compiler* errors, and how macros are expanded.`,
      },
      {
        type: 'comparison',
        title: 'The Four Translation Stages',
        headers: ['Stage', 'Tool', 'Input', 'Output', 'Primary Responsibility'],
        rows: [
          ['1. Preprocessing', 'cpp', 'source.c', 'source.i', 'Expands #include, replaces #define macros, strips comments.'],
          ['2. Compilation', 'cc1', 'source.i', 'source.s', 'Parses syntax, validates types, performs optimizations, generates assembly.'],
          ['3. Assembly', 'as', 'source.s', 'source.o', 'Translates assembly mnemonics into machine code object files with relocations.'],
          ['4. Linking', 'ld', 'source.o, libc.a', 'binary.out', 'Resolves external symbols, patches jump targets, packages final executable.'],
        ],
      },
      {
        type: 'code',
        language: 'c',
        title: 'pipeline_demo.c',
        code: `#include <stdio.h>
#define PLATFORM_ID 101

int main(void) {
    printf("Lumenode C Pipeline Initialized. Platform ID: %d\\n", PLATFORM_ID);
    return 0;
}`,
        executable: true,
      },
      {
        type: 'walkthrough',
        title: 'Step-by-Step Pipeline Execution',
        steps: [
          {
            stepNumber: 1,
            title: 'Preprocessing: Textual Substitution',
            description: 'The preprocessor runs first. #include <stdio.h> is replaced with thousands of lines of standard I/O declarations, and PLATFORM_ID is textually substituted with 101.',
            codeSnippet: `gcc -E pipeline_demo.c -o pipeline_demo.i`,
            highlightLines: [1],
          },
          {
            stepNumber: 2,
            title: 'Compilation: Generating Assembly',
            description: 'The compiler front-end translates preprocessed C into target-specific assembly instructions (e.g. x86-64 or ARM64).',
            codeSnippet: `gcc -S pipeline_demo.i -o pipeline_demo.s`,
            highlightLines: [1],
          },
          {
            stepNumber: 3,
            title: 'Assembly: Emitting Object Code',
            description: 'The assembler produces pipeline_demo.o containing raw machine code bytes, but external function addresses like printf remain unresolved placeholder symbols.',
            codeSnippet: `as pipeline_demo.s -o pipeline_demo.o`,
            highlightLines: [1],
          },
          {
            stepNumber: 4,
            title: 'Linking: Symbol Resolution',
            description: 'The linker locates printf in libc.so/libc.a, resolves the offset, and produces the final executable binary.',
            codeSnippet: `gcc pipeline_demo.o -o pipeline_demo`,
            highlightLines: [1],
          },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Diagnostic Mastery: Compiler vs Linker Errors',
        content: `If you misspell a variable name (e.g., \`prntf\`), the **compiler** halts with \`implicit declaration of function\`. If you declare a function in a header \`void calculate();\` but forget to link the implementation file containing its definition, the compiler succeeds, but the **linker** fails with \`undefined reference to 'calculate'\`.`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-c-pipeline',
      },
      {
        type: 'related_concepts',
        title: 'Prerequisite & Connected Concepts',
        conceptIds: ['c.types-variables'],
      },
      {
        type: 'references',
        title: 'Authoritative Documentation',
        items: [
          {
            title: 'The C Programming Language (2nd Edition)',
            author: 'Brian W. Kernighan & Dennis M. Ritchie',
            year: 1988,
          },
          {
            title: 'Linkers and Loaders',
            author: 'John R. Levine',
            year: 1999,
          },
        ],
      },
    ],
  },

  {
    id: 'c-variables-types',
    conceptId: 'c.types-variables',
    languageId: 'c',
    title: 'Primitive Data Types & Memory Sizing in C',
    slug: 'variables-and-data-types',
    summary: 'Understand fundamental C data types, bit-level storage, signedness, two complement representations, and machine word alignment.',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 15,
    order: 2,
    version: '1.0.0',
    learningObjectives: [
      'Explain how char, int, float, and double are physically laid out in RAM.',
      'Differentiate between signed and unsigned integer arithmetic overflow.',
      'Use the sizeof operator accurately to determine byte sizes at compile time.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Physical Nature of Data in C',
      },
      {
        type: 'markdown',
        content: `In high-level languages like Python or JavaScript, variables are abstract references that automatically adjust in size. In C, **every variable corresponds directly to a fixed contiguous block of bytes in memory**. 

When you write \`int count = 42;\`, you tell the compiler to allocate exactly 4 bytes on the current stack frame, formatted as a signed two's complement binary number.`,
      },
      {
        type: 'comparison',
        title: 'Standard C Primitive Sizing (x86-64 / LP64 Data Model)',
        headers: ['Type', 'Minimum Standard Size', 'Typical 64-bit Size', 'Value Range', 'Format Specifier'],
        rows: [
          ['char', '1 byte (8 bits)', '1 byte', '-128 to 127 (or 0 to 255)', '%c, %d'],
          ['short', '2 bytes (16 bits)', '2 bytes', '-32,768 to 32,767', '%hd'],
          ['int', '2 bytes (16 bits)', '4 bytes', '-2,147,483,648 to 2,147,483,647', '%d'],
          ['long', '4 bytes (32 bits)', '8 bytes (Linux) / 4 bytes (Win)', '-2^63 to 2^63 - 1', '%ld'],
          ['float', '4 bytes (32 bits)', '4 bytes', 'IEEE 754 Single Precision (~7 digits)', '%f'],
          ['double', '8 bytes (64 bits)', '8 bytes', 'IEEE 754 Double Precision (~15 digits)', '%lf'],
        ],
      },
      {
        type: 'code',
        language: 'c',
        title: 'sizeof_inspection.c',
        code: `#include <stdio.h>
#include <stdint.h>

int main(void) {
    char c = 'A';
    int i = 42;
    double d = 3.1415926535;
    
    printf("char size:   %zu byte  (Address: %p)\\n", sizeof(c), (void*)&c);
    printf("int size:    %zu bytes (Address: %p)\\n", sizeof(i), (void*)&i);
    printf("double size: %zu bytes (Address: %p)\\n", sizeof(d), (void*)&d);
    
    return 0;
}`,
        executable: true,
      },
      {
        type: 'walkthrough',
        title: 'Memory Byte Inspection',
        steps: [
          {
            stepNumber: 1,
            title: 'Variable Allocation on Stack Frame',
            description: 'When main() executes, the compiler reserves stack frame space for c (1 byte), i (4 bytes), and d (8 bytes).',
            codeSnippet: `char c = 'A';\nint i = 42;\ndouble d = 3.1415926535;`,
            highlightLines: [1, 2, 3],
          },
          {
            stepNumber: 2,
            title: 'Compile-Time sizeof Evaluation',
            description: 'sizeof does not execute at runtime; the compiler inspects the type at compile-time and inserts the literal constant byte count.',
            codeSnippet: `sizeof(c); // Evaluates to constant 1`,
            highlightLines: [1],
          },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Crucial Systems Rule: Signed Overflow is Undefined Behavior',
        content: `In C, **signed integer overflow is Undefined Behavior (UB)**. If a signed 32-bit int exceeds 2,147,483,647, the compiler is allowed by the C standard to assume it never happens, which can lead to aggressive loop elimination optimizations. For modular wraparound arithmetic, always use \`unsigned int\` or \`uint32_t\` from \`<stdint.h>\`.`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-c-types',
      },
      {
        type: 'related_concepts',
        title: 'Prerequisite & Connected Concepts',
        conceptIds: ['c.compilation-pipeline', 'c.control-flow', 'memory.pointers-intro'],
      },
      {
        type: 'references',
        title: 'Canonical References',
        items: [
          {
            title: 'ISO/IEC 9899:2018 (C18 Standard) - Section 6.2.5 Types',
            author: 'ISO Standards Committee',
            year: 2018,
          },
        ],
      },
    ],
  },

  {
    id: 'c-control-flow',
    conceptId: 'c.control-flow',
    languageId: 'c',
    title: 'Control Flow, Branch Prediction & Loop Invariants in C',
    slug: 'c-control-flow',
    summary: 'Master conditional logic, numeric truthiness, switch jump tables, and provable loop termination invariants.',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 15,
    order: 3,
    version: '1.0.0',
    learningObjectives: [
      'Evaluate truthiness in C where 0 represents false and any non-zero value represents true.',
      'Differentiate between if-else decision trees and switch jump tables.',
      'Construct deterministic loops with provable loop termination invariants.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Directing the Machine: Branches and Loops',
      },
      {
        type: 'markdown',
        content: `At the machine level, the CPU executes instructions sequentially from memory. Control flow structures in C—\`if\`, \`else\`, \`switch\`, \`for\`, and \`while\`—translate into conditional jump instructions (\`je\`, \`jne\`, \`jg\`) that modify the CPU Instruction Pointer (EIP/RIP).

In C, conditions do not require a special boolean type: **any integer expression evaluating to 0 is false, and any non-zero value is true**.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'control_flow_demo.c',
        code: `#include <stdio.h>

int main(void) {
    int sum = 0;
    
    // Provable invariant: sum contains sum of integers from 1 to i-1
    for (int i = 1; i <= 5; i++) {
        if (i % 2 == 0) {
            sum += i; // Add even numbers
        }
    }
    
    printf("Sum of evens (2 + 4): %d\\n", sum);
    return 0;
}`,
        executable: true,
      },
      {
        type: 'walkthrough',
        title: 'Tracing Loop Execution',
        steps: [
          {
            stepNumber: 1,
            title: 'Initialization',
            description: 'Variable i is allocated and initialized to 1. The loop condition i <= 5 is evaluated.',
            codeSnippet: `for (int i = 1; i <= 5; i++)`,
            highlightLines: [1],
          },
          {
            stepNumber: 2,
            title: 'Conditional Branching',
            description: 'When i is 2, 2 % 2 evaluates to 0, so the condition i % 2 == 0 is true (1). sum increments from 0 to 2.',
            codeSnippet: `if (i % 2 == 0) sum += i;`,
            highlightLines: [1],
          },
          {
            stepNumber: 3,
            title: 'Termination',
            description: 'When i increments to 6, i <= 5 evaluates to false (0), the loop terminates deterministically, and execution proceeds.',
            codeSnippet: `// Loop exits when i = 6`,
            highlightLines: [1],
          },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Common Mistake: Assignment vs Equality',
        content: `Writing \`if (x = 5)\` is an assignment that evaluates to 5 (non-zero / true), executing the branch and mutating x! Always use \`==\` for comparison. Modern compilers warn on \`-Wparentheses\`.`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-c-control-flow',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['c.types-variables', 'c.functions-stack'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Computer Systems: A Programmer\'s Perspective (CS:APP)',
            author: 'Randal E. Bryant & David R. O\'Hallaron',
            year: 2015,
          },
        ],
      },
    ],
  },

  {
    id: 'c-functions-stack',
    conceptId: 'c.functions-stack',
    languageId: 'c',
    title: 'Functions, Activation Records & Call-Stack Mechanics in C',
    slug: 'c-functions-stack',
    summary: 'Explore stack frame allocation, the cdecl calling convention, base pointers (RBP), and parameter passing by value.',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 20,
    order: 4,
    version: '1.0.0',
    learningObjectives: [
      'Trace call stack frame creation and destruction during function execution.',
      'Explain why C passes all parameters strictly by value.',
      'Identify stack overflow conditions caused by unbounded recursion.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Architecture of Function Calls',
      },
      {
        type: 'markdown',
        content: `Every time a C function is called, the CPU allocates an **Activation Record (Stack Frame)** on the call stack. This frame stores:
1. The return address (where to resume execution in the caller).
2. The caller's base pointer (\`RBP\`).
3. Local variables and spilled register values.

Because C passes all parameters **strictly by value**, a function receives local copies of its arguments. Modifying a parameter inside a function alters only its stack frame copy.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'call_stack_demo.c',
        code: `#include <stdio.h>

void calculate(int val) {
    val = val * 2;
    printf("Inside calculate: %d\\n", val);
}

int main(void) {
    int original = 10;
    calculate(original);
    printf("Inside main (unchanged): %d\\n", original);
    return 0;
}`,
        executable: true,
      },
      {
        type: 'walkthrough',
        title: 'Stack Frame Allocation Cycle',
        steps: [
          {
            stepNumber: 1,
            title: 'Caller Frame (main)',
            description: 'main() allocates stack space for original = 10. To call calculate(), it loads 10 into register EDI (System V AMD64 ABI).',
            codeSnippet: `int original = 10;\ncalculate(original);`,
            highlightLines: [1, 2],
          },
          {
            stepNumber: 2,
            title: 'Call Instruction: Pushing Return Address',
            description: 'The call instruction pushes the address of the next instruction in main() onto the stack and jumps to calculate.',
            codeSnippet: `call calculate`,
            highlightLines: [1],
          },
          {
            stepNumber: 3,
            title: 'Callee Frame & Teardown',
            description: 'calculate() pushes RBP, allocates stack space for val, modifies its local copy, prints, and issues ret. ret pops the return address, restoring main().',
            codeSnippet: `ret // Stack frame destroyed`,
            highlightLines: [1],
          },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Dangling Stack Pointer Hazard',
        content: `Never return the address of a local stack variable: \`int* f() { int x = 5; return &x; }\`. When the function returns, its stack frame is invalidated. Dereferencing the returned pointer in the caller reads corrupted stack memory!`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-c-functions',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['c.control-flow', 'c.arrays-strings', 'memory.pointers-intro'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'System V Application Binary Interface AMD64 Architecture Processor Supplement',
            author: 'H.J. Lu, Michael Matz, Milind Girkar et al.',
            year: 2018,
          },
        ],
      },
    ],
  },

  {
    id: 'c-arrays-strings',
    conceptId: 'c.arrays-strings',
    languageId: 'c',
    title: 'Fixed Arrays & Null-Terminated Strings in C',
    slug: 'c-arrays-strings',
    summary: 'Contiguous buffer layouts in memory, array dimension calculation, string length determination, and the null terminator invariant.',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 20,
    order: 5,
    version: '1.0.0',
    learningObjectives: [
      'Calculate array element byte addresses: base + index * sizeof(type).',
      'Explain how C strings differ from modern managed strings by using the null byte \\0.',
      'Prevent buffer overflow vulnerabilities when handling user input.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Contiguous Buffers in Hardware Memory',
      },
      {
        type: 'markdown',
        content: `In C, an **array** is a sequence of identical elements stored contiguously in memory. Unlike managed languages, a C array stores **no length metadata at runtime**: it is purely raw bytes.

A C **string** is simply an array of \`char\` elements terminated by a null byte (\`'\\0'\`, integer value 0). Functions like \`strlen()\` traverse the buffer character by character until finding this sentinel zero.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'arrays_strings_demo.c',
        code: `#include <stdio.h>
#include <string.h>

int main(void) {
    int numbers[4] = {10, 20, 30, 40};
    char name[] = "Lumen"; // 5 chars + 1 null terminator = 6 bytes
    
    printf("Array total bytes: %zu\\n", sizeof(numbers));
    printf("Array element count: %zu\\n", sizeof(numbers) / sizeof(numbers[0]));
    printf("String length: %zu, sizeof buffer: %zu\\n", strlen(name), sizeof(name));
    
    return 0;
}`,
        executable: true,
      },
      {
        type: 'walkthrough',
        title: 'Buffer Layout & Null Terminator',
        steps: [
          {
            stepNumber: 1,
            title: 'Contiguous Memory Allocation',
            description: 'numbers is placed in stack memory as 4 contiguous 4-byte integers (16 bytes total).',
            codeSnippet: `int numbers[4] = {10, 20, 30, 40};`,
            highlightLines: [1],
          },
          {
            stepNumber: 2,
            title: 'String Null Termination',
            description: 'name is allocated 6 bytes: \'L\', \'u\', \'m\', \'e\', \'n\', and \'\\0\'.',
            codeSnippet: `char name[] = "Lumen"; // 6 bytes on stack`,
            highlightLines: [1],
          },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Security Vulnerability: Buffer Overflows',
        content: `Functions like \`gets()\` or \`strcpy()\` do not check buffer boundaries. Writing beyond the allocated length corrupts adjacent stack variables and can overwrite the function return address—the classic buffer overflow exploit! Always use bounds-checking functions like \`snprintf()\` or \`fgets()\`.`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-c-arrays',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['c.functions-stack', 'memory.pointers-intro', 'c.pointer-arithmetic'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'C Programming: A Modern Approach',
            author: 'K. N. King',
            year: 2008,
          },
        ],
      },
    ],
  },

  {
    id: 'c-pointers-basics',
    conceptId: 'memory.pointers-intro',
    languageId: 'c',
    title: 'Demystifying Pointers & Memory Addresses in C',
    slug: 'pointers-basics-in-c',
    summary: 'Direct unchecked memory address manipulation via the address-of (&) and dereference (*) operators.',
    difficulty: 'beginner',
    templateType: 'memory-systems',
    estimatedMinutes: 20,
    order: 6,
    version: '1.0.0',
    learningObjectives: [
      'Understand how variables map to virtual memory addresses.',
      'Differentiate between an address value and the dereferenced payload.',
      'Analyze 64-bit pointer sizing and byte offsets.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Memory as an Addressable Byte Sequence',
      },
      {
        type: 'markdown',
        content: `Every variable created in a C program resides at a specific **virtual memory address**. A pointer is simply a variable whose value is the memory address of another variable.

In modern 64-bit operating systems, memory is structured as a continuous address space of $2^{64}$ addressable bytes. Therefore, every pointer in a 64-bit C program is exactly **8 bytes** in size, regardless of what type of data it points to.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'pointer_basics.c',
        code: `#include <stdio.h>

int main(void) {
    int target = 42;
    int *ptr = &target; // & gets the memory address of target
    
    printf("Value of target:              %d\\n", target);
    printf("Memory address of target:     %p\\n", (void*)&target);
    printf("Value stored in pointer ptr:  %p\\n", (void*)ptr);
    printf("Dereferenced value (*ptr):    %d\\n", *ptr);
    
    *ptr = 99; // Mutate target directly via its memory address
    printf("Updated target value:         %d\\n", target);
    
    return 0;
}`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'memory',
      },
      {
        type: 'walkthrough',
        title: 'Pointer Dereference Step-by-Step',
        steps: [
          {
            stepNumber: 1,
            title: 'Variable Allocation',
            description: 'An integer variable target is allocated on the stack (4 bytes) holding the binary representation of 42.',
            codeSnippet: `int target = 42;`,
            highlightLines: [1],
          },
          {
            stepNumber: 2,
            title: 'Address-of Operator (&)',
            description: 'The operator &target retrieves the hexadecimal memory address where target resides.',
            codeSnippet: `int *ptr = &target;`,
            highlightLines: [1],
          },
          {
            stepNumber: 3,
            title: 'Dereference Operator (*)',
            description: 'The dereference *ptr tells the CPU to read or write the bytes located at that stored address.',
            codeSnippet: `*ptr = 99;`,
            highlightLines: [1],
          },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Memory Invariant: Pointer Sizes are Uniform',
        content: `Whether pointing to a 1-byte \`char\` or a 10,000-byte \`struct\`, the pointer itself is always exactly 8 bytes on a 64-bit architecture. The pointer type determines only how many bytes are read when dereferencing.`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-pointer-deref',
      },
      {
        type: 'related_concepts',
        title: 'Prerequisite & Connected Concepts',
        conceptIds: ['c.arrays-strings', 'c.pointer-arithmetic', 'memory.dynamic-allocation'],
      },
      {
        type: 'references',
        title: 'Academic References',
        items: [
          {
            title: 'The C Programming Language (2nd Edition)',
            author: 'Brian W. Kernighan & Dennis M. Ritchie',
            year: 1988,
          },
        ],
      },
    ],
  },

  {
    id: 'c-pointer-arithmetic',
    conceptId: 'c.pointer-arithmetic',
    languageId: 'c',
    title: 'Pointer Arithmetic & Array Decay in C',
    slug: 'pointer-arithmetic-and-arrays',
    summary: 'Understand pointer scaling by data type size, address offsets, and why array indexing is syntactically equivalent to pointer arithmetic.',
    difficulty: 'intermediate',
    templateType: 'memory-systems',
    estimatedMinutes: 20,
    order: 7,
    version: '1.0.0',
    learningObjectives: [
      'Explain that incrementing a pointer advances the virtual address by sizeof(*ptr) bytes.',
      'Demonstrate that arr[i] is syntactically equivalent to *(arr + i).',
      'Traverse contiguous memory blocks safely without buffer overruns.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'How Pointer Arithmetic Works',
      },
      {
        type: 'markdown',
        content: `Pointer arithmetic differs fundamentally from standard integer arithmetic. When you add 1 to an integer variable, its numeric value increases by 1. When you add 1 to a **pointer**, its address value increases by **1 * sizeof(the pointed-to type)**.

If \`ptr\` points to a 4-byte \`int\` at address \`0x1000\`, \`ptr + 1\` resolves to address \`0x1004\`. If it points to an 8-byte \`double\`, \`ptr + 1\` resolves to \`0x1008\`.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'pointer_decay_demo.c',
        code: `#include <stdio.h>

int main(void) {
    int arr[4] = {10, 20, 30, 40};
    int *p = arr; // Array name decays into pointer to arr[0]
    
    for (int i = 0; i < 4; i++) {
        printf("Index %d: arr[%d]=%d | *(p + %d)=%d | Address: %p\\n", 
               i, i, arr[i], i, *(p + i), (void*)(p + i));
    }
    return 0;
}`,
        executable: true,
      },
      {
        type: 'comparison',
        title: 'Array Indexing vs Pointer Arithmetic Equivalence',
        headers: ['Expression', 'Internal Translation', 'Memory Operation', 'Result'],
        rows: [
          ['arr[0]', '*(arr + 0)', 'Reads 4 bytes from base address', '10'],
          ['arr[1]', '*(arr + 1)', 'Reads 4 bytes from base + 4', '20'],
          ['arr[2]', '*(arr + 2)', 'Reads 4 bytes from base + 8', '30'],
          ['2[arr]', '*(2 + arr)', 'Identical due to commutative addition', '30 (Valid C!)'],
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Undefined Behavior: Past-the-End Pointers',
        content: `The C standard permits computing a pointer to one element past the end of an array (\`arr + 4\` for a 4-element array) to support sentinel loop conditions. However, **dereferencing** that past-the-end pointer is Undefined Behavior!`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-pointer-arithmetic',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['memory.pointers-intro', 'memory.dynamic-allocation', 'dsa.singly-linked-list'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Expert C Programming: Deep C Secrets',
            author: 'Peter van der Linden',
            year: 1994,
          },
        ],
      },
    ],
  },

  {
    id: 'c-dynamic-memory',
    conceptId: 'memory.dynamic-allocation',
    languageId: 'c',
    title: 'Dynamic Heap Memory: malloc, calloc & free',
    slug: 'dynamic-memory-allocation',
    summary: 'Manage dynamic heap allocations, prevent memory leaks, understand brk/sbrk and mmap, and avoid dangling pointers.',
    difficulty: 'intermediate',
    templateType: 'memory-systems',
    estimatedMinutes: 25,
    order: 8,
    version: '1.0.0',
    learningObjectives: [
      'Allocate heap memory using malloc and calloc safely.',
      'Check for allocation failures by validating returned pointers against NULL.',
      'Prevent memory leaks and double-free vulnerabilities with disciplined free() calls.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Stack vs Heap Lifetime',
      },
      {
        type: 'markdown',
        content: `Stack memory is managed automatically: when a function returns, its activation record is wiped out. However, if your program needs data that survives across multiple function calls, or data whose size is only known at runtime, it must be allocated on the **Heap**.

The heap is managed by the C runtime library allocator (glibc ptmalloc, jemalloc), which requests virtual memory pages from the OS via \`brk\` or \`mmap\` system calls.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'heap_allocation.c',
        code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    size_t count = 3;
    int *numbers = malloc(count * sizeof(int));
    
    // Always check for allocation failure!
    if (numbers == NULL) {
        fprintf(stderr, "Out of memory!\\n");
        return 1;
    }
    
    for (size_t i = 0; i < count; i++) {
        numbers[i] = (int)(i + 1) * 100;
        printf("Heap element [%zu]: %d\\n", i, numbers[i]);
    }
    
    free(numbers);
    numbers = NULL; // Defend against dangling pointer dereference
    return 0;
}`,
        executable: true,
      },
      {
        type: 'walkthrough',
        title: 'Heap Allocation Lifecycle',
        steps: [
          {
            stepNumber: 1,
            title: 'Heap Request',
            description: 'malloc requests 12 contiguous bytes from the heap allocator. The allocator finds a free block with memory metadata headers and returns a void* pointer.',
            codeSnippet: `int *numbers = malloc(count * sizeof(int));`,
            highlightLines: [1],
          },
          {
            stepNumber: 2,
            title: 'Memory Deallocation',
            description: 'free(numbers) releases the chunk back to the heap free-list. The OS does not immediately reclaim the memory pages; the allocator keeps it for reuse.',
            codeSnippet: `free(numbers);`,
            highlightLines: [1],
          },
          {
            stepNumber: 3,
            title: 'Nullifying the Pointer',
            description: 'Setting numbers = NULL ensures that any accidental subsequent dereference immediately segfaults cleanly rather than silently corrupting memory.',
            codeSnippet: `numbers = NULL;`,
            highlightLines: [1],
          },
        ],
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dynamic-alloc',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['c.pointer-arithmetic', 'c.structures', 'dsa.singly-linked-list'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Understanding glibc malloc',
            author: 'Sploitfun',
            year: 2015,
          },
        ],
      },
    ],
  },

  {
    id: 'c-structures',
    conceptId: 'c.structures',
    languageId: 'c',
    title: 'C Structures, Alignment & Padding',
    slug: 'c-structures-and-alignment',
    summary: 'Design composite data types, analyze compiler padding, understand struct packing, and navigate nested struct layouts.',
    difficulty: 'intermediate',
    templateType: 'memory-systems',
    estimatedMinutes: 20,
    order: 9,
    version: '1.0.0',
    learningObjectives: [
      'Construct user-defined composite records with the struct keyword.',
      'Explain why sizeof(struct) often exceeds the sum of its member sizes due to alignment padding.',
      'Order struct members to minimize memory footprint in high-performance applications.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Hardware Alignment and Data Structure Padding',
      },
      {
        type: 'markdown',
        content: `CPUs access memory most efficiently when data is naturally aligned: an $N$-byte value should be placed at an address that is a multiple of $N$. For example, an 8-byte \`double\` is aligned to addresses divisible by 8.

When you declare a struct in C, the compiler automatically inserts invisible **padding bytes** between members and at the end of the struct to ensure each field and array element satisfies hardware alignment.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'struct_alignment_demo.c',
        code: `#include <stdio.h>

struct Unoptimized {
    char a;    // 1 byte + 3 bytes padding
    int b;     // 4 bytes
    char c;    // 1 byte + 7 bytes padding
    double d;  // 8 bytes
}; // Total: 24 bytes!

struct Optimized {
    double d;  // 8 bytes
    int b;     // 4 bytes
    char a;    // 1 byte
    char c;    // 1 byte + 2 bytes padding
}; // Total: 16 bytes!

int main(void) {
    printf("Unoptimized size: %zu bytes\\n", sizeof(struct Unoptimized));
    printf("Optimized size:   %zu bytes\\n", sizeof(struct Optimized));
    return 0;
}`,
        executable: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Performance Rule: Order Members from Largest to Smallest',
        content: `To minimize padding waste in C structs, order fields by descending size: 8-byte types first (\`double\`, \`long\`, pointers), followed by 4-byte types (\`int\`, \`float\`), 2-byte types (\`short\`), and 1-byte types (\`char\`).`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-c-struct-padding',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['c.types-variables', 'memory.dynamic-allocation', 'dsa.singly-linked-list'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'The Lost Art of Structure Packing',
            author: 'Eric S. Raymond',
            year: 2014,
          },
        ],
      },
    ],
  },

  // ==========================================
  // PATH 2 — C++ SYSTEMS & OOP (7 LESSONS)
  // ==========================================
  {
    id: 'cpp-fundamentals-references',
    conceptId: 'cpp.fundamentals-references',
    languageId: 'cpp',
    title: 'C++ Foundations: Namespaces, Streams & Alias References',
    slug: 'cpp-foundations-references',
    summary: 'Bridge from pure C to C++: understand namespace isolation, type-safe streams (cin/cout), and non-null reference aliases (&).',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 15,
    order: 10,
    version: '1.0.0',
    learningObjectives: [
      'Isolate identifiers and avoid global namespace pollution using namespace blocks.',
      'Differentiate between C pointers and C++ references in syntax and semantics.',
      'Implement pass-by-reference with const qualifiers for zero-copy read-only operations.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'From C to C++: Stronger Type Safety and References',
      },
      {
        type: 'markdown',
        content: `C++ was originally designed by Bjarne Stroustrup as "C with Classes". While maintaining near-full backwards compatibility with C, C++ introduces powerful core abstractions.

The most critical of these is the **Reference (\`&\`)**. In C, modifying caller data requires passing a pointer and explicitly dereferencing it (\`*p\`). In C++, a reference acts as an immutable, non-null alias for an existing object.`,
      },
      {
        type: 'comparison',
        title: 'C Pointers vs C++ References',
        headers: ['Property', 'C Pointer (T*)', 'C++ Reference (T&)', 'Safety Implication'],
        rows: [
          ['Nullability', 'Can be NULL / nullptr', 'Cannot be null (must bind to valid object)', 'References guarantee existence'],
          ['Re-seating', 'Can be reassigned to point elsewhere', 'Cannot be rebound after initialization', 'References guarantee identity stability'],
          ['Syntax', 'Requires & to take address, * to dereference', 'Natural value syntax (no * needed)', 'Cleaner, less error-prone code'],
          ['Pointer Arithmetic', 'Allowed (ptr++)', 'Disallowed directly on references', 'Eliminates off-by-one pointer bugs'],
        ],
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'references_demo.cpp',
        code: `#include <iostream>

void swap(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 10, y = 20;
    swap(x, y); // Clean call syntax!
    std::cout << "x: " << x << ", y: " << y << std::endl;
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-cpp-references',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['c.functions-stack', 'oops.classes-objects', 'memory.pointers-intro'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'A Tour of C++ (3rd Edition)',
            author: 'Bjarne Stroustrup',
            year: 2022,
          },
        ],
      },
    ],
  },

  {
    id: 'cpp-classes-objects',
    conceptId: 'oops.classes-objects',
    languageId: 'cpp',
    title: 'C++ Classes, Encapsulation & Member Visibility',
    slug: 'cpp-classes-objects',
    summary: 'Encapsulation boundaries, private/protected/public access specifiers, and the implicit this pointer.',
    difficulty: 'beginner',
    templateType: 'oop',
    estimatedMinutes: 20,
    order: 11,
    version: '1.0.0',
    learningObjectives: [
      'Encapsulate mutable state behind private access boundaries.',
      'Differentiate class (private by default) from struct (public by default).',
      'Explain how the implicit this pointer is passed to non-static member functions.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Object Encapsulation and Memory Layout',
      },
      {
        type: 'markdown',
        content: `A C++ class groups data members and member functions into a single cohesive entity. An instance of a class occupies exactly the memory required to store its non-static data members (plus padding and vtable pointer if polymorphic).

Member functions do not duplicate memory per instance: they exist once in the code/text segment and receive a hidden parameter called \`this\`—a pointer to the invoking object.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'bank_account.cpp',
        code: `#include <iostream>

class BankAccount {
private:
    double balance; // Encapsulated private state

public:
    BankAccount(double initial) : balance(initial) {}
    
    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }
    
    double getBalance() const {
        return balance;
    }
};

int main() {
    BankAccount acc(100.0);
    acc.deposit(50.0);
    std::cout << "Account Balance: $" << acc.getBalance() << std::endl;
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-cpp-classes',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['cpp.fundamentals-references', 'cpp.constructors-destructors', 'oops.inheritance'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Effective C++: 55 Specific Ways to Improve Your Programs and Designs',
            author: 'Scott Meyers',
            year: 2005,
          },
        ],
      },
    ],
  },

  {
    id: 'cpp-constructors-destructors',
    conceptId: 'cpp.constructors-destructors',
    languageId: 'cpp',
    title: 'C++ Constructors, Destructors & The Rule of 5',
    slug: 'cpp-constructors-and-rule-of-5',
    summary: 'Manage object lifecycles, member initialization lists, deep copying vs move semantics, and the Rule of Three/Five/Zero.',
    difficulty: 'intermediate',
    templateType: 'oop',
    estimatedMinutes: 25,
    order: 12,
    version: '1.0.0',
    learningObjectives: [
      'Use member initializer lists to avoid redundant default construction.',
      'Implement custom copy constructors and copy assignment operators for deep copies.',
      'Implement move constructors and move assignment operators for zero-cost ownership transfers.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Deterministic Object Lifecycles',
      },
      {
        type: 'markdown',
        content: `In C++, object lifetime is strictly deterministic:
- **Constructors** initialize state when an object is created on the stack or heap.
- **Destructors (\`~ClassName\`)** execute automatically when the object leaves scope or is deleted.

When a class directly manages a dynamic resource (like raw heap memory or an OS file handle), default compiler-generated member copies cause shallow pointer duplication, leading to double-free bugs. The **Rule of Five** mandates that managing a resource requires defining or deleting all 5 special member functions.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'rule_of_five_buffer.cpp',
        code: `#include <iostream>
#include <utility>

class Buffer {
private:
    size_t size;
    int *data;

public:
    // 1. Constructor
    Buffer(size_t s) : size(s), data(new int[s]()) {}

    // 2. Destructor
    ~Buffer() { delete[] data; }

    // 3. Copy Constructor (Deep Copy)
    Buffer(const Buffer &other) : size(other.size), data(new int[other.size]) {
        for (size_t i = 0; i < size; i++) data[i] = other.data[i];
    }

    // 4. Move Constructor (Resource Transfer)
    Buffer(Buffer &&other) noexcept : size(other.size), data(other.data) {
        other.size = 0;
        other.data = nullptr;
    }
};

int main() {
    Buffer b1(10);
    Buffer b2 = std::move(b1); // Efficient move!
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-cpp-constructors',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['oops.classes-objects', 'oops.raii', 'cpp.overloading-operators'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Effective Modern C++',
            author: 'Scott Meyers',
            year: 2014,
          },
        ],
      },
    ],
  },

  {
    id: 'cpp-overloading-friends',
    conceptId: 'cpp.overloading-operators',
    languageId: 'cpp',
    title: 'Function Overloading, Operator Overloading & Friends in C++',
    slug: 'cpp-overloading-friends',
    summary: 'Compile-time ad-hoc polymorphism via name mangling, custom operator semantics, and friend access grants.',
    difficulty: 'intermediate',
    templateType: 'oop',
    estimatedMinutes: 20,
    order: 13,
    version: '1.0.0',
    learningObjectives: [
      'Explain how the C++ compiler distinguishes overloaded functions using name mangling.',
      'Overload arithmetic and stream insertion (<<) operators safely.',
      'Grant selective private access to non-member functions with the friend keyword.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Ad-hoc Polymorphism and Operator Overloading',
      },
      {
        type: 'markdown',
        content: `C++ allows multiple functions in the same scope to share the same name as long as their parameter signatures differ (number, types, or order of parameters). The compiler encodes parameter types into the assembly symbol name—a process called **Name Mangling**.

Similarly, C++ allows user-defined classes to define custom behaviors for operators like \`+\`, \`-\`, \`==\`, and \`<<\`, giving custom types the expressive syntax of native primitives.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'vector2d_operators.cpp',
        code: `#include <iostream>

class Vector2D {
private:
    double x, y;

public:
    Vector2D(double x_val, double y_val) : x(x_val), y(y_val) {}

    // Overload + operator (Member)
    Vector2D operator+(const Vector2D &other) const {
        return Vector2D(x + other.x, y + other.y);
    }

    // Friend stream insertion operator (Free function)
    friend std::ostream &operator<<(std::ostream &os, const Vector2D &v) {
        os << "(" << v.x << ", " << v.y << ")";
        return os;
    }
};

int main() {
    Vector2D v1(1.0, 2.0);
    Vector2D v2(3.0, 4.0);
    Vector2D v3 = v1 + v2;
    std::cout << "Sum vector: " << v3 << std::endl;
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-cpp-overloading',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['oops.classes-objects', 'oops.inheritance', 'oops.polymorphism'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'The C++ Programming Language (4th Edition)',
            author: 'Bjarne Stroustrup',
            year: 2013,
          },
        ],
      },
    ],
  },

  {
    id: 'cpp-inheritance',
    conceptId: 'oops.inheritance',
    languageId: 'cpp',
    title: 'C++ Inheritance, Derived Classes & Object Slicing',
    slug: 'cpp-inheritance-hierarchies',
    summary: 'Single and multiple inheritance, memory slicing when passing by value, and derived-to-base pointer conversions.',
    difficulty: 'intermediate',
    templateType: 'oop',
    estimatedMinutes: 20,
    order: 14,
    version: '1.0.0',
    learningObjectives: [
      'Construct clean is-a class hierarchies using public inheritance.',
      'Explain how derived class memory layout encapsulates base class subobjects.',
      'Prevent object slicing by passing polymorphic objects via reference or pointer.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Subtyping and Base Class Memory Layout',
      },
      {
        type: 'markdown',
        content: `When a class inherits from another (\`class Derived : public Base\`), the memory layout of the \`Derived\` instance begins with an embedded **Base class subobject**, followed immediately by the Derived class's own data members.

This sequential layout allows a \`Derived*\` pointer to be implicitly converted into a \`Base*\` pointer without changing the underlying memory address.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'inheritance_slicing_demo.cpp',
        code: `#include <iostream>

class Base {
public:
    int base_val = 10;
};

class Derived : public Base {
public:
    int derived_val = 20;
};

void inspectByValue(Base b) { // OBJECT SLICING OCCURS!
    std::cout << "By value: " << b.base_val << std::endl;
}

void inspectByReference(const Base &b) { // SAFE: NO SLICING
    std::cout << "By reference: " << b.base_val << std::endl;
}

int main() {
    Derived d;
    inspectByValue(d);
    inspectByReference(d);
    return 0;
}`,
        executable: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Pitfall: Object Slicing',
        content: `Passing a polymorphic object by value copies only the Base portion. Derived fields and virtual method table bindings are sliced off! Always pass polymorphic objects by **const reference** (\`const Base&\`) or **pointer** (\`Base*\`).`,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-cpp-inheritance',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['oops.classes-objects', 'oops.polymorphism'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Inside the C++ Object Model',
            author: 'Stanley B. Lippman',
            year: 1996,
          },
        ],
      },
    ],
  },

  {
    id: 'cpp-polymorphism',
    conceptId: 'oops.polymorphism',
    languageId: 'cpp',
    title: 'Dynamic Polymorphism & The Virtual Table (vtable) in C++',
    slug: 'cpp-polymorphism-vtable',
    summary: 'Virtual functions, dynamic dispatch, vtable pointers, and the necessity of virtual destructors.',
    difficulty: 'intermediate',
    templateType: 'oop',
    estimatedMinutes: 25,
    order: 15,
    version: '1.0.0',
    learningObjectives: [
      'Explain how the compiler builds virtual method tables (vtables) and inserts hidden vptrs.',
      'Analyze the single-indirection runtime cost of dynamic virtual dispatch.',
      'Always declare base class destructors virtual to prevent partial deallocations.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Virtual Method Table Architecture',
      },
      {
        type: 'markdown',
        content: `When a class declares or inherits a \`virtual\` function, the compiler inserts a hidden pointer—the **vptr (virtual table pointer)**—into the class instance (typically at offset 0).

The vptr points to a static array of function pointers called the **vtable (virtual table)** created for that specific class. Calling \`ptr->virtualMethod()\` does not execute a direct call; it performs an indirect lookup: \`ptr->vptr[slot]()\`.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'vtable_dispatch.cpp',
        code: `#include <iostream>

class Shape {
public:
    virtual ~Shape() = default; // Essential virtual destructor
    virtual void draw() const {
        std::cout << "Drawing generic Shape" << std::endl;
    }
};

class Circle : public Shape {
public:
    void draw() const override {
        std::cout << "Drawing Circle (O)" << std::endl;
    }
};

int main() {
    Shape *s = new Circle();
    s->draw(); // Dynamically dispatches to Circle::draw() via vtable
    delete s;  // Correctly triggers Circle destructor then Shape destructor
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-cpp-vtable',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['oops.inheritance', 'oops.raii'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Itanium C++ ABI Specification - Virtual Table Layout',
            author: 'CodeSourcery, Compaq, EDG, HP, IBM, Intel, SGI',
            year: 2001,
          },
        ],
      },
    ],
  },

  {
    id: 'cpp-raii-smart-pointers',
    conceptId: 'oops.raii',
    languageId: 'cpp',
    title: 'Modern C++: RAII and Smart Pointers (unique_ptr, shared_ptr)',
    slug: 'modern-cpp-raii-smart-pointers',
    summary: 'Resource Acquisition Is Initialization (RAII), exclusive unique_ptr, reference-counted shared_ptr, and cycle-breaking weak_ptr.',
    difficulty: 'advanced',
    templateType: 'oop',
    estimatedMinutes: 25,
    order: 16,
    version: '1.0.0',
    learningObjectives: [
      'Tie system resource lifetimes (heap memory, mutexes, file handles) to object scope.',
      'Use std::unique_ptr for zero-overhead, exclusive ownership of heap resources.',
      'Use std::shared_ptr and std::weak_ptr to manage shared ownership without reference cycles.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Zero-Leak Architecture with RAII',
      },
      {
        type: 'markdown',
        content: `**Resource Acquisition Is Initialization (RAII)** is the core programming idiom of modern C++. A resource is acquired in an object's constructor and released in its destructor.

Because C++ guarantees that all stack-allocated objects are destructed during stack unwinding (even if an exception is thrown), RAII guarantees that resources are never leaked. Modern C++ code almost never calls raw \`delete\`.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'smart_pointers_demo.cpp',
        code: `#include <iostream>
#include <memory>

class Resource {
public:
    Resource()  { std::cout << "Acquired\\n"; }
    ~Resource() { std::cout << "Released\\n"; }
    void act()  { std::cout << "Operating\\n"; }
};

int main() {
    {
        // Automatically destroyed when leaving this inner block scope
        auto ptr = std::make_unique<Resource>();
        ptr->act();
    } // "Released" prints right here!
    
    std::cout << "Scope exited successfully.\\n";
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-cpp-raii',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['cpp.constructors-destructors', 'memory.dynamic-allocation'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'C++ Core Guidelines',
            author: 'Bjarne Stroustrup & Herb Sutter',
            year: 2024,
          },
        ],
      },
    ],
  },

  // ==========================================
  // PATH 3 — PYTHON PROGRAMMING (6 LESSONS)
  // ==========================================
  {
    id: 'python-fundamentals-syntax',
    conceptId: 'python.fundamentals',
    languageId: 'python',
    title: 'Python Syntax, Dynamic Typing & Control Structures',
    slug: 'python-syntax-control-flow',
    summary: 'Explore interpreted Python execution, dynamic typing tags, indentation-based blocks, and expressive iteration.',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 15,
    order: 17,
    version: '1.0.0',
    learningObjectives: [
      'Explain how Python variables store type-tagged heap pointers.',
      'Write clean, idiomatic control flow using while, for-in, and match-case.',
      'Utilize list comprehensions for concise, expressive data transformations.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Python: Dynamic, Strongly Typed & Interpreted',
      },
      {
        type: 'markdown',
        content: `In Python, **types belong to objects, not variables**. A variable name in Python is simply a name tag bound to a heap-allocated \`PyObject\`. 

Python is **strongly typed** (it will not implicitly coerce string "5" into integer 5 in arithmetic) and **dynamically typed** (a variable name can be rebound to an object of any type at runtime).`,
      },
      {
        type: 'code',
        language: 'python',
        title: 'python_basics.py',
        code: `# Dynamic typing in action
val = 42
print(f"val: {val}, type: {type(val).__name__}")

val = "Lumenode"
print(f"val: {val}, type: {type(val).__name__}")

# Expressive list comprehension
evens = [x for x in range(10) if x % 2 == 0]
print(f"Evens: {evens}")`,
        executable: true,
      },
      {
        type: 'walkthrough',
        title: 'Python Evaluation Model',
        steps: [
          {
            stepNumber: 1,
            title: 'Name Binding',
            description: 'val = 42 creates a PyLongObject on the heap holding value 42, and inserts the key "val" into the current namespace dictionary pointing to that object.',
            codeSnippet: `val = 42`,
            highlightLines: [1],
          },
          {
            stepNumber: 2,
            title: 'Re-binding',
            description: 'val = "Lumenode" creates a PyUnicodeObject on the heap. The variable name "val" is updated to point to the new string. The old integer has its reference counter decremented.',
            codeSnippet: `val = "Lumenode"`,
            highlightLines: [1],
          },
        ],
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-py-fundamentals',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['python.functions-scopes', 'python.references-identity'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Fluent Python (2nd Edition)',
            author: 'Luciano Ramalho',
            year: 2022,
          },
        ],
      },
    ],
  },

  {
    id: 'python-functions-scopes',
    conceptId: 'python.functions-scopes',
    languageId: 'python',
    title: 'Python Functions, Closures & LEGB Scope Resolution',
    slug: 'python-functions-and-scopes',
    summary: 'First-class callables, *args/**kwargs unpacking, closures, and the Local-Enclosing-Global-Builtin namespace lookup hierarchy.',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 20,
    order: 18,
    version: '1.0.0',
    learningObjectives: [
      'Trace identifier resolution through the LEGB scoping hierarchy.',
      'Implement closures that capture enclosing lexical state.',
      'Use the nonlocal and global keywords appropriately.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The LEGB Namespace Rule',
      },
      {
        type: 'markdown',
        content: `When Python looks up a variable name, it searches four namespaces in strict sequence:
1. **L (Local):** Names defined inside the current function body.
2. **E (Enclosing):** Names in outer enclosing function scopes (closures).
3. **G (Global):** Names declared at top-level module scope.
4. **B (Built-in):** Built-in functions like \`len\`, \`range\`, and \`print\`.`,
      },
      {
        type: 'code',
        language: 'python',
        title: 'closures_and_scopes.py',
        code: `def make_multiplier(factor):
    # 'factor' lives in the enclosing scope
    def multiply(x):
        return x * factor # closure captures factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

print("Double 7:", double(7))
print("Triple 7:", triple(7))`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-py-functions',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['python.fundamentals', 'python.oop-classes'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Python Distilled',
            author: 'David Beazley',
            year: 2021,
          },
        ],
      },
    ],
  },

  {
    id: 'python-collections',
    conceptId: 'python.collections',
    languageId: 'python',
    title: 'Python Collections Architecture: Lists, Dicts, Sets & Tuples',
    slug: 'python-collections-architecture',
    summary: 'Deep dive into Python collection internals: dynamic contiguous arrays (lists), compact open-addressing hash tables (dicts), and sets.',
    difficulty: 'intermediate',
    templateType: 'data-structures',
    estimatedMinutes: 20,
    order: 19,
    version: '1.0.0',
    learningObjectives: [
      'Analyze O(1) amortized append in Python dynamic lists.',
      'Explain hash table collision resolution and key hashing requirements (__hash__, __eq__).',
      'Select the optimal collection type for specific lookup and mutation workloads.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Inside Python Built-in Collections',
      },
      {
        type: 'markdown',
        content: `Python built-in containers are highly optimized C structures:
- **list:** Contiguous array of \`PyObject*\` pointers with geometric over-allocation, providing $O(1)$ amortized append.
- **tuple:** Fixed-size immutable array of \`PyObject*\` pointers with zero resize overhead.
- **dict:** Compact hash table utilizing an index array and a dense entry array, preserving insertion order with $O(1)$ average lookup.
- **set:** Hash table storing keys only, offering $O(1)$ membership testing (\`in\`).`,
      },
      {
        type: 'code',
        language: 'python',
        title: 'collections_demo.py',
        code: `student_grades = {
    "Alice": 95,
    "Bob": 88,
    "Charlie": 92
}

# O(1) average lookup
print("Alice grade:", student_grades.get("Alice"))

# Set operations (O(1) average lookup)
enrolled = {"Alice", "Bob"}
honor_roll = {"Alice", "Charlie"}
print("Both:", enrolled.intersection(honor_roll))`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-py-collections',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['python.fundamentals', 'python.references-identity', 'dsa.arrays-amortized'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'CPython Internals',
            author: 'Anthony Shaw',
            year: 2021,
          },
        ],
      },
    ],
  },

  {
    id: 'python-references-identity',
    conceptId: 'python.references-identity',
    languageId: 'python',
    title: 'Python Names, Bindings & Object Identity',
    slug: 'python-references-identity',
    summary: 'Variables as namespace labels bound to PyObjects, mutable vs. immutable types, and is vs. == semantics.',
    difficulty: 'beginner',
    templateType: 'fundamentals',
    estimatedMinutes: 20,
    order: 20,
    version: '1.0.0',
    learningObjectives: [
      'Explain that variables in Python are pointers to heap objects.',
      'Differentiate between value equality (==) and identity equality (is).',
      'Avoid unintended side-effects with mutable default arguments.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Variables Are Reference Labels, Not Boxes',
      },
      {
        type: 'markdown',
        content: `In languages like C, a variable is a physical memory box where bytes are stored. In Python, **variables are reference labels bound to objects on the heap**.

When you write \`a = [1, 2, 3]\` and \`b = a\`, both names point to the **exact same physical list object**. Mutating \`b\` immediately mutates what \`a\` sees.`,
      },
      {
        type: 'code',
        language: 'python',
        title: 'identity_inspection.py',
        code: `x = [1, 2, 3]
y = x          # Alias reference
z = [1, 2, 3]  # Separate list object

print(f"x == z: {x == z}") # True (values match)
print(f"x is z: {x is z}") # False (distinct physical objects)
print(f"x is y: {x is y}") # True (identical object in RAM)`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-py-references',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['python.fundamentals', 'python.collections', 'memory.pointers-intro'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Python Language Reference - Data Model',
            author: 'Python Software Foundation',
            year: 2024,
          },
        ],
      },
    ],
  },

  {
    id: 'python-classes-oop',
    conceptId: 'python.oop-classes',
    languageId: 'python',
    title: 'Python OOP: Classes, Dunder Methods & MRO Resolution',
    slug: 'python-classes-oop',
    summary: 'Classes as object factories, __init__, explicit self parameter, single and multiple inheritance, and C3 Linearization.',
    difficulty: 'intermediate',
    templateType: 'oop',
    estimatedMinutes: 25,
    order: 21,
    version: '1.0.0',
    learningObjectives: [
      'Implement classes with custom dunder constructors and methods.',
      'Calculate the Method Resolution Order (MRO) for multiple inheritance hierarchies using C3 linearization.',
      'Use super() cooperatively in diamond inheritance hierarchies.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Python Object-Oriented Architecture',
      },
      {
        type: 'markdown',
        content: `Python classes provide a dynamic object system. Everything in Python—including functions, modules, and classes themselves—is an instance of an object (\`isinstance(x, object)\` is always true).

Python supports multiple inheritance resolved by the **C3 Linearization Algorithm**, which computes an unambiguous, monotonic Method Resolution Order (\`__mro__\`).`,
      },
      {
        type: 'code',
        language: 'python',
        title: 'python_oop_demo.py',
        code: `class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        return "Generic sound"

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

pet = Dog("Buddy")
print(pet.speak())
print("MRO:", [c.__name__ for c in Dog.__mro__])`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-py-oop',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['python.functions-scopes', 'oops.classes-objects', 'python.exceptions-context-managers'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'The Python 2.3 Method Resolution Order',
            author: 'Michele Simionato',
            year: 2003,
          },
        ],
      },
    ],
  },

  {
    id: 'python-exceptions-context-managers',
    conceptId: 'python.exceptions-context-managers',
    languageId: 'python',
    title: 'Exception Handling & Context Managers (with Statement)',
    slug: 'python-exceptions-and-context-managers',
    summary: 'Structured error recovery with try/except/finally and deterministic resource disposal with the with statement context protocol.',
    difficulty: 'intermediate',
    templateType: 'fundamentals',
    estimatedMinutes: 20,
    order: 22,
    version: '1.0.0',
    learningObjectives: [
      'Construct robust error recovery blocks with specific exception catching.',
      'Implement custom context managers using __enter__ and __exit__ protocol.',
      'Contrast Python context managers with C++ RAII resource disposal.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Deterministic Resource Cleanliness',
      },
      {
        type: 'markdown',
        content: `Because Python uses garbage collection, resources like file descriptors, network sockets, or database connections cannot rely on deallocation timing for cleanup.

The **\`with\` statement (Context Manager protocol)** provides deterministic setup and teardown:
1. \`__enter__()\` is executed before the block starts.
2. \`__exit__()\` is guaranteed to run when leaving the block, even if an unhandled exception is raised.`,
      },
      {
        type: 'code',
        language: 'python',
        title: 'context_manager_demo.py',
        code: `class LoggedSession:
    def __enter__(self):
        print("[Session Started]")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("[Session Closed]")
        return False # Propagate exceptions

with LoggedSession():
    print("Executing secure transactions...")`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-py-exceptions',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['python.oop-classes', 'oops.raii'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'PEP 343 - The "with" Statement',
            author: 'Guido van Rossum & Nick Coghlan',
            year: 2005,
          },
        ],
      },
    ],
  },

  // ==========================================
  // PATH 4 — DATA STRUCTURES & ALGORITHMS (8 LESSONS)
  // ==========================================
  {
    id: 'dsa-asymptotic-complexity',
    conceptId: 'dsa.asymptotic-complexity',
    title: 'Asymptotic Analysis: Big O Notation & Complexity Bounds',
    slug: 'asymptotic-analysis-big-o',
    summary: 'Formal mathematical definitions of Big O, Omega, and Theta, input scaling, and time-space trade-offs.',
    difficulty: 'beginner',
    templateType: 'mathematical',
    estimatedMinutes: 20,
    order: 23,
    version: '1.0.0',
    learningObjectives: [
      'State the formal mathematical definition of Big O: T(n) <= c * f(n) for n >= n0.',
      'Differentiate worst-case, average-case, and best-case performance.',
      'Rank common asymptotic classes: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n).',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Measuring Algorithm Efficiency',
      },
      {
        type: 'markdown',
        content: `Algorithm performance is not measured in seconds or milliseconds, because clock times depend heavily on CPU clock speed, compiler optimizations, and background workloads.

Instead, computer scientists measure efficiency using **Asymptotic Analysis**: characterizing the growth rate of required operations $T(n)$ as the input size $n$ approaches infinity.`,
      },
      {
        type: 'math',
        formula: 'T(n) = O(f(n)) \\iff \\exists c > 0, n_0 \\ge 0 \\text{ such that } 0 \\le T(n) \\le c \\cdot f(n) \\; \\forall n \\ge n_0',
        explanation: 'Formal Big O Upper Bound: T(n) grows no faster than f(n) scaled by constant c past threshold n0.',
      },
      {
        type: 'comparison',
        title: 'Asymptotic Growth Orders',
        headers: ['Notation', 'Name', 'Operations for N = 1,000', 'Operations for N = 1,000,000', 'Typical Algorithm'],
        rows: [
          ['O(1)', 'Constant', '1', '1', 'Array index lookup, Hash table lookup'],
          ['O(log N)', 'Logarithmic', '~10', '~20', 'Binary search, BST lookup'],
          ['O(N)', 'Linear', '1,000', '1,000,000', 'Linear scan, Linked list traversal'],
          ['O(N log N)', 'Linearithmic', '~10,000', '~20,000,000', 'Merge sort, Quicksort (average)'],
          ['O(N^2)', 'Quadratic', '1,000,000', '1,000,000,000,000', 'Bubble sort, Nested loop pairs'],
          ['O(2^N)', 'Exponential', '1.07 x 10^301', 'Incalculable', 'Recursive Fibonacci, Subset generation'],
        ],
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dsa-complexity',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dsa.arrays-amortized', 'dsa.binary-search', 'dsa.singly-linked-list'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Introduction to Algorithms (4th Edition) - Chapter 3 Growth of Functions',
            author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
            year: 2022,
          },
        ],
      },
    ],
  },

  {
    id: 'dsa-arrays-amortized',
    conceptId: 'dsa.arrays-amortized',
    title: 'Contiguous Memory Arrays & Dynamic Resizing Amortization',
    slug: 'arrays-and-amortized-complexity',
    summary: 'Hardware cache-line locality of contiguous arrays, O(1) random-access indexing, dynamic array geometric expansion, and amortized push complexity.',
    difficulty: 'beginner',
    templateType: 'data-structures',
    estimatedMinutes: 20,
    order: 24,
    version: '1.0.0',
    learningObjectives: [
      'Calculate address offset: addr(A[i]) = base + i * sizeof(element).',
      'Prove that geometric capacity doubling yields O(1) amortized insertion cost.',
      'Contrast cache hit rates between contiguous arrays and pointer-based linked lists.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Ultimate Hardware-Friendly Data Structure',
      },
      {
        type: 'markdown',
        content: `Contiguous arrays are the foundational building block of computing. Because elements are laid out back-to-back in memory, locating element \`A[i]\` requires only a single memory address calculation:
$$\\text{address}(A[i]) = \\text{base} + i \\times \\text{sizeof}(element)$$

Furthermore, modern CPUs fetch 64-byte **cache lines** into L1/L2 cache. Iterating over an array accesses elements sequentially, maximizing hardware cache hit rates.`,
      },
      {
        type: 'math',
        formula: '\\sum_{i=1}^{k} 2^i = 2^{k+1} - 2 \\approx 2N \\implies \\frac{2N}{N} = O(1) \\text{ Amortized Work Per Append}',
        explanation: 'Amortized Analysis of Geometric Doubling: Although doubling capacity takes O(N), it happens so infrequently that the cost amortizes to O(1) per element.',
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dsa-arrays',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dsa.asymptotic-complexity', 'dsa.singly-linked-list', 'c.arrays-strings'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Algorithm Design Manual (3rd Edition)',
            author: 'Steven S. Skiena',
            year: 2020,
          },
        ],
      },
    ],
  },

  {
    id: 'dsa-linked-list-basics',
    conceptId: 'dsa.singly-linked-list',
    title: 'Singly Linked Lists: Structure, Traversal & Insertion',
    slug: 'singly-linked-lists',
    summary: 'Master node pointers, dynamic chaining, O(1) head insertion, and boundary condition handling in linked data structures.',
    difficulty: 'beginner',
    templateType: 'data-structures',
    estimatedMinutes: 20,
    order: 25,
    version: '1.0.0',
    learningObjectives: [
      'Model linked list nodes with data and next pointers.',
      'Implement O(1) head insertion and O(N) node traversal.',
      'Compare trade-offs between contiguous arrays and pointer-linked lists.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Non-Contiguous Linked Memory',
      },
      {
        type: 'markdown',
        content: `Unlike arrays, which require large contiguous blocks of memory, a **Linked List** stores elements in scattered individual heap nodes. Each node contains its payload data plus a pointer (\`next\`) to the subsequent node.

This topology allows inserting or removing nodes at the head in $O(1)$ constant time without shifting elements, at the expense of losing random access indexing.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'linked_list.c',
        code: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int val;
    struct Node *next;
};

struct Node *prepend(struct Node *head, int val) {
    struct Node *newNode = malloc(sizeof(struct Node));
    newNode->val = val;
    newNode->next = head; // Points to current head (O(1))
    return newNode;
}

int main(void) {
    struct Node *head = NULL;
    head = prepend(head, 30);
    head = prepend(head, 20);
    head = prepend(head, 10);
    
    // Traverse and print: 10 -> 20 -> 30
    struct Node *curr = head;
    while (curr != NULL) {
        printf("%d -> ", curr->val);
        curr = curr->next;
    }
    printf("NULL\\n");
    return 0;
}`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'dsa',
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-linked-list-complexity',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dsa.stacks-queues', 'memory.pointers-intro', 'dsa.binary-trees'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Data Structures and Algorithm Analysis in C (2nd Edition)',
            author: 'Mark Allen Weiss',
            year: 1996,
          },
        ],
      },
    ],
  },

  {
    id: 'dsa-stacks-queues',
    conceptId: 'dsa.stacks-queues',
    title: 'Stacks (LIFO) & Queues (FIFO) Architecture',
    slug: 'stacks-and-queues',
    summary: 'Constrained access disciplines, call stack simulation, buffer queuing, and circular buffer implementations.',
    difficulty: 'beginner',
    templateType: 'data-structures',
    estimatedMinutes: 20,
    order: 26,
    version: '1.0.0',
    learningObjectives: [
      'Implement LIFO push/pop operations using arrays and linked lists.',
      'Implement FIFO enqueue/dequeue operations with circular buffers.',
      'Apply stacks to balance parentheses and evaluate postfix expressions.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Ordered Access Disciplines',
      },
      {
        type: 'markdown',
        content: `Stacks and queues are linear container adapters that restrict where elements can be inserted and removed:
- **Stack (LIFO — Last In, First Out):** Push and pop occur exclusively at the top. Used in CPU call stacks, undo buffers, and syntax parsing.
- **Queue (FIFO — First In, First Out):** Enqueue occurs at the tail; dequeue occurs at the head. Used in OS job scheduling, print queues, and BFS graph traversals.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'stack_array.c',
        code: `#include <stdio.h>
#define CAPACITY 5

struct Stack {
    int data[CAPACITY];
    int top;
};

void push(struct Stack *s, int val) {
    if (s->top < CAPACITY - 1) s->data[++(s->top)] = val;
}

int pop(struct Stack *s) {
    if (s->top >= 0) return s->data[(s->top)--];
    return -1;
}

int main(void) {
    struct Stack s = {.top = -1};
    push(&s, 10);
    push(&s, 20);
    printf("Popped: %d\\n", pop(&s)); // 20
    printf("Popped: %d\\n", pop(&s)); // 10
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dsa-stacks-queues',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dsa.singly-linked-list', 'dsa.graphs-bfs-dfs', 'c.functions-stack'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Algorithms (4th Edition)',
            author: 'Robert Sedgewick & Kevin Wayne',
            year: 2011,
          },
        ],
      },
    ],
  },

  {
    id: 'dsa-binary-search',
    conceptId: 'dsa.binary-search',
    title: 'Binary Search Algorithm: Invariants & O(log N) Proof',
    slug: 'binary-search-algorithm',
    summary: 'Divide-and-conquer interval bisection, mid calculation avoiding integer overflow, and logarithmic time complexity.',
    difficulty: 'beginner',
    templateType: 'algorithms',
    estimatedMinutes: 20,
    order: 27,
    version: '1.0.0',
    learningObjectives: [
      'Maintain the loop invariant: target resides in range [low, high].',
      'Compute mid without signed integer overflow: low + (high - low) / 2.',
      'Prove the O(log N) logarithmic recurrence relation T(n) = T(n/2) + O(1).',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Logarithmic Search via Interval Bisection',
      },
      {
        type: 'markdown',
        content: `When searching for an element in an unsorted collection, you must inspect every element one by one ($O(N)$ linear search). However, if the array is **sorted in monotonic order**, we can eliminate half of the remaining elements on every single comparison.`,
      },
      {
        type: 'math',
        formula: 'T(n) = T(n/2) + O(1) \\implies T(n) = O(\\log_2 n)',
        explanation: 'Binary Search Recurrence: Each iteration halves problem size with O(1) comparisons. For N = 1,000,000 elements, at most 20 comparisons are needed.',
      },
      {
        type: 'code',
        language: 'c',
        title: 'binary_search.c',
        code: `#include <stdio.h>

int binarySearch(const int arr[], int size, int target) {
    int low = 0;
    int high = size - 1;
    
    while (low <= high) {
        // Prevents (low + high) integer overflow
        int mid = low + (high - low) / 2;
        
        if (arr[mid] == target) return mid;
        if (arr[mid] < target)  low = mid + 1;
        else                    high = mid - 1;
    }
    return -1; // Not found
}

int main(void) {
    int numbers[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int idx = binarySearch(numbers, 10, 23);
    printf("Found 23 at index: %d\\n", idx);
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dsa-binary-search',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dsa.arrays-amortized', 'dsa.binary-search-tree'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Extra, Extra - Read All About It: Nearly All Binary Searches and Mergesorts are Broken',
            author: 'Joshua Bloch (Google Research)',
            year: 2006,
          },
        ],
      },
    ],
  },

  {
    id: 'dsa-binary-trees',
    conceptId: 'dsa.binary-trees',
    title: 'Binary Trees & Recursive Traversals (Inorder, Preorder, Postorder)',
    slug: 'binary-trees-and-traversals',
    summary: 'Rooted tree hierarchies, parent-child pointers, depth-first search orders (DFS), and bread-first level-order (BFS).',
    difficulty: 'intermediate',
    templateType: 'data-structures',
    estimatedMinutes: 20,
    order: 28,
    version: '1.0.0',
    learningObjectives: [
      'Model hierarchical binary tree node records with left and right children.',
      'Implement recursive Preorder, Inorder, and Postorder traversals.',
      'Calculate tree depth, height, and node counts recursively.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Non-Linear Hierarchical Topologies',
      },
      {
        type: 'markdown',
        content: `A **Binary Tree** is a hierarchical data structure in which each node has at most two children, referred to as the **left child** and **right child**.

Tree algorithms are naturally recursive: a tree consists of a root node plus two subtrees, each of which is itself a complete binary tree.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'tree_traversals.c',
        code: `#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};

void printInorder(struct TreeNode *root) {
    if (root == NULL) return;
    printInorder(root->left);   // 1. Visit left subtree
    printf("%d ", root->val);   // 2. Visit root
    printInorder(root->right);  // 3. Visit right subtree
}

int main(void) {
    struct TreeNode n1 = {.val = 1, .left = NULL, .right = NULL};
    struct TreeNode n3 = {.val = 3, .left = NULL, .right = NULL};
    struct TreeNode root = {.val = 2, .left = &n1, .right = &n3};
    
    printf("Inorder traversal: ");
    printInorder(&root); // Prints: 1 2 3
    printf("\\n");
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dsa-binary-trees',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dsa.binary-search-tree', 'dsa.graphs-bfs-dfs', 'dsa.singly-linked-list'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'The Art of Computer Programming, Vol 1: Fundamental Algorithms',
            author: 'Donald E. Knuth',
            year: 1997,
          },
        ],
      },
    ],
  },

  {
    id: 'dsa-binary-search-trees',
    conceptId: 'dsa.binary-search-tree',
    title: 'Binary Search Trees (BST): Structure, Search & Invariants',
    slug: 'binary-search-trees-bst',
    summary: 'The BST ordering invariant, recursive lookup, node insertion, and worst-case skew degeneration.',
    difficulty: 'intermediate',
    templateType: 'data-structures',
    estimatedMinutes: 25,
    order: 29,
    version: '1.0.0',
    learningObjectives: [
      'Enforce the BST ordering invariant across all recursive subtrees.',
      'Implement recursive O(h) search and insertion where h is tree height.',
      'Explain why balanced BSTs (AVL, Red-Black) are needed to avoid O(N) degeneration.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Binary Search Tree Invariant',
      },
      {
        type: 'markdown',
        content: `A **Binary Search Tree (BST)** is a binary tree with a strict ordering property:
- For every node $X$, all keys in the left subtree of $X$ are strictly less than $X.key$.
- All keys in the right subtree of $X$ are strictly greater than $X.key$.

Because of this property, an **inorder traversal** of a BST visits nodes in strictly sorted ascending order!`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'bst_search.c',
        code: `#include <stdio.h>
#include <stdbool.h>

struct BSTNode {
    int key;
    struct BSTNode *left;
    struct BSTNode *right;
};

bool searchBST(const struct BSTNode *root, int target) {
    if (root == NULL) return false;
    if (root->key == target) return true;
    if (target < root->key) return searchBST(root->left, target);
    return searchBST(root->right, target);
}

int main(void) {
    struct BSTNode left = {.key = 10, .left = NULL, .right = NULL};
    struct BSTNode right = {.key = 30, .left = NULL, .right = NULL};
    struct BSTNode root = {.key = 20, .left = &left, .right = &right};
    
    printf("Found 30: %s\\n", searchBST(&root, 30) ? "True" : "False");
    printf("Found 99: %s\\n", searchBST(&root, 99) ? "True" : "False");
    return 0;
}`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dsa-bst',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dsa.binary-trees', 'dsa.binary-search', 'dbms.indexing'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Introduction to Algorithms (CLRS) - Chapter 12 Binary Search Trees',
            author: 'Cormen, Leiserson, Rivest, Stein',
            year: 2022,
          },
        ],
      },
    ],
  },

  {
    id: 'dsa-graphs-bfs-dfs',
    conceptId: 'dsa.graphs-bfs-dfs',
    title: 'Graph Representations & Traversal Algorithms (BFS & DFS)',
    slug: 'graphs-bfs-dfs-traversals',
    summary: 'Vertices and edges, adjacency matrices vs adjacency lists, Breadth-First Search (Queue), and Depth-First Search (Stack).',
    difficulty: 'intermediate',
    templateType: 'algorithms',
    estimatedMinutes: 25,
    order: 30,
    version: '1.0.0',
    learningObjectives: [
      'Represent networks using Adjacency Lists (O(V+E) space) vs Adjacency Matrices (O(V^2)).',
      'Trace BFS to compute single-source shortest paths on unweighted graphs.',
      'Implement recursive DFS with cycle detection using visited sets.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Graphs: Modeling Generalized Relationships',
      },
      {
        type: 'markdown',
        content: `A **Graph** $G = (V, E)$ consists of a set of vertices (nodes) and edges (connections). Graphs model social networks, road maps, dependency graphs, and computer networks.

The two fundamental graph traversal strategies are:
1. **Breadth-First Search (BFS):** Uses a FIFO queue to visit neighbors level-by-level, guaranteeing the shortest hop distance.
2. **Depth-First Search (DFS):** Uses recursion or a LIFO stack to plunge deeply down a path before backtracking.`,
      },
      {
        type: 'code',
        language: 'python',
        title: 'bfs_traversal.py',
        code: `from collections import deque

def bfs(graph, start_vertex):
    visited = {start_vertex}
    queue = deque([start_vertex])
    traversal_order = []
    
    while queue:
        vertex = queue.popleft()
        traversal_order.append(vertex)
        
        for neighbor in graph.get(vertex, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                
    return traversal_order

# Adjacency list representation
web_graph = {
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['E'],
    'D': [],
    'E': []
}
print("BFS Order:", bfs(web_graph, 'A'))`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dsa-graphs',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dsa.stacks-queues', 'dsa.binary-trees'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Algorithms (4th Edition) - Chapter 4 Graphs',
            author: 'Robert Sedgewick & Kevin Wayne',
            year: 2011,
          },
        ],
      },
    ],
  },

  // ==========================================
  // PATH 5 — DATABASE MANAGEMENT SYSTEMS (7 LESSONS)
  // ==========================================
  {
    id: 'dbms-relational-model',
    conceptId: 'dbms.relational-model',
    title: 'The Relational Model, Keys & Integrity Constraints',
    slug: 'relational-model-and-keys',
    summary: 'Relations (tables), tuples (rows), attributes (columns), candidate keys, primary keys, and foreign key integrity rules.',
    difficulty: 'beginner',
    templateType: 'dbms',
    estimatedMinutes: 20,
    order: 31,
    version: '1.0.0',
    learningObjectives: [
      'Define relation schemas and mathematical tuple domains.',
      'Differentiate Super Keys, Candidate Keys, Primary Keys, and Foreign Keys.',
      'Explain entity integrity and referential integrity constraints.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Codd\'s Relational Foundation',
      },
      {
        type: 'markdown',
        content: `Introduced by Edgar F. Codd in 1970, the **Relational Model** organizes data into mathematical relations (tables). A relation is a set of ordered tuples (rows), where each attribute (column) belongs to a declared domain.

Integrity constraints guarantee data correctness:
- **Entity Integrity:** Every relation must have a Primary Key; primary key attributes can never be \`NULL\`.
- **Referential Integrity:** A Foreign Key must either reference an existing primary key value in the target table or be \`NULL\`.`,
      },
      {
        type: 'comparison',
        title: 'Relational Model vs File Storage',
        headers: ['Feature', 'Flat Files (CSV/JSON)', 'Relational Database (RDBMS)'],
        rows: [
          ['Data Consistency', 'Manual checking, easily corrupted', 'Enforced constraints (Primary/Foreign Keys, Check)'],
          ['Concurrent Access', 'File locking or race overwrites', 'ACID transactions with isolation levels'],
          ['Query Language', 'Custom imperative scripts', 'Standard declarative SQL'],
          ['Indexing', 'Full file sequential scans', 'B+ Trees, Hash Indexes, Bitmaps'],
        ],
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dbms-relational',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dbms.sql-foundations', 'dbms.joins', 'dbms.normalization'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'A Relational Model of Data for Large Shared Data Banks',
            author: 'E. F. Codd (Communications of the ACM)',
            year: 1970,
          },
        ],
      },
    ],
  },

  {
    id: 'dbms-sql-foundations',
    conceptId: 'dbms.sql-foundations',
    title: 'SQL Foundations: DDL Table Creation & DML Mutations',
    slug: 'sql-foundations-ddl-dml',
    summary: 'Write Data Definition Language (CREATE, ALTER, DROP) statements and perform atomic Data Manipulation Language (INSERT, UPDATE, DELETE) queries.',
    difficulty: 'beginner',
    templateType: 'dbms',
    estimatedMinutes: 20,
    order: 32,
    version: '1.0.0',
    learningObjectives: [
      'Write DDL statements specifying column types and key constraints.',
      'Perform atomic DML mutations using INSERT, UPDATE, and DELETE.',
      'Differentiate between schema definition and row-level operations.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Structured Query Language (SQL)',
      },
      {
        type: 'markdown',
        content: `SQL divides operations into distinct sub-languages:
- **DDL (Data Definition Language):** Defines and alters database schema objects (\`CREATE TABLE\`, \`ALTER TABLE\`, \`DROP TABLE\`).
- **DML (Data Manipulation Language):** Mutates data tuples stored in tables (\`INSERT\`, \`UPDATE\`, \`DELETE\`).`,
      },
      {
        type: 'code',
        language: 'sql',
        title: 'schema_creation.sql',
        code: `CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    major TEXT NOT NULL,
    gpa REAL CHECK (gpa >= 0.0 AND gpa <= 4.0)
);

INSERT INTO students (id, name, major, gpa) VALUES
(1, 'Alice Smith', 'Computer Science', 3.9),
(2, 'Bob Jones', 'Electrical Engineering', 3.4);

UPDATE students SET gpa = 3.95 WHERE id = 1;
SELECT * FROM students;`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'sql',
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dbms-sql-basics',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dbms.relational-model', 'dbms.sql-querying', 'dbms.transactions'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Database System Concepts (7th Edition)',
            author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
            year: 2019,
          },
        ],
      },
    ],
  },

  {
    id: 'dbms-sql-querying',
    conceptId: 'dbms.sql-querying',
    title: 'SQL Declarative Querying: Filtering, Aggregation & Grouping',
    slug: 'sql-declarative-querying',
    summary: 'Write declarative SELECT queries, filter rows with WHERE, sort results with ORDER BY, and aggregate partitions with GROUP BY & HAVING.',
    difficulty: 'beginner',
    templateType: 'dbms',
    estimatedMinutes: 20,
    order: 33,
    version: '1.0.0',
    learningObjectives: [
      'Formulate filtered SELECT queries using comparison and logical operators.',
      'Aggregate partitioned subsets using COUNT, SUM, AVG with GROUP BY.',
      'Differentiate between WHERE (row filter before grouping) and HAVING (group filter after aggregation).',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Declarative Data Retrieval',
      },
      {
        type: 'markdown',
        content: `In SQL, you specify **what** data you want, not **how** to iterate over rows. The database query engine parses the query, optimizes an algebraic execution plan, and retrieves matching records.

Logical query processing order:
1. \`FROM\` & \`JOIN\` &rarr; 2. \`WHERE\` &rarr; 3. \`GROUP BY\` &rarr; 4. \`HAVING\` &rarr; 5. \`SELECT\` &rarr; 6. \`ORDER BY\` &rarr; 7. \`LIMIT\`.`,
      },
      {
        type: 'code',
        language: 'sql',
        title: 'aggregation_query.sql',
        code: `SELECT 
    major,
    COUNT(*) AS student_count,
    ROUND(AVG(gpa), 2) AS average_gpa
FROM students
WHERE gpa >= 3.0
GROUP BY major
HAVING COUNT(*) >= 1
ORDER BY average_gpa DESC;`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'sql',
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dbms-sql-querying',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dbms.sql-foundations', 'dbms.joins', 'dbms.indexing'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'SQL Queries for Mere Mortals',
            author: 'John L. Viescas',
            year: 2014,
          },
        ],
      },
    ],
  },

  {
    id: 'dbms-joins-relational',
    conceptId: 'dbms.joins',
    title: 'Relational Joins: Inner, Left, & Full Outer Joins',
    slug: 'relational-joins',
    summary: 'How relational databases combine tables using set algebra, Cartesian products, and key matches.',
    difficulty: 'intermediate',
    templateType: 'dbms',
    estimatedMinutes: 20,
    order: 34,
    version: '1.0.0',
    learningObjectives: [
      'Distinguish between INNER JOIN, LEFT JOIN, and CROSS JOIN.',
      'Write multi-table relational queries in SQL.',
      'Analyze query execution plans and index usage on foreign keys.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Connecting Normalized Entities',
      },
      {
        type: 'markdown',
        content: `Relational databases avoid redundancy by normalizing data into separate tables. When querying information spanning multiple business domains (e.g. students and their course enrollments), we perform a **JOIN** operation over common identifier keys.`,
      },
      {
        type: 'code',
        language: 'sql',
        title: 'join_query.sql',
        code: `SELECT 
    students.name, 
    courses.course_title, 
    enrollments.grade
FROM students
INNER JOIN enrollments ON students.id = enrollments.student_id
INNER JOIN courses ON enrollments.course_id = courses.id
ORDER BY students.name ASC;`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'sql',
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dbms-joins',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dbms.sql-querying', 'dbms.normalization', 'dbms.indexing'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Database Systems: The Complete Book (2nd Edition)',
            author: 'Hector Garcia-Molina, Jeffrey D. Ullman, Jennifer Widom',
            year: 2008,
          },
        ],
      },
    ],
  },

  {
    id: 'dbms-normalization',
    conceptId: 'dbms.normalization',
    title: 'Database Normalization: 1NF, 2NF, 3NF & BCNF',
    slug: 'database-normalization',
    summary: 'Decompose relation schemas to eliminate update, insertion, and deletion anomalies while preserving dependencies.',
    difficulty: 'intermediate',
    templateType: 'dbms',
    estimatedMinutes: 25,
    order: 35,
    version: '1.0.0',
    learningObjectives: [
      'Identify update, insertion, and deletion anomalies in denormalized tables.',
      'Verify 1NF atomicity, 2NF full functional dependency, and 3NF transitive elimination.',
      'Decompose schemas into Boyce-Codd Normal Form (BCNF) without loss of information.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Eliminating Data Redundancy and Anomalies',
      },
      {
        type: 'markdown',
        content: `Poorly designed relational schemas store duplicate facts across multiple rows. This leads to **database anomalies**:
- **Update Anomaly:** Updating an instructor's office requires modifying thousands of student rows.
- **Insertion Anomaly:** Cannot record a new course until a student enrolls in it.
- **Deletion Anomaly:** Deleting the last student enrolled in a course inadvertently deletes all information about the course!

**Normalization** decomposes tables based on Functional Dependencies (FDs) to ensure every non-key attribute depends on the key, the whole key, and nothing but the key.`,
      },
      {
        type: 'comparison',
        title: 'The Normal Forms Hierarchy',
        headers: ['Normal Form', 'Core Requirement', 'Anomaly Eliminated'],
        rows: [
          ['1NF (First Normal Form)', 'All column values must be atomic (no arrays or repeating groups).', 'Repeating group ambiguity'],
          ['2NF (Second Normal Form)', 'In 1NF and no non-prime attribute is partially dependent on a composite key.', 'Partial dependency redundancy'],
          ['3NF (Third Normal Form)', 'In 2NF and no non-prime attribute is transitively dependent on a candidate key.', 'Transitive dependency redundancy'],
          ['BCNF (Boyce-Codd NF)', 'In 3NF and for every non-trivial functional dependency X -> Y, X must be a superkey.', 'All functional redundancy'],
        ],
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dbms-normalization',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dbms.relational-model', 'dbms.joins', 'dbms.transactions'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Further Normalization of the Data Base Relational Model',
            author: 'E. F. Codd',
            year: 1972,
          },
        ],
      },
    ],
  },

  {
    id: 'dbms-transactions-acid',
    conceptId: 'dbms.transactions',
    title: 'Transactions, Concurrency Anomalies & ACID Guarantees',
    slug: 'transactions-acid-concurrency',
    summary: 'Atomicity, Consistency, Isolation, Durability, write-ahead logging (WAL), two-phase locking, and isolation levels.',
    difficulty: 'intermediate',
    templateType: 'dbms',
    estimatedMinutes: 25,
    order: 36,
    version: '1.0.0',
    learningObjectives: [
      'Define the four ACID transactional properties.',
      'Differentiate concurrency phenomena: Dirty Reads, Non-Repeatable Reads, and Phantom Reads.',
      'Explain how Write-Ahead Logging (WAL) guarantees durability across sudden power loss.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The ACID Transactional Guarantees',
      },
      {
        type: 'markdown',
        content: `A **Transaction** is a logical unit of database work consisting of one or more SQL operations executed as a unified operation. Transactions must satisfy the **ACID** properties:
- **Atomicity:** All-or-nothing execution. If any operation fails, all uncommitted changes roll back.
- **Consistency:** The database transitions strictly between valid states satisfying all schema constraints.
- **Isolation:** Concurrent transactions execute without mutual interference.
- **Durability:** Once committed, mutations survive subsequent hardware crashes or power outages.`,
      },
      {
        type: 'code',
        language: 'sql',
        title: 'bank_transfer_transaction.sql',
        code: `BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- Both updates commit atomically together
COMMIT;`,
        executable: true,
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dbms-transactions',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dbms.sql-foundations', 'dbms.indexing'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'Principles of Transaction Processing (2nd Edition)',
            author: 'Philip A. Bernstein & Eric Newcomer',
            year: 2009,
          },
        ],
      },
    ],
  },

  {
    id: 'dbms-indexing',
    conceptId: 'dbms.indexing',
    title: 'Database Indexing: B+ Tree Lookups vs Full Table Scans',
    slug: 'database-indexing-b-trees',
    summary: 'How relational databases use B+ Tree balanced search trees on disk to turn O(N) table scans into O(log N) lookups.',
    difficulty: 'intermediate',
    templateType: 'dbms',
    estimatedMinutes: 20,
    order: 37,
    version: '1.0.0',
    learningObjectives: [
      'Explain how B+ Trees minimize expensive disk I/O operations with high fan-out.',
      'Differentiate between Clustered Primary Indexes and Secondary Indexes.',
      'Evaluate the write overhead of indexes during INSERT, UPDATE, and DELETE.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Accelerating Data Retrieval on Disk',
      },
      {
        type: 'markdown',
        content: `Without an index, finding a row matching \`WHERE id = 42\` requires a **Full Table Scan ($O(N)$)**: reading every page from disk from start to finish.

A **B+ Tree Index** creates a balanced, multi-way search tree on disk. Because database page sizes (4KB–16KB) can store hundreds of keys per node (high fan-out), a B+ tree storing millions of records rarely exceeds 3 to 4 levels in height!`,
      },
      {
        type: 'code',
        language: 'sql',
        title: 'create_index.sql',
        code: `CREATE INDEX idx_student_major ON students(major);

-- Uses the B+ tree index rather than scanning every row in students
EXPLAIN QUERY PLAN
SELECT * FROM students WHERE major = 'Computer Science';`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'sql',
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-dbms-indexing',
      },
      {
        type: 'related_concepts',
        title: 'Connected Concepts',
        conceptIds: ['dbms.sql-querying', 'dbms.joins', 'dsa.binary-search-tree'],
      },
      {
        type: 'references',
        title: 'References',
        items: [
          {
            title: 'The Ubiquitous B-Tree',
            author: 'Douglas Comer (ACM Computing Surveys)',
            year: 1979,
          },
        ],
      },
    ],
  },
];
