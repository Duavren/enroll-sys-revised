import { Request, Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

// Returns recent activity logs relevant to the authenticated student
export const listNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Try to map user -> student id
    const studentRows = await query('SELECT id FROM students WHERE user_id = ?', [userId]);
    const studentId = studentRows.length ? studentRows[0].id : null;

    // Fetch activity_logs entries linked to this student by user_id or entity references
    const params: any[] = [];
    let sql = `SELECT l.id as log_id, l.user_id, l.action, l.entity_type, l.entity_id, l.description, l.created_at,
                      n.id as notification_id, IFNULL(n.is_read, 0) as is_read
               FROM activity_logs l
               LEFT JOIN notifications n ON n.activity_log_id = l.id AND n.user_id = ?
               WHERE 1=1`;

    params.push(userId);

    if (userId) {
      sql += ' AND (l.user_id = ? OR l.entity_type = ? OR l.entity_id = ? )';
      params.push(userId, 'student', studentId);
    }

    sql += ' ORDER BY l.created_at DESC LIMIT 100';

    const rows = await query(sql, params);

    // Ensure notifications rows exist for returned logs (so mark-as-read can be used)
    for (const r of rows) {
      if (!r.notification_id) {
        try {
          await run('INSERT INTO notifications (user_id, activity_log_id, is_read) VALUES (?, ?, 0)', [userId, r.log_id]);
        } catch (e) {
          // ignore duplicate insert race
        }
      }
    }

    // Return rows with consistent fields
    const data = rows.map((r: any) => ({
      id: r.log_id,
      action: r.action,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      description: r.description,
      created_at: r.created_at,
      is_read: !!r.is_read
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params; // activity log id

    if (!id) return res.status(400).json({ success: false, message: 'id required' });

    // Update notifications record
    await run('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND activity_log_id = ?', [userId, id]);

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default { listNotifications, markAsRead };
