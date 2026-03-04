import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import db, { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

// COR Management
export const getAllCORs = async (req: AuthRequest, res: Response) => {
  try {
    const { status, studentId } = req.query;

    let sql = `
      SELECT 
        c.*,
        s.student_id,
        s.first_name || ' ' || s.last_name as student_name,
        s.course,
        e.school_year,
        e.semester
      FROM cors c
      JOIN students s ON c.student_id = s.id
      JOIN enrollments e ON c.enrollment_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (studentId) {
      sql += ' AND s.student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY c.created_at DESC';

    const cors = await query(sql, params);

    res.json({
      success: true,
      data: cors
    });
  } catch (error) {
    console.error('Get all CORs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const generateCOR = async (req: AuthRequest, res: Response) => {
  try {
    const { enrollmentId } = req.body;
    const userId = req.user?.id;

    // Get enrollment details
    const enrollments = await query(
      `SELECT e.*, s.id as student_id, s.student_id as student_number
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.id = ?`,
      [enrollmentId]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const enrollment = enrollments[0];

    // Generate COR number
    const corNumber = `COR-${enrollment.student_number}-${enrollment.school_year.replace('-', '')}-${Date.now()}`;

    // Check if COR already exists
    const existing = await query('SELECT * FROM cors WHERE enrollment_id = ?', [enrollmentId]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'COR already exists for this enrollment'
      });
    }

    const result = await run(
      `INSERT INTO cors 
        (student_id, enrollment_id, cor_number, status, generated_at, generated_by)
       VALUES (?, ?, ?, 'Generated', datetime('now'), ?)`,
      [enrollment.student_id, enrollmentId, corNumber, userId]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'GENERATE_COR', 'cor', result.lastInsertRowid, `Generated COR ${corNumber}`]
    );

    res.status(201).json({
      success: true,
      message: 'COR generated successfully',
      data: { id: result.lastInsertRowid, cor_number: corNumber }
    });
  } catch (error) {
    console.error('Generate COR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const approveCOR = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await run(
      `UPDATE cors SET 
        status = 'Approved',
        updated_at = datetime('now')
      WHERE id = ?`,
      [id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'APPROVE_COR', 'cor', id, 'Approved COR']
    );

    res.json({
      success: true,
      message: 'COR approved successfully'
    });
  } catch (error) {
    console.error('Approve COR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Clearances Management
export const getAllClearances = async (req: AuthRequest, res: Response) => {
  try {
    const { status, clearance_type, studentId } = req.query;

    let sql = `
      SELECT 
        c.*,
        s.student_id,
        s.first_name || ' ' || s.last_name as student_name,
        s.course,
        u.username as resolved_by_name
      FROM clearances c
      JOIN students s ON c.student_id = s.id
      LEFT JOIN users u ON c.resolved_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (clearance_type) {
      sql += ' AND c.clearance_type = ?';
      params.push(clearance_type);
    }
    if (studentId) {
      sql += ' AND s.student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY c.created_at DESC';

    const clearances = await query(sql, params);

    res.json({
      success: true,
      data: clearances
    });
  } catch (error) {
    console.error('Get all clearances error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createClearance = async (req: AuthRequest, res: Response) => {
  try {
    const { student_id, clearance_type, issue_description } = req.body;

    const result = await run(
      `INSERT INTO clearances 
        (student_id, clearance_type, issue_description, status)
       VALUES (?, ?, ?, 'Pending')`,
      [student_id, clearance_type, issue_description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Clearance created successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error) {
    console.error('Create clearance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const resolveClearance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const userId = req.user?.id;

    await run(
      `UPDATE clearances SET 
        status = 'Cleared',
        resolved_at = datetime('now'),
        resolved_by = ?,
        remarks = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [userId, remarks || null, id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'RESOLVE_CLEARANCE', 'clearance', id, 'Resolved clearance']
    );

    res.json({
      success: true,
      message: 'Clearance resolved successfully'
    });
  } catch (error) {
    console.error('Resolve clearance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get enrollments pending registrar assessment (after subject selection)
export const getPendingSubjectAssessments = async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await query(
      `SELECT e.*, 
        s.student_id, s.first_name || ' ' || s.last_name as student_name, s.course, s.year_level,
        (SELECT COUNT(*) FROM enrollment_subjects es WHERE es.enrollment_id = e.id) as subject_count
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.status = 'For Registrar Assessment'
       ORDER BY e.updated_at DESC`
    );

    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get pending subject assessments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get enrollment details with subjects for assessment review
export const getEnrollmentForAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const enrollments = await query(
      `SELECT e.*, 
        s.student_id, s.first_name || ' ' || s.last_name as student_name, s.course, s.year_level
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.id = ?`,
      [id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const enrollment = enrollments[0];

    // Get enrolled subjects
    let subjects = await query(
      `SELECT es.*, sub.subject_code, sub.subject_name, sub.units
       FROM enrollment_subjects es
       JOIN subjects sub ON es.subject_id = sub.id
       WHERE es.enrollment_id = ?`,
      [id]
    );

    // If no subjects assigned yet, get available subjects and auto-assign them
    let availableSubjects = [];
    if (subjects.length === 0) {
      availableSubjects = await query(
        `SELECT id, subject_code, subject_name, units, course, year_level, semester
         FROM subjects
         WHERE course = ? AND year_level = ? AND is_active = 1
         ORDER BY semester ASC, subject_code ASC`,
        [enrollment.course, enrollment.year_level]
      );

      // Auto-assign available subjects to the enrollment
      if (availableSubjects.length > 0) {
        const insertSubjectStmt = db.prepare(
          'INSERT OR IGNORE INTO enrollment_subjects (enrollment_id, subject_id, status) VALUES (?, ?, ?)'
        );
        
        const insertManySubjects = db.transaction((subjects: any[]) => {
          for (const subject of subjects) {
            insertSubjectStmt.run(enrollment.id, subject.id, 'Enrolled');
          }
        });

        insertManySubjects(availableSubjects);

        // Fetch the newly assigned subjects
        subjects = await query(
          `SELECT es.*, sub.subject_code, sub.subject_name, sub.units
           FROM enrollment_subjects es
           JOIN subjects sub ON es.subject_id = sub.id
           WHERE es.enrollment_id = ?`,
          [id]
        );
      }
    }

    res.json({ 
      success: true, 
      data: { 
        enrollment, 
        subjects,
        availableSubjects
      } 
    });
  } catch (error) {
    console.error('Get enrollment for assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Approve subject assessment and forward to dean
export const approveSubjectAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tuition, registration, library, lab, id_fee, others, remarks } = req.body;
    const userId = req.user?.id;

    // Check if enrollment exists and is in correct status
    const enrollments = await query('SELECT * FROM enrollments WHERE id = ?', [id]);

    if (enrollments.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollments[0].status !== 'For Registrar Assessment') {
      return res.status(400).json({ success: false, message: 'Enrollment is not pending registrar assessment' });
    }

    // Calculate total based on units and fees
    const subjTotals = await query(
      `SELECT SUM(s.units) as total_units
       FROM enrollment_subjects es
       JOIN subjects s ON es.subject_id = s.id
       WHERE es.enrollment_id = ?`,
      [id]
    );
    const totalUnits = subjTotals[0]?.total_units || 0;
    
    // Calculate total amount
    const tuitionFee = tuition || (totalUnits * 700); // Default 700 per unit
    const regFee = registration || 0;
    const libFee = library || 0;
    const labFee = lab || 0;
    const idFee = id_fee || 0;
    const otherFees = others || 0;
    const totalAmount = tuitionFee + regFee + libFee + labFee + idFee + otherFees;

    // Update enrollment with assessment and forward to dean
    await run(
      `UPDATE enrollments SET 
        status = 'For Dean Approval',
        tuition = ?,
        registration = ?,
        library = ?,
        lab = ?,
        id_fee = ?,
        others = ?,
        total_amount = ?,
        assessed_by = ?,
        assessed_at = ?,
        remarks = ?,
        updated_at = ?
       WHERE id = ?`,
      [tuitionFee, regFee, libFee, labFee, idFee, otherFees, totalAmount, userId, remarks || null, new Date().toISOString(), new Date().toISOString(), id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'APPROVE_SUBJECT_ASSESSMENT', 'enrollment', id, `Subject assessment approved, total: ₱${totalAmount}`]
    );

    res.json({
      success: true,
      message: 'Subject assessment approved. Forwarded to Dean for approval.',
      data: { total_amount: totalAmount }
    });
  } catch (error) {
    console.error('Approve subject assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get registrar dashboard stats
export const getRegistrarDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Total student records
    const totalRecords = await query('SELECT COUNT(*) as count FROM students WHERE status = ?', ['Active']);
    // Pending grades (enrollment_subjects without grades)
    const pendingGrades = await query(
      `SELECT COUNT(*) as count 
       FROM enrollment_subjects es
       JOIN enrollments e ON es.enrollment_id = e.id
       WHERE es.grade IS NULL OR es.grade = ''
       AND e.status = 'Approved'`
    );

    // COR requests
    const corRequests = await query(
      "SELECT COUNT(*) as count FROM cors WHERE status = 'Pending'"
    );

    // Clearances
    const clearances = await query(
      "SELECT COUNT(*) as count FROM clearances WHERE status = 'Pending'"
    );

    res.json({
      success: true,
      data: {
        totalRecords: totalRecords[0]?.count || 0,
        pendingGrades: pendingGrades[0]?.count || 0,
        corRequests: corRequests[0]?.count || 0,
        clearances: clearances[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get registrar dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Assign a student/enrollment to a section
export const assignStudentToSection = async (req: AuthRequest, res: Response) => {
  try {
    const { enrollment_id, section_id } = req.body;
    const userId = req.user?.id;

    if (!enrollment_id || !section_id) {
      return res.status(400).json({ success: false, message: 'enrollment_id and section_id are required' });
    }

    // Update enrollment record with section
    await run(
      `UPDATE enrollments SET section_id = ?, updated_at = datetime('now') WHERE id = ?`,
      [section_id, enrollment_id]
    );

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'ASSIGN_SECTION', 'enrollment', enrollment_id, `Assigned to section ${section_id}`]
    );

    res.json({ success: true, message: 'Student assigned to section' });
  } catch (error) {
    console.error('Assign student to section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Enrollment reports: totals per semester, per section, pending enrollments
export const getEnrollmentReport = async (req: AuthRequest, res: Response) => {
  try {
    // Total enrolled per semester
    const perSemester = await query(
      `SELECT school_year || ' ' || semester AS period, COUNT(*) as total
       FROM enrollments
       WHERE status = 'Enrolled'
       GROUP BY school_year, semester
       ORDER BY school_year DESC, semester`)
;

    // Number of students per section
    const perSection = await query(
      `SELECT sec.id as section_id, sec.section_name as section_name, COUNT(e.id) as total
       FROM enrollments e
       LEFT JOIN sections sec ON e.section_id = sec.id
       WHERE e.status = 'Enrolled'
       GROUP BY sec.id, sec.section_name`);

    // Pending enrollments
    const pending = await query(`SELECT COUNT(*) as total FROM enrollments WHERE status != 'Enrolled'`);

    res.json({ success: true, data: { perSemester, perSection, pending: pending[0]?.total || 0 } });
  } catch (error) {
    console.error('Get enrollment report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const downloadScholarshipLetter = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/scholarships', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    res.download(filePath, (filename));
  } catch (error) {
    console.error('Download scholarship letter error:', error);
    res.status(500).send('Server error');
  }
};
