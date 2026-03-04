import { Response } from 'express';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { department, status, search } = req.query;

    let sql = 'SELECT * FROM faculty WHERE 1=1';
    const params: any[] = [];

    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ` AND (faculty_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY last_name, first_name';

    const faculty = await query(sql, params);

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Get all faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getFacultyById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const faculty = await query('SELECT * FROM faculty WHERE id = ?', [id]);

    if (faculty.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Get subjects assigned to this faculty
    const subjects = await query(
      `SELECT DISTINCT s.* 
       FROM subjects s
       JOIN enrollment_subjects es ON s.id = es.subject_id
       WHERE es.instructor LIKE '%' || ? || '%'
       GROUP BY s.id`,
      [faculty[0].last_name]
    );

    res.json({
      success: true,
      data: {
        faculty: faculty[0],
        subjects
      }
    });
  } catch (error) {
    console.error('Get faculty by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const {
      faculty_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      department,
      specialization,
      email,
      contact_number
    } = req.body;

    const result = await run(
      `INSERT INTO faculty 
        (faculty_id, first_name, middle_name, last_name, suffix, department, specialization, email, contact_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [faculty_id, first_name, middle_name || null, last_name, suffix || null, department, specialization || null, email || null, contact_number || null]
    );

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error: any) {
    console.error('Create faculty error:', error);
    res.status(500).json({
      success: false,
      message: error.message?.includes('UNIQUE') ? 'Faculty ID already exists' : 'Server error'
    });
  }
};

export const updateFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      faculty_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      department,
      specialization,
      email,
      contact_number,
      status
    } = req.body;

    await run(
      `UPDATE faculty SET 
        faculty_id = ?, first_name = ?, middle_name = ?, last_name = ?, suffix = ?,
        department = ?, specialization = ?, email = ?, contact_number = ?, status = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [faculty_id, first_name, middle_name, last_name, suffix, department, specialization, email, contact_number, status, id]
    );

    res.json({
      success: true,
      message: 'Faculty updated successfully'
    });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await run('DELETE FROM faculty WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
