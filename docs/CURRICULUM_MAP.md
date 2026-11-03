# Lumenode Curriculum Map & Hierarchy Specification

## 1. Curriculum Hierarchy

Lumenode structures its educational catalog through an interconnected 7-tier canonical hierarchy:

```
Platform (Lumenode)
  └── Learning Division (Programming Languages | Core Computer Science | Laboratories)
       └── Subject (e.g., C Programming, Data Structures & Algorithms, DBMS)
            └── Module (e.g., C Low-Level Systems, Trees & Balanced Search, Transaction Management)
                 └── Topic (e.g., Linked Lists, Pointer Arithmetic, Concurrency Control)
                      └── Concept (Language-independent Canonical Knowledge Unit, e.g. dsa.binary-search)
                           └── Lesson (Structured 15-part pedagogical instruction with interactive blocks)
                                └── Exercise (Multi-choice, Predict-Output, Find-Error, or Coding Lab)
```

---

## 2. Expanded Curriculum Catalog (37 Production Lessons)

### 2.1 C Programming Path (`c-lang`) — 9 Lessons
*Focus: Low-level systems foundations, memory addresses, pointer arithmetic, activation frames, and dynamic heap allocation.*

- **Module 1: C Systems Foundations (`c-mod-fundamentals`)**
  - Topic: Compilation Pipeline (`c-top-pipeline`)
    - Concept: `c.compilation-pipeline`
    - Lesson: *The C Compilation Pipeline: Preprocessor, Compiler, Assembler, and Linker* (`c-compilation-pipeline`)
    - Exercise: `quiz-c-compilation`
  - Topic: Data Types & Byte Sizing (`c-top-types`)
    - Concept: `c.types-variables`
    - Lesson: *Primitive Data Types & Memory Sizing in C* (`c-variables-types`)
    - Exercise: `quiz-c-types`
  - Topic: Control Flow & Branching (`c-top-control-flow`)
    - Concept: `c.control-flow`
    - Lesson: *Control Flow, Branch Prediction & Iteration Invariants in C* (`c-control-flow`)
    - Exercise: `quiz-c-control-flow`
  - Topic: Functions & Stack Architecture (`c-top-functions`)
    - Concept: `c.functions-stack`
    - Lesson: *Functions, Activation Records, and Call-Stack Architecture* (`c-functions-stack`)
    - Exercise: `quiz-c-functions`
  - Topic: Arrays & Null-Terminated Strings (`c-top-arrays`)
    - Concept: `c.arrays-strings`
    - Lesson: *Fixed Arrays and Null-Terminated Strings in C* (`c-arrays-strings`)
    - Exercise: `quiz-c-arrays`

- **Module 2: Pointers & Dynamic Allocation (`c-mod-memory`)**
  - Topic: Pointer Mechanics (`c-top-pointers`)
    - Concept: `memory.pointers-intro`
    - Lesson: *Pointer Mechanics & Virtual Memory Addressing* (`c-pointers-basics`)
    - Exercise: `quiz-c-pointers`
  - Topic: Pointer Arithmetic & Arrays (`c-top-ptr-arithmetic`)
    - Concept: `c.pointer-arithmetic`
    - Lesson: *Pointer Arithmetic & Array Memory Decay* (`c-pointer-arithmetic`)
    - Exercise: `quiz-c-ptr-arithmetic`
  - Topic: Heap Allocation (`c-top-dynamic-mem`)
    - Concepts: `memory.stack-vs-heap`, `memory.dynamic-allocation`
    - Lesson: *Dynamic Memory Allocation with malloc and free* (`c-dynamic-memory`)
    - Exercise: `quiz-c-dynamic-mem`
  - Topic: Structures & Alignment (`c-top-structures`)
    - Concept: `c.structures`
    - Lesson: *Composite Structures and Memory Alignment Padding* (`c-structures-padding`)
    - Exercise: `quiz-c-struct-padding`

---

### 2.2 C++ Systems & OOP Path (`cpp-lang`) — 7 Lessons
*Focus: Value vs reference semantics, RAII, constructor invariants, operator overloading, and polymorphic vtables.*

