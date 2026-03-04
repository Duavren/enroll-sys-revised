import { Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const { course, year_level, semester, is_active } = req.query;

    let sql = 'SELECT * FROM subjects WHERE 1=1';
    const params: any[] = [];

    if (course) {
      sql += ' AND course = ?';
      params.push(course);
    }

    if (year_level) {
      sql += ' AND year_level = ?';
      params.push(year_level);
    }

    if (semester) {
      sql += ' AND semester = ?';
      params.push(semester);
    }

    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY subject_code';

    const subjects = await query(sql, params);

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get all subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getSubjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const subjects = await query(
      'SELECT * FROM subjects WHERE id = ?',
      [id]
    );

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: subjects[0]
    });
  } catch (error) {
    console.error('Get subject by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createSubject = async (req: AuthRequest, res: Response) => {
  try {
    const {
      subject_code,
      subject_name,
      description,
      units,
      course,
      year_level,
      semester
    } = req.body;

    // Check if subject code already exists
    const existingSubjects = await query(
      'SELECT id FROM subjects WHERE subject_code = ?',
      [subject_code]
    );

    if (existingSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const result = await run(
      `INSERT INTO subjects 
        (subject_code, subject_name, description, units, course, year_level, semester) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [subject_code, subject_name, description, units, course, year_level, semester]
    );

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: {
        id: result.lastInsertRowid
      }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      subject_code,
      subject_name,
      description,
      units,
      course,
      year_level,
      semester,
      is_active
    } = req.body;

    await run(
      `UPDATE subjects SET 
        subject_code = ?,
        subject_name = ?,
        description = ?,
        units = ?,
        course = ?,
        year_level = ?,
        semester = ?,
        is_active = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [subject_code, subject_name, description, units, course, year_level, semester, is_active, id]
    );

    res.json({
      success: true,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if subject is used in any enrollments
    const enrollmentSubjects = await query(
      'SELECT COUNT(*) as count FROM enrollment_subjects WHERE subject_id = ?',
      [id]
    );

    if (enrollmentSubjects[0]?.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject that is used in enrollments'
      });
    }

    await run('DELETE FROM subjects WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getSubjectsByCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { course } = req.params;
    const { year_level, semester } = req.query;

    let sql = 'SELECT * FROM subjects WHERE course = ? AND is_active = 1';
    const params: any[] = [course];

    if (year_level) {
      sql += ' AND year_level = ?';
      params.push(year_level);
    }

    if (semester) {
      sql += ' AND semester = ?';
      params.push(semester);
    }

    sql += ' ORDER BY year_level, subject_code';

    const subjects = await query(sql, params);

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getSchedulesForSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const schedules = await query(
      'SELECT id, day_time, room, instructor, capacity, is_active FROM subject_schedules WHERE subject_id = ? AND is_active = 1 ORDER BY id',
      [id]
    );

    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Get schedules for subject error:', error);
    const msg = String((error as any)?.message ?? error ?? '').toLowerCase();
    if (msg.includes('no such table') || msg.includes('no such column')) {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
