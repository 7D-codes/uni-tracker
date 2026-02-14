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
  requirements?: string; // JSON string
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
  profileItemType?: string; // Links to profile field (e.g., 'sat_actual', 'transcript_status')
  completedAt?: string;
  createdAt: string;
}

export interface Profile {
  id: number;
  satTarget?: number;
  satActual?: number;
  ieltsScore?: number;
  toeflScore?: number;
  transcriptStatus: 'missing' | 'requested' | 'received' | 'submitted';
  recommendationsCount: number;
  statementStatus: 'not_started' | 'drafting' | 'reviewing' | 'complete';
  feeBudget?: number;
  updatedAt: string;
}

// University requirements structure
export interface UniversityRequirements {
  sat?: { required: boolean; minScore?: number; avgScore?: number };
  ielts?: { required: boolean; minScore?: number };
  toefl?: { required: boolean; minScore?: number };
  transcripts?: { required: boolean; count?: number };
  recommendations?: { required: boolean; count?: number };
  essays?: { required: boolean; count?: number };
  interview?: { required: boolean };
  applicationFee?: { amount?: number; waiverAvailable?: boolean };
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
  
  // Run migrations
  await runMigrations();
  
  initialized = true;
}

async function runMigrations() {
  // Get current schema version
  await run(db, `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    )
  `);
  
  const migrationRow = await get<{ maxVersion: number }>(db, 'SELECT MAX(version) as maxVersion FROM schema_migrations');
  const currentVersion = migrationRow?.maxVersion || 0;
  
  console.log(`📦 Database schema version: ${currentVersion}`);
  
  // Migration 1: Initial schema (creates universities and tasks tables)
  if (currentVersion < 1) {
    console.log('🔄 Running migration 1: Initial schema...');
    
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

    await run(db, 'CREATE INDEX IF NOT EXISTS idx_universities_status ON universities(status)');
    await run(db, 'CREATE INDEX IF NOT EXISTS idx_universities_priority ON universities(priority)');
    await run(db, 'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');
    await run(db, 'CREATE INDEX IF NOT EXISTS idx_tasks_universityId ON tasks(universityId)');
    
    // Insert seed data if empty
    const count = await get<{ count: number }>(db, 'SELECT COUNT(*) as count FROM universities');
    if (count && count.count === 0) {
      await insertSeedData();
    }
    
    await run(db, 'INSERT INTO schema_migrations (version, appliedAt) VALUES (?, ?)', [1, new Date().toISOString()]);
    console.log('✅ Migration 1 complete');
  }
  
  // Migration 2: Add profile table and update universities with requirements
  if (currentVersion < 2) {
    console.log('🔄 Running migration 2: Add profile table and requirements field...');
    
    // Add requirements JSON column to universities
    try {
      await run(db, 'ALTER TABLE universities ADD COLUMN requirements TEXT');
      console.log('✅ Added requirements column to universities');
    } catch (e) {
      // Column may already exist
      console.log('ℹ️ requirements column already exists');
    }
    
    // Create profile table
    await run(db, `
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        satTarget INTEGER,
        satActual INTEGER,
        ieltsScore REAL,
        toeflScore INTEGER,
        transcriptStatus TEXT NOT NULL DEFAULT 'missing',
        recommendationsCount INTEGER NOT NULL DEFAULT 0,
        statementStatus TEXT NOT NULL DEFAULT 'not_started',
        feeBudget INTEGER,
        updatedAt TEXT NOT NULL
      )
    `);
    
    // Create index on profile
    await run(db, 'CREATE INDEX IF NOT EXISTS idx_profile_id ON profile(id)');
    
    // Add profile_item_type to tasks table
    try {
      await run(db, 'ALTER TABLE tasks ADD COLUMN profileItemType TEXT');
      console.log('✅ Added profileItemType column to tasks');
    } catch (e) {
      console.log('ℹ️ profileItemType column already exists');
    }
    
    // Create index for profile item type
    await run(db, 'CREATE INDEX IF NOT EXISTS idx_tasks_profileItemType ON tasks(profileItemType)');
    
    // Populate requirements for existing universities
    await populateUniversityRequirements();
    
    await run(db, 'INSERT INTO schema_migrations (version, appliedAt) VALUES (?, ?)', [2, new Date().toISOString()]);
    console.log('✅ Migration 2 complete');
  }
}

