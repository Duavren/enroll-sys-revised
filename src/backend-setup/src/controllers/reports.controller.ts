import { Response } from 'express';
import { query } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

// Generate CSV of students
export const exportStudentsCsv = async (req: AuthRequest, res: Response) => {
  try {
    const students = await query('SELECT s.*, u.username, u.email FROM students s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.student_id');

    const headers = ['student_id', 'first_name', 'middle_name', 'last_name', 'course', 'year_level', 'username', 'email', 'status'];
    const rows = students.map((s: any) => headers.map(h => (s[h] !== null && s[h] !== undefined) ? String(s[h]).replace(/"/g, '""') : '').join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_report.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export students CSV error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Suggest subjects for a student based on course/year and excluding already taken
export const suggestSubjectsForStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params; // can be student.student_id or internal numeric id

    // Find internal student record by student_id OR id
    const students = await query('SELECT * FROM students WHERE student_id = ? OR id = ? LIMIT 1', [studentId, studentId]);
    if (students.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const student = students[0];

    // Get latest enrollment id for this student
    const enrollments = await query('SELECT id, school_year, semester FROM enrollments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1', [student.id]);
    const latestEnrollmentId = enrollments.length > 0 ? enrollments[0].id : null;

    // Get subjects already taken in any enrollment (passed or not)
    const taken = await query('SELECT subject_id FROM enrollment_subjects WHERE enrollment_id IN (SELECT id FROM enrollments WHERE student_id = ?)', [student.id]);
    const takenIds = taken.map((t: any) => t.subject_id);

    // Suggest subjects matching student's course and year_level that are not taken yet
    const subjects = await query(
      'SELECT * FROM subjects WHERE course = ? AND year_level = ? AND is_active IS NOT 0 ORDER BY subject_code',
      [student.course, student.year_level]
    );

    const suggestions = subjects.filter((s: any) => !takenIds.includes(s.id));

    res.json({ success: true, data: { student: { id: student.id, student_id: student.student_id, course: student.course, year_level: student.year_level }, suggestions } });
  } catch (error) {
    console.error('Suggest subjects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
