import { Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      enrollment_id,
      transaction_type,
      amount,
      payment_method,
      reference_number,
      receipt_path,
      remarks
    } = req.body;

    const result = await run(
      `INSERT INTO transactions 
        (enrollment_id, transaction_type, amount, payment_method, reference_number, receipt_path, processed_by, status, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [enrollment_id, transaction_type, amount, payment_method, reference_number, receipt_path || null, userId, remarks]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'CREATE_TRANSACTION', 'transaction', result.lastInsertRowid, `Created ${transaction_type} transaction`]
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        id: result.lastInsertRowid
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTransactionsByEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { enrollmentId } = req.params;

    const transactions = await query(
      `SELECT t.*, u.username as processed_by_name
       FROM transactions t
       LEFT JOIN users u ON t.processed_by = u.id
       WHERE t.enrollment_id = ?
       ORDER BY t.payment_date DESC`,
      [enrollmentId]
    );

    // Calculate totals
    const totals = await query(
      `SELECT 
        SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) as total_pending
       FROM transactions
       WHERE enrollment_id = ?`,
      [enrollmentId]
    );

    res.json({
      success: true,
      data: {
        transactions,
        totals: totals[0] || { total_paid: 0, total_pending: 0 }
      }
    });
  } catch (error) {
    console.error('Get transactions by enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { status, payment_method, start_date, end_date } = req.query;

    let sql = `
      SELECT t.*, 
        e.school_year, e.semester,
        s.student_id, s.first_name, s.last_name,
        u.username as processed_by_name
      FROM transactions t
      JOIN enrollments e ON t.enrollment_id = e.id
      JOIN students s ON e.student_id = s.id
      LEFT JOIN users u ON t.processed_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (payment_method) {
      sql += ' AND t.payment_method = ?';
      params.push(payment_method);
    }

    if (start_date) {
      sql += ' AND DATE(t.payment_date) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND DATE(t.payment_date) <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY t.payment_date DESC';

    const transactions = await query(sql, params);

    // Normalize receipt paths - convert full file system paths to relative /uploads paths
    const normalizedTransactions = transactions?.map((transaction: any) => {
      if (transaction.receipt_path) {
        let normalizedPath = transaction.receipt_path;
        // If it's a full file system path, extract the /uploads portion
        const uploadsIndex = normalizedPath.indexOf('/uploads');
        if (uploadsIndex !== -1) {
          normalizedPath = normalizedPath.substring(uploadsIndex);
        }
        return { ...transaction, receipt_path: normalizedPath };
      }
      return transaction;
    }) || [];

    res.json({
      success: true,
      data: normalizedTransactions
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const userId = req.user?.id;

    await run(
      "UPDATE transactions SET status = ?, remarks = ?, updated_at = datetime('now') WHERE id = ?",
      [status, remarks || null, id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'UPDATE_TRANSACTION_STATUS', 'transaction', id, `Changed status to ${status}`]
    );

    res.json({
      success: true,
      message: 'Transaction status updated successfully'
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