- **Module 1: C++ Object-Oriented Design (`cpp-mod-oop`)**
  - Topic: References & Namespaces (`cpp-top-references`)
    - Concept: `cpp.fundamentals-references`
    - Lesson: *C++ Foundations: Namespaces, Streams, and Alias References* (`cpp-fundamentals-references`)
    - Exercise: `quiz-cpp-references`
  - Topic: Classes & Encapsulation (`cpp-top-classes`)
    - Concept: `oops.classes-objects`
    - Lesson: *Classes, Object Layout & Member Visibility in C++* (`cpp-classes-objects`)
    - Exercise: `quiz-cpp-classes`
  - Topic: Constructors & Lifecycle (`cpp-top-constructors`)
    - Concept: `cpp.constructors-destructors`
    - Lesson: *Constructors, Destructors & The Rule of Three/Five* (`cpp-constructors-destructors`)
    - Exercise: `quiz-cpp-constructors`
  - Topic: Operator Overloading (`cpp-top-overloading`)
    - Concept: `cpp.overloading-operators`
    - Lesson: *Function Overloading, Operator Overloading, and Friend Scopes* (`cpp-overloading-operators`)
    - Exercise: `quiz-cpp-overloading`
  - Topic: RAII & Smart Pointers (`cpp-top-raii`)
    - Concept: `oops.raii`
    - Lesson: *RAII and Smart Pointers (unique_ptr, shared_ptr)* (`cpp-raii-smart-pointers`)
    - Exercise: `quiz-cpp-raii`
  - Topic: Inheritance & Memory Slicing (`cpp-top-inheritance`)
    - Concept: `oops.inheritance`
    - Lesson: *Class Inheritance & Object Memory Slicing* (`cpp-inheritance`)
    - Exercise: `quiz-cpp-inheritance`
  - Topic: Polymorphism & VTables (`cpp-top-polymorphism`)
    - Concept: `oops.polymorphism`
    - Lesson: *Virtual Functions, VTables & Dynamic Dispatch in C++* (`cpp-polymorphism-vtables`)
    - Exercise: `quiz-cpp-vtable`

---

### 2.3 Python Systems & Mechanics Path (`python-lang`) — 6 Lessons
*Focus: PyObject pointers, mutable vs immutable references, closures, generators, and descriptor protocols.*

- **Module 1: Python Core Mechanics (`py-mod-core`)**
  - Topic: Object Model & References (`py-top-references`)
    - Concept: `python.references-identity`
    - Lesson: *Python Object Model & Reference Semantics* (`python-object-model`)
    - Exercise: `quiz-py-identity`
  - Topic: Comprehensions & Sequences (`py-top-comprehensions`)
    - Concept: `python.data-structures`
    - Lesson: *List, Dict & Set Comprehensions: Expressive Sequences in Python* (`python-comprehensions`)
    - Exercise: `quiz-py-comprehensions`
  - Topic: Functions, Closures & Decorators (`py-top-functions-decorators`)
    - Concept: `python.functions-decorators`
    - Lesson: *Functions as First-Class Citizens, Closures, and Decorators* (`python-functions-decorators`)
    - Exercise: `quiz-py-decorators`
  - Topic: Generators & Iterators (`py-top-generators`)
    - Concept: `python.generators-iterators`
    - Lesson: *Generators, Iterators, and Memory-Efficient Lazy Streaming* (`python-generators-iterators`)
    - Exercise: `quiz-py-generators`
  - Topic: Classes & MRO (`py-top-oop`)
    - Concepts: `python.classes-dunder`, `oops.classes-objects`, `oops.inheritance`
    - Lesson: *Python Classes, Dunder Methods & MRO Resolution* (`python-oop-mro`)
    - Exercise: `quiz-py-mro`
  - Topic: Context Managers & `with` (`py-top-context-managers`)
    - Concept: `python.context-managers`
    - Lesson: *Context Managers & Deterministic Resource Reclamation with `with`* (`python-context-managers`)
    - Exercise: `quiz-py-context`

---

### 2.4 Data Structures & Algorithms Path (`dsa`) — 8 Lessons
*Focus: Algorithmic complexity, linear topologies, search trees, asymptotic analysis, and graph traversals.*

- **Module 1: Linear Data Structures (`dsa-mod-linear`)**
  - Topic: Asymptotic Analysis (`dsa-top-asymptotic`)
    - Concept: `dsa.asymptotic-analysis`
    - Lesson: *Asymptotic Complexity & Big-O Notation: Evaluating Space and Time* (`dsa-asymptotic-complexity`)
    - Exercise: `quiz-dsa-asymptotic`
  - Topic: Static & Dynamic Arrays (`dsa-top-arrays`)
    - Concept: `dsa.arrays-dynamic`
    - Lesson: *Contiguous Buffers, Dynamic Array Amortization & Capacity Resizing* (`dsa-dynamic-arrays`)
    - Exercise: `quiz-dsa-arrays`
  - Topic: Singly Linked Lists (`dsa-top-lists`)
    - Concept: `dsa.singly-linked-list`
    - Lesson: *Singly Linked Lists: Node Topologies & Pointer Manipulation* (`dsa-singly-linked-list`)
    - Exercise: `quiz-dsa-linked-list`
  - Topic: Doubly Linked Lists (`dsa-top-doubly-lists`)
    - Concept: `dsa.doubly-linked-list`
    - Lesson: *Doubly Linked Lists & Bidirectional Node Traversals* (`dsa-doubly-linked-list`)
    - Exercise: `quiz-dsa-doubly-list`
  - Topic: Stacks and Queues (`dsa-top-stacks-queues`)
    - Concept: `dsa.stacks-queues`
    - Lesson: *Stacks, Queues & Call-Stack Mechanics* (`dsa-stacks-queues`)
    - Exercise: `quiz-dsa-stacks-queues`

