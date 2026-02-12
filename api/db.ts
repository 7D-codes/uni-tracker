import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'universities.json');

interface University {
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

interface Task {
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

interface Data {
  universities: University[];
  tasks: Task[];
  nextId: number;
}

const defaultData: Data = {
  universities: [
    {
      id: 1,
      name: 'University of London',
      country: 'UK',
      program: 'Undergraduate',
      major: 'Computer Science',
      deadlineRegular: '2026-03-30',
      status: 'accepted',
      priority: 'high',
      notes: 'Online via Coursera. Starts April 2026. Must complete registration by March 30.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'KFUPM (King Fahd University)',
      country: 'Saudi Arabia',
      program: 'Undergraduate',
      major: 'Computer Science',
      deadlineRegular: '2026-01-29',
      status: 'researching',
      priority: 'medium',
      notes: 'Primary track CLOSED. Olympiad track opens May 1. Secondary track TBA.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'KAUST',
      country: 'Saudi Arabia',
      program: 'Undergraduate',
      major: 'Computer Science',
      satAvg: 1400,
      ieltsMin: 6.5,
      status: 'researching',
      priority: 'medium',
      notes: 'Research deadlines for 2026/2027 intake.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'PMU (Prince Mohammad bin Fahd)',
      country: 'Saudi Arabia',
      program: 'Undergraduate',
      major: 'Computer Science',
      status: 'researching',
      priority: 'low',
      notes: 'Fall 2025 and Spring 2026 deadlines passed. Next intake: Summer/Fall 2026.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 7,
      name: 'IAU (Imam Abdulrahman bin Faisal)',
      country: 'Saudi Arabia',
      program: 'Undergraduate',
      major: 'Computer Science',
      status: 'researching',
      priority: 'low',
      notes: 'Research application deadlines.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  tasks: [],
  nextId: 8,
};

async function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Directory already exists
  }
}

async function readData(): Promise<Data> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

async function writeData(data: Data) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export const UniversityService = {
  async getAll() {
    const data = await readData();
    return data.universities.sort((a, b) => (a.ranking || 999) - (b.ranking || 999));
  },

  async getById(id: number) {
    const data = await readData();
    return data.universities.find(u => u.id === id);
  },

  async getByStatus(status: string) {
    const data = await readData();
    return data.universities.filter(u => u.status === status);
  },

  async create(university: Omit<University, 'id' | 'createdAt' | 'updatedAt'>) {
    const data = await readData();
    const newUni: University = {
      ...university,
      id: data.nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.universities.push(newUni);
    await writeData(data);
    return newUni;
  },

  async update(id: number, updates: Partial<University>) {
    const data = await readData();
    const index = data.universities.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    data.universities[index] = {
      ...data.universities[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await writeData(data);
    return data.universities[index];
  },

  async delete(id: number) {
    const data = await readData();
    data.universities = data.universities.filter(u => u.id !== id);
    await writeData(data);
    return true;
  },

  async getStats() {
    const data = await readData();
    return {
      total: data.universities.length,
      researching: data.universities.filter(u => u.status === 'researching').length,
      planning: data.universities.filter(u => u.status === 'planning').length,
      applied: data.universities.filter(u => u.status === 'applied').length,
      accepted: data.universities.filter(u => u.status === 'accepted').length,
      rejected: data.universities.filter(u => u.status === 'rejected').length,
    };
  },
};

export const TaskService = {
  async getAll() {
    const data = await readData();
    return data.tasks.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
    });
  },

  async getByUniversity(universityId: number) {
    const data = await readData();
    return data.tasks.filter(t => t.universityId === universityId);
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>) {
    const data = await readData();
    const newTask: Task = {
      ...task,
      id: data.nextId++,
      createdAt: new Date().toISOString(),
    };
    data.tasks.push(newTask);
    await writeData(data);
    return newTask;
  },

  async update(id: number, updates: Partial<Task>) {
    const data = await readData();
    const index = data.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    data.tasks[index] = { ...data.tasks[index], ...updates };
    await writeData(data);
    return data.tasks[index];
  },

  async delete(id: number) {
    const data = await readData();
    data.tasks = data.tasks.filter(t => t.id !== id);
    await writeData(data);
    return true;
  },
};
