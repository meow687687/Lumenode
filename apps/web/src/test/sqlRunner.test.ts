import { describe, it, expect, beforeAll } from 'vitest';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

describe('SQLite WASM Real Engine Verification', () => {
  let SQL: SqlJsStatic;
  let db: Database;

  beforeAll(async () => {
    SQL = await initSqlJs();
    db = new SQL.Database();
  });

  it('creates tables and executes real DDL statements', () => {
    db.run(`
      CREATE TABLE students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        major TEXT NOT NULL,
        gpa REAL NOT NULL
      );
    `);

    const tableQuery = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='students';");
    expect(tableQuery.length).toBe(1);
    expect(tableQuery[0].values[0][0]).toBe('students');
  });

  it('inserts records and retrieves them via SELECT with WHERE filter', () => {
    db.run(`
      INSERT INTO students (id, name, major, gpa) VALUES
      (1, 'Alex Rivera', 'Computer Science', 3.85),
      (2, 'Priya Sharma', 'Electrical Engineering', 3.92),
      (3, 'Marcus Chen', 'Data Science', 3.40);
    `);

    const res = db.exec('SELECT name, gpa FROM students WHERE gpa >= 3.80 ORDER BY gpa DESC;');
    expect(res.length).toBe(1);
    expect(res[0].columns).toEqual(['name', 'gpa']);
    expect(res[0].values).toEqual([
      ['Priya Sharma', 3.92],
      ['Alex Rivera', 3.85],
    ]);
  });

  it('updates records and changes actual database state', () => {
    db.run("UPDATE students SET gpa = 3.99 WHERE id = 1;");
    const res = db.exec('SELECT gpa FROM students WHERE id = 1;');
    expect(res[0].values[0][0]).toBe(3.99);
  });

  it('deletes records and reduces row count', () => {
    db.run("DELETE FROM students WHERE id = 3;");
    const res = db.exec('SELECT COUNT(*) as count FROM students;');
    expect(res[0].values[0][0]).toBe(2);
  });

  it('supports multi-table relational JOIN operations', () => {
    db.run(`
      CREATE TABLE courses (
        id INTEGER PRIMARY KEY,
        course_title TEXT NOT NULL
      );
      CREATE TABLE enrollments (
        id INTEGER PRIMARY KEY,
        student_id INTEGER,
        course_id INTEGER
      );
      INSERT INTO courses VALUES (101, 'Operating Systems');
      INSERT INTO enrollments VALUES (1, 1, 101);
    `);

    const joinRes = db.exec(`
      SELECT students.name, courses.course_title
      FROM students
      JOIN enrollments ON students.id = enrollments.student_id
      JOIN courses ON enrollments.course_id = courses.id;
    `);

    expect(joinRes.length).toBe(1);
    expect(joinRes[0].values[0]).toEqual(['Alex Rivera', 'Operating Systems']);
  });

  it('supports aggregate functions and GROUP BY', () => {
    const aggRes = db.exec('SELECT major, COUNT(*) as count, AVG(gpa) as avg_gpa FROM students GROUP BY major;');
    expect(aggRes.length).toBe(1);
    expect(aggRes[0].columns).toEqual(['major', 'count', 'avg_gpa']);
  });

  it('throws and surfaces real SQLite syntax errors on invalid queries', () => {
    expect(() => {
      db.exec('SELECT * FROM non_existent_table;');
    }).toThrow(/no such table/);
  });

  it('handles empty result sets gracefully without crashing', () => {
    const emptyRes = db.exec('SELECT * FROM students WHERE gpa > 5.0;');
    expect(emptyRes.length).toBe(0);
  });
});