- **Module 2: Searching, Trees & Graphs (`dsa-mod-search-sort`)**
  - Topic: Binary Search (`dsa-top-search`)
    - Concept: `dsa.binary-search`
    - Lesson: *Binary Search & Logarithmic Interval Bisection* (`dsa-binary-search`)
    - Exercise: `quiz-dsa-binary-search`
  - Topic: Binary Trees & Traversals (`dsa-top-trees`)
    - Concept: `dsa.binary-trees`
    - Lesson: *Binary Trees & Recursive Tree Traversals* (`dsa-binary-trees`)
    - Exercise: `quiz-dsa-binary-trees`
  - Topic: Binary Search Trees (`dsa-top-bst`)
    - Concept: `dsa.binary-search-trees`
    - Lesson: *Binary Search Trees (BST): Invariant Ordering, Search, and Mutations* (`dsa-binary-search-trees`)
    - Exercise: `quiz-dsa-bst`

---

### 2.5 Database Management Systems Path (`dbms`) — 7 Lessons
*Focus: Relational model, DDL/DML, indexing, transactions, and ACID isolation.*

- **Module 1: Relational Core & SQL Design (`dbms-mod-relational`)**
  - Topic: Relational Foundations (`dbms-top-model`)
    - Concept: `dbms.relational-model`
    - Lesson: *Relational Model, Primary Keys & Foreign Key Constraints* (`dbms-relational-model`)
    - Exercise: `quiz-dbms-relational`
  - Topic: SQL DDL & DML Foundations (`dbms-top-sql-basics`)
    - Concept: `dbms.sql-foundations`
    - Lesson: *SQL Foundations: Declarative Schema Definition and Data Manipulation (DDL/DML)* (`dbms-sql-foundations`)
    - Exercise: `quiz-dbms-sql-basics`
  - Topic: Querying, Filtering & Aggregation (`dbms-top-sql-querying`)
    - Concept: `dbms.sql-querying`
    - Lesson: *SQL Querying: Projection, Filtering, Aggregation, and Grouping* (`dbms-sql-querying`)
    - Exercise: `quiz-dbms-sql-querying`
  - Topic: Relational Joins (`dbms-top-joins`)
    - Concept: `dbms.joins`
    - Lesson: *Relational Joins: Inner, Left Outer, and Cross Product Semantics* (`dbms-joins`)
    - Exercise: `quiz-dbms-joins`
  - Topic: Normalization (`dbms-top-normalization`)
    - Concept: `dbms.normalization`
    - Lesson: *Database Normalization: Functional Dependencies, 1NF, 2NF, 3NF & BCNF* (`dbms-normalization`)
    - Exercise: `quiz-dbms-normalization`

- **Module 2: Storage Engines & Transactions (`dbms-mod-transactions`)**
  - Topic: Transactions & ACID (`dbms-top-acid`)
    - Concept: `dbms.transactions-acid`
    - Lesson: *Database Transactions, Write-Ahead Logging & ACID Guarantees* (`dbms-transactions-acid`)
    - Exercise: `quiz-dbms-transactions`
  - Topic: Indexing & B-Trees (`dbms-top-indexing`)
    - Concept: `dbms.indexing-btree`
    - Lesson: *Database Indexing: B+ Tree Architectures & Query Plan Optimization* (`dbms-indexing-btree`)
    - Exercise: `quiz-dbms-indexing`

---

## 3. Curriculum Verification Baseline

All 37 lessons are programmatically verified against:
1. `pnpm content:validate`: Canonical Zod schemas, concept link consistency, DAG cycle check, and educational block requirements.
2. `pnpm content:check-links`: Referential integrity between subjects, modules, topics, concepts, lessons, and quizzes.
3. `pnpm content:check-code`: Direct compilation & execution via `gcc -std=c11`, `g++ -std=c++17`, `python3`, and `sqlite3`.
4. `pnpm typecheck` & `pnpm test`: Full TypeScript strictness and Vitest coverage.
