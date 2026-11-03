# Lumenode Curriculum Map & Hierarchy Specification

## 1. Curriculum Hierarchy

Lumenode structures its educational catalog through a clean 7-tier hierarchy:

```
Platform (Lumenode)
  └── Learning Division (Programming Languages | Core CS | Laboratories)
       └── Subject (e.g., C Programming, Data Structures & Algorithms, DBMS)
            └── Module (e.g., Linear Data Structures, Heap & Dynamic Allocation)
                 └── Topic (e.g., Linked Lists, Pointer Arithmetic)
                      └── Concept (Canonical Knowledge Unit, e.g. dsa.singly-linked-list)
                           └── Lesson (Structured lesson with interactive blocks)
                                └── Exercise (Interactive quiz or coding laboratory)
```

---

## 2. Subjects & Module Breakdown

### 2.1 C Programming (`c-lang`)
*Focus: Low-level systems foundations, memory addresses, pointer arithmetic, and heap allocation.*

- **Module 1: C Systems Foundations (`c-mod-fundamentals`)**
  - Topic: Data Types & Byte Sizing (`c-top-types`)
    - Concept: `c.types-variables`
    - Lesson: *Primitive Data Types & Memory Sizing in C* (`c-lesson-01`)
  - Topic: Pointer Mechanics (`c-top-pointers`)
    - Concept: `memory.pointers-intro`
    - Lesson: *Pointer Mechanics & Virtual Memory Addressing* (`c-lesson-02`)
- **Module 2: Pointers & Dynamic Allocation (`c-mod-memory`)**
  - Topic: Pointer Arithmetic & Arrays (`c-top-ptr-arithmetic`)
    - Concept: `c.pointer-arithmetic`
    - Lesson: *Pointer Arithmetic & Array Memory Decay* (`c-lesson-03`)
  - Topic: Heap Allocation & Structures (`c-top-dynamic-mem`)
    - Concepts: `memory.stack-vs-heap`, `memory.dynamic-allocation`, `c.structures`
    - Lesson: *Dynamic Memory Allocation with malloc and free* (`c-lesson-04`)
    - Lesson: *Composite Structures and Memory Alignment Padding* (`c-lesson-05`)

---

### 2.2 C++ Systems & OOP (`cpp-lang`)
*Focus: RAII resource management, object lifecycle, inheritance, and virtual dispatch.*

- **Module 1: C++ Object-Oriented Design (`cpp-mod-oop`)**
  - Topic: Classes & RAII (`cpp-top-classes`)
    - Concept: `oops.classes-objects`, `cpp.constructors-destructors`, `oops.raii`
    - Lesson: *Classes, Object Layout & Member Visibility* (`cpp-lesson-01`)
    - Lesson: *Constructors, Destructors & The Rule of Three/Five* (`cpp-lesson-02`)
    - Lesson: *RAII and Smart Pointers (unique_ptr, shared_ptr)* (`cpp-lesson-03`)
  - Topic: Inheritance & Dynamic Dispatch (`cpp-top-inheritance`)
    - Concepts: `oops.inheritance`, `oops.polymorphism`
    - Lesson: *Class Inheritance & Object Memory Slicing* (`cpp-lesson-04`)
    - Lesson: *Virtual Functions, VTables & Dynamic Dispatch* (`cpp-lesson-05`)

---

### 2.3 Python Programming (`python-lang`)
*Focus: Python object model, PyObject heap references, and dynamic typing mechanics.*

- **Module 1: Python Core Mechanics (`py-mod-core`)**
  - Topic: Object Model & References (`py-top-references`)
    - Concept: `python.references-identity`
    - Lesson: *Python Object Model & Reference Semantics* (`python-lesson-01`)
  - Topic: Classes & Inheritance (`py-top-oop`)
    - Concepts: `oops.classes-objects`, `oops.inheritance`
    - Lesson: *Python Classes, Dunder Methods & MRO Resolution* (`python-lesson-02`)

---

### 2.4 Data Structures & Algorithms (`dsa`)
*Focus: Algorithmic complexity, linear topologies, search trees, and asymptotic analysis.*

- **Module 1: Linear Data Structures (`dsa-mod-linear`)**
  - Topic: Linked Lists (`dsa-top-lists`)
    - Concept: `dsa.singly-linked-list`
    - Lesson: *Singly Linked Lists: Node Topologies & Pointer Manipulation* (`dsa-lesson-01`)
  - Topic: Stacks and Queues (`dsa-top-stacks-queues`)
    - Concept: `dsa.stacks-queues`
    - Lesson: *Stacks, Queues & Call-Stack Mechanics* (`dsa-lesson-02`)
- **Module 2: Searching, Trees & Graphs (`dsa-mod-search-sort`)**
  - Topic: Binary Search Algorithm (`dsa-top-search`)
    - Concept: `dsa.binary-search`
    - Lesson: *Binary Search & Logarithmic Interval Bisection* (`dsa-lesson-03`)
  - Topic: Binary Trees & Traversals (`dsa-top-trees`)
    - Concept: `dsa.binary-trees`
    - Lesson: *Binary Trees & Recursive Tree Traversals* (`dsa-lesson-04`)

---

### 2.5 Database Management Systems (`dbms`)
*Focus: Relational model, relational algebra, SQL design, indexing, transactions, and ACID guarantees.*

- **Module 1: Relational Core & SQL Design (`dbms-mod-relational`)**
  - Topic: Relational Foundations & Keys (`dbms-top-model`)
    - Concept: `dbms.relational-model`
    - Lesson: *Relational Model, Primary Keys & Foreign Key Constraints* (`dbms-lesson-01`)
  - Topic: Relational Joins (`dbms-top-joins`)
    - Concept: `dbms.joins`
    - Lesson: *Relational Joins: Inner, Left, Full & Hash Join Execution* (`dbms-lesson-02`)
  - Topic: Normalization, ACID & Indexing (`dbms-top-normal-acid`)
    - Concepts: `dbms.normalization`, `dbms.transactions`, `dbms.indexing`
    - Lesson: *Database Normalization: From 1NF to BCNF* (`dbms-lesson-03`)
    - Lesson: *Transactions, ACID Guarantees & B+ Tree Indexing* (`dbms-lesson-04`)

---

## 3. Curriculum Matrix Summary

| Subject | Modules | Topics | Canonical Concepts | Initial Lessons |
| :--- | :--- | :--- | :--- | :--- |
| **C Programming** | 2 | 4 | 5 | 5 |
| **C++ Systems & OOP** | 1 | 2 | 5 | 5 |
| **Python Programming** | 1 | 2 | 3 | 2 |
| **Data Structures & Algorithms** | 2 | 4 | 4 | 4 |
| **Database Management Systems** | 1 | 3 | 4 | 4 |
| **Total Platform Initial Catalog** | **9 Modules** | **19 Topics** | **21 Concepts** | **20 Lessons** |
