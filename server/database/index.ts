import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function initDatabase(): Promise<Database.Database> {
  const dbDir = path.dirname(config.dbPath);
  await fs.ensureDir(dbDir);

  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = OFF');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'hr_admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hackathons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      department TEXT DEFAULT 'Engineering',
      employment_type TEXT DEFAULT 'Full-time',
      experience_required TEXT DEFAULT '',
      skills_required TEXT DEFAULT '[]',
      location TEXT DEFAULT 'Remote',
      salary_range TEXT DEFAULT '',
      hiring_manager TEXT DEFAULT '',
      deadline TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      type TEXT DEFAULT 'hackathon',
      FOREIGN KEY (created_by) REFERENCES admin_users(id)
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT DEFAULT '',
      resume_path TEXT DEFAULT '',
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT 'N/A',
      linkedin_url TEXT DEFAULT '',
      portfolio_url TEXT DEFAULT '',
      skills TEXT DEFAULT '',
      education TEXT DEFAULT '',
      experience TEXT DEFAULT '',
      experience_years INTEGER DEFAULT 0,
      status TEXT DEFAULT 'applied',
      ai_match_score REAL DEFAULT 0,
      ai_screening_report TEXT DEFAULT '',
      job_id TEXT DEFAULT '',
      extracted_at TEXT NOT NULL DEFAULT (datetime('now')),
      applied_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(email, file_name, job_id)
    );

    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      hackathon_id TEXT NOT NULL,
      candidate_email TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      sent_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (hackathon_id) REFERENCES hackathons(id),
      UNIQUE(hackathon_id, candidate_email)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      hackathon_id TEXT NOT NULL,
      candidate_email TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      github_repo_url TEXT NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'pending',
      evaluation_id TEXT,
      FOREIGN KEY (hackathon_id) REFERENCES hackathons(id),
      UNIQUE(hackathon_id, candidate_email)
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL UNIQUE,
      hackathon_id TEXT NOT NULL,
      candidate_email TEXT NOT NULL,
      code_quality_score REAL DEFAULT 0,
      readme_clarity_score REAL DEFAULT 0,
      project_structure_score REAL DEFAULT 0,
      innovation_score REAL DEFAULT 0,
      technical_score REAL DEFAULT 0,
      overall_score REAL DEFAULT 0,
      rank INTEGER,
      feedback_json TEXT DEFAULT '{}',
      ai_recommendation TEXT DEFAULT 'pending',
      confidence_level REAL DEFAULT 0,
      approval_status TEXT DEFAULT 'pending_review',
      hr_notes TEXT DEFAULT '',
      approved_by TEXT DEFAULT '',
      approved_at TEXT,
      evaluated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (submission_id) REFERENCES submissions(id),
      FOREIGN KEY (hackathon_id) REFERENCES hackathons(id)
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      candidate_id INTEGER NOT NULL,
      job_id TEXT NOT NULL,
      round_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT DEFAULT '',
      scheduled_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id),
      FOREIGN KEY (job_id) REFERENCES hackathons(id)
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      candidate_id INTEGER NOT NULL,
      job_id TEXT NOT NULL,
      salary TEXT DEFAULT '',
      joining_date TEXT,
      status TEXT NOT NULL DEFAULT 'sent',
      manager TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id),
      FOREIGN KEY (job_id) REFERENCES hackathons(id)
    );

    CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
    CREATE INDEX IF NOT EXISTS idx_submissions_hackathon ON submissions(hackathon_id);
    CREATE INDEX IF NOT EXISTS idx_evaluations_hackathon ON evaluations(hackathon_id);
  `);

  // Migration: add new columns if they don't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE candidates ADD COLUMN status TEXT DEFAULT 'extracted'`);
  } catch { /* column already exists */ }
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN ai_recommendation TEXT DEFAULT 'pending'`);
  } catch { /* column already exists */ }
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN confidence_level REAL DEFAULT 0`);
  } catch { /* column already exists */ }
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN approval_status TEXT DEFAULT 'pending_review'`);
  } catch { /* column already exists */ }
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN hr_notes TEXT DEFAULT ''`);
  } catch { /* column already exists */ }
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN approved_by TEXT DEFAULT ''`);
  } catch { /* column already exists */ }
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN approved_at TEXT`);
  } catch { /* column already exists */ }
  try {
    db.exec(`ALTER TABLE hackathons ADD COLUMN type TEXT DEFAULT 'hackathon'`);
  } catch { /* column already exists */ }

  try { db.exec(`ALTER TABLE hackathons ADD COLUMN department TEXT DEFAULT 'Engineering'`); } catch { }
  try { db.exec(`ALTER TABLE hackathons ADD COLUMN employment_type TEXT DEFAULT 'Full-time'`); } catch { }
  try { db.exec(`ALTER TABLE hackathons ADD COLUMN experience_required TEXT DEFAULT ''`); } catch { }
  try { db.exec(`ALTER TABLE hackathons ADD COLUMN skills_required TEXT DEFAULT '[]'`); } catch { }
  try { db.exec(`ALTER TABLE hackathons ADD COLUMN location TEXT DEFAULT 'Remote'`); } catch { }
  try { db.exec(`ALTER TABLE hackathons ADD COLUMN salary_range TEXT DEFAULT ''`); } catch { }
  try { db.exec(`ALTER TABLE hackathons ADD COLUMN hiring_manager TEXT DEFAULT ''`); } catch { }

  try { db.exec(`ALTER TABLE candidates ADD COLUMN resume_path TEXT DEFAULT ''`); } catch { }
  try { db.exec(`ALTER TABLE candidates ADD COLUMN job_id TEXT DEFAULT ''`); } catch { }
  try { db.exec(`ALTER TABLE candidates ADD COLUMN linkedin_url TEXT DEFAULT ''`); } catch { }
  try { db.exec(`ALTER TABLE candidates ADD COLUMN portfolio_url TEXT DEFAULT ''`); } catch { }
  try { db.exec(`ALTER TABLE candidates ADD COLUMN experience_years INTEGER DEFAULT 0`); } catch { }
  try { db.exec(`ALTER TABLE candidates ADD COLUMN ai_match_score REAL DEFAULT 0`); } catch { }
  try { db.exec(`ALTER TABLE candidates ADD COLUMN ai_screening_report TEXT DEFAULT ''`); } catch { }
  try { db.exec(`ALTER TABLE candidates ADD COLUMN applied_at TEXT DEFAULT (datetime('now'))`); } catch { }
  try { db.exec(`ALTER TABLE candidates DROP COLUMN file_name`); } catch { } // Optional, keeping it for now but making it default ''
  try { db.exec(`ALTER TABLE candidates ALTER COLUMN file_name SET DEFAULT ''`); } catch { } // SQLite doesn't support easy ALTER COLUMN


  logger.info('Database initialized successfully');
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    logger.info('Database connection closed');
  }
}
