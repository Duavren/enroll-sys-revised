import { run, query } from '../database/connection';

// Map enrollment status to notification details
const notificationMap: Record<string, { title: string; message: string; type: string }> = {
  'Pending Assessment': {
    title: 'Enrollment Submitted',
    message: 'Your enrollment has been submitted for assessment. Please wait for approval.',
    type: 'info'
  },
  'For Registrar Assessment': {
    title: 'Under Registrar Review',
    message: 'Your enrollment is now being reviewed by the Registrar.',
    type: 'info'
  },
  'For Admin Approval': {
    title: 'Pending Admin Approval',
    message: 'Your enrollment is pending approval from the Admin.',
    type: 'info'
  },
  'For Subject Selection': {
    title: 'Select Your Subjects',
    message: 'Your enrollment has been approved! Please select your subjects for this semester.',
    type: 'success'
  },
  'Cashier Review': {
    title: 'Under Cashier Review',
    message: 'Your enrollment fees are being reviewed by the Cashier.',
    type: 'info'
  },
  'For Dean Approval': {
    title: 'Pending Dean Approval',
    message: 'Your enrollment is now pending approval from the Dean.',
    type: 'info'
  },
  'For Payment': {
    title: 'Ready for Payment',
    message: 'Your enrollment has been approved and is ready for payment. Please proceed with your payment.',
    type: 'warning'
  },
  'Ready for Payment': {
    title: 'Tuition Assessment Approved',
    message: 'Your tuition assessment has been approved. Please proceed with payment.',
    type: 'success'
  },
  'Payment Verification': {
    title: 'Payment Under Review',
    message: 'Your payment has been received and is pending verification by the cashier.',
    type: 'info'
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
  }
};

export const sendEnrollmentNotification = async (
  studentId: number,
  enrollmentId: number,
  newStatus: string,
  message?: string
) => {
  try {
    const notif = notificationMap[newStatus];
    if (!notif) {
      console.log(`No notification mapped for status: ${newStatus}`);
      return;
    }

    const finalMessage = message || notif.message;

    // Insert notification
    await run(
      `INSERT INTO notifications (student_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, datetime('now'))`,
      [studentId, notif.title, finalMessage, notif.type]
    );

    console.log(`✅ Notification sent to student ${studentId}: ${notif.title}`);
  } catch (error) {
    console.error('Error sending enrollment notification:', error);
    // Don't throw - continue with enrollment even if notification fails
  }
};

export const sendLoginNotification = async (userId: number) => {
  try {
    // Map user to student
    const studentRows = await query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (!studentRows || studentRows.length === 0) return;
    
    const studentId = studentRows[0].id;

    // Get current enrollment status
    const enrollments = await query(
      `SELECT id, status FROM enrollments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1`,
      [studentId]
    );

    const currentStatus = enrollments.length > 0 ? enrollments[0].status : null;
    const statusText = currentStatus || 'No active enrollment';

    await run(
      `INSERT INTO notifications (student_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, datetime('now'))`,
      [studentId, 'Welcome Back!', `You have logged in successfully. Current enrollment status: ${statusText}.`, 'info']
    );

    console.log(`✅ Login notification sent to student ${studentId}`);
  } catch (error) {
    console.error('Error sending login notification:', error);
  }
};
