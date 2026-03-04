import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Get database path from environment or use default
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../enrollment_system.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Test connection
try {
  db.prepare('SELECT 1').get();
  console.log('✅ SQLite database connected successfully');
  console.log(`📁 Database location: ${dbPath}`);
} catch (err: any) {
  console.error('❌ Database connection failed:', err.message);
}

// Helper function to wrap synchronous queries in promises for async/await compatibility
export const query = async (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.all(params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function for INSERT/UPDATE/DELETE operations
export const run = async (sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(params);
      resolve({
        lastInsertRowid: Number(result.lastInsertRowid),
        changes: result.changes
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function for single row queries
export const get = async (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.get(params);
      resolve(result || null);
    } catch (error) {
      reject(error);
    }
  });
};

// Export the database instance for direct access if needed
export default db;
