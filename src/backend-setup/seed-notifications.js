import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../enrollment_system.db');

try {
  const db = new Database(dbPath);

  // Get all students
  const students = db.prepare('SELECT id FROM students').all() as any[];
  
  console.log(`Found ${students.length} students`);

  if (students.length === 0) {
    console.log('No students found');
    db.close();
    process.exit(0);
  }

  const notifications = [
    { title: 'Welcome to Online Enrollment', message: 'You can now view your enrollment status and manage your courses online.', type: 'info' },
    { title: 'Payment Portal Available', message: 'You can now submit installment payments through the payment portal.', type: 'info' },
    { title: 'Check Your Enrollment Status', message: 'Please review your enrollment details and ensure all information is correct.', type: 'warning' }
  ];

  let count = 0;
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO notifications (student_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, 0, datetime('now'))
  `);

  for (const student of students) {
    for (const notif of notifications) {
      stmt.run(student.id, notif.title, notif.message, notif.type);
      count++;
    }
  }

  console.log(`✅ Created ${count} notifications`);
  db.close();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
