import { Exercise } from '../types';

export const EXERCISES: Record<string, Exercise> = {
  // --- C Programming Exercises ---
  'quiz-c-pipeline': {
    id: 'quiz-c-pipeline',
    conceptId: 'c.compilation-pipeline',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'Which phase of the C translation pipeline expands #include directives and evaluates #define macros?',
    options: [
      { id: 'opt-1', text: 'The Linker (ld)', explanation: 'Incorrect: The linker resolves external symbols between object files and libraries.' },
      { id: 'opt-2', text: 'The Preprocessor (cpp)', explanation: 'Correct! The C preprocessor handles all textual directives starting with #, inserting header file contents and expanding macro definitions.' },
      { id: 'opt-3', text: 'The Compiler front-end (cc1)', explanation: 'Incorrect: The compiler takes already-preprocessed translation units and builds Abstract Syntax Trees and assembly.' },
      { id: 'opt-4', text: 'The Assembler (as)', explanation: 'Incorrect: The assembler converts textual assembly code into machine-code object files (.o).' }
    ],
    correctOptionId: 'opt-2',
    explanation: 'The preprocessor is a pure textual translation step that runs before syntactic and semantic analysis.'
  },

  'quiz-c-types': {
    id: 'quiz-c-types',
    conceptId: 'c.types-variables',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'Assuming a standard 64-bit LP64 system, what is the output of this code?',
    codeSnippet: {
      language: 'c',
      code: `printf("%zu", sizeof(int) == sizeof(long) ? 1 : sizeof(char));`
    },
    options: [
      { id: 'opt-1', text: '1', explanation: 'Correct! In standard LP64 Linux, sizeof(int) is 4 bytes and sizeof(long) is 8 bytes, so the condition is false and sizeof(char) (which is always 1 by C standard) is returned.' },
      { id: 'opt-2', text: '4', explanation: 'Incorrect: sizeof(char) is 1 byte by C language definition.' },
      { id: 'opt-3', text: '8', explanation: 'Incorrect: int is 4 bytes, while long is 8 bytes.' },
      { id: 'opt-4', text: 'Compilation Error', explanation: 'Incorrect: sizeof expressions evaluate to size_t constants at compile time.' }
    ],
    correctOptionId: 'opt-1',
    expectedOutput: '1',
    explanation: 'On Linux 64-bit LP64 data models, sizeof(int) is 4 while sizeof(long) is 8. The ternary operator evaluates the false branch, yielding sizeof(char), which is guaranteed to be 1 byte by definition.'
  },

  'quiz-c-control-flow': {
    id: 'quiz-c-control-flow',
    conceptId: 'c.control-flow',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What is printed by this C switch statement?',
    codeSnippet: {
      language: 'c',
      code: `int x = 2;
switch (x) {
    case 1: printf("A");
    case 2: printf("B");
    case 3: printf("C"); break;
    default: printf("D");
}`
    },
    options: [
      { id: 'opt-1', text: 'B', explanation: 'Incorrect: case 2 lacks a break statement, causing execution to fall through to case 3.' },
      { id: 'opt-2', text: 'BC', explanation: 'Correct! Execution matches case 2, prints "B", falls through to case 3 because of the omitted break, prints "C", and hits break to terminate the switch.' },
      { id: 'opt-3', text: 'BCD', explanation: 'Incorrect: case 3 contains a break statement, preventing fallthrough into default.' },
      { id: 'opt-4', text: 'Compilation Error', explanation: 'Incorrect: Switch fallthrough is fully valid in C.' }
    ],
    correctOptionId: 'opt-2',
    expectedOutput: 'BC',
    explanation: 'In C, switch cases fall through automatically to subsequent labels unless explicitly halted by a break or return statement.'
  },

  'quiz-c-functions': {
    id: 'quiz-c-functions',
    conceptId: 'c.functions-stack',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What will be printed when running this C program?',
    codeSnippet: {
      language: 'c',
      code: `void modify(int val) {
    val += 10;
}
int main(void) {
    int num = 5;
    modify(num);
    printf("%d", num);
    return 0;
}`
    },
    options: [
      { id: 'opt-1', text: '15', explanation: 'Incorrect: C uses pass-by-value, so modifications inside the function only affect the local copy on its stack frame.' },
      { id: 'opt-2', text: '5', explanation: 'Correct! Arguments in C are passed strictly by value. The parameter val receives a copy of num; modifying val does not alter num in the caller stack frame.' },
      { id: 'opt-3', text: '0', explanation: 'Incorrect: num maintains its initialized value.' },
      { id: 'opt-4', text: 'Segmentation Fault', explanation: 'Incorrect: No pointers or illegal memory accesses are involved.' }
    ],
    correctOptionId: 'opt-2',
    expectedOutput: '5',
    explanation: 'C parameters are strictly call-by-value. Modifying a parameter modifies its activation record copy on the stack, leaving the caller variable unchanged.'
  },

  'quiz-c-arrays': {
    id: 'quiz-c-arrays',
    conceptId: 'c.arrays-strings',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What is the output of strlen() versus sizeof() on this string?',
    codeSnippet: {
      language: 'c',
      code: `char str[] = "Byte";
printf("%zu,%zu", strlen(str), sizeof(str));`
    },
    options: [
      { id: 'opt-1', text: '4,4', explanation: 'Incorrect: sizeof includes the terminating null character \\0.' },
      { id: 'opt-2', text: '4,5', explanation: 'Correct! strlen counts characters up to the null terminator (4 characters: B, y, t, e), whereas sizeof counts the total allocated buffer bytes including the \\0 (5 bytes).' },
      { id: 'opt-3', text: '5,5', explanation: 'Incorrect: strlen does not count the \\0 terminator.' },
      { id: 'opt-4', text: '5,4', explanation: 'Incorrect: strlen is 4 and sizeof is 5.' }
    ],
    correctOptionId: 'opt-2',
    expectedOutput: '4,5',
    explanation: 'strlen() computes the count of printable characters until \\0, while sizeof(arr) returns the total allocated byte count of the array including \\0.'
  },

  'quiz-pointer-deref': {
    id: 'quiz-pointer-deref',
    conceptId: 'memory.pointers-intro',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What is the exact output of this C code snippet?',
    codeSnippet: {
      language: 'c',
      code: `int a = 10;
int *p = &a;
*p = *p + 5;
printf("%d", a);`
    },
    options: [
      { id: 'opt-1', text: '10', explanation: 'Incorrect: *p references the memory address of a, so modifying *p mutates a directly.' },
      { id: 'opt-2', text: '15', explanation: 'Correct! Dereferencing *p accesses variable a in memory and adds 5 to its value, changing a from 10 to 15.' },
      { id: 'opt-3', text: 'Compilation Error', explanation: 'Incorrect: The pointer declaration and dereferencing syntax is completely valid.' },
      { id: 'opt-4', text: 'A random memory address', explanation: 'Incorrect: The printf format %d prints the integer value of a, not the pointer address.' }
    ],
    correctOptionId: 'opt-2',
    expectedOutput: '15',
    explanation: 'Dereferencing a pointer using *p reads and writes directly to the memory address stored in p. Thus, modifying *p directly modifies a.'
  },

  'quiz-pointer-arithmetic': {
    id: 'quiz-pointer-arithmetic',
    conceptId: 'c.pointer-arithmetic',
    type: 'predict_output',
    difficulty: 'intermediate',
    question: 'What is the printed output of this pointer traversal?',
    codeSnippet: {
      language: 'c',
      code: `int arr[] = {100, 200, 300, 400};
int *ptr = arr;
ptr += 2;
printf("%d", *ptr);`
    },
    options: [
      { id: 'opt-1', text: '102', explanation: 'Incorrect: Pointer arithmetic moves by units of sizeof(type), not integer addition to the value.' },
      { id: 'opt-2', text: '300', explanation: 'Correct! Adding 2 to ptr advances the pointer by 2 * sizeof(int) bytes, landing directly at arr[2] which contains 300.' },
      { id: 'opt-3', text: '200', explanation: 'Incorrect: ptr + 1 is 200; ptr + 2 is 300.' },
      { id: 'opt-4', text: '400', explanation: 'Incorrect: arr[3] is 400.' }
    ],
    correctOptionId: 'opt-2',
    expectedOutput: '300',
    explanation: 'Pointer arithmetic automatically scales offsets by the byte size of the underlying type. ptr + 2 points to element index 2.'
  },

  'quiz-dynamic-alloc': {
    id: 'quiz-dynamic-alloc',
    conceptId: 'memory.dynamic-allocation',
    type: 'find_error',
    difficulty: 'intermediate',
    question: 'Identify the critical memory error in this dynamic allocation function:',
    codeSnippet: {
      language: 'c',
      code: `int *create_array(size_t n) {
    int *arr = malloc(n * sizeof(int));
    for (size_t i = 0; i < n; i++) arr[i] = i * 2;
    free(arr);
    return arr;
}`
    },
    options: [
      { id: 'opt-1', text: 'malloc requires an explicit cast in modern C', explanation: 'Incorrect: In C, void* converts implicitly to any pointer type.' },
      { id: 'opt-2', text: 'Returning a dangling pointer after free()', explanation: 'Correct! The memory allocated to arr is deallocated with free(arr) before returning. The returned pointer points to deallocated heap memory (dangling pointer).' },
      { id: 'opt-3', text: 'The loop index type size_t is invalid', explanation: 'Incorrect: size_t is the standard unsigned integer type for memory sizes.' },
      { id: 'opt-4', text: 'sizeof(int) cannot be multiplied in malloc', explanation: 'Incorrect: n * sizeof(int) is the standard allocation size expression.' }
    ],
    correctOptionId: 'opt-2',
    explanation: 'free(arr) releases the heap memory back to the allocator. Returning arr produces a dangling pointer; dereferencing it in the caller invokes Undefined Behavior.'
  },

  'quiz-c-struct-padding': {
    id: 'quiz-c-struct-padding',
    conceptId: 'c.structures',
    type: 'predict_output',
    difficulty: 'intermediate',
    question: 'On an x86-64 Linux system with 8-byte word alignment, what is sizeof(struct Node)?',
    codeSnippet: {
      language: 'c',
      code: `struct Node {
    char flag;    // 1 byte
    // padding?
    int count;    // 4 bytes
    double value; // 8 bytes
};
int main(void) {
    printf("%zu", sizeof(struct Node));
    return 0;
}`
    },
    options: [
      { id: 'opt-1', text: '13', explanation: 'Incorrect: Compilers insert alignment padding to align fields to their natural boundary.' },
      { id: 'opt-2', text: '16', explanation: 'Correct! char is 1 byte followed by 3 bytes padding (to align int to a 4-byte boundary), then 4-byte int (total 8 bytes), followed by 8-byte double, totaling 16 bytes.' },
      { id: 'opt-3', text: '24', explanation: 'Incorrect: 16 bytes is sufficient to satisfy the 8-byte maximum member alignment.' },
      { id: 'opt-4', text: '8', explanation: 'Incorrect: Struct fields cannot overlap.' }
    ],
    correctOptionId: 'opt-2',
    expectedOutput: '16',
    explanation: 'Due to struct alignment, 3 padding bytes are inserted after char flag so that int count starts at a multiple of 4, yielding 1 + 3 + 4 + 8 = 16 bytes.'
  },

  // --- C++ Exercises ---
  'quiz-cpp-references': {
    id: 'quiz-cpp-references',
    conceptId: 'cpp.fundamentals-references',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What is the output of this C++ reference code?',
    codeSnippet: {
      language: 'cpp',
      code: `int a = 10;
int &ref = a;
int b = 20;
ref = b;
ref += 5;
std::cout << a << "," << b;`
    },
    options: [
      { id: 'opt-1', text: '25,20', explanation: 'Correct! ref is an immutable alias for a. When ref = b runs, a takes the value 20. Then ref += 5 mutates a to 25. b remains 20.' },
      { id: 'opt-2', text: '10,25', explanation: 'Incorrect: ref cannot be reseated to point to b; ref = b copies the value of b into a.' },
      { id: 'opt-3', text: '25,25', explanation: 'Incorrect: b was not modified, only a was.' },
      { id: 'opt-4', text: '15,20', explanation: 'Incorrect: ref = b sets a to 20 first.' }
    ],
    correctOptionId: 'opt-1',
    expectedOutput: '25,20',
    explanation: 'C++ references cannot be reseated. ref = b copies the value of b into the aliased variable a. Then ref += 5 mutates a to 25.'
  },

  'quiz-cpp-classes': {
    id: 'quiz-cpp-classes',
    conceptId: 'oops.classes-objects',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'What is the default member visibility in a C++ class versus a C++ struct?',
    options: [
      { id: 'opt-1', text: 'class is private by default; struct is public by default', explanation: 'Correct! The only functional difference between class and struct in C++ is default access and inheritance specifiers.' },
      { id: 'opt-2', text: 'class is protected by default; struct is private by default', explanation: 'Incorrect: Neither defaults to protected.' },
      { id: 'opt-3', text: 'Both are private by default', explanation: 'Incorrect: struct members are public by default for C backwards compatibility.' },
      { id: 'opt-4', text: 'Both are public by default', explanation: 'Incorrect: class members default to private.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'In C++, struct members default to public (preserving C compatibility), while class members default to private.'
  },

  'quiz-cpp-constructors': {
    id: 'quiz-cpp-constructors',
    conceptId: 'cpp.constructors-destructors',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'According to the C++ Rule of Five, if a class defines a custom destructor, which other special members should typically be defined or deleted?',
    options: [
      { id: 'opt-1', text: 'Copy constructor, copy assignment, move constructor, and move assignment', explanation: 'Correct! Managing a resource requiring custom destruction almost always requires custom copy and move lifecycle management.' },
      { id: 'opt-2', text: 'Only the default constructor', explanation: 'Incorrect: Default constructor does not resolve resource duplication bugs.' },
      { id: 'opt-3', text: 'Only virtual methods', explanation: 'Incorrect: The Rule of Five pertains to object lifecycle operators.' },
      { id: 'opt-4', text: 'Only operator==', explanation: 'Incorrect: Comparison operators are not special member functions.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'The Rule of Five states that if a class manages a resource needing custom destruction, it should explicitly define copy ctor, copy assign, move ctor, and move assign.'
  },

  'quiz-cpp-overloading': {
    id: 'quiz-cpp-overloading',
    conceptId: 'cpp.overloading-operators',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'Why is the stream insertion operator (std::ostream &operator<<(std::ostream &os, const MyClass &obj)) typically implemented as a non-member friend function?',
    options: [
      { id: 'opt-1', text: 'Because the left operand is std::ostream, which cannot be modified to add a member method for MyClass', explanation: 'Correct! For binary operators, a member function requires the left-hand operand to be an instance of the class itself. Since std::ostream is on the left, it must be a free function.' },
      { id: 'opt-2', text: 'Because C++ does not allow operator<< to be overloaded', explanation: 'Incorrect: Operator<< is overloaded extensively in standard C++.' },
      { id: 'opt-3', text: 'Because friend functions run faster than member functions', explanation: 'Incorrect: Friend status only affects access permissions, not compilation or execution speed.' },
      { id: 'opt-4', text: 'To prevent stream flushing', explanation: 'Incorrect: Flushing is controlled by std::endl or explicit flush.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Member operators require the left-hand operand to be of that class. For std::cout << obj, std::cout is the left operand, requiring a non-member function.'
  },

  'quiz-cpp-inheritance': {
    id: 'quiz-cpp-inheritance',
    conceptId: 'oops.inheritance',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'What occurs during object slicing when a Derived object is passed by value to a parameter of type Base?',
    options: [
      { id: 'opt-1', text: 'The derived portion is sliced off; only the Base subobject is copied, and dynamic polymorphism is lost', explanation: 'Correct! Pass-by-value copies only sizeof(Base) bytes into the parameter. Derived member variables and virtual dispatch are stripped.' },
      { id: 'opt-2', text: 'A runtime segmentation fault is triggered', explanation: 'Incorrect: Slicing is valid C++ behavior, though often a logical bug.' },
      { id: 'opt-3', text: 'The compiler rejects the program with a compile-time error', explanation: 'Incorrect: Derived-to-base conversion is implicit and valid.' },
      { id: 'opt-4', text: 'Derived virtual functions are executed via heap trampoline', explanation: 'Incorrect: The parameter object is a concrete Base instance whose vptr points to Base.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Object slicing occurs when a derived instance is assigned or passed by value to a base instance, copying only base fields and setting the vptr to Base.'
  },

  'quiz-cpp-vtable': {
    id: 'quiz-cpp-vtable',
    conceptId: 'oops.polymorphism',
    type: 'predict_output',
    difficulty: 'intermediate',
    question: 'What is printed when calling speak() through a Base pointer?',
    codeSnippet: {
      language: 'cpp',
      code: `class Base {
public:
    virtual void speak() { std::cout << "Base"; }
};
class Derived : public Base {
public:
    void speak() override { std::cout << "Derived"; }
};
int main() {
    Base *b = new Derived();
    b->speak();
    delete b;
    return 0;
}`
    },
    options: [
      { id: 'opt-1', text: 'Derived', explanation: 'Correct! Because speak() is declared virtual in Base, the call b->speak() looks up the function pointer in the vtable of the concrete Derived object, executing Derived::speak().' },
      { id: 'opt-2', text: 'Base', explanation: 'Incorrect: Virtual dynamic dispatch resolves to the runtime type Derived.' },
      { id: 'opt-3', text: 'BaseDerived', explanation: 'Incorrect: Overriding replaces the invocation; it does not chain.' },
      { id: 'opt-4', text: 'Compilation Error', explanation: 'Incorrect: The code is valid modern C++.' }
    ],
    correctOptionId: 'opt-1',
    expectedOutput: 'Derived',
    explanation: 'Virtual functions resolve dynamically via the object vtable pointer (vptr) at runtime, executing the overridden derived method.'
  },

  'quiz-cpp-raii': {
    id: 'quiz-cpp-raii',
    conceptId: 'oops.raii',
    type: 'mcq',
    difficulty: 'advanced',
    question: 'Why does std::unique_ptr prevent duplicate resource deallocation (double free)?',
    options: [
      { id: 'opt-1', text: 'It deletes its copy constructor and copy assignment operator, allowing only move semantics', explanation: 'Correct! By deleting copy operations, std::unique_ptr enforces exclusive ownership: only one pointer can ever manage the resource.' },
      { id: 'opt-2', text: 'It uses an atomic reference counter to track owners', explanation: 'Incorrect: std::shared_ptr uses reference counting; std::unique_ptr has zero reference count overhead.' },
      { id: 'opt-3', text: 'It allocates all resources in read-only memory', explanation: 'Incorrect: unique_ptr manages dynamic heap memory.' },
      { id: 'opt-4', text: 'It runs a background garbage collector thread', explanation: 'Incorrect: C++ RAII is deterministic and runs during stack unwinding without GC threads.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'std::unique_ptr enforces exclusive resource ownership by disabling copying and allowing only move transfers, eliminating double-free hazards at compile time.'
  },

  // --- Python Exercises ---
  'quiz-py-fundamentals': {
    id: 'quiz-py-fundamentals',
    conceptId: 'python.fundamentals',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What is the output of this Python list comprehension?',
    codeSnippet: {
      language: 'python',
      code: `nums = [1, 2, 3, 4]
res = [x * 2 for x in nums if x % 2 == 0]
print(res)`
    },
    options: [
      { id: 'opt-1', text: '[4, 8]', explanation: 'Correct! The filter if x % 2 == 0 selects even numbers 2 and 4, which are multiplied by 2 to produce [4, 8].' },
      { id: 'opt-2', text: '[2, 4, 6, 8]', explanation: 'Incorrect: The if clause filters out odd numbers 1 and 3.' },
      { id: 'opt-3', text: '[2, 6]', explanation: 'Incorrect: Those are odd numbers multiplied by 2.' },
      { id: 'opt-4', text: '[4]', explanation: 'Incorrect: Both 2 and 4 are even.' }
    ],
    correctOptionId: 'opt-1',
    expectedOutput: '[4, 8]',
    explanation: 'The list comprehension filters nums for even elements (2, 4) and doubles them, producing [4, 8].'
  },

  'quiz-py-functions': {
    id: 'quiz-py-functions',
    conceptId: 'python.functions-scopes',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What is printed by this Python closure?',
    codeSnippet: {
      language: 'python',
      code: `def counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c1 = counter()
c1()
print(c1())`
    },
    options: [
      { id: 'opt-1', text: '2', explanation: 'Correct! The nonlocal keyword binds count to the enclosing counter scope. Two invocations increment count from 0 to 1, then to 2.' },
      { id: 'opt-2', text: '1', explanation: 'Incorrect: c1 was called twice; each call increments the preserved cell.' },
      { id: 'opt-3', text: 'UnboundLocalError', explanation: 'Incorrect: The nonlocal statement explicitly authorizes mutation of enclosing scope.' },
      { id: 'opt-4', text: '0', explanation: 'Incorrect: count is incremented on every call.' }
    ],
    correctOptionId: 'opt-1',
    expectedOutput: '2',
    explanation: 'nonlocal allows the inner function to rebind count in the enclosing scope. Calling c1() twice increments count to 2.'
  },

  'quiz-py-collections': {
    id: 'quiz-py-collections',
    conceptId: 'python.collections',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'Why cannot a standard Python list be used as a key in a dictionary?',
    options: [
      { id: 'opt-1', text: 'Because lists are mutable and do not implement __hash__', explanation: 'Correct! Hash table keys must be immutable so their hash code remains constant over their lifetime in the dictionary.' },
      { id: 'opt-2', text: 'Because lists can only contain integers', explanation: 'Incorrect: Python lists can hold heterogeneous items.' },
      { id: 'opt-3', text: 'Because dictionaries only allow string keys', explanation: 'Incorrect: Any hashable type (int, tuple, frozenset) can be a key.' },
      { id: 'opt-4', text: 'Because lists exceed the maximum key size', explanation: 'Incorrect: Key size is not restricted by length.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Dictionary keys must be hashable. Because Python lists are mutable, their hash could change while in the table, destroying index integrity.'
  },

  'quiz-py-references': {
    id: 'quiz-py-references',
    conceptId: 'python.references-identity',
    type: 'predict_output',
    difficulty: 'beginner',
    question: 'What is the output of this comparison in Python?',
    codeSnippet: {
      language: 'python',
      code: `a = [1, 2, 3]
b = [1, 2, 3]
print(f"{a == b},{a is b}")`
    },
    options: [
      { id: 'opt-1', text: 'True,False', explanation: 'Correct! a == b checks value equality (which is True because elements match). a is b checks object identity (which is False because two separate list objects were instantiated on the heap).' },
      { id: 'opt-2', text: 'True,True', explanation: 'Incorrect: List literals create distinct heap objects.' },
      { id: 'opt-3', text: 'False,False', explanation: 'Incorrect: Values are identical.' },
      { id: 'opt-4', text: 'False,True', explanation: 'Incorrect: a is b cannot be true if values differ.' }
    ],
    correctOptionId: 'opt-1',
    expectedOutput: 'True,False',
    explanation: '== compares value contents, whereas is checks physical object identity (id(a) == id(b)). Distinct list instantiations create distinct objects.'
  },

  'quiz-py-oop': {
    id: 'quiz-py-oop',
    conceptId: 'python.oop-classes',
    type: 'predict_output',
    difficulty: 'intermediate',
    question: 'What does super() execute in this Python diamond hierarchy?',
    codeSnippet: {
      language: 'python',
      code: `class A:
    def greet(self): return "A"
class B(A):
    def greet(self): return "B" + super().greet()
class C(A):
    def greet(self): return "C" + super().greet()
class D(B, C):
    def greet(self): return "D" + super().greet()
print(D().greet())`
    },
    options: [
      { id: 'opt-1', text: 'DBCA', explanation: 'Correct! Under Python C3 Linearization, the Method Resolution Order (MRO) for D is [D, B, C, A, object]. Each super() call delegates to the next class in the linear chain.' },
      { id: 'opt-2', text: 'DBA', explanation: 'Incorrect: C is not skipped; C3 linearization includes C after B.' },
      { id: 'opt-3', text: 'DCBA', explanation: 'Incorrect: B is listed before C in class D(B, C).' },
      { id: 'opt-4', text: 'RecursionError', explanation: 'Incorrect: C3 linearization produces an acyclic linear order.' }
    ],
    correctOptionId: 'opt-1',
    expectedOutput: 'DBCA',
    explanation: 'Python uses C3 Linearization to compute MRO: D -> B -> C -> A. Each super() call moves down this chain, resulting in "DBCA".'
  },

  'quiz-py-exceptions': {
    id: 'quiz-py-exceptions',
    conceptId: 'python.exceptions-context-managers',
    type: 'predict_output',
    difficulty: 'intermediate',
    question: 'What is printed when an exception occurs inside this with block?',
    codeSnippet: {
      language: 'python',
      code: `class SuppressError:
    def __enter__(self):
        print("Enter")
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Exit")
        return True # Suppress exception

with SuppressError():
    raise ValueError("Error")
print("Done")`
    },
    options: [
      { id: 'opt-1', text: 'Enter\nExit\nDone', explanation: 'Correct! __enter__ executes, ValueError is raised, __exit__ executes and returns True (which suppresses the exception), and execution continues normally to print "Done".' },
      { id: 'opt-2', text: 'Enter\nValueError: Error', explanation: 'Incorrect: Returning True from __exit__ suppresses the exception.' },
      { id: 'opt-3', text: 'Exit\nDone', explanation: 'Incorrect: __enter__ runs before the with block body.' },
      { id: 'opt-4', text: 'Done', explanation: 'Incorrect: Enter and Exit must execute.' }
    ],
    correctOptionId: 'opt-1',
    expectedOutput: 'Enter\nExit\nDone',
    explanation: 'When __exit__ returns a truthy value (like True), Python suppresses the exception that occurred inside the with block.'
  },

  // --- DSA Exercises ---
  'quiz-dsa-complexity': {
    id: 'quiz-dsa-complexity',
    conceptId: 'dsa.asymptotic-complexity',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'Which of the following functions has the strictly slowest asymptotic growth rate as N approaches infinity?',
    options: [
      { id: 'opt-1', text: 'O(log N)', explanation: 'Correct! Logarithmic growth O(log N) grows significantly slower than linear, polynomial, or exponential functions.' },
      { id: 'opt-2', text: 'O(N)', explanation: 'Incorrect: Linear growth grows faster than O(log N).' },
      { id: 'opt-3', text: 'O(N log N)', explanation: 'Incorrect: Linearithmic grows faster than linear.' },
      { id: 'opt-4', text: 'O(N^2)', explanation: 'Incorrect: Quadratic grows much faster.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'O(log N) represents sub-linear growth, halving the problem space at each step. For N = 1,000,000, log2(N) is only ~20 operations.'
  },

  'quiz-dsa-arrays': {
    id: 'quiz-dsa-arrays',
    conceptId: 'dsa.arrays-amortized',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'Why does an array have O(1) constant-time access to any element index A[i]?',
    options: [
      { id: 'opt-1', text: 'Because contiguous memory layout allows direct address calculation: base + i * sizeof(element)', explanation: 'Correct! Random access requires only one addition and one multiplication in hardware to find the exact memory address.' },
      { id: 'opt-2', text: 'Because arrays use a binary search tree internally', explanation: 'Incorrect: Arrays are contiguous sequential memory blocks.' },
      { id: 'opt-3', text: 'Because arrays use hash keys', explanation: 'Incorrect: Arrays use contiguous integer indices.' },
      { id: 'opt-4', text: 'Because the CPU caches all array elements forever', explanation: 'Incorrect: Cache locality speeds up access, but O(1) is an architectural mathematical property.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Contiguous element layout allows O(1) direct address calculation without traversing preceding elements.'
  },

  'quiz-linked-list-complexity': {
    id: 'quiz-linked-list-complexity',
    conceptId: 'dsa.singly-linked-list',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'What is the time complexity of inserting a new node at the very beginning (head) of a singly linked list?',
    options: [
      { id: 'opt-1', text: 'O(1) - Constant Time', explanation: 'Correct! Inserting at the head only requires creating the node, pointing its next to the current head, and updating the head pointer. No node traversal is needed.' },
      { id: 'opt-2', text: 'O(N) - Linear Time', explanation: 'Incorrect: O(N) is required only when searching for a value or traversing to the end of an un-augmented list.' },
      { id: 'opt-3', text: 'O(log N) - Logarithmic Time', explanation: 'Incorrect: Linked lists do not support binary search splits because random access is impossible.' },
      { id: 'opt-4', text: 'O(N^2) - Quadratic Time', explanation: 'Incorrect: Head insertion never requires nested iterations.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Prepending a node to the front of a linked list is always O(1) constant time, unlike an array where all elements must be shifted right.'
  },

  'quiz-dsa-stacks-queues': {
    id: 'quiz-dsa-stacks-queues',
    conceptId: 'dsa.stacks-queues',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'Which data structure follows the First-In, First-Out (FIFO) access discipline?',
    options: [
      { id: 'opt-1', text: 'Queue', explanation: 'Correct! In a queue, the first element inserted is the first element removed (FIFO).' },
      { id: 'opt-2', text: 'Stack', explanation: 'Incorrect: Stacks follow LIFO (Last-In, First-Out).' },
      { id: 'opt-3', text: 'Binary Tree', explanation: 'Incorrect: Trees are hierarchical structures.' },
      { id: 'opt-4', text: 'Hash Table', explanation: 'Incorrect: Hash tables do not enforce order disciplines.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Queues maintain FIFO ordering (enqueued at tail, dequeued from head), whereas stacks maintain LIFO ordering.'
  },

  'quiz-dsa-binary-search': {
    id: 'quiz-dsa-binary-search',
    conceptId: 'dsa.binary-search',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'What is the fundamental prerequisite for applying binary search on an array?',
    options: [
      { id: 'opt-1', text: 'The array elements must be sorted in monotonic order', explanation: 'Correct! Binary search relies on monotonicity to eliminate half the search space on each comparison.' },
      { id: 'opt-2', text: 'The array must contain only unique elements', explanation: 'Incorrect: Binary search works on arrays with duplicate values.' },
      { id: 'opt-3', text: 'The array size must be an exact power of two', explanation: 'Incorrect: Binary search works on any array size.' },
      { id: 'opt-4', text: 'The array must be stored as a linked list', explanation: 'Incorrect: Linked lists do not support O(1) midpoint access.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Binary search requires sorted elements so that comparing the target with mid deterministically eliminates either the left or right partition.'
  },

  'quiz-dsa-binary-trees': {
    id: 'quiz-dsa-binary-trees',
    conceptId: 'dsa.binary-trees',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'In which tree traversal order is a node visited between its left and right subtrees?',
    options: [
      { id: 'opt-1', text: 'Inorder (Left, Root, Right)', explanation: 'Correct! Inorder traversal processes the left subtree, then visits the root node, and finally processes the right subtree.' },
      { id: 'opt-2', text: 'Preorder (Root, Left, Right)', explanation: 'Incorrect: Preorder visits root before any subtrees.' },
      { id: 'opt-3', text: 'Postorder (Left, Right, Root)', explanation: 'Incorrect: Postorder visits root after both subtrees.' },
      { id: 'opt-4', text: 'Level-order (BFS)', explanation: 'Incorrect: Level-order visits nodes row by row.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Inorder traversal visits Left -> Root -> Right. For a Binary Search Tree, an inorder traversal prints elements in strictly sorted ascending order.'
  },

  'quiz-dsa-bst': {
    id: 'quiz-dsa-bst',
    conceptId: 'dsa.binary-search-tree',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'What is the worst-case time complexity of searching a key in an un-balanced Binary Search Tree with N nodes?',
    options: [
      { id: 'opt-1', text: 'O(N) - Linear Time', explanation: 'Correct! If elements are inserted in sorted order, the BST degenerates into a singly linked list with height N, resulting in linear lookup.' },
      { id: 'opt-2', text: 'O(log N)', explanation: 'Incorrect: O(log N) is the balanced/average case, not worst-case.' },
      { id: 'opt-3', text: 'O(1)', explanation: 'Incorrect: Root lookup is O(1), but general key lookup depends on tree height.' },
      { id: 'opt-4', text: 'O(N log N)', explanation: 'Incorrect: Searching a single key cannot exceed O(N).' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'In the worst case (e.g. inserting 1, 2, 3, 4, 5 in order), an unbalanced BST degrades to a linear chain of height N, requiring O(N) operations.'
  },

  'quiz-dsa-graphs': {
    id: 'quiz-dsa-graphs',
    conceptId: 'dsa.graphs-bfs-dfs',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'Which traversal algorithm guarantees finding the shortest path (minimum edge count) between two vertices in an unweighted graph?',
    options: [
      { id: 'opt-1', text: 'Breadth-First Search (BFS)', explanation: 'Correct! BFS explores vertices in increasing order of distance (hops) from the start node, guaranteeing the first discovery of target is the shortest path.' },
      { id: 'opt-2', text: 'Depth-First Search (DFS)', explanation: 'Incorrect: DFS traverses deep paths first and may find a much longer path first.' },
      { id: 'opt-3', text: 'Binary Search', explanation: 'Incorrect: Binary search applies to sorted sequences, not graphs.' },
      { id: 'opt-4', text: 'Inorder Traversal', explanation: 'Incorrect: Inorder is specific to binary trees.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'BFS uses a FIFO queue to visit nodes level-by-level, ensuring that the first time a target vertex is reached, the path taken has the minimum number of edges.'
  },

  // --- DBMS Exercises ---
  'quiz-dbms-relational': {
    id: 'quiz-dbms-relational',
    conceptId: 'dbms.relational-model',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'What invariant must be satisfied by a Primary Key in the relational model?',
    options: [
      { id: 'opt-1', text: 'It must be uniquely identifying for every tuple and cannot contain NULL values', explanation: 'Correct! Entity integrity requires primary key attributes to be both unique and non-null.' },
      { id: 'opt-2', text: 'It can contain duplicate values if clustered', explanation: 'Incorrect: Primary keys must be strictly unique.' },
      { id: 'opt-3', text: 'It must be a single numeric integer column', explanation: 'Incorrect: Composite keys spanning multiple columns are permitted.' },
      { id: 'opt-4', text: 'It can contain NULL values if indexed', explanation: 'Incorrect: Primary key columns are never nullable.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'The Entity Integrity constraint mandates that primary key values must be unique across all rows and cannot contain NULL.'
  },

  'quiz-dbms-sql-basics': {
    id: 'quiz-dbms-sql-basics',
    conceptId: 'dbms.sql-foundations',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'Which of the following SQL statements is a Data Definition Language (DDL) command?',
    options: [
      { id: 'opt-1', text: 'CREATE TABLE', explanation: 'Correct! CREATE TABLE modifies the database schema definition, making it DDL.' },
      { id: 'opt-2', text: 'INSERT INTO', explanation: 'Incorrect: INSERT is a Data Manipulation Language (DML) statement.' },
      { id: 'opt-3', text: 'UPDATE', explanation: 'Incorrect: UPDATE is DML.' },
      { id: 'opt-4', text: 'DELETE', explanation: 'Incorrect: DELETE is DML.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'DDL commands (CREATE, ALTER, DROP) manage schema structures, whereas DML commands (INSERT, UPDATE, DELETE) mutate row data.'
  },

  'quiz-dbms-sql-querying': {
    id: 'quiz-dbms-sql-querying',
    conceptId: 'dbms.sql-querying',
    type: 'mcq',
    difficulty: 'beginner',
    question: 'What is the crucial difference between the WHERE clause and the HAVING clause in SQL?',
    options: [
      { id: 'opt-1', text: 'WHERE filters rows before grouping; HAVING filters aggregated groups after GROUP BY', explanation: 'Correct! WHERE evaluates individual table rows before aggregation. HAVING evaluates aggregate expressions (e.g. COUNT(*) > 5) on grouped buckets.' },
      { id: 'opt-2', text: 'WHERE is used only in SQLite; HAVING is used only in PostgreSQL', explanation: 'Incorrect: Both clauses are standard ANSI SQL across all RDBMS.' },
      { id: 'opt-3', text: 'HAVING runs before WHERE', explanation: 'Incorrect: WHERE executes before GROUP BY; HAVING executes after.' },
      { id: 'opt-4', text: 'WHERE can evaluate aggregate functions like AVG() directly', explanation: 'Incorrect: Aggregate functions cannot appear in the WHERE clause.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'WHERE filters individual tuples prior to grouping. HAVING filters the result of aggregate functions on grouped partitions.'
  },

  'quiz-dbms-joins': {
    id: 'quiz-dbms-joins',
    conceptId: 'dbms.joins',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'What does a LEFT OUTER JOIN return when a row in the left table has no matching row in the right table?',
    options: [
      { id: 'opt-1', text: 'The left row is preserved, and all right table columns are filled with NULL', explanation: 'Correct! A LEFT JOIN preserves all rows from the left relation, substituting NULL for missing right-hand columns.' },
      { id: 'opt-2', text: 'The left row is discarded from the result set', explanation: 'Incorrect: That is the behavior of an INNER JOIN.' },
      { id: 'opt-3', text: 'A foreign key integrity violation is raised', explanation: 'Incorrect: Queries do not validate constraints; they read existing state.' },
      { id: 'opt-4', text: 'Default zeros are inserted into the database', explanation: 'Incorrect: SELECT queries are read-only and return NULL.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'LEFT OUTER JOIN guarantees that every tuple from the left relation appears in the output, populating right-table fields with NULL when no match exists.'
  },

  'quiz-dbms-normalization': {
    id: 'quiz-dbms-normalization',
    conceptId: 'dbms.normalization',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'A relation is in Second Normal Form (2NF) if it is in 1NF and satisfies which condition?',
    options: [
      { id: 'opt-1', text: 'No non-prime attribute is partially dependent on any candidate key', explanation: 'Correct! 2NF eliminates partial dependencies: every non-prime attribute must depend on the whole candidate key, not a proper subset.' },
      { id: 'opt-2', text: 'Every determinant is a superkey', explanation: 'Incorrect: That is the definition of Boyce-Codd Normal Form (BCNF).' },
      { id: 'opt-3', text: 'No transitive dependencies exist', explanation: 'Incorrect: Eliminating transitive dependencies is the requirement for 3NF.' },
      { id: 'opt-4', text: 'All columns contain atomic values', explanation: 'Incorrect: Atomicity is the requirement for 1NF.' }
    ],
    correctOptionId: 'opt-1',
    explanation: '2NF requires relations to be in 1NF and have no partial functional dependencies on candidate keys.'
  },

  'quiz-dbms-transactions': {
    id: 'quiz-dbms-transactions',
    conceptId: 'dbms.transactions',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'Which ACID property guarantees that all operations within a transaction either completely succeed or completely roll back with no partial effects?',
    options: [
      { id: 'opt-1', text: 'Atomicity', explanation: 'Correct! Atomicity ensures the "all-or-nothing" execution of database transactions.' },
      { id: 'opt-2', text: 'Consistency', explanation: 'Incorrect: Consistency ensures transitions from one valid state satisfying all invariants to another.' },
      { id: 'opt-3', text: 'Isolation', explanation: 'Incorrect: Isolation ensures concurrent transactions do not interfere.' },
      { id: 'opt-4', text: 'Durability', explanation: 'Incorrect: Durability guarantees committed changes persist across power failures.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'Atomicity guarantees that in the event of an error, crash, or abort, all uncommitted mutations are rolled back completely.'
  },

  'quiz-dbms-indexing': {
    id: 'quiz-dbms-indexing',
    conceptId: 'dbms.indexing',
    type: 'mcq',
    difficulty: 'intermediate',
    question: 'Why are B+ Trees preferred over standard Binary Search Trees for database disk storage?',
    options: [
      { id: 'opt-1', text: 'B+ Trees have a high branching factor (fan-out), minimizing the number of disk I/O reads required to locate a record', explanation: 'Correct! A single B+ tree node can hold hundreds of keys matching disk block sizes, keeping tree height small (3–4 levels) and minimizing costly disk seeks.' },
      { id: 'opt-2', text: 'B+ Trees do not require sorting', explanation: 'Incorrect: B+ tree keys are maintained in strict sorted order.' },
      { id: 'opt-3', text: 'B+ Trees store records in volatile CPU registers only', explanation: 'Incorrect: B+ trees are designed specifically for disk blocks and buffer pools.' },
      { id: 'opt-4', text: 'B+ Trees eliminate the need for primary keys', explanation: 'Incorrect: Primary keys are frequently indexed with B+ trees.' }
    ],
    correctOptionId: 'opt-1',
    explanation: 'High fan-out in B+ trees matches filesystem page sizes (e.g. 4KB-16KB), keeping tree height low and minimizing expensive disk read I/O operations.'
  }
};
