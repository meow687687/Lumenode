import React, { useState, useEffect } from 'react';
import { Database, Play, Table, Clock, FileCode, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { sqlRunner, TableSchemas } from '../../services/sqlRunner';

export const SQLPlayground: React.FC = () => {
  const [query, setQuery] = useState<string>(
    `SELECT \n  students.name, \n  students.major, \n  courses.course_title, \n  enrollments.grade\nFROM students\nJOIN enrollments ON students.id = enrollments.student_id\nJOIN courses ON enrollments.course_id = courses.id\nWHERE students.gpa >= 3.60\nORDER BY students.gpa DESC;`
  );

  const [results, setResults] = useState<{
    columns: string[];
    values: (string | number | null)[][];
    timeMs: number;
    rowCount: number;
    rowsModified?: number;
    error?: string;
  }>({
    columns: [],
    values: [],
    timeMs: 0,
    rowCount: 0,
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [schemas, setSchemas] = useState<TableSchemas>({});
  const [activeSchemaTab, setActiveSchemaTab] = useState<string>('students');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize real SQLite WASM Worker on mount
  useEffect(() => {
    let mounted = true;
    sqlRunner.initialize()
      .then(loadedSchemas => {
        if (!mounted) return;
        setSchemas(loadedSchemas);
        setIsInitializing(false);
        // Run initial default query
        return sqlRunner.execute(query);
      })
      .then(initialRes => {
        if (!mounted || !initialRes) return;
        setResults({
          columns: initialRes.columns,
          values: initialRes.values,
          timeMs: initialRes.durationMs,
          rowCount: initialRes.rowCount,
          rowsModified: initialRes.rowsModified,
          error: initialRes.error,
        });
      })
      .catch(err => {
        if (!mounted) return;
        setIsInitializing(false);
        setResults(prev => ({
          ...prev,
          error: `Failed to initialize SQLite WASM: ${err.message}`,
        }));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const executeQuery = async () => {
    if (!query.trim()) return;
    setIsRunning(true);
    setStatusMessage(null);

    try {
      const res = await sqlRunner.execute(query);
      setResults({
        columns: res.columns,
        values: res.values,
        timeMs: res.durationMs,
        rowCount: res.rowCount,
        rowsModified: res.rowsModified,
        error: res.error,
      });
      // Refresh schemas in case user ran CREATE TABLE or ALTER TABLE
      setSchemas(sqlRunner.getSchemas());
    } catch (e: any) {
      setResults({
        columns: [],
        values: [],
        timeMs: 0,
        rowCount: 0,
        error: e.message || 'Execution failed',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsRunning(true);
    try {
      const freshSchemas = await sqlRunner.reset();
      setSchemas(freshSchemas);
      setStatusMessage('Database reset to canonical initial state.');
      setTimeout(() => setStatusMessage(null), 3000);
      // Re-run query
      await executeQuery();
    } catch (e: any) {
      setResults(prev => ({ ...prev, error: `Reset failed: ${e.message}` }));
    } finally {
      setIsRunning(false);
    }
  };

  const sampleQueries = [
    {
      title: 'Relational Join',
      sql: `SELECT \n  students.name, \n  courses.course_title, \n  enrollments.grade\nFROM students\nJOIN enrollments ON students.id = enrollments.student_id\nJOIN courses ON enrollments.course_id = courses.id;`,
    },
    {
      title: 'Filter & Order',
      sql: `SELECT name, major, gpa FROM students WHERE gpa >= 3.70 ORDER BY gpa DESC;`,
    },
    {
      title: 'Aggregate & Group By',
      sql: `SELECT \n  courses.department,\n  COUNT(*) as total_courses,\n  AVG(credits) as avg_credits\nFROM courses\nGROUP BY courses.department;`,
    },
    {
      title: 'Insert Record',
      sql: `INSERT INTO students (id, name, major, gpa) \nVALUES (6, 'Kavita Das', 'Artificial Intelligence', 3.96);\n\nSELECT * FROM students ORDER BY id DESC;`,
    },
  ];

  const availableTables = Object.keys(schemas);

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E1526] gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-100 text-lg">In-Browser SQL Laboratory</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                SQLite WASM Dedicated Worker
              </span>
            </div>
            <p className="text-xs text-slate-400">Authentic client-side relational SQL engine with instant execution</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetDatabase}
            disabled={isRunning || isInitializing}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Reset database to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset DB</span>
          </button>

          <button
            onClick={executeQuery}
            disabled={isRunning || isInitializing}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Executing...' : 'Run SQL'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="px-6 py-2 bg-emerald-950/60 border-b border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Editor & Results Area (Left 3 cols) */}
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
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-slate-300 transition cursor-pointer"
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
              placeholder="Enter SQLite query..."
            />
          </div>

          {/* Error Banner if Query Failed */}
          {results.error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 font-mono text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">SQLite Syntax / Execution Error:</span>
                <span>{results.error}</span>
              </div>
            </div>
          )}

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
                {results.rowsModified !== undefined && results.rowsModified > 0 && (
                  <span className="text-emerald-400 font-semibold">{results.rowsModified} rows modified</span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-60">
              {results.columns.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-slate-500">
                  {results.error
                    ? 'No records returned due to query error.'
                    : 'Query executed successfully with 0 result columns (or DDL statement).'}
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      {results.columns.map((h, i) => (
                        <th key={i} className="px-4 py-2.5 font-semibold uppercase text-[10px] tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {results.values.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40 transition">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 text-slate-200">
                            {cell === null ? (
                              <span className="text-slate-600 italic">NULL</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Real Schema Inspector (Right 1 col) */}
        <div className="p-6 bg-slate-900/30">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <Database className="w-3.5 h-3.5 mr-1 text-blue-400" />
              Live Database Schema
            </span>
            <span className="text-[10px] text-emerald-400 font-normal">SQLite In-Memory</span>
          </h4>

          {availableTables.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1 mb-3 bg-slate-950 p-1 rounded border border-slate-800">
                {availableTables.map(tableName => (
                  <button
                    key={tableName}
                    onClick={() => setActiveSchemaTab(tableName)}
                    className={`flex-1 min-w-[70px] py-1 text-[10px] font-mono rounded transition cursor-pointer text-center ${
                      activeSchemaTab === tableName ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tableName}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] space-y-2 max-h-72 overflow-y-auto">
                {schemas[activeSchemaTab]?.map(col => (
                  <div key={col.cid} className="flex justify-between items-center text-slate-300">
                    <span className={col.pk ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                      {col.name} {col.pk ? '(PK)' : ''}
                    </span>
                    <span className="text-slate-500 text-[10px]">{col.type}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-xs font-mono text-slate-500">
              {isInitializing ? 'Loading SQLite WASM...' : 'No tables exist.'}
            </div>
          )}

          <div className="mt-4 p-3 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Real SQLite WASM engine. Queries execute entirely in your browser thread worker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
