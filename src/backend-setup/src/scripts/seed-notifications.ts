import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../enrollment_system.db');
const db = new Database(dbPath);

const seedNotifications = () => {
  try {
    // Get all students
    const students = db.prepare('SELECT id FROM students').all() as any[];
    
    if (students.length === 0) {
      console.log('No students found to seed notifications');
      return;
    }

    console.log(`Found ${students.length} students. Creating notifications...`);

    // Notifications to create for each student
    const notifications = [
      {
        title: 'Welcome to Online Enrollment',
        message: 'You can now view your enrollment status and manage your courses online.',
        type: 'info'
      },
      {
        title: 'Payment Portal Available',
        message: 'You can now submit installment payments through the payment portal.',
        type: 'info'
      },
      {
        title: 'Important: Check Your Enrollment Status',
        message: 'Please review your enrollment details and ensure all information is correct.',
        type: 'warning'
      }
    ];

    let createdCount = 0;
    const insertStmt = db.prepare(`
      INSERT INTO notifications (student_id, title, message, type, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, datetime('now'))
    `);

    for (const student of students) {
      for (const notif of notifications) {
        try {
          insertStmt.run(student.id, notif.title, notif.message, notif.type);
          createdCount++;
        } catch (err: any) {
          if (!err.message?.includes('UNIQUE constraint failed')) {
            console.error(`Error creating notification for student ${student.id}:`, err);
          }
        }
      }
    }

    console.log(`✅ Successfully created ${createdCount} notifications for ${students.length} students`);
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    process.exit(1);
  } finally {
    db.close();
  }
};

seedNotifications();
