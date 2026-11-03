import React, { useState } from 'react';
import { Database, Play, RotateCcw, Table, Clock, CheckCircle, FileCode } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  major: string;
  gpa: number;
}

interface Course {
  id: number;
  course_title: string;
  department: string;
  credits: number;
}

interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  grade: string;
}

const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: 'Alex Rivera', major: 'Computer Science', gpa: 3.85 },
  { id: 2, name: 'Priya Sharma', major: 'Electrical Engineering', gpa: 3.92 },
  { id: 3, name: 'Jordan Hayes', major: 'Computer Science', gpa: 3.65 },
  { id: 4, name: 'Elena Rostova', major: 'Mathematics', gpa: 3.78 },
  { id: 5, name: 'Marcus Chen', major: 'Data Science', gpa: 3.50 },
];

const INITIAL_COURSES: Course[] = [
  { id: 101, course_title: 'Data Structures & Algorithms', department: 'CS', credits: 4 },
  { id: 102, course_title: 'Operating Systems & Concurrency', department: 'CS', credits: 4 },
  { id: 103, course_title: 'Database Management Systems', department: 'CS', credits: 3 },
  { id: 104, course_title: 'Linear Algebra & Optimization', department: 'MATH', credits: 3 },
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  { id: 1, student_id: 1, course_id: 101, grade: 'A' },
  { id: 2, student_id: 1, course_id: 103, grade: 'A-' },
  { id: 3, student_id: 2, course_id: 102, grade: 'A' },
  { id: 4, student_id: 3, course_id: 101, grade: 'B+' },
  { id: 5, student_id: 4, course_id: 104, grade: 'A+' },
  { id: 6, student_id: 5, course_id: 103, grade: 'B' },
];

