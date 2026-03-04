import { Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

// Programs Management
export const getAllPrograms = async (req: AuthRequest, res: Response) => {
  try {
    const { status, department } = req.query;

    let sql = 'SELECT * FROM programs WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }

    sql += ' ORDER BY program_code';

    const programs = await query(sql, params);

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    console.error('Get all programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getProgramById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const programs = await query('SELECT * FROM programs WHERE id = ?', [id]);

    if (programs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Get curriculum for this program
    const curriculum = await query(
      `SELECT 
        c.*,
        s.subject_code,
        s.subject_name,
        s.units
       FROM curriculum c
       JOIN subjects s ON c.subject_id = s.id
       WHERE c.program_id = ?
       ORDER BY c.year_level, c.semester, s.subject_code`,
      [id]
    );

    // Get student count
    const studentCount = await query(
      'SELECT COUNT(*) as count FROM students WHERE course = ? AND status = ?',
      [programs[0].program_code, 'Active']
    );

    res.json({
      success: true,
      data: {
        program: programs[0],
        curriculum,
        studentCount: studentCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get program by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createProgram = async (req: AuthRequest, res: Response) => {
  try {
    const {
      program_code,
      program_name,
      description,
      department,
      degree_type,
      duration_years,
      total_units
    } = req.body;

    const result = await run(
      `INSERT INTO programs 
        (program_code, program_name, description, department, degree_type, duration_years, total_units)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [program_code, program_name, description || null, department || null, degree_type || null, duration_years || null, total_units || null]
    );

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error: any) {
    console.error('Create program error:', error);
    res.status(500).json({
      success: false,
      message: error.message?.includes('UNIQUE') ? 'Program code already exists' : 'Server error'
    });
  }
};

export const updateProgram = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      program_code,
      program_name,
      description,
      department,
      degree_type,
      duration_years,
      total_units,
      status
    } = req.body;

    await run(
      `UPDATE programs SET 
        program_code = ?, program_name = ?, description = ?, department = ?,
        degree_type = ?, duration_years = ?, total_units = ?, status = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [program_code, program_name, description, department, degree_type, duration_years, total_units, status, id]
    );

    res.json({
      success: true,
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteProgram = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await run('DELETE FROM programs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Curriculum Management
export const getCurriculumByProgram = async (req: AuthRequest, res: Response) => {
  try {
    const { programId } = req.params;

    const curriculum = await query(
      `SELECT 
        c.*,
        s.subject_code,
        s.subject_name,
        s.units,
        s.description as subject_description
       FROM curriculum c
       JOIN subjects s ON c.subject_id = s.id
       WHERE c.program_id = ?
       ORDER BY c.year_level, c.semester, s.subject_code`,
      [programId]
    );

    res.json({
      success: true,
      data: curriculum
    });
  } catch (error) {
    console.error('Get curriculum by program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const addSubjectToCurriculum = async (req: AuthRequest, res: Response) => {
  try {
    const { program_id, subject_id, year_level, semester, is_core, prerequisite_subject_id } = req.body;

    const result = await run(
      `INSERT INTO curriculum 
        (program_id, subject_id, year_level, semester, is_core, prerequisite_subject_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [program_id, subject_id, year_level, semester, is_core ? 1 : 0, prerequisite_subject_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Subject added to curriculum successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error: any) {
    console.error('Add subject to curriculum error:', error);
    res.status(500).json({
      success: false,
      message: error.message?.includes('UNIQUE') ? 'Subject already in curriculum' : 'Server error'
    });
  }
};

export const removeSubjectFromCurriculum = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await run('DELETE FROM curriculum WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Subject removed from curriculum successfully'
    });
  } catch (error) {
    console.error('Remove subject from curriculum error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get dean dashboard stats
export const getDeanDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Total faculty
    const totalFaculty = await query("SELECT COUNT(*) as count FROM faculty WHERE status = 'Active'");

    // Active programs
    const activePrograms = await query("SELECT COUNT(*) as count FROM programs WHERE status = 'Active'");

    // Total students
    const totalStudents = await query("SELECT COUNT(*) as count FROM students WHERE status = 'Active'");

    // Pending approvals (could be curriculum proposals, etc.)
    const pendingApprovals = await query(
      "SELECT COUNT(*) as count FROM enrollments WHERE status = 'For Approval'"
    );

    res.json({
      success: true,
      data: {
        totalFaculty: totalFaculty[0]?.count || 0,
        activePrograms: activePrograms[0]?.count || 0,
        totalStudents: totalStudents[0]?.count || 0,
        pendingApprovals: pendingApprovals[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get dean dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
