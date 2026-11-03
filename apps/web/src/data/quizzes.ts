import { Exercise } from '../types';

export const EXERCISES: Record<string, Exercise> = {
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
    explanation: 'Dereferencing a pointer using `*p` reads and writes directly to the memory address stored in `p`. Thus, modifying `*p` directly modifies `a`.'
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
  }
};
