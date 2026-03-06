import { Request, Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

// Map enrollment status to notification details
const statusNotificationMap: Record<string, { title: string; message: string; type: string }> = {
  'Pending Assessment': { title: 'Enrollment Submitted', message: 'Your enrollment has been submitted for assessment. Please wait for approval.', type: 'info' },
  'For Subject Selection': { title: 'Select Your Subjects', message: 'Please select your subjects for this semester.', type: 'info' },
  'For Dean Approval': { title: 'Pending Dean Approval', message: 'Your enrollment is pending approval from the Dean.', type: 'warning' },
  'For Payment': { title: 'Ready for Payment', message: 'Your enrollment has been approved and is ready for payment. Please proceed with your payment.', type: 'warning' },
  'Ready for Payment': { title: 'Enrollment Approved', message: 'Your enrollment has been approved. Please proceed with payment.', type: 'success' },
  'Payment Verification': { title: 'Payment Under Review', message: 'Your payment has been received and is pending verification by the cashier.', type: 'info' },
  'Enrolled': { title: 'Enrollment Complete', message: 'Congratulations! You are now officially enrolled.', type: 'success' },
  'Rejected': { title: 'Enrollment Rejected', message: 'Your enrollment has been rejected. Please contact the registrar for more information.', type: 'error' },
  'Cancelled': { title: 'Enrollment Cancelled', message: 'Your enrollment has been cancelled.', type: 'error' }
};

// Returns notifications for the authenticated student
export const listNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Try to map user -> student id
    const studentRows = await query('SELECT id FROM students WHERE user_id = ?', [userId]);
    const studentId = studentRows.length ? studentRows[0].id : null;

    if (!studentId) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Auto-create notification for the student's current enrollment status if missing
    try {
      const enrollments = await query(
        `SELECT id, status FROM enrollments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1`,
        [studentId]
      );

      if (enrollments.length > 0) {
        const currentStatus = enrollments[0].status;
        const notifInfo = statusNotificationMap[currentStatus];

        if (notifInfo) {
          // Check if a notification for this status already exists
          const existing = await query(
            `SELECT id FROM notifications WHERE student_id = ? AND title = ? LIMIT 1`,
            [studentId, notifInfo.title]
          );

          if (!existing || existing.length === 0) {
            await run(
              `INSERT INTO notifications (student_id, title, message, type, is_read, created_at)
               VALUES (?, ?, ?, ?, 0, datetime('now'))`,
              [studentId, notifInfo.title, notifInfo.message, notifInfo.type]
            );
          }
        }
      }
    } catch (autoErr) {
      console.error('Auto-create notification error (non-fatal):', autoErr);
    }

    // Fetch all notifications for this student
    const notifications = await query(
      `SELECT id, student_id, title, message, type, is_read, created_at 
       FROM notifications 
       WHERE student_id = ? 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [studentId]
    );

    res.json({
      success: true,
      data: notifications || []
    });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params; // notification id

    if (!id) return res.status(400).json({ success: false, message: 'id required' });

    // Update notifications record to mark as read
    await run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default { listNotifications, markAsRead };
