import { Request, Response } from 'express';
import { query } from '../database/connection';

// Platform-wide usage (admins, registrar, dean, cashier)
export const getUsage = async (req: Request, res: Response) => {
  try {
    const totalNonStudents = await query(
      "SELECT COUNT(*) as count FROM users WHERE role != 'student'"
    );

    const totalStudents = await query(
      "SELECT COUNT(*) as count FROM students WHERE status = 'Active'"
    );

    const recentLogins = await query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM activity_logs
       WHERE action = 'LOGIN' AND datetime(created_at) > datetime('now', '-24 hours')`
    );

    const apiCalls = await query(
      `SELECT COUNT(*) as count
       FROM activity_logs
       WHERE datetime(created_at) > datetime('now', '-24 hours')`
    );

    res.json({
      success: true,
      data: {
        activeUsers24h: recentLogins[0]?.count || 0,
        staffAccounts: totalNonStudents[0]?.count || 0,
        activeStudents: totalStudents[0]?.count || 0,
        apiCallsLast24h: apiCalls[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Analytics getUsage error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Students per program / course
export const getStudentsPerProgram = async (req: Request, res: Response) => {
  try {
    const rows = await query(
      `SELECT IFNULL(course, 'Unassigned') as label, COUNT(*) as total
       FROM students
       WHERE status = 'Active'
       GROUP BY course
       ORDER BY total DESC`
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Analytics getStudentsPerProgram error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Enrollment stats for registrar/admin
export const getEnrollmentStats = async (req: Request, res: Response) => {
  try {
    const totalEnrolled = await query(
      `SELECT COUNT(*) as total FROM enrollments WHERE status = 'Enrolled'`
    );

    const pending = await query(
      `SELECT COUNT(*) as total FROM enrollments WHERE status != 'Enrolled'`
    );

    const perSemester = await query(
      `SELECT school_year || ' ' || semester AS period, COUNT(*) as total
       FROM enrollments
       WHERE status = 'Enrolled'
       GROUP BY school_year, semester
       ORDER BY school_year DESC, semester`
    );

    const perSection = await query(
      `SELECT IFNULL(sec.section_code, 'Unassigned') as section_code,
              IFNULL(sec.section_name, 'Unassigned') as section_name,
              COUNT(e.id) as total
       FROM enrollments e
       LEFT JOIN sections sec ON e.section_id = sec.id
       WHERE e.status = 'Enrolled'
       GROUP BY sec.section_code, sec.section_name
       ORDER BY total DESC`
    );

    res.json({
      success: true,
      data: {
        totalEnrolledThisSemester: totalEnrolled[0]?.total || 0,
        pendingEnrollments: pending[0]?.total || 0,
        perSemester,
        perSection
      }
    });
  } catch (error) {
    console.error('Analytics getEnrollmentStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cashier-focused revenue metrics
export const getCashierSummary = async (req: Request, res: Response) => {
  try {
    // Get completed transactions (full payments)
    const completed = await query(
      `SELECT SUM(amount) as total FROM transactions WHERE status = 'Completed'`
    );

    // Get approved installment payments
    const approvedInstallments = await query(
      `SELECT SUM(amount) as total FROM installment_payments WHERE status = 'Approved'`
    );

    // Combine both for total collections
    const transactionTotal = completed[0]?.total || 0;
    const installmentTotal = approvedInstallments[0]?.total || 0;
    const totalCollections = (transactionTotal + installmentTotal);

    // Calculate outstanding balance
    const outstanding = await query(
      `SELECT SUM(CASE WHEN e.total_amount > IFNULL(p.paid, 0) THEN e.total_amount - IFNULL(p.paid, 0) ELSE 0 END) as balance
       FROM enrollments e
       LEFT JOIN (
         SELECT enrollment_id, SUM(amount) as paid
         FROM (
           SELECT enrollment_id, amount FROM transactions WHERE status = 'Completed'
           UNION ALL
           SELECT enrollment_id, amount FROM installment_payments WHERE status = 'Approved'
         )
         GROUP BY enrollment_id
       ) p ON p.enrollment_id = e.id
       WHERE e.status != 'Rejected'`
    );

    const pending = await query(
      `SELECT COUNT(*) as total FROM transactions WHERE status = 'Pending'`
    );

    const recent = await query(
      `SELECT t.id, t.enrollment_id, t.amount, t.status, t.payment_method, t.created_at,
              s.student_id, s.first_name || ' ' || s.last_name as student_name
       FROM transactions t
       JOIN enrollments e ON t.enrollment_id = e.id
       JOIN students s ON e.student_id = s.id
       ORDER BY t.created_at DESC
       LIMIT 15`
    );

    res.json({
      success: true,
      data: {
        totalCollections: totalCollections,
        outstandingBalances: outstanding[0]?.balance || 0,
        pendingCount: pending[0]?.total || 0,
        recent
      }
    });
  } catch (error) {
    console.error('Analytics getCashierSummary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Dean-focused distribution metrics
export const getDeanSummary = async (req: Request, res: Response) => {
  try {
    const perProgram = await query(
      `SELECT IFNULL(course,'Unassigned') as course, COUNT(*) as total
       FROM students
       WHERE status = 'Active'
       GROUP BY course
       ORDER BY total DESC`
    );

    const perYear = await query(
      `SELECT year_level as yearLevel, COUNT(*) as total
       FROM students
       WHERE status = 'Active'
       GROUP BY year_level
       ORDER BY year_level`
    );

    const subjectDemand = await query(
      `SELECT s.subject_code, s.subject_name, COUNT(es.id) as enrolled
       FROM enrollment_subjects es
       JOIN subjects s ON es.subject_id = s.id
       GROUP BY s.subject_code, s.subject_name
       ORDER BY enrolled DESC
       LIMIT 10`
    );

    const teachingLoad = await query(
      `SELECT IFNULL(es.instructor, 'TBA') as instructor, COUNT(*) as assignments
       FROM enrollment_subjects es
       GROUP BY es.instructor
       ORDER BY assignments DESC`
    );

    res.json({ success: true, data: { perProgram, perYear, subjectDemand, teachingLoad } });
  } catch (error) {
    console.error('Analytics getDeanSummary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default { getUsage, getStudentsPerProgram, getEnrollmentStats, getCashierSummary, getDeanSummary };
