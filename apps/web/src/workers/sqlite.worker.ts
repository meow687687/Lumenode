/**
 * Dedicated Web Worker for SQLite WASM (via sql.js)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let isInitializing = false;

const INITIAL_SCHEMA_SQL = `
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    major TEXT NOT NULL,
    gpa REAL NOT NULL
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    course_title TEXT NOT NULL,
    department TEXT NOT NULL,
    credits INTEGER NOT NULL
);

CREATE TABLE enrollments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(course_id) REFERENCES courses(id)
);

INSERT INTO students (id, name, major, gpa) VALUES
(1, 'Alex Rivera', 'Computer Science', 3.85),
(2, 'Priya Sharma', 'Electrical Engineering', 3.92),
(3, 'Jordan Hayes', 'Computer Science', 3.65),
(4, 'Elena Rostova', 'Mathematics', 3.78),
(5, 'Marcus Chen', 'Data Science', 3.50);

INSERT INTO courses (id, course_title, department, credits) VALUES
(101, 'Data Structures & Algorithms', 'CS', 4),
(102, 'Operating Systems & Concurrency', 'CS', 4),
(103, 'Database Management Systems', 'CS', 3),
(104, 'Linear Algebra & Optimization', 'MATH', 3);

INSERT INTO enrollments (id, student_id, course_id, grade) VALUES
(1, 1, 101, 'A'),
(2, 1, 103, 'A-'),
(3, 2, 102, 'A'),
(4, 3, 101, 'B+'),
(5, 4, 104, 'A+'),
(6, 5, 103, 'B');
`;

async function getDatabase(): Promise<Database> {
  if (db) return db;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 50));
    }
    return db!;
  }

  isInitializing = true;
  try {
    SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`,
    });
    db = new SQL.Database();
    db.run(INITIAL_SCHEMA_SQL);
    return db;
  } finally {
    isInitializing = false;
  }
}

function getTableSchemas(database: Database) {
  const tablesResult = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
  const tableNames = tablesResult.length > 0 ? tablesResult[0].values.map(v => String(v[0])) : [];

  const schemaInfo: Record<string, { cid: number; name: string; type: string; notnull: number; dflt_value: any; pk: number }[]> = {};

  for (const tableName of tableNames) {
    const pragma = database.exec(`PRAGMA table_info("${tableName}");`);
    if (pragma.length > 0) {
      schemaInfo[tableName] = pragma[0].values.map(row => ({
        cid: Number(row[0]),
        name: String(row[1]),
        type: String(row[2]),
        notnull: Number(row[3]),
        dflt_value: row[4],
        pk: Number(row[5]),
      }));
    }
  }

  return schemaInfo;
}

self.onmessage = async (event: MessageEvent) => {
  const { type, id, sql } = event.data;

  if (type === 'INIT') {
    const startTime = performance.now();
    try {
      const database = await getDatabase();
      const schemas = getTableSchemas(database);
      self.postMessage({
        type: 'INIT_SUCCESS',
        id,
        schemas,
        durationMs: performance.now() - startTime,
      });
    } catch (err: any) {
      self.postMessage({
        type: 'INIT_ERROR',
        id,
        error: err?.message || String(err),
      });
    }
    return;
  }

  if (type === 'RESET') {
    try {
      if (db) {
        db.close();
      }
      db = new SQL!.Database();
      db.run(INITIAL_SCHEMA_SQL);
      const schemas = getTableSchemas(db);
      self.postMessage({
        type: 'RESET_SUCCESS',
        id,
        schemas,
      });
    } catch (err: any) {
      self.postMessage({
        type: 'RESET_ERROR',
        id,
        error: err?.message || String(err),
      });
    }
    return;
  }

  if (type === 'EXECUTE') {
    const startTime = performance.now();
    try {
      const database = await getDatabase();
      
      // Execute the real query through SQLite WASM
      const execResults = database.exec(sql);
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      const schemas = getTableSchemas(database);

      // Extract results
      const formattedResults = execResults.map(res => ({
        columns: res.columns,
        values: res.values,
      }));

      self.postMessage({
        type: 'EXECUTE_SUCCESS',
        id,
        results: formattedResults,
        schemas,
        durationMs,
        rowsModified: database.getRowsModified(),
      });
    } catch (err: any) {
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      self.postMessage({
        type: 'EXECUTE_ERROR',
        id,
        error: err?.message || String(err),
        durationMs,
      });
    }
  }
};
