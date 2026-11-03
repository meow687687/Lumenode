import { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  {
    id: 'c-pointers-basics',
    conceptId: 'memory.pointers-intro',
    languageId: 'c',
    title: 'Demystifying Pointers & Memory Addresses in C',
    slug: 'pointers-basics',
    summary: 'Understand memory as a contiguous byte sequence, address-of operator (&), and dereferencing (*).',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    order: 1,
    version: '1.0.0',
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Memory as an Indexed Array of Bytes'
      },
      {
        type: 'markdown',
        content: `Every variable declared in a C program occupies a specific slot in physical or virtual RAM. To write efficient, systems-level code, you must stop thinking of variables as abstract labels and view them as **fixed memory locations with hex addresses and byte widths**.`
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Fundamental Principle',
        content: 'A pointer is simply a variable whose stored value is the memory address of another variable. On modern 64-bit architectures, all pointers occupy exactly 8 bytes of space, regardless of the data type they point to!'
      },
      {
        type: 'code',
        language: 'c',
        title: 'inspect_address.c',
        code: `#include <stdio.h>

int main() {
    int age = 42;
    int *ptr = &age; // ptr holds the memory address of age

    printf("Value of age: %d\\n", age);
    printf("Address of age (&age): %p\\n", (void*)&age);
    printf("Value stored in ptr: %p\\n", (void*)ptr);
    printf("Dereferenced value (*ptr): %d\\n", *ptr);

    // Modify age via pointer dereference
    *ptr = 99;
    printf("New value of age: %d\\n", age);

    return 0;
}`,
        executable: true
      },
      {
        type: 'visualization',
        visualizerType: 'memory',
        config: {
          concept: 'pointers-stack-layout'
        }
      },
      {
        type: 'comparison',
        title: 'Operator Semantics Comparison',
        headers: ['Operator', 'Name', 'C Syntax Example', 'Underlying Operation'],
        rows: [
          ['&', 'Address-of', '&variable', 'Returns the hexadecimal memory offset where variable begins.'],
          ['*', 'Dereference', '*ptr', 'Reads from or writes to the byte sequence starting at the address.'],
          ['sizeof', 'Size Query', 'sizeof(ptr)', 'Returns pointer size (8 bytes on 64-bit systems, 4 on 32-bit).']
        ]
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-pointer-deref'
      }
    ]
  },
  {
    id: 'dsa-linked-list-basics',
    conceptId: 'dsa.singly-linked-list',
    languageId: 'c',
    title: 'Singly Linked Lists: Structure, Traversal & Insertion',
    slug: 'linked-list-basics',
    summary: 'Why dynamic node chaining eliminates the contiguous memory restrictions of standard arrays.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    order: 2,
    version: '1.0.0',
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'The Limitations of Contiguous Arrays'
      },
      {
        type: 'markdown',
        content: `While arrays offer instant **O(1)** random access via index arithmetic, inserting or deleting an element in the middle requires shifting every subsequent element, incurring **O(N)** time complexity. Furthermore, resizing a fixed buffer requires allocating a new block and copying data.

A **Singly Linked List** decouples memory storage: each node lives independently on the heap and maintains an explicit pointer link to its successor.`
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
    if (newNode == NULL) return NULL; // Check allocation failure
    newNode->data = value;
    newNode->next = NULL;
    return newNode;
}`,
        executable: true
      },
      {
        type: 'visualization',
        visualizerType: 'dsa',
        config: {
          structure: 'linked-list'
        }
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Memory Leaks & Lost References',
        content: 'When inserting or deleting nodes, the order of pointer assignments is critical! If you overwrite `prev->next` before storing `current->next`, the rest of the list is severed in memory and cannot be reached or freed.'
      },
      {
        type: 'quiz',
        exerciseId: 'quiz-linked-list-complexity'
      }
    ]
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
    order: 3,
    version: '1.0.0',
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Resource Acquisition Is Initialization (RAII)'
      },
      {
        type: 'markdown',
        content: `In traditional C, every \`malloc()\` demands a corresponding \`free()\`. If an exception occurs, or a function returns early, resources leak. 

Modern C++ solves this fundamentally via **RAII**: resources (heap memory, file handles, mutex locks) are encapsulated within stack-allocated objects. When the object leaves its lexical scope, its **destructor runs automatically**, guaranteeing leak-free cleanup.`
      },
      {
        type: 'code',
        language: 'cpp',
        title: 'unique_ptr_demo.cpp',
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
        // Automatically destroyed when exiting this nested block scope
        std::unique_ptr<Resource> ptr = std::make_unique<Resource>();
        ptr->work();
    } // <-- Destructor executes right here!

    std::cout << "Scope exited successfully.\\n";
    return 0;
}`,
        executable: true
      },
      {
        type: 'comparison',
        title: 'Raw Pointers vs. Modern C++ Smart Pointers',
        headers: ['Feature', 'Raw Pointer (*)', 'std::unique_ptr', 'std::shared_ptr'],
        rows: [
          ['Ownership', 'Undefined / Ambiguous', 'Exclusive single owner', 'Shared reference-counted owner'],
          ['Cleanup', 'Manual delete needed', 'Automatic on scope exit', 'Automatic when ref count hits 0'],
          ['Runtime Overhead', 'Zero', 'Zero (zero-cost abstraction)', 'Atomic counter overhead']
        ]
      }
    ]
  },
  {
    id: 'dbms-joins-relational',
    conceptId: 'dbms.joins',
    title: 'Relational Joins: Inner, Left & Cross Joins',
    slug: 'relational-joins',
    summary: 'How relational databases combine tables using set algebra and foreign key matches.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    order: 4,
    version: '1.0.0',
    sections: [
      {
        type: 'heading',
        level: 2,
        text: 'Connecting Entities Through Foreign Keys'
      },
      {
        type: 'markdown',
        content: `Relational databases avoid redundancy by normalizing data into separate tables. When querying information spanning multiple business domains (e.g. students and their course enrollments), we perform a **JOIN** operation over common identifier keys.`
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
        executable: true
      },
      {
        type: 'visualization',
        visualizerType: 'sql',
        config: {
          tableA: 'students',
          tableB: 'enrollments'
        }
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Try It in the SQL Playground',
        content: 'You can run, modify, and test this query right now in our built-in in-browser SQL playground!'
      }
    ]
  }
];
