import sqlite3 from 'sqlite3';
import path from 'path';
import os from 'os';
import { mkdir } from 'fs/promises';

// Store DB in ~/clawd/data/ for persistence across project moves
const DB_DIR = path.join(os.homedir(), 'clawd', 'data');
const DB_PATH = path.join(DB_DIR, 'uni-tracker.db');

export interface University {
  id: number;
  name: string;
  country: string;
  program: string;
  major: string;
  ranking?: number;
  deadlineEarly?: string;
  deadlineRegular?: string;
  deadlineTransfer?: string;
  satMin?: number;
  satAvg?: number;
  ieltsMin?: number;
  ieltsAvg?: number;
  toeflMin?: number;
  gpaMin?: number;
  applicationPortal?: string;
  applicationUrl?: string;
  essaysRequired?: number;
  recLettersRequired?: number;
  interviewRequired?: number;
  status: string;
  priority: string;
  notes?: string;
  applicationSubmitted?: string;
  decisionReceived?: string;
  decisionResult?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  universityId?: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  priority: string;
  completedAt?: string;
  createdAt: string;
}

// Promise wrapper for sqlite3
function run(db: sqlite3.Database, sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get<T>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

function all<T>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

// Initialize database
let db: sqlite3.Database;
let initialized = false;

async function initDb() {
  if (initialized) return;
  
  await mkdir(DB_DIR, { recursive: true });
  
  db = new sqlite3.Database(DB_PATH);
  
  // Create tables
  await run(db, `
    CREATE TABLE IF NOT EXISTS universities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      program TEXT NOT NULL,
      major TEXT NOT NULL,
      ranking INTEGER,
      deadlineEarly TEXT,
      deadlineRegular TEXT,
      deadlineTransfer TEXT,
      satMin INTEGER,
      satAvg INTEGER,
      ieltsMin REAL,
      ieltsAvg REAL,
      toeflMin INTEGER,
      gpaMin REAL,
      applicationPortal TEXT,
      applicationUrl TEXT,
      essaysRequired INTEGER,
      recLettersRequired INTEGER,
      interviewRequired INTEGER,
      status TEXT NOT NULL DEFAULT 'researching',
      priority TEXT NOT NULL DEFAULT 'medium',
      notes TEXT,
      applicationSubmitted TEXT,
      decisionReceived TEXT,
      decisionResult TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      universityId INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      dueDate TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      completedAt TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (universityId) REFERENCES universities(id) ON DELETE SET NULL
    )
  `);

  // Create indexes
  await run(db, 'CREATE INDEX IF NOT EXISTS idx_universities_status ON universities(status)');
  await run(db, 'CREATE INDEX IF NOT EXISTS idx_universities_priority ON universities(priority)');
  await run(db, 'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');
  await run(db, 'CREATE INDEX IF NOT EXISTS idx_tasks_universityId ON tasks(universityId)');

  // Insert seed data if empty
  const count = await get<{ count: number }>(db, 'SELECT COUNT(*) as count FROM universities');
  if (count && count.count === 0) {
    await insertSeedData();
  }

  initialized = true;
}

async function insertSeedData() {
  const now = new Date().toISOString();
  
  const seedUniversities = [
    {
      name: 'University of London',
      country: 'UK',
      program: 'Undergraduate',
      major: 'Computer Science',
      deadlineRegular: '2026-03-30',
      status: 'accepted',
      priority: 'high',
      notes: 'Online via Coursera. Starts April 2026. Must complete registration by March 30.',
    },
    {
      name: 'Stanford University',
      country: 'USA',
      program: 'Undergraduate',
      major: 'Computer Science',
      deadlineEarly: '2026-11-01',
      deadlineRegular: '2027-01-05',
      satAvg: 1500,
      ieltsAvg: 7.5,
      toeflMin: 100,
      applicationPortal: 'Common App',
      essaysRequired: 2,
      recLettersRequired: 2,
      status: 'planning',
      priority: 'high',
      notes: 'Freshman application only (Fall 2027). Mohammed has no college credits.',
    },
    {
      name: 'Oxford University',
      country: 'UK',
      program: 'Undergraduate',
      major: 'Computer Science',
      ieltsMin: 7.0,
      applicationPortal: 'UCAS',
      essaysRequired: 1,
      interviewRequired: 1,
      status: 'researching',
      priority: 'high',
      notes: 'Check deadlines for 2027 intake. Requires admissions test (MAT).',
    },
    {
      name: 'KFUPM (King Fahd University)',
      country: 'Saudi Arabia',
      program: 'Undergraduate',
      major: 'Computer Science',
      deadlineRegular: '2026-01-29',
      status: 'researching',
      priority: 'medium',
      notes: 'Primary track CLOSED. Olympiad track opens May 1. Secondary track TBA.',
    },
    {
      name: 'KAUST',
      country: 'Saudi Arabia',
      program: 'Undergraduate',
      major: 'Computer Science',
      satAvg: 1400,
      ieltsMin: 6.5,
      status: 'researching',
      priority: 'medium',
      notes: 'Research deadlines for 2026/2027 intake.',
    },
    {
      name: 'PMU (Prince Mohammad bin Fahd)',
      country: 'Saudi Arabia',
      program: 'Undergraduate',
      major: 'Computer Science',
      status: 'researching',
      priority: 'low',
      notes: 'Fall 2025 and Spring 2026 deadlines passed. Next intake: Summer/Fall 2026.',
    },
    {
      name: 'IAU (Imam Abdulrahman bin Faisal)',
      country: 'Saudi Arabia',
      program: 'Undergraduate',
      major: 'Computer Science',
      status: 'researching',
      priority: 'low',
      notes: 'Research application deadlines.',
    },
  ];

  for (const uni of seedUniversities) {
    await run(db, `
      INSERT INTO universities (
        name, country, program, major, deadlineRegular, deadlineEarly,
        satAvg, ieltsAvg, ieltsMin, toeflMin, applicationPortal,
        essaysRequired, recLettersRequired, interviewRequired,
        status, priority, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uni.name, uni.country, uni.program, uni.major, 
      uni.deadlineRegular || null, uni.deadlineEarly || null,
      uni.satAvg || null, uni.ieltsAvg || null, uni.ieltsMin || null, uni.toeflMin || null,
      uni.applicationPortal || null, uni.essaysRequired || null, uni.recLettersRequired || null, 
      uni.interviewRequired || null, uni.status, uni.priority, uni.notes || null, now, now
    ]);
  }
}

// Initialize on first use
async function ensureInit() {
  if (!initialized) {
    await initDb();
  }
}

// Force immediate initialization (call before starting server)
export async function initDatabase() {
  await ensureInit();
  console.log('✅ Database initialized');
}

export const UniversityService = {
  async getAll(): Promise<University[]> {
    await ensureInit();
    return all<University>(db, 'SELECT * FROM universities ORDER BY ranking ASC, name ASC');
  },

  async getById(id: number): Promise<University | undefined> {
    await ensureInit();
    return get<University>(db, 'SELECT * FROM universities WHERE id = ?', [id]);
  },

  async getByStatus(status: string): Promise<University[]> {
    await ensureInit();
    return all<University>(db, 'SELECT * FROM universities WHERE status = ? ORDER BY ranking ASC', [status]);
  },

  async create(university: Omit<University, 'id' | 'createdAt' | 'updatedAt'>): Promise<University> {
    await ensureInit();
    const now = new Date().toISOString();
    const result = await run(db, `
      INSERT INTO universities (
        name, country, program, major, ranking, deadlineEarly, deadlineRegular, deadlineTransfer,
        satMin, satAvg, ieltsMin, ieltsAvg, toeflMin, gpaMin,
        applicationPortal, applicationUrl, essaysRequired, recLettersRequired, interviewRequired,
        status, priority, notes, applicationSubmitted, decisionReceived, decisionResult,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      university.name, university.country, university.program, university.major,
      university.ranking || null, university.deadlineEarly || null, university.deadlineRegular || null, 
      university.deadlineTransfer || null, university.satMin || null, university.satAvg || null,
      university.ieltsMin || null, university.ieltsAvg || null, university.toeflMin || null, 
      university.gpaMin || null, university.applicationPortal || null, university.applicationUrl || null,
      university.essaysRequired || null, university.recLettersRequired || null, 
      university.interviewRequired || null, university.status, university.priority,
      university.notes || null, university.applicationSubmitted || null, 
      university.decisionReceived || null, university.decisionResult || null, now, now
    ]);
    
    return this.getById(result.lastID)!;
  },

  async update(id: number, updates: Partial<University>): Promise<University | undefined> {
    await ensureInit();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return this.getById(id);

    values.push(now, id);
    await run(db, `UPDATE universities SET ${fields.join(', ')}, updatedAt = ? WHERE id = ?`, values);
    return this.getById(id);
  },

  async delete(id: number): Promise<boolean> {
    await ensureInit();
    const result = await run(db, 'DELETE FROM universities WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async getStats() {
    await ensureInit();
    const total = await get<{ count: number }>(db, 'SELECT COUNT(*) as count FROM universities');
    const researching = await get<{ count: number }>(db, "SELECT COUNT(*) as count FROM universities WHERE status = 'researching'");
    const planning = await get<{ count: number }>(db, "SELECT COUNT(*) as count FROM universities WHERE status = 'planning'");
    const applied = await get<{ count: number }>(db, "SELECT COUNT(*) as count FROM universities WHERE status = 'applied'");
    const accepted = await get<{ count: number }>(db, "SELECT COUNT(*) as count FROM universities WHERE status = 'accepted'");
    const rejected = await get<{ count: number }>(db, "SELECT COUNT(*) as count FROM universities WHERE status = 'rejected'");

    return {
      total: total?.count || 0,
      researching: researching?.count || 0,
      planning: planning?.count || 0,
      applied: applied?.count || 0,
      accepted: accepted?.count || 0,
      rejected: rejected?.count || 0,
    };
  },
};

export const TaskService = {
  async getAll(): Promise<Task[]> {
    await ensureInit();
    return all<Task>(db, `
      SELECT * FROM tasks 
      ORDER BY 
        CASE status WHEN 'done' THEN 1 ELSE 0 END,
        CASE WHEN dueDate IS NULL THEN 1 ELSE 0 END,
        dueDate ASC
    `);
  },

  async getByUniversity(universityId: number): Promise<Task[]> {
    await ensureInit();
    return all<Task>(db, 'SELECT * FROM tasks WHERE universityId = ? ORDER BY dueDate ASC', [universityId]);
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    await ensureInit();
    const now = new Date().toISOString();
    const result = await run(db, `
      INSERT INTO tasks (universityId, title, description, dueDate, status, priority, completedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task.universityId || null, task.title, task.description || null, 
      task.dueDate || null, task.status, task.priority, task.completedAt || null, now
    ]);
    
    return this.getById(result.lastID)!;
  },

  async getById(id: number): Promise<Task | undefined> {
    await ensureInit();
    return get<Task>(db, 'SELECT * FROM tasks WHERE id = ?', [id]);
  },

  async update(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    await ensureInit();
    const fields: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return this.getById(id);

    values.push(id);
    await run(db, `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  },

  async delete(id: number): Promise<boolean> {
    await ensureInit();
    const result = await run(db, 'DELETE FROM tasks WHERE id = ?', [id]);
    return result.changes > 0;
  },
};
