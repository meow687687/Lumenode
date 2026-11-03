import { Module, Topic } from '../types';

export const MODULES: Module[] = [
  // C Modules
  {
    id: 'c-mod-fundamentals',
    subjectId: 'c-lang',
    title: 'C Systems Foundations',
    slug: 'c-fundamentals',
    description: 'Data types, memory representations, variables, and control flow in pure C.',
    order: 1,
    topicIds: ['c-top-types', 'c-top-pointers'],
  },
  {
    id: 'c-mod-memory',
    subjectId: 'c-lang',
    title: 'Pointers & Dynamic Allocation',
    slug: 'c-pointers-memory',
    description: 'Pointer arithmetic, arrays, heap allocation via malloc/free, and structures.',
    order: 2,
    topicIds: ['c-top-ptr-arithmetic', 'c-top-dynamic-mem'],
  },

  // C++ Modules
  {
    id: 'cpp-mod-oop',
    subjectId: 'cpp-lang',
    title: 'C++ Object-Oriented Design',
    slug: 'cpp-oop',
    description: 'Classes, encapsulation, constructors, destructors, and memory ownership.',
    order: 1,
    topicIds: ['cpp-top-classes', 'cpp-top-inheritance'],
  },

  // Python Modules
  {
    id: 'py-mod-core',
    subjectId: 'python-lang',
    title: 'Python Core Mechanics',
    slug: 'python-core',
    description: 'Names, bindings, collections, object model, and exceptions.',
    order: 1,
    topicIds: ['py-top-references', 'py-top-oop'],
  },

  // DSA Modules
  {
    id: 'dsa-mod-linear',
    subjectId: 'dsa',
    title: 'Linear Data Structures',
    slug: 'dsa-linear',
    description: 'Arrays, Singly/Doubly Linked Lists, Stacks, and Queues.',
    order: 1,
    topicIds: ['dsa-top-lists', 'dsa-top-stacks-queues'],
  },
  {
    id: 'dsa-mod-search-sort',
    subjectId: 'dsa',
    title: 'Searching, Trees & Graphs',
    slug: 'dsa-search-trees',
    description: 'Binary search, binary trees, traversals, and logarithmic algorithms.',
    order: 2,
    topicIds: ['dsa-top-search', 'dsa-top-trees'],
  },

  // Memory & Pointers Module
  {
    id: 'mem-mod-architecture',
    subjectId: 'memory-pointers',
    title: 'Memory Architecture & Allocation',
    slug: 'memory-architecture',
    description: 'Hardware memory hierarchy, stack frames, heap management, and pointer mechanics.',
    order: 1,
    topicIds: ['mem-top-stack-heap', 'mem-top-pointers'],
  },

  // OOP Module
  {
    id: 'oops-mod-concepts',
    subjectId: 'oops',
    title: 'Core Object-Oriented Principles',
    slug: 'oop-foundations',
    description: 'Classes, encapsulation, abstraction, inheritance models, and dynamic polymorphism.',
    order: 1,
    topicIds: ['oops-top-classes', 'oops-top-polymorphism'],
  },

  // DBMS Modules
  {
    id: 'dbms-mod-relational',
    subjectId: 'dbms',
    title: 'Relational Core & SQL Design',
    slug: 'dbms-relational-core',
    description: 'Relational model, primary/foreign keys, joins, and normal forms.',
    order: 1,
    topicIds: ['dbms-top-model', 'dbms-top-joins', 'dbms-top-normal-acid'],
  },
];