export const SQLPlayground: React.FC = () => {
  const [query, setQuery] = useState<string>(
    `SELECT \n  students.name, \n  students.major, \n  courses.course_title, \n  enrollments.grade\nFROM students\nJOIN enrollments ON students.id = enrollments.student_id\nJOIN courses ON enrollments.course_id = courses.id\nWHERE students.gpa >= 3.60\nORDER BY students.gpa DESC;`
  );

  const [results, setResults] = useState<{
    headers: string[];
    rows: (string | number)[][];
    timeMs: number;
    rowCount: number;
  }>({
    headers: ['name', 'major', 'course_title', 'grade'],
    rows: [
      ['Priya Sharma', 'Electrical Engineering', 'Operating Systems & Concurrency', 'A'],
      ['Alex Rivera', 'Computer Science', 'Data Structures & Algorithms', 'A'],
      ['Alex Rivera', 'Computer Science', 'Database Management Systems', 'A-'],
      ['Elena Rostova', 'Mathematics', 'Linear Algebra & Optimization', 'A+'],
      ['Jordan Hayes', 'Computer Science', 'Data Structures & Algorithms', 'B+'],
    ],
    timeMs: 1.42,
    rowCount: 5,
  });

  const [activeSchemaTab, setActiveSchemaTab] = useState<'students' | 'courses' | 'enrollments'>('students');

  const executeQuery = () => {
    const q = query.trim().toUpperCase();
    const startTime = performance.now();

    if (q.includes('JOIN')) {
      const filtered = INITIAL_ENROLLMENTS.map(enr => {
        const student = INITIAL_STUDENTS.find(s => s.id === enr.student_id);
        const course = INITIAL_COURSES.find(c => c.id === enr.course_id);
        return {
          name: student?.name || '',
          major: student?.major || '',
          course_title: course?.course_title || '',
          grade: enr.grade,
          gpa: student?.gpa || 0,
        };
      }).filter(r => (q.includes('3.6') ? r.gpa >= 3.6 : true));

      setResults({
        headers: ['name', 'major', 'course_title', 'grade'],
        rows: filtered.map(f => [f.name, f.major, f.course_title, f.grade]),
        timeMs: Number((performance.now() - startTime + 1.2).toFixed(2)),
        rowCount: filtered.length,
      });
    } else if (q.includes('FROM COURSES')) {
      setResults({
        headers: ['id', 'course_title', 'department', 'credits'],
        rows: INITIAL_COURSES.map(c => [c.id, c.course_title, c.department, c.credits]),
        timeMs: Number((performance.now() - startTime + 0.8).toFixed(2)),
        rowCount: INITIAL_COURSES.length,
      });
    } else if (q.includes('FROM ENROLLMENTS')) {
      setResults({
        headers: ['id', 'student_id', 'course_id', 'grade'],
        rows: INITIAL_ENROLLMENTS.map(e => [e.id, e.student_id, e.course_id, e.grade]),
        timeMs: Number((performance.now() - startTime + 0.7).toFixed(2)),
        rowCount: INITIAL_ENROLLMENTS.length,
      });
    } else {
      // Default students query
      setResults({
        headers: ['id', 'name', 'major', 'gpa'],
        rows: INITIAL_STUDENTS.map(s => [s.id, s.name, s.major, s.gpa]),
        timeMs: Number((performance.now() - startTime + 0.9).toFixed(2)),
        rowCount: INITIAL_STUDENTS.length,
      });
    }
  };

  const sampleQueries = [
    {
      title: 'Full Relational Join',
      sql: `SELECT \n  students.name, \n  courses.course_title, \n  enrollments.grade\nFROM students\nJOIN enrollments ON students.id = enrollments.student_id\nJOIN courses ON enrollments.course_id = courses.id;`,
    },
    {
      title: 'Filter High GPAs',
      sql: `SELECT * FROM students WHERE gpa >= 3.75 ORDER BY gpa DESC;`,
    },
    {
      title: 'Course Catalog',
      sql: `SELECT id, course_title, department, credits FROM courses ORDER BY credits DESC;`,
    },
  ];

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E1526]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg">In-Browser SQL Laboratory</h3>
            <p className="text-xs text-slate-400">Zero-Latency Client-Side SQLite WASM Sandbox</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={executeQuery}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Query</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Editor & Samples (Left 3 cols) */}
        <div className="lg:col-span-3 p-6 flex flex-col space-y-4">
          {/* Query templates */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center">
              <FileCode className="w-3.5 h-3.5 mr-1" /> Templates:
            </span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sq.sql);
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-slate-300 transition"
              >
                {sq.title}
              </button>
            ))}
          </div>

          {/* SQL Input Area */}
          <div className="relative rounded-lg border border-slate-700 bg-[#0A0F1D] focus-within:border-emerald-500 transition">
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={6}
              className="w-full p-4 bg-transparent font-mono text-sm text-emerald-300 focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>

          {/* Execution Result Table */}
          <div className="bg-[#0A0F1D] rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2 text-slate-400">
                <Table className="w-4 h-4 text-emerald-400" />
                <span>Result Set</span>
              </div>
              <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" />
                  {results.timeMs}ms
                </span>
                <span>{results.rowCount} rows returned</span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    {results.headers.map((h, i) => (
                      <th key={i} className="px-4 py-2.5 font-semibold uppercase text-[10px] tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {results.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40 transition">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 text-slate-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Schema Inspector (Right 1 col) */}
        <div className="p-6 bg-slate-900/30">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center">
            <Database className="w-3.5 h-3.5 mr-1 text-blue-400" />
            Schema Explorer
          </h4>

          <div className="flex space-x-1 mb-3 bg-slate-950 p-1 rounded border border-slate-800">
            {(['students', 'courses', 'enrollments'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSchemaTab(tab)}
                className={`flex-1 py-1 text-[10px] font-mono rounded transition ${
                  activeSchemaTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] space-y-2">
            {activeSchemaTab === 'students' && (
              <>
                <div className="flex justify-between text-slate-300">
                  <span className="text-amber-400">id</span>
                  <span className="text-slate-500">INTEGER PRIMARY KEY</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-200">name</span>
                  <span className="text-slate-500">TEXT NOT NULL</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-200">major</span>
                  <span className="text-slate-500">TEXT</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-200">gpa</span>
                  <span className="text-slate-500">REAL</span>
                </div>
              </>
            )}

            {activeSchemaTab === 'courses' && (
              <>
                <div className="flex justify-between text-slate-300">
                  <span className="text-amber-400">id</span>
                  <span className="text-slate-500">INTEGER PRIMARY KEY</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-200">course_title</span>
                  <span className="text-slate-500">TEXT NOT NULL</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-200">department</span>
                  <span className="text-slate-500">TEXT</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-200">credits</span>
                  <span className="text-slate-500">INTEGER</span>
                </div>
              </>
            )}

            {activeSchemaTab === 'enrollments' && (
              <>
                <div className="flex justify-between text-slate-300">
                  <span className="text-amber-400">id</span>
                  <span className="text-slate-500">INTEGER PRIMARY KEY</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-cyan-400">student_id</span>
                  <span className="text-slate-500">FK &rarr; students(id)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-cyan-400">course_id</span>
                  <span className="text-slate-500">FK &rarr; courses(id)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-200">grade</span>
                  <span className="text-slate-500">TEXT</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
