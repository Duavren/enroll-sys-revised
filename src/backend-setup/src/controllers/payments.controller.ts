import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { query, run } from '../database/connection';

const dataDir = path.join(__dirname, '../../data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
const paymentsFile = path.join(dataDir, 'payments.json');

function readPayments() { try { return JSON.parse(fs.readFileSync(paymentsFile, 'utf8') || '[]'); } catch (e) { return []; } }
function writePayments(items: any[]) { fs.writeFileSync(paymentsFile, JSON.stringify(items, null, 2)); }

export const getAssessment = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  try {
    // Try to find the latest enrollment for this student (by student.student_id)
    const rows = await query(
      `SELECT e.* FROM enrollments e JOIN students s ON e.student_id = s.id WHERE s.student_id = ? ORDER BY e.created_at DESC LIMIT 1`,
      [studentId]
    );

    const enrollment = rows && rows[0] ? rows[0] : null;

    // Compute assessment from enrollment if available, otherwise fallback to zeros
    let assessmentTotal = 0;
    let breakdown: any = { tuition: 0, misc: 0 };

    if (enrollment) {
      const tuition = Number(enrollment.tuition || 0);
      const registration = Number(enrollment.registration || 0);
      const library = Number(enrollment.library || 0);
      const lab = Number(enrollment.lab || 0);
      const id_fee = Number(enrollment.id_fee || 0);
      const others = Number(enrollment.others || 0);

      assessmentTotal = Number(enrollment.total_amount || tuition + registration + library + lab + id_fee + others);
      breakdown = { tuition, misc: registration + library + lab + id_fee + others };
    }

    const all = readPayments();
    const paymentsForStudent = all.filter((p: any) => p.studentId === studentId);
    const paid = paymentsForStudent.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    const due = Math.max(assessmentTotal - paid, 0);
    const assessment = { studentId, total: assessmentTotal, paid, due, breakdown };
    res.json({ success: true, data: assessment });
  } catch (err) {
    console.error('Failed to compute assessment:', err);
    res.status(500).json({ success: false, message: 'Failed to compute assessment' });
  }
};

export const listPayments = (req: Request, res: Response) => {
  const { studentId } = req.params;
  const all = readPayments();
  res.json({ success: true, data: all.filter((p: any) => p.studentId === studentId) });
};

export const addPayment = (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { amount, method, reference } = req.body;
  const payments = readPayments();
  const entry = { id: Date.now().toString(), studentId, amount, method, reference, ts: new Date().toISOString() };
  payments.unshift(entry);
  writePayments(payments);
  res.json({ success: true, data: entry });
};

export const submitInstallmentPayment = async (req: Request, res: Response) => {
  try {
    const { enrollmentId, studentId, amount, period, paymentMethod, referenceNumber, receiptPath } = req.body;

    // Validate required fields
    if (!enrollmentId || !studentId || !amount || !period || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create the installment payment record
    const result = await run(
      `INSERT INTO installment_payments 
       (enrollment_id, student_id, amount, period, status, payment_method, reference_number, receipt_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [enrollmentId, studentId, amount, period, 'Pending', paymentMethod, referenceNumber || null, receiptPath || null]
    );

    // Update enrollment status to Payment Verification
    await run(
      `UPDATE enrollments SET 
        status = 'Payment Verification',
        updated_at = datetime('now')
       WHERE id = ?`,
      [enrollmentId]
    );

    res.json({ 
      success: true, 
      message: 'Installment payment submitted for approval',
      paymentId: result.lastID 
    });
  } catch (err) {
    console.error('Failed to submit installment payment:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit installment payment' 
    });
  }
};

export const getInstallmentSchedule = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;

    // Fetch all installment payments for this enrollment
    const payments = await query(
      `SELECT * FROM installment_payments 
       WHERE enrollment_id = ? 
       ORDER BY CASE 
         WHEN period = 'Down Payment' THEN 1
         WHEN period = 'Prelim Period' THEN 2
         WHEN period = 'Midterm Period' THEN 3
         WHEN period = 'Finals Period' THEN 4
       END`,
      [enrollmentId]
    );

    if (!payments || payments.length === 0) {
      return res.json({ 
        success: true, 
        data: [],
        message: 'No installment schedule found'
      });
    }

    res.json({ 
      success: true, 
      data: payments || []
    });
  } catch (err) {
    console.error('Failed to get installment schedule:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get installment schedule' 
    });
  }
};

export const getAllInstallmentPayments = async (req: Request, res: Response) => {
  try {
    // Get all installment payments with student info
    const payments = await query(
      `SELECT ip.*, s.student_id, s.first_name, s.last_name, e.total_amount 
       FROM installment_payments ip 
       LEFT JOIN students s ON ip.student_id = s.id 
       LEFT JOIN enrollments e ON ip.enrollment_id = e.id 
       ORDER BY ip.created_at DESC`
    );

    // Normalize receipt paths - convert full file system paths to relative /uploads paths
    const normalizedPayments = payments?.map((payment: any) => {
      if (payment.receipt_path) {
        let normalizedPath = payment.receipt_path;
        // If it's a full file system path, extract the /uploads portion
        const uploadsIndex = normalizedPath.indexOf('/uploads');
        if (uploadsIndex !== -1) {
          normalizedPath = normalizedPath.substring(uploadsIndex);
        }
        return { ...payment, receipt_path: normalizedPath };
      }
      return payment;
    }) || [];

    res.json({
      success: true,
      data: normalizedPayments
    });
  } catch (err) {
    console.error('Failed to get all installment payments:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get all installment payments'
    });
  }
};

export const updateInstallmentPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Approved', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update the installment payment status
    await run(
      `UPDATE installment_payments SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, id]
    );

    res.json({
      success: true,
      message: `Installment payment ${status.toLowerCase()}`
    });
  } catch (err) {
    console.error('Failed to update installment payment status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update installment payment status'
    });
  }
};

export default { getAssessment, listPayments, addPayment, submitInstallmentPayment, getInstallmentSchedule, getAllInstallmentPayments, updateInstallmentPaymentStatus };