export const TOPICS: Topic[] = [
  // C Topics
  {
    id: 'c-top-types',
    moduleId: 'c-mod-fundamentals',
    title: 'Data Types & Byte Sizing',
    slug: 'types-sizing',
    description: 'Primitives, two-complement binary representation, and sizeof offsets.',
    order: 1,
    conceptIds: ['c.types-variables'],
  },
  {
    id: 'c-top-pointers',
    moduleId: 'c-mod-fundamentals',
    title: 'Pointer Mechanics',
    slug: 'pointers-mechanics',
    description: 'Virtual addresses, dereferencing, and pointer sizing.',
    order: 2,
    conceptIds: ['memory.pointers-intro'],
  },
  {
    id: 'c-top-ptr-arithmetic',
    moduleId: 'c-mod-memory',
    title: 'Pointer Arithmetic & Arrays',
    slug: 'pointer-arithmetic',
    description: 'Address offsets, array decay, and buffer iteration.',
    order: 1,
    conceptIds: ['c.pointer-arithmetic'],
  },
  {
    id: 'c-top-dynamic-mem',
    moduleId: 'c-mod-memory',
    title: 'Heap Allocation & Structures',
    slug: 'heap-structures',
    description: 'malloc, calloc, realloc, free, and composite structs.',
    order: 2,
    conceptIds: ['memory.stack-vs-heap', 'memory.dynamic-allocation', 'c.structures'],
  },

  // C++ Topics
  {
    id: 'cpp-top-classes',
    moduleId: 'cpp-mod-oop',
    title: 'Classes & RAII',
    slug: 'classes-raii',
    description: 'Encapsulation, constructors, destructors, and unique_ptr.',
    order: 1,
    conceptIds: ['oops.classes-objects', 'cpp.constructors-destructors', 'oops.raii'],
  },
  {
    id: 'cpp-top-inheritance',
    moduleId: 'cpp-mod-oop',
    title: 'Inheritance & Dynamic Dispatch',
    slug: 'inheritance-polymorphism',
    description: 'Derived classes, vtable pointers, and virtual method resolution.',
    order: 2,
    conceptIds: ['oops.inheritance', 'oops.polymorphism'],
  },

  // Python Topics
  {
    id: 'py-top-references',
    moduleId: 'py-mod-core',
    title: 'Object Model & References',
    slug: 'python-objects-refs',
    description: 'Names as reference labels, mutability, and object identity.',
    order: 1,
    conceptIds: ['python.references-identity'],
  },
  {
    id: 'py-top-oop',
    moduleId: 'py-mod-core',
    title: 'Classes & Inheritance',
    slug: 'python-oop',
    description: 'Python classes, __init__, super(), and MRO.',
    order: 2,
    conceptIds: ['oops.classes-objects', 'oops.inheritance'],
  },

  // DSA Topics
  {
    id: 'dsa-top-lists',
    moduleId: 'dsa-mod-linear',
    title: 'Linked Lists',
    slug: 'linked-lists',
    description: 'Singly and doubly linked lists, node links, and traversal.',
    order: 1,
    conceptIds: ['dsa.singly-linked-list'],
  },
  {
    id: 'dsa-top-stacks-queues',
    moduleId: 'dsa-mod-linear',
    title: 'Stacks and Queues',
    slug: 'stacks-and-queues',
    description: 'LIFO and FIFO operations, call stacks, and buffer pipelines.',
    order: 2,
    conceptIds: ['dsa.stacks-queues'],
  },
  {
    id: 'dsa-top-search',
    moduleId: 'dsa-mod-search-sort',
    title: 'Binary Search Algorithm',
    slug: 'binary-search',
    description: 'Divide and conquer, interval bisection, and complexity.',
    order: 1,
    conceptIds: ['dsa.binary-search'],
  },
  {
    id: 'dsa-top-trees',
    moduleId: 'dsa-mod-search-sort',
    title: 'Binary Trees & Traversals',
    slug: 'trees-traversals',
    description: 'Tree structures, Inorder/Preorder/Postorder DFS, and BFS.',
    order: 2,
    conceptIds: ['dsa.binary-trees'],
  },

  // Memory & Pointers Topics
  {
    id: 'mem-top-stack-heap',
    moduleId: 'mem-mod-architecture',
    title: 'Stack Frames & Heap Memory',
    slug: 'stack-heap-architecture',
    description: 'Call stack execution, stack overflow, virtual address spaces, and heap allocator internals.',
    order: 1,
    conceptIds: ['memory.stack-vs-heap', 'memory.dynamic-allocation'],
  },
  {
    id: 'mem-top-pointers',
    moduleId: 'mem-mod-architecture',
    title: 'Pointer Mechanics & Addresses',
    slug: 'pointers-addresses',
    description: 'Direct memory addressing, referencing, dereferencing, and alignment constraints.',
    order: 2,
    conceptIds: ['memory.pointers-intro'],
  },

  // OOP Topics
  {
    id: 'oops-top-classes',
    moduleId: 'oops-mod-concepts',
    title: 'Classes, Objects & RAII',
    slug: 'classes-encapsulation',
    description: 'Encapsulation, object lifecycles, and Resource Acquisition Is Initialization.',
    order: 1,
    conceptIds: ['oops.classes-objects', 'oops.raii'],
  },
  {
    id: 'oops-top-polymorphism',
    moduleId: 'oops-mod-concepts',
    title: 'Inheritance & Polymorphism',
    slug: 'inheritance-dynamic-dispatch',
    description: 'Class hierarchies, subtyping, and dynamic dispatch via vtables.',
    order: 2,
    conceptIds: ['oops.inheritance', 'oops.polymorphism'],
  },

  // DBMS Topics
  {
    id: 'dbms-top-model',
    moduleId: 'dbms-mod-relational',
    title: 'Relational Foundations & Keys',
    slug: 'relational-keys',
    description: 'Relations, primary keys, foreign keys, and integrity rules.',
    order: 1,
    conceptIds: ['dbms.relational-model'],
  },
  {
    id: 'dbms-top-joins',
    moduleId: 'dbms-mod-relational',
    title: 'Relational Joins',
    slug: 'relational-joins',
    description: 'INNER, LEFT, and FULL joins, execution strategies.',
    order: 2,
    conceptIds: ['dbms.joins'],
  },
  {
    id: 'dbms-top-normal-acid',
    moduleId: 'dbms-mod-relational',
    title: 'Normalization, ACID & B-Tree Indexing',
    slug: 'normalization-acid-indexing',
    description: '1NF-BCNF, ACID concurrency guarantees, and B+ Tree index structures.',
    order: 3,
    conceptIds: ['dbms.normalization', 'dbms.transactions', 'dbms.indexing'],
  },
];