async function populateUniversityRequirements() {
  console.log('🔄 Populating requirements for existing universities...');
  
  const universities = await all<University>(db, 'SELECT * FROM universities');
  
  for (const uni of universities) {
    const requirements: UniversityRequirements = {};
    
    if (uni.satAvg || uni.satMin) {
      requirements.sat = { 
        required: true, 
        minScore: uni.satMin || undefined,
        avgScore: uni.satAvg || undefined
      };
    }
    
    if (uni.ieltsMin || uni.ieltsAvg) {
      requirements.ielts = { 
        required: true, 
        minScore: uni.ieltsMin || uni.ieltsAvg || undefined 
      };
    }
    
    if (uni.toeflMin) {
      requirements.toefl = { required: true, minScore: uni.toeflMin };
    }
    
    if (uni.recLettersRequired) {
      requirements.recommendations = { required: true, count: uni.recLettersRequired };
    }
    
    if (uni.essaysRequired) {
      requirements.essays = { required: true, count: uni.essaysRequired };
    }
    
    if (uni.interviewRequired) {
      requirements.interview = { required: true };
    }
    
    await run(db, 'UPDATE universities SET requirements = ? WHERE id = ?', [
      JSON.stringify(requirements),
      uni.id
    ]);
  }
  
  console.log(`✅ Updated ${universities.length} universities with requirements`);
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

// Profile Service
export const ProfileService = {
  async getProfile(): Promise<Profile | undefined> {
    await ensureInit();
    const row = await get<{
      id: number;
      satTarget: number | null;
      satActual: number | null;
      ieltsScore: number | null;
      toeflScore: number | null;
      transcriptStatus: string;
      recommendationsCount: number;
      statementStatus: string;
      feeBudget: number | null;
      updatedAt: string;
    }>(db, 'SELECT * FROM profile ORDER BY id LIMIT 1');
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      satTarget: row.satTarget || undefined,
      satActual: row.satActual || undefined,
      ieltsScore: row.ieltsScore || undefined,
      toeflScore: row.toeflScore || undefined,
      transcriptStatus: row.transcriptStatus as Profile['transcriptStatus'],
      recommendationsCount: row.recommendationsCount,
      statementStatus: row.statementStatus as Profile['statementStatus'],
      feeBudget: row.feeBudget || undefined,
      updatedAt: row.updatedAt
    };
  },

  async createDefaultProfile(): Promise<Profile> {
    await ensureInit();
    const now = new Date().toISOString();
    
    const result = await run(db, `
      INSERT INTO profile (transcriptStatus, recommendationsCount, statementStatus, updatedAt)
      VALUES (?, ?, ?, ?)
    `, ['missing', 0, 'not_started', now]);
    
    return this.getProfileById(result.lastID)!;
  },

  async getProfileById(id: number): Promise<Profile | undefined> {
    await ensureInit();
    const row = await get<{
      id: number;
      satTarget: number | null;
      satActual: number | null;
      ieltsScore: number | null;
      toeflScore: number | null;
      transcriptStatus: string;
      recommendationsCount: number;
      statementStatus: string;
      feeBudget: number | null;
      updatedAt: string;
    }>(db, 'SELECT * FROM profile WHERE id = ?', [id]);
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      satTarget: row.satTarget || undefined,
      satActual: row.satActual || undefined,
      ieltsScore: row.ieltsScore || undefined,
      toeflScore: row.toeflScore || undefined,
      transcriptStatus: row.transcriptStatus as Profile['transcriptStatus'],
      recommendationsCount: row.recommendationsCount,
      statementStatus: row.statementStatus as Profile['statementStatus'],
      feeBudget: row.feeBudget || undefined,
      updatedAt: row.updatedAt
    };
  },

  async updateProfile(updates: Partial<Omit<Profile, 'id' | 'updatedAt'>>): Promise<Profile> {
    await ensureInit();
    
    // Get or create profile
    let profile = await this.getProfile();
    if (!profile) {
      profile = await this.createDefaultProfile();
    }
    
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];
    
    if ('satTarget' in updates) {
      fields.push('satTarget = ?');
      values.push(updates.satTarget ?? null);
    }
    if ('satActual' in updates) {
      fields.push('satActual = ?');
      values.push(updates.satActual ?? null);
    }
    if ('ieltsScore' in updates) {
      fields.push('ieltsScore = ?');
      values.push(updates.ieltsScore ?? null);
    }
    if ('toeflScore' in updates) {
      fields.push('toeflScore = ?');
      values.push(updates.toeflScore ?? null);
    }
    if ('transcriptStatus' in updates) {
      fields.push('transcriptStatus = ?');
      values.push(updates.transcriptStatus);
    }
    if ('recommendationsCount' in updates) {
      fields.push('recommendationsCount = ?');
      values.push(updates.recommendationsCount);
    }
    if ('statementStatus' in updates) {
      fields.push('statementStatus = ?');
      values.push(updates.statementStatus);
    }
    if ('feeBudget' in updates) {
      fields.push('feeBudget = ?');
      values.push(updates.feeBudget ?? null);
    }
    
    if (fields.length === 0) return profile;
    
    fields.push('updatedAt = ?');
    values.push(now);
    values.push(profile.id);
    
    await run(db, `UPDATE profile SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return this.getProfileById(profile.id)!;
  },

  // Calculate overall readiness percentage
  async getReadinessScore(): Promise<{ score: number; total: number; completed: number; items: Array<{name: string; complete: boolean; status: string}> }> {
    await ensureInit();
    const profile = await this.getProfile();
    
    if (!profile) {
      return { score: 0, total: 6, completed: 0, items: [] };
    }
    
    const items = [
      { name: 'SAT Score', complete: !!profile.satActual, status: profile.satActual ? `Score: ${profile.satActual}` : 'Missing' },
      { name: 'IELTS/TOEFL', complete: !!(profile.ieltsScore || profile.toeflScore), status: profile.ieltsScore ? `IELTS: ${profile.ieltsScore}` : profile.toeflScore ? `TOEFL: ${profile.toeflScore}` : 'Missing' },
      { name: 'Transcripts', complete: profile.transcriptStatus === 'received' || profile.transcriptStatus === 'submitted', status: profile.transcriptStatus },
      { name: 'Recommendations', complete: profile.recommendationsCount > 0, status: `${profile.recommendationsCount} received` },
      { name: 'Personal Statement', complete: profile.statementStatus === 'complete', status: profile.statementStatus },
      { name: 'Application Fee', complete: !!profile.feeBudget, status: profile.feeBudget ? `Budget: $${profile.feeBudget}` : 'No budget set' }
    ];
    
    const completed = items.filter(i => i.complete).length;
    const score = Math.round((completed / items.length) * 100);
    
    return { score, total: items.length, completed, items };
  }
};

// Task Generation Logic
export const TaskGenerator = {
  // Generate tasks based on university requirements vs profile completeness
  async generateTasksForUniversity(universityId: number): Promise<Task[]> {
    await ensureInit();
    
    const university = await UniversityService.getById(universityId);
    if (!university) throw new Error('University not found');
    
    const profile = await ProfileService.getProfile() || await ProfileService.createDefaultProfile();
    const requirements: UniversityRequirements = university.requirements ? JSON.parse(university.requirements) : {};
    
    const tasks: Task[] = [];
    const now = new Date().toISOString();
    
    // Calculate due date (30 days before deadline if available, otherwise 30 days from now)
    let dueDate: string | undefined;
    if (university.deadlineEarly || university.deadlineRegular) {
      const deadline = new Date(university.deadlineEarly || university.deadlineRegular!);
      deadline.setDate(deadline.getDate() - 30);
      dueDate = deadline.toISOString().split('T')[0];
    }
    
    // Check SAT requirement
    if (requirements.sat?.required && !profile.satActual) {
      const task = await TaskService.create({
        universityId: university.id,
        title: `Take SAT for ${university.name}`,
        description: `${university.name} requires SAT${requirements.sat.avgScore ? ` (avg: ${requirements.sat.avgScore})` : ''}${requirements.sat.minScore ? ` (min: ${requirements.sat.minScore})` : ''}. Schedule and take the test.`,
        dueDate,
        status: 'suggested',
        priority: 'high',
        profileItemType: 'sat_actual'
      });
      tasks.push(task);
    } else if (requirements.sat?.required && profile.satActual && requirements.sat.minScore && profile.satActual < requirements.sat.minScore) {
      const task = await TaskService.create({
        universityId: university.id,
        title: `Retake SAT for ${university.name}`,
        description: `Your score (${profile.satActual}) is below the minimum required (${requirements.sat.minScore}) for ${university.name}. Consider retaking.`,
        dueDate,
        status: 'suggested',
        priority: 'high',
        profileItemType: 'sat_actual'
      });
      tasks.push(task);
    }
    
    // Check IELTS/TOEFL requirement
    if ((requirements.ielts?.required || requirements.toefl?.required) && !(profile.ieltsScore || profile.toeflScore)) {
      const task = await TaskService.create({
        universityId: university.id,
        title: `Take English Proficiency Test for ${university.name}`,
        description: `${university.name} requires ${requirements.ielts?.required ? 'IELTS' : 'TOEFL'}${requirements.ielts?.minScore ? ` (min: ${requirements.ielts.minScore})` : requirements.toefl?.minScore ? ` (min: ${requirements.toefl.minScore})` : ''}.`,
        dueDate,
        status: 'suggested',
        priority: 'high',
        profileItemType: profile.ieltsScore ? 'ieltsScore' : 'toeflScore'
      });
      tasks.push(task);
    }
    
    // Check Transcripts requirement
    if (requirements.transcripts?.required && profile.transcriptStatus === 'missing') {
      const task = await TaskService.create({
        universityId: university.id,
        title: `Request transcripts for ${university.name}`,
        description: `${university.name} requires transcripts. Contact your school to request official transcripts.`,
        dueDate,
        status: 'suggested',
        priority: 'high',
        profileItemType: 'transcriptStatus'
      });
      tasks.push(task);
    }
    
    // Check Recommendations requirement
    if (requirements.recommendations?.required) {
      const requiredCount = requirements.recommendations.count || 1;
      if (profile.recommendationsCount < requiredCount) {
        const task = await TaskService.create({
          universityId: university.id,
          title: `Request recommendation letters for ${university.name}`,
          description: `${university.name} requires ${requiredCount} recommendation letter(s). You currently have ${profile.recommendationsCount}. Contact teachers or mentors.`,
          dueDate,
          status: 'suggested',
          priority: 'high',
          profileItemType: 'recommendationsCount'
        });
        tasks.push(task);
      }
    }
    
    // Check Essays requirement
    if (requirements.essays?.required && profile.statementStatus === 'not_started') {
      const task = await TaskService.create({
        universityId: university.id,
        title: `Write essays for ${university.name}`,
        description: `${university.name} requires ${requirements.essays.count || 1} essay(s). Start drafting your personal statement and supplemental essays.`,
        dueDate,
        status: 'suggested',
        priority: 'medium',
        profileItemType: 'statementStatus'
      });
      tasks.push(task);
    }
    
    // Check Interview requirement
    if (requirements.interview?.required) {
      const task = await TaskService.create({
        universityId: university.id,
        title: `Prepare for interview at ${university.name}`,
        description: `${university.name} requires an interview. Research common questions and practice your responses.`,
        dueDate,
        status: 'suggested',
        priority: 'medium',
        profileItemType: undefined
      });
      tasks.push(task);
    }
    
    return tasks;
  },

  // Generate tasks when profile is updated
  async generateTasksForProfileUpdate(updatedFields: (keyof Profile)[]): Promise<Task[]> {
    await ensureInit();
    
    const profile = await ProfileService.getProfile();
    if (!profile) return [];
    
    const universities = await UniversityService.getAll();
    const tasks: Task[] = [];
    
    for (const university of universities) {
      const requirements: UniversityRequirements = university.requirements ? JSON.parse(university.requirements) : {};
      let shouldGenerate = false;
      
      // Check if any updated field is related to requirements
      if (updatedFields.includes('satActual') && requirements.sat?.required) shouldGenerate = true;
      if ((updatedFields.includes('ieltsScore') || updatedFields.includes('toeflScore')) && (requirements.ielts?.required || requirements.toefl?.required)) shouldGenerate = true;
      if (updatedFields.includes('transcriptStatus') && requirements.transcripts?.required) shouldGenerate = true;
      if (updatedFields.includes('recommendationsCount') && requirements.recommendations?.required) shouldGenerate = true;
      if (updatedFields.includes('statementStatus') && requirements.essays?.required) shouldGenerate = true;
      
      if (shouldGenerate) {
        // Check for existing suggested tasks for this university
        const existingTasks = await TaskService.getByUniversity(university.id);
        const hasSuggestedTasks = existingTasks.some(t => t.status === 'suggested');
        
        if (!hasSuggestedTasks) {
          const newTasks = await this.generateTasksForUniversity(university.id);
          tasks.push(...newTasks);
        }
      }
    }
    
    return tasks;
  }
};

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
    
    // Build requirements JSON from individual fields if provided
    const requirements: UniversityRequirements = {};
    if (university.satMin || university.satAvg) {
      requirements.sat = { required: true, minScore: university.satMin, avgScore: university.satAvg };
    }
    if (university.ieltsMin || university.ieltsAvg) {
      requirements.ielts = { required: true, minScore: university.ieltsMin || university.ieltsAvg };
    }
    if (university.toeflMin) {
      requirements.toefl = { required: true, minScore: university.toeflMin };
    }
    if (university.recLettersRequired) {
      requirements.recommendations = { required: true, count: university.recLettersRequired };
    }
    if (university.essaysRequired) {
      requirements.essays = { required: true, count: university.essaysRequired };
    }
    if (university.interviewRequired) {
      requirements.interview = { required: true };
    }
    
    const result = await run(db, `
      INSERT INTO universities (
        name, country, program, major, ranking, deadlineEarly, deadlineRegular, deadlineTransfer,
        satMin, satAvg, ieltsMin, ieltsAvg, toeflMin, gpaMin,
        applicationPortal, applicationUrl, essaysRequired, recLettersRequired, interviewRequired,
        status, priority, notes, applicationSubmitted, decisionReceived, decisionResult,
        requirements, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      university.name, university.country, university.program, university.major,
      university.ranking || null, university.deadlineEarly || null, university.deadlineRegular || null, 
      university.deadlineTransfer || null, university.satMin || null, university.satAvg || null,
      university.ieltsMin || null, university.ieltsAvg || null, university.toeflMin || null, 
      university.gpaMin || null, university.applicationPortal || null, university.applicationUrl || null,
      university.essaysRequired || null, university.recLettersRequired || null, 
      university.interviewRequired || null, university.status, university.priority,
      university.notes || null, university.applicationSubmitted || null, 
      university.decisionReceived || null, university.decisionResult || null, 
      JSON.stringify(requirements), now, now
    ]);
    
    const newUni = await this.getById(result.lastID)!;
    
    // Auto-generate tasks for the new university
    try {
      await TaskGenerator.generateTasksForUniversity(result.lastID);
    } catch (e) {
      console.log('Failed to generate tasks for new university:', e);
    }
    
    return newUni;
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
      SELECT 
        id,
        universityId,
        title,
        description,
        dueDate,
        status,
        priority,
        profileItemType as profileItemType,
        completedAt,
        createdAt
      FROM tasks 
      ORDER BY 
        CASE status WHEN 'done' THEN 1 ELSE 0 END,
        CASE WHEN dueDate IS NULL THEN 1 ELSE 0 END,
        dueDate ASC
    `);
  },

  async getByUniversity(universityId: number): Promise<Task[]> {
    await ensureInit();
    return all<Task>(db, `
      SELECT 
        id,
        universityId,
        title,
        description,
        dueDate,
        status,
        priority,
        profileItemType as profileItemType,
        completedAt,
        createdAt
      FROM tasks WHERE universityId = ? ORDER BY dueDate ASC
    `, [universityId]);
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    await ensureInit();
    const now = new Date().toISOString();
    const result = await run(db, `
      INSERT INTO tasks (universityId, title, description, dueDate, status, priority, profileItemType, completedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task.universityId || null, task.title, task.description || null, 
      task.dueDate || null, task.status, task.priority, task.profileItemType || null,
      task.completedAt || null, now
    ]);
    
    return this.getById(result.lastID)!;
  },

  async getById(id: number): Promise<Task | undefined> {
    await ensureInit();
    return get<Task>(db, `
      SELECT 
        id,
        universityId,
        title,
        description,
        dueDate,
        status,
        priority,
        profileItemType as profileItemType,
        completedAt,
        createdAt
      FROM tasks WHERE id = ?
    `, [id]);
  },

  async update(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    await ensureInit();
    const fields: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'createdAt') {
        // Convert camelCase to snake_case for DB
        const dbField = key === 'profileItemType' ? 'profileItemType' : key;
        fields.push(`${dbField} = ?`);
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
