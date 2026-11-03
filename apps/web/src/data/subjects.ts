import { Subject } from '../types';

export const SUBJECTS: Subject[] = [
  // Programming Languages
  {
    id: 'c-lang',
    title: 'C Programming',
    slug: 'c',
    description: 'Master low-level programming, memory layout, pointers, and systems fundamentals.',
    category: 'programming-languages',
    icon: 'Terminal',
    order: 1,
    totalLessons: 12
  },
  {
    id: 'cpp-lang',
    title: 'C++ Systems & OOP',
    slug: 'cpp',
    description: 'High-performance programming, modern RAII, templates, STL, and type systems.',
    category: 'programming-languages',
    icon: 'Cpu',
    order: 2,
    totalLessons: 14
  },
  {
    id: 'python-lang',
    title: 'Python Programming',
    slug: 'python',
    description: 'High-level expressive syntax, dynamic data structures, scripting, and modular architecture.',
    category: 'programming-languages',
    icon: 'Code2',
    order: 3,
    totalLessons: 10
  },

  // Core Computer Science
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    slug: 'dsa',
    description: 'Arrays, linked lists, trees, graphs, dynamic programming, and complexity analysis.',
    category: 'core-cs',
    icon: 'Network',
    order: 4,
    totalLessons: 18
  },
  {
    id: 'memory-pointers',
    title: 'Pointers & Memory Architecture',
    slug: 'memory',
    description: 'Stack vs heap, pointer arithmetic, memory leaks, addresses, and dynamic allocation.',
    category: 'core-cs',
    icon: 'Layers',
    order: 5,
    totalLessons: 8
  },
  {
    id: 'oops',
    title: 'Object-Oriented Programming',
    slug: 'oops',
    description: 'Encapsulation, inheritance models, polymorphism, composition, and design patterns.',
    category: 'core-cs',
    icon: 'Boxes',
    order: 6,
    totalLessons: 9
  },
  {
    id: 'dbms',
    title: 'Database Management Systems',
    slug: 'dbms',
    description: 'Relational algebra, SQL query design, indexing, transactions, and ACID properties.',
    category: 'core-cs',
    icon: 'Database',
    order: 7,
    totalLessons: 11
  }
];
