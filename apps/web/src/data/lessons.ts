import { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  // ==========================================
  // C PROGRAMMING CURRICULUM
  // ==========================================
  {
    id: 'c-variables-types',
    conceptId: 'c.types-variables',
    languageId: 'c',
    title: 'C Types, Sizing & Binary Representation',
    slug: 'variables-and-types',
    summary: 'Understand fixed-width primitives, two-complement integers, floating-point IEEE-754, and sizeof byte queries.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    order: 1,
    version: '1.0.0',
    learningObjectives: [
      'Query accurate byte sizes of primitive types using sizeof.',
      'Explain two-complement signed integer bit representations.',
      'Prevent integer overflow and promotion vulnerabilities.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Primitive Data Types as Fixed-Width Memory Slots',
      },
      {
        type: 'markdown',
        content: `In C, data types are not high-level abstractions—they are concrete hardware specifications defining exactly how many contiguous bytes are allocated in RAM and how the CPU ALU should interpret those bits.`,
      },
      {
        type: 'comparison',
        title: 'Standard C Fixed-Width Sizing (x86_64)',
        headers: ['Type Specifier', 'Typical Size', 'Bit Width', 'Value Range'],
        rows: [
          ['char', '1 byte', '8 bits', '-128 to +127 (or 0 to 255 unsigned)'],
          ['short', '2 bytes', '16 bits', '-32,768 to +32,767'],
          ['int', '4 bytes', '32 bits', '-2,147,483,648 to +2,147,483,647'],
          ['long / int64_t', '8 bytes', '64 bits', '-9.22 × 10^18 to +9.22 × 10^18'],
          ['float', '4 bytes', '32 bits', 'Single precision IEEE-754 (~7 decimal digits)'],
          ['double', '8 bytes', '64 bits', 'Double precision IEEE-754 (~15 decimal digits)'],
        ],
      },
      {
        type: 'code',
        language: 'c',
        title: 'sizeof_demo.c',
        code: `#include <stdio.h>
#include <stdint.h>

int main() {
    printf("sizeof(char):      %zu byte\\n", sizeof(char));
    printf("sizeof(int):       %zu bytes\\n", sizeof(int));
    printf("sizeof(long):      %zu bytes\\n", sizeof(long));
    printf("sizeof(int*):      %zu bytes (all 64-bit pointers)\\n", sizeof(int*));
    return 0;
}`,
        executable: true,
      },
      {
        type: 'callout',
        variant: 'deep-dive',
        title: 'Why All Pointers Are 8 Bytes',
        content: 'Regardless of whether a pointer points to a 1-byte char or a 1000-byte struct, the pointer variable itself only stores a 64-bit virtual memory address. Therefore, sizeof(any_pointer) is always 8 bytes on a 64-bit OS!',
      },
      {
        type: 'related_concepts',
        conceptIds: ['memory.pointers-intro', 'c.pointer-arithmetic'],
      },
    ],
  },

  {
    id: 'c-pointers-basics',
    conceptId: 'memory.pointers-intro',
    languageId: 'c',
    title: 'Demystifying Pointers & Memory Addresses in C',
    slug: 'pointers-basics',
    summary: 'Understand memory as a contiguous byte sequence, address-of operator (&), and dereferencing (*).',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    order: 2,
    version: '1.0.0',
    learningObjectives: [
      'Trace how variables map to hexadecimal memory offsets.',
      'Differentiate between an address and the dereferenced data value.',
      'Modify memory through pointer dereferencing.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Memory as an Indexed Array of Bytes',
      },
      {
        type: 'markdown',
        content: `Every variable declared in a C program occupies a specific slot in virtual RAM. To write systems-level code, you must view variables as **fixed memory locations with hex addresses and byte widths**.`,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Fundamental Principle',
        content: 'A pointer is simply a variable whose stored value is the memory address of another variable. On modern 64-bit architectures, all pointers occupy exactly 8 bytes of space.',
      },
      {
        type: 'code',
        language: 'c',
        title: 'inspect_address.c',
        code: `#include <stdio.h>

int main() {
    int age = 42;
    int *ptr = &age; // ptr holds memory address of age

    printf("Value of age: %d\\n", age);
    printf("Address of age (&age): %p\\n", (void*)&age);
    printf("Value stored in ptr:   %p\\n", (void*)ptr);
    printf("Dereferenced (*ptr):   %d\\n", *ptr);

    // Modify age via pointer dereference
    *ptr = 99;
    printf("New value of age:      %d\\n", age);

    return 0;
}`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'memory',
        config: { concept: 'pointers-stack-layout' },
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-pointer-deref',
      },
      {
        type: 'related_concepts',
        conceptIds: ['c.pointer-arithmetic', 'dsa.singly-linked-list'],
      },
    ],
  },

  {
    id: 'c-pointer-arithmetic',
    conceptId: 'c.pointer-arithmetic',
    languageId: 'c',
    title: 'Pointer Arithmetic & Array Decay in C',
    slug: 'pointer-arithmetic',
    summary: 'How adding an integer to a pointer increments memory by sizeof(type) bytes, and why arr[i] == *(arr + i).',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    order: 3,
    version: '1.0.0',
    learningObjectives: [
      'Explain that ptr + 1 increments the address by sizeof(*ptr) bytes.',
      'Prove that array indexing arr[i] is identical to *(arr + i).',
      'Safely traverse contiguous memory buffers using pointer increments.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Scaling by Type Size',
      },
      {
        type: 'markdown',
        content: `Pointer arithmetic does not increment raw byte values by 1. Instead, the compiler automatically multiplies the integer offset by the byte size of the referenced type:`,
      },
      {
        type: 'math',
        formula: 'Address(ptr + k) = Address(ptr) + (k \\times sizeof(*ptr))',
        explanation: 'For an int* pointer (where sizeof(int) = 4), adding 1 increases the hexadecimal address by 4 bytes.',
      },
      {
        type: 'code',
        language: 'c',
        title: 'pointer_math.c',
        code: `#include <stdio.h>

int main() {
    int arr[4] = {10, 20, 30, 40};
    int *p = arr; // Array decays to pointer to first element

    printf("p:       %p, *p:     %d\\n", (void*)p, *p);
    printf("p + 1:   %p, *(p+1): %d (+4 bytes)\\n", (void*)(p + 1), *(p + 1));
    printf("p + 2:   %p, *(p+2): %d (+8 bytes)\\n", (void*)(p + 2), *(p + 2));

    // Array syntax is pure syntactic sugar for pointer arithmetic!
    printf("arr[2]:  %d\\n", arr[2]);
    printf("*(arr+2):%d\\n", *(arr + 2));
    printf("2[arr]:  %d (commutativity of addition!)\\n", 2[arr]);

    return 0;
}`,
        executable: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Buffer Overruns',
        content: 'C does not perform bounds checking on pointer arithmetic. Incrementing past the buffer boundary reads or writes arbitrary stack or heap memory (undefined behavior).',
      },
      {
        type: 'related_concepts',
        conceptIds: ['memory.pointers-intro', 'dsa.singly-linked-list'],
      },
    ],
  },

  {
    id: 'c-dynamic-memory',
    conceptId: 'memory.dynamic-allocation',
    languageId: 'c',
    title: 'Dynamic Heap Memory: malloc, calloc & free',
    slug: 'dynamic-memory-allocation',
    summary: 'Requesting runtime-sized heap memory from the operating system, verifying allocation success, and preventing leaks.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    order: 4,
    version: '1.0.0',
    learningObjectives: [
      'Allocate memory with malloc, calloc, and realloc.',
      'Verify that allocation did not fail by checking for NULL.',
      'Deallocate memory using free() and nullify dangling pointers.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Dynamic Heap Segment',
      },
      {
        type: 'markdown',
        content: `Stack variables are automatically destroyed when their enclosing function returns. When you need data to survive across function calls, or when the buffer size is unknown at compile time, you must allocate from the **Heap** using \`malloc()\`.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'heap_allocation.c',
        code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    // Request space for 5 integers (5 * 4 = 20 bytes)
    int *buffer = (int*)malloc(n * sizeof(int));
    if (buffer == NULL) {
        fprintf(stderr, "Out of Memory (OOM) error!\\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        buffer[i] = (i + 1) * 10;
    }

    printf("Buffer allocated at %p\\n", (void*)buffer);
    for (int i = 0; i < n; i++) {
        printf("buffer[%d] = %d\\n", i, buffer[i]);
    }

    // Always release heap allocations!
    free(buffer);
    buffer = NULL; // Defend against dangling pointer access

    return 0;
}`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'memory',
      },
      {
        type: 'related_concepts',
        conceptIds: ['memory.stack-vs-heap', 'oops.raii'],
      },
    ],
  },

  {
    id: 'c-structures',
    conceptId: 'c.structures',
    languageId: 'c',
    title: 'C Structures, Alignment & Padding',
    slug: 'structures-alignment',
    summary: 'Grouping composite data with struct, arrow operator (->), and CPU hardware alignment constraints.',
    difficulty: 'intermediate',
    estimatedMinutes: 16,
    order: 5,
    version: '1.0.0',
    learningObjectives: [
      'Define composite structs with typedef.',
      'Explain how CPU 4-byte and 8-byte alignment requirements create padding bytes.',
      'Access struct members via direct dot and pointer arrow operators.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Defining Composite Records with struct',
      },
      {
        type: 'markdown',
        content: `A struct allows grouping heterogeneous data elements into a contiguous composite type. However, compilers insert invisible **padding bytes** to align members with CPU bus word boundaries.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'struct_alignment.c',
        code: `#include <stdio.h>

typedef struct Student {
    char grade;     // 1 byte (+ 3 padding bytes!)
    int id;         // 4 bytes
    double gpa;     // 8 bytes
} Student;

int main() {
    Student s = {'A', 101, 3.95};
    Student *ptr = &s;

    printf("Student ID:    %d\\n", ptr->id);
    printf("Grade:         %c\\n", ptr->grade);
    printf("GPA:           %.2f\\n", ptr->gpa);

    // Sum of fields: 1 + 4 + 8 = 13 bytes
    // Actual aligned size: 16 bytes!
    printf("sizeof(Student): %zu bytes (contains 3 bytes padding!)\\n", sizeof(Student));
    return 0;
}`,
        executable: true,
      },
      {
        type: 'related_concepts',
        conceptIds: ['dsa.singly-linked-list', 'c.types-variables'],
      },
    ],
  },

  // ==========================================
  // C++ OBJECT-ORIENTED & SYSTEMS CURRICULUM
  // ==========================================
  {
    id: 'cpp-classes-objects',
    conceptId: 'oops.classes-objects',
    languageId: 'cpp',
    title: 'C++ Classes, Encapsulation & Access Specifiers',
    slug: 'classes-and-objects',
    summary: 'Binding data with member functions, enforcing invariants with public and private access specifiers.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    order: 6,
    version: '1.0.0',
    learningObjectives: [
      'Encapsulate private member variables behind public getter/setter methods.',
      'Construct objects on both stack and heap.',
      'Understand this pointer passed implicitly to member functions.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Encapsulating State and Invariants',
      },
      {
        type: 'markdown',
        content: `In C++, a class is a user-defined blueprint. Unlike a C struct (where all members are public by default), a C++ class defaults to private, enforcing data hiding.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'bank_account.cpp',
        code: `#include <iostream>
#include <string>

class BankAccount {
private:
    std::string owner;
    double balance;

public:
    BankAccount(std::string name, double initial) 
        : owner(name), balance(initial) {}

    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    double getBalance() const { return balance; }
};

int main() {
    BankAccount account("Priya", 1500.0);
    account.deposit(500.0);
    std::cout << "Balance: $" << account.getBalance() << "\\n";
    return 0;
}`,
        executable: true,
      },
      {
        type: 'related_concepts',
        conceptIds: ['cpp.constructors-destructors', 'oops.inheritance'],
      },
    ],
  },

  {
    id: 'cpp-constructors-destructors',
    conceptId: 'cpp.constructors-destructors',
    languageId: 'cpp',
    title: 'C++ Constructors, Destructors & The Rule of 5',
    slug: 'constructors-destructors',
    summary: 'Object lifecycles: initializer lists, deep copying, move semantics, and deterministic destruction.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    order: 7,
    version: '1.0.0',
    learningObjectives: [
      'Use member initializer lists for zero-cost initialization.',
      'Implement custom copy constructors and copy assignment operators.',
      'Understand destructor invocation during stack frame unwinding.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Deterministic Construction and Destruction',
      },
      {
        type: 'markdown',
        content: `Constructors initialize an object's memory. When the object leaves its lexical scope, its destructor (\`~ClassName()\`) runs automatically, releasing resources.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'lifecycle.cpp',
        code: `#include <iostream>

class ScopedResource {
public:
    ScopedResource() { std::cout << "[Constructor] Resource acquired\\n"; }
    ~ScopedResource() { std::cout << "[Destructor] Resource freed automatically\\n"; }
};

int main() {
    std::cout << "Entering main scope\\n";
    {
        ScopedResource res;
        std::cout << "Inside nested scope\\n";
    } // <-- Destructor executes right here on closing brace!
    std::cout << "Exited nested scope\\n";
    return 0;
}`,
        executable: true,
      },
      {
        type: 'related_concepts',
        conceptIds: ['oops.raii', 'oops.classes-objects'],
      },
    ],
  },

  {
    id: 'cpp-inheritance',
    conceptId: 'oops.inheritance',
    languageId: 'cpp',
    title: 'C++ Inheritance & Derived Class Hierarchies',
    slug: 'cpp-inheritance-models',
    summary: 'Deriving behavior from base classes, protected access, constructor delegation, and multiple inheritance.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    order: 8,
    version: '1.0.0',
    learningObjectives: [
      'Model is-a class hierarchies using public inheritance.',
      'Trace base constructor execution prior to derived constructor.',
      'Avoid object slicing when passing polymorphic types.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Extending Base Class Functionality',
      },
      {
        type: 'markdown',
        content: `Inheritance allows derived classes to inherit state and methods from base classes. In C++, derived classes contain the complete subobject memory layout of the base class.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'inheritance.cpp',
        code: `#include <iostream>
#include <string>

class Vehicle {
protected:
    std::string brand;
public:
    Vehicle(std::string b) : brand(b) {}
    void honk() const { std::cout << brand << " honks!\\n"; }
};

class ElectricCar : public Vehicle {
private:
    int batteryCapacity;
public:
    ElectricCar(std::string b, int kwh) 
        : Vehicle(b), batteryCapacity(kwh) {}

    void displayStatus() const {
        std::cout << brand << " with " << batteryCapacity << " kWh battery\\n";
    }
};

int main() {
    ElectricCar myCar("Tesla", 85);
    myCar.honk();
    myCar.displayStatus();
    return 0;
}`,
        executable: true,
      },
      {
        type: 'related_concepts',
        conceptIds: ['oops.polymorphism', 'oops.classes-objects'],
      },
    ],
  },

  {
    id: 'cpp-polymorphism',
    conceptId: 'oops.polymorphism',
    languageId: 'cpp',
    title: 'Dynamic Polymorphism & The Virtual Table (vtable)',
    slug: 'polymorphism-vtable',
    summary: 'Virtual functions, dynamic dispatch, vptr pointers, and runtime method lookup.',
    difficulty: 'intermediate',
    estimatedMinutes: 22,
    order: 9,
    version: '1.0.0',
    learningObjectives: [
      'Differentiate compile-time static binding from runtime dynamic dispatch.',
      'Trace how the vptr pointer indexes into the vtable function pointer array.',
      'Always declare virtual destructors on polymorphic base classes.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Runtime Dynamic Dispatch with virtual',
      },
      {
        type: 'markdown',
        content: `When a base class declares a method as \`virtual\`, the compiler inserts an invisible pointer (\`vptr\`) at the beginning of the object layout pointing to a table of function pointers (\`vtable\`). At runtime, calling \`basePtr->speak()\` dereferences the vtable to execute the derived method.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'vtable_polymorphism.cpp',
        code: `#include <iostream>
#include <memory>
#include <vector>

class Animal {
public:
    virtual void speak() const = 0; // Pure virtual function (interface)
    virtual ~Animal() = default;    // Virtual destructor is critical!
};

class Dog : public Animal {
public:
    void speak() const override { std::cout << "Woof!\\n"; }
};

class Cat : public Animal {
public:
    void speak() const override { std::cout << "Meow!\\n"; }
};

int main() {
    std::vector<std::unique_ptr<Animal>> pets;
    pets.push_back(std::make_unique<Dog>());
    pets.push_back(std::make_unique<Cat>());

    for (const auto &pet : pets) {
        pet->speak(); // Dispatches dynamically via vtable!
    }
    return 0;
}`,
        executable: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Virtual Destructors Are Mandatory',
        content: 'If you delete a derived object through a base pointer (Animal* p = new Dog(); delete p;) and the base destructor is not marked virtual, only the base destructor runs, causing a resource leak!',
      },
      {
        type: 'related_concepts',
        conceptIds: ['oops.inheritance', 'oops.raii'],
      },
    ],
  },

  {
    id: 'cpp-raii-smart-pointers',
    conceptId: 'oops.raii',
    languageId: 'cpp',
    title: 'Modern C++: RAII and Smart Pointers',
    slug: 'raii-smart-pointers',
    summary: 'Eliminate manual delete and memory leaks by binding resource lifetimes to stack scopes.',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    order: 10,
    version: '1.0.0',
    learningObjectives: [
      'Enforce zero manual delete invocations in modern code.',
      'Use std::unique_ptr for exclusive single-ownership resources.',
      'Use std::shared_ptr and std::weak_ptr for reference-counted ownership.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Resource Acquisition Is Initialization (RAII)',
      },
      {
        type: 'markdown',
        content: `In modern C++, resources (heap memory, socket connections, file handles, mutex locks) are encapsulated within stack-allocated objects. When the object leaves its lexical scope, its **destructor runs automatically**, guaranteeing leak-free cleanup.`,
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'smart_pointers.cpp',
        code: `#include <iostream>
#include <memory>

class Resource {
public:
    Resource() { std::cout << "Resource acquired\\n"; }
    ~Resource() { std::cout << "Resource destroyed automatically!\\n"; }
    void work() { std::cout << "Doing work safely\\n"; }
};

int main() {
    {
        std::unique_ptr<Resource> ptr = std::make_unique<Resource>();
        ptr->work();
    } // <-- Destructor executes right here!

    std::cout << "Scope exited successfully.\\n";
    return 0;
}`,
        executable: true,
      },
      {
        type: 'comparison',
        title: 'Raw Pointers vs. Modern Smart Pointers',
        headers: ['Feature', 'Raw Pointer (*)', 'std::unique_ptr', 'std::shared_ptr'],
        rows: [
          ['Ownership', 'Undefined / Ambiguous', 'Exclusive single owner', 'Shared reference-counted owner'],
          ['Cleanup', 'Manual delete needed', 'Automatic on scope exit', 'Automatic when ref count hits 0'],
          ['Runtime Overhead', 'Zero', 'Zero (zero-cost abstraction)', 'Atomic counter overhead'],
        ],
      },
      {
        type: 'related_concepts',
        conceptIds: ['memory.stack-vs-heap', 'cpp.constructors-destructors'],
      },
    ],
  },

  // ==========================================
  // PYTHON CORE MECHANICS CURRICULUM
  // ==========================================
  {
    id: 'python-references-identity',
    conceptId: 'python.references-identity',
    languageId: 'python',
    title: 'Python Names, Bindings & Object Identity',
    slug: 'python-references-identity',
    summary: 'Variables as namespace labels pointing to heap PyObjects, mutability vs immutability, and is vs ==.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    order: 11,
    version: '1.0.0',
    learningObjectives: [
      'Explain that variables in Python are references to heap objects.',
      'Differentiate between value equality (==) and identity equality (is).',
      'Avoid unintended side-effects with mutable default arguments.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Variables Are Labels, Not Boxes',
      },
      {
        type: 'markdown',
        content: `In compiled languages like C, a variable is a named memory box storing raw bytes. In Python, **variables are reference labels bound to objects living on the heap**. Assignment (\`=\`) binds a name to an object.`,
      },
      {
        type: 'code',
        language: 'python',
        title: 'identity.py',
        code: `# Value equality vs Object Identity
a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(f"a == b: {a == b}")  # True: identical contents
print(f"a is b: {a is b}")  # False: distinct heap objects (different id)
print(f"a is c: {a is c}")  # True: both reference the identical object

# Modifying through reference 'c' affects 'a'
c.append(4)
print(f"a after c.append: {a}")
`,
        executable: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Try Running This in the Browser!',
        content: 'Click "Run in Playground" to execute this code right now via our integrated in-browser Pyodide WebAssembly runtime!',
      },
      {
        type: 'related_concepts',
        conceptIds: ['memory.pointers-intro', 'dsa.singly-linked-list'],
      },
    ],
  },

  {
    id: 'python-collections',
    conceptId: 'python.references-identity',
    languageId: 'python',
    title: 'Python Built-In Collections & Data Structures',
    slug: 'python-collections',
    summary: 'Deep dive into Python lists (dynamic arrays), tuples, sets (hash tables), and dicts (hash maps).',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    order: 12,
    version: '1.0.0',
    learningObjectives: [
      'Understand the amortized O(1) growth of Python lists.',
      'Leverage O(1) average lookup in sets and dictionaries.',
      'Select the appropriate collection for performance constraints.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Built-in Collection Arsenal',
      },
      {
        type: 'markdown',
        content: `Python provides four foundational collection types with distinct time complexity and ordering guarantees:`,
      },
      {
        type: 'comparison',
        title: 'Python Collections Complexity Comparison',
        headers: ['Collection', 'Ordered?', 'Mutable?', 'Average Lookup', 'Internal Implementation'],
        rows: [
          ['list', 'Yes', 'Yes', 'O(1) by index, O(N) by value', 'Contiguous pointer array with over-allocation'],
          ['tuple', 'Yes', 'No (Immutable)', 'O(1) by index', 'Fixed-size contiguous pointer array'],
          ['dict', 'Yes (insertion order)', 'Yes', 'O(1) by key', 'Combined hash table with compact indices'],
          ['set', 'No', 'Yes', 'O(1) membership check', 'Open-addressed hash table'],
        ],
      },
      {
        type: 'code',
        language: 'python',
        title: 'collections_demo.py',
        code: `# Dictionary and Set O(1) lookups
grades = {"Alex": 92, "Priya": 98, "Jordan": 85}
print("Priya's grade:", grades.get("Priya"))

# Fast set operations
cs_students = {"Alex", "Jordan", "Elena"}
math_students = {"Elena", "Marcus"}

both = cs_students & math_students
print("Students taking both CS & Math:", both)
`,
        executable: true,
      },
      {
        type: 'related_concepts',
        conceptIds: ['dsa.binary-search', 'dbms.relational-model'],
      },
    ],
  },

  // ==========================================
  // DATA STRUCTURES & ALGORITHMS CURRICULUM
  // ==========================================
  {
    id: 'dsa-linked-list-basics',
    conceptId: 'dsa.singly-linked-list',
    languageId: 'c',
    title: 'Singly Linked Lists: Structure, Traversal & Insertion',
    slug: 'linked-list-basics',
    summary: 'Why dynamic node chaining eliminates the contiguous memory restrictions of standard arrays.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    order: 13,
    version: '1.0.0',
    learningObjectives: [
      'Explain how node pointers decouple memory placement in RAM.',
      'Achieve O(1) prepend operations compared to O(N) array shifts.',
      'Implement safe node deletion and pointer redirection.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Limitations of Contiguous Arrays',
      },
      {
        type: 'markdown',
        content: `While arrays offer instant **O(1)** random access via index arithmetic, inserting or deleting an element in the middle requires shifting every subsequent element, incurring **O(N)** time complexity.

A **Singly Linked List** decouples memory storage: each node lives independently on the heap and maintains an explicit pointer link to its successor.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'node_structure.c',
        code: `typedef struct Node {
    int data;
    struct Node* next; // Self-referential pointer to successor
} Node;

Node* create_node(int value) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    if (newNode == NULL) return NULL;
    newNode->data = value;
    newNode->next = NULL;
    return newNode;
}`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'dsa',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Memory Leaks & Lost References',
        content: 'When inserting or deleting nodes, the order of pointer assignments is critical! If you overwrite prev->next before storing current->next, the rest of the list is severed in memory and cannot be reached or freed.',
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-linked-list-complexity',
      },
      {
        type: 'related_concepts',
        conceptIds: ['memory.pointers-intro', 'dsa.stacks-queues'],
      },
    ],
  },

  {
    id: 'dsa-binary-search',
    conceptId: 'dsa.binary-search',
    languageId: 'c',
    title: 'Binary Search Algorithm: Invariants & O(log N) Proof',
    slug: 'binary-search-algorithm',
    summary: 'Master logarithmic interval bisection on sorted sequences and maintain strict boundary invariants.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    order: 14,
    version: '1.0.0',
    learningObjectives: [
      'Maintain the invariant that target must lie within [low, high].',
      'Prevent integer overflow with low + (high - low) / 2.',
      'Prove O(log N) halving complexity mathematically.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Divide and Conquer: Halving Search Space',
      },
      {
        type: 'markdown',
        content: `Linear search evaluates elements one by one in O(N) time. If the dataset is pre-sorted, we can compare the target against the middle element and immediately eliminate half of the remaining items.`,
      },
      {
        type: 'math',
        formula: 'T(N) = T(N / 2) + O(1) \\implies T(N) = O(\\log_2 N)',
        explanation: 'At each comparison, the search range is divided by 2. For an array of 1,000,000 elements, binary search requires at most 20 comparisons!',
      },
      {
        type: 'code',
        language: 'c',
        title: 'binary_search.c',
        code: `#include <stdio.h>

int binary_search(const int arr[], int size, int target) {
    int low = 0;
    int high = size - 1;

    while (low <= high) {
        // Safe midpoint calculation avoiding integer overflow
        int mid = low + (high - low) / 2;

        if (arr[mid] == target) {
            return mid; // Target found
        }
        if (arr[mid] < target) {
            low = mid + 1; // Discard left half
        } else {
            high = mid - 1; // Discard right half
        }
    }
    return -1; // Target not found
}

int main() {
    int sorted[8] = {3, 9, 14, 22, 38, 55, 78, 99};
    int index = binary_search(sorted, 8, 38);
    printf("Found 38 at index: %d\\n", index);
    return 0;
}`,
        executable: true,
      },
      {
        type: 'visualization',
        visualizerType: 'dsa',
      },
      {
        type: 'related_concepts',
        conceptIds: ['dsa.binary-trees', 'dbms.indexing'],
      },
    ],
  },

  {
    id: 'dsa-stacks-queues',
    conceptId: 'dsa.stacks-queues',
    languageId: 'c',
    title: 'Stacks (LIFO) & Queues (FIFO) Architecture',
    slug: 'stacks-and-queues',
    summary: 'Constrained linear abstract data types: push, pop, enqueue, dequeue, and call stack recursion.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    order: 15,
    version: '1.0.0',
    learningObjectives: [
      'Implement a stack using both fixed arrays and linked lists.',
      'Implement a queue using a circular ring buffer.',
      'Apply stacks to parenthesis matching and call stack tracing.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'LIFO and FIFO Protocols',
      },
      {
        type: 'markdown',
        content: `A **Stack** operates on Last-In First-Out (LIFO) semantics, matching the CPU call stack and undo histories. A **Queue** operates on First-In First-Out (FIFO) semantics, matching printer spools and async event loops.`,
      },
      {
        type: 'comparison',
        title: 'Stack vs Queue Comparison',
        headers: ['Property', 'Stack (LIFO)', 'Queue (FIFO)'],
        rows: [
          ['Primary Operations', 'push(x), pop(), top()', 'enqueue(x), dequeue(), front()'],
          ['Insert Position', 'Top of stack', 'Rear / Tail of queue'],
          ['Remove Position', 'Top of stack', 'Front / Head of queue'],
          ['Core Applications', 'Recursion, syntax parsing, backtracking', 'Task scheduling, BFS traversal, buffers'],
        ],
      },
      {
        type: 'related_concepts',
        conceptIds: ['dsa.singly-linked-list', 'dsa.binary-trees'],
      },
    ],
  },

  {
    id: 'dsa-binary-trees',
    conceptId: 'dsa.binary-trees',
    languageId: 'c',
    title: 'Binary Trees & Tree Traversals (Inorder, Preorder, Postorder)',
    slug: 'binary-trees-traversals',
    summary: 'Hierarchical node branching, recursive depth-first traversals, and breadth-first level order.',
    difficulty: 'intermediate',
    estimatedMinutes: 22,
    order: 16,
    version: '1.0.0',
    learningObjectives: [
      'Define tree height, depth, leaf nodes, and subtrees.',
      'Implement recursive Inorder, Preorder, and Postorder DFS.',
      'Explain why Inorder traversal on a BST yields sorted values.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Non-Linear Hierarchical Nodes',
      },
      {
        type: 'markdown',
        content: `Unlike linked lists where each node has at most one successor, a **Binary Tree** node points to two child nodes: \`left\` and \`right\`. Trees provide logarithmic search and insertion when balanced.`,
      },
      {
        type: 'code',
        language: 'c',
        title: 'tree_traversals.c',
        code: `#include <stdio.h>
#include <stdlib.h>

typedef struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
} TreeNode;

// Inorder: Left -> Root -> Right
void inorder(TreeNode *root) {
    if (root == NULL) return;
    inorder(root->left);
    printf("%d ", root->val);
    inorder(root->right);
}

TreeNode* make_node(int val) {
    TreeNode* n = (TreeNode*)malloc(sizeof(TreeNode));
    n->val = val;
    n->left = n->right = NULL;
    return n;
}

int main() {
    TreeNode* root = make_node(20);
    root->left = make_node(10);
    root->right = make_node(30);

    printf("Inorder Traversal: ");
    inorder(root); // Outputs: 10 20 30
    printf("\\n");
    return 0;
}`,
        executable: true,
      },
      {
        type: 'related_concepts',
        conceptIds: ['dsa.binary-search', 'dbms.indexing'],
      },
    ],
  },

  // ==========================================
  // DATABASE MANAGEMENT SYSTEMS CURRICULUM
  // ==========================================
  {
    id: 'dbms-relational-model',
    conceptId: 'dbms.relational-model',
    languageId: 'c',
    title: 'The Relational Model, Keys & Integrity Constraints',
    slug: 'relational-model-keys',
    summary: 'Relations, tuples, attributes, Candidate Keys, Primary Keys, and Foreign Key integrity rules.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    order: 17,
    version: '1.0.0',
    learningObjectives: [
      'Define relation schemas and attribute domains.',
      'Differentiate Super Keys, Candidate Keys, and Primary Keys.',
      'Enforce entity integrity and referential integrity constraints.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Mathematical Relations as Tables',
      },
      {
        type: 'markdown',
        content: `The relational model organizes data into named relations (tables). Each row represents a distinct entity tuple, and each column represents a typed attribute domain.`,
      },
      {
        type: 'comparison',
        title: 'Relational Database Terminology vs. Mathematical Formalism',
        headers: ['Relational DB Term', 'Formal Relational Term', 'Description'],
        rows: [
          ['Table', 'Relation', 'Named set of tuples adhering to a schema'],
          ['Row / Record', 'Tuple', 'Ordered set of attribute values representing one entity'],
          ['Column / Field', 'Attribute', 'Named domain of allowed values (e.g. INTEGER, TEXT)'],
          ['Primary Key', 'Identifier Key', 'Minimal attribute subset uniquely identifying every tuple'],
          ['Foreign Key', 'Referential Key', 'Attribute in one relation referencing Primary Key of another'],
        ],
      },
      {
        type: 'related_concepts',
        conceptIds: ['dbms.joins', 'dbms.normalization'],
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
    estimatedMinutes: 20,
    order: 18,
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
        type: 'related_concepts',
        conceptIds: ['dbms.relational-model', 'dbms.indexing'],
      },
    ],
  },

  {
    id: 'dbms-normalization',
    conceptId: 'dbms.normalization',
    title: 'Database Normalization: 1NF, 2NF, 3NF & BCNF',
    slug: 'database-normalization',
    summary: 'Eliminating insertion, update, and deletion anomalies through systematic functional dependency decomposition.',
    difficulty: 'intermediate',
    estimatedMinutes: 22,
    order: 19,
    version: '1.0.0',
    learningObjectives: [
      'Identify update, insertion, and deletion anomalies in denormalized tables.',
      'Verify 1NF (atomic values), 2NF (no partial dependencies), and 3NF (no transitive dependencies).',
      'Decompose schemas into BCNF while preserving functional dependencies.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Three Database Anomalies',
      },
      {
        type: 'markdown',
        content: `Without normalization, redundant information leads to three classic database anomalies:
1. **Update Anomaly**: Changing a student's address in one row leaves contradictory data in others.
2. **Insertion Anomaly**: Cannot record a new course until a student enrolls in it.
3. **Deletion Anomaly**: Deleting the last enrolled student unintentionally destroys the course record!`,
      },
      {
        type: 'comparison',
        title: 'The Normal Forms Hierarchy',
        headers: ['Normal Form', 'Core Requirement', 'Eliminated Flaw'],
        rows: [
          ['1NF', 'All attribute values must be atomic (no arrays/nested records)', 'Repeating groups & non-atomic lists'],
          ['2NF', 'In 1NF + no non-prime attribute depends on a partial candidate key', 'Partial key dependencies'],
          ['3NF', 'In 2NF + no non-prime attribute depends transitively on a key', 'Transitive dependencies (X -> Y -> Z)'],
          ['BCNF', 'For every functional dependency X -> Y, X must be a super key', 'All remaining functional dependency redundancies'],
        ],
      },
      {
        type: 'related_concepts',
        conceptIds: ['dbms.relational-model', 'dbms.transactions'],
      },
    ],
  },

  {
    id: 'dbms-indexing',
    conceptId: 'dbms.indexing',
    title: 'Database Indexing: B+ Tree Lookups vs Table Scans',
    slug: 'database-indexing-b-trees',
    summary: 'Accelerating data retrieval from linear table scans (O(N)) to logarithmic index lookups using B+ Trees.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    order: 20,
    version: '1.0.0',
    learningObjectives: [
      'Compare Full Table Scan (O(N)) with Index Seek (O(log N)).',
      'Explain B+ Tree leaf page linked lists for efficient range queries.',
      'Evaluate the write performance trade-off of maintaining secondary indexes.',
    ],
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Why Full Table Scans Fail at Scale',
      },
      {
        type: 'markdown',
        content: `Without an index, finding a student with \`id = 948201\` requires reading every single 8KB disk page from storage sequentially—incurring millions of expensive I/O operations.

A **B+ Tree Index** creates a self-balancing, high-fanout search tree. Each node stores hundreds of keys, allowing searching 100,000,000 records in just 3 or 4 page reads!`,
      },
      {
        type: 'code',
        language: 'sql',
        title: 'create_index.sql',
        code: `-- Creating a secondary B-Tree index on foreign key
CREATE INDEX idx_enrollments_student ON enrollments(student_id);

-- Query planner now performs logarithmic Index Seek!
EXPLAIN QUERY PLAN 
SELECT * FROM enrollments WHERE student_id = 1;`,
        executable: true,
      },
      {
        type: 'related_concepts',
        conceptIds: ['dsa.binary-trees', 'dbms.joins'],
      },
    ],
  },
];
