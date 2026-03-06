import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../enrollment_system.db');

try {
  const db = new Database(dbPath);

  // Get all students with their current enrollment status
  const studentEnrollments = db.prepare(`
    SELECT DISTINCT 
      s.id as student_id,
      e.id as enrollment_id,
      e.status,
      MAX(e.created_at) as latest_enrollment
    FROM students s
    LEFT JOIN enrollments e ON s.id = e.student_id
    GROUP BY s.id
  `).all() as any[];

  console.log(`Found ${studentEnrollments.length} students`);

  // Map enrollment status to notification
  const statusToNotification = (status: string) => {
    const map: Record<string, { title: string; message: string; type: string }> = {
      'Pending Assessment': {
        title: 'Enrollment Submitted',
        message: 'Your enrollment has been submitted for assessment. Please wait for approval.',
        type: 'info'
      },
      'For Payment': {
        title: 'Ready for Payment',
        message: 'Your enrollment is ready for payment. Please proceed with your payment.',
        type: 'warning'
      },
      'Payment Verification': {
        title: 'Payment Received',
        message: 'Your payment has been received and is pending verification.',
        type: 'info'
      },
      'Ready for Payment': {
        title: 'Enrollment Approved',
        message: 'Your enrollment has been approved. Please proceed with payment.',
        type: 'success'
      },
      'Enrolled': {
        title: 'Enrollment Complete',
        message: 'Congratulations! You are now officially enrolled.',
        type: 'success'
      },
      'Rejected': {
        title: 'Enrollment Rejected',
        message: 'Your enrollment has been rejected. Please contact the registrar for more information.',
        type: 'error'
      },
      'Cancelled': {
        title: 'Enrollment Cancelled',
        message: 'Your enrollment has been cancelled.',
        type: 'error'
      },
      'For Subject Selection': {
        title: 'Select Your Subjects',
        message: 'Please select your subjects for this semester.',
        type: 'info'
      },
      'For Dean Approval': {
        title: 'Pending Dean Approval',
        message: 'Your enrollment is pending approval from the Dean.',
        type: 'warning'
      }
    };
    return map[status] || null;
  };

  let createdCount = 0;
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO notifications (student_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, 0, datetime('now'))
  `);

  for (const se of studentEnrollments) {
    if (!se.status) continue; // Skip students with no enrollment

    const notif = statusToNotification(se.status);
    if (!notif) continue;

    try {
      insertStmt.run(se.student_id, notif.title, notif.message, notif.type);
      createdCount++;
      console.log(`✅ Student ${se.student_id}: ${se.status} → ${notif.title}`);
    } catch (err: any) {
      if (!err.message?.includes('UNIQUE')) {
        console.error(`❌ Error for student ${se.student_id}:`, err.message);
      }
    }
  }

  console.log(`\n✅ Created ${createdCount} enrollment status notifications for existing students`);
  db.close();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
