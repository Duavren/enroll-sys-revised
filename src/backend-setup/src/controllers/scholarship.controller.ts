import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query, run } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';

const uploadsRoot = path.join(__dirname, '../../uploads/scholarships');
try { fs.mkdirSync(uploadsRoot, { recursive: true }); } catch (e) {}

// Ensure table exists
const ensureTable = async () => {
  await run(`CREATE TABLE IF NOT EXISTS scholarship_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_internal_id INTEGER,
    student_id TEXT,
    scholarship_type TEXT,
    files TEXT,
    meta TEXT,
    status TEXT DEFAULT 'Pending',
    coverage TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
  )`);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const studentId = (req.params.studentId || 'unknown').toString();
    const dir = path.join(uploadsRoot, studentId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

export const submitApplication = [upload.any(), async (req: Request, res: Response) => {
  try {
    await ensureTable();
    const { studentId } = req.params;
    const { scholarship_type } = req.body;

    // resolve student internal id
    const studs = await query('SELECT * FROM students WHERE student_id = ? OR id = ? LIMIT 1', [studentId, studentId]);
    if (studs.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const student = studs[0];

    const files = (req as any).files || [];
    const stored: any = {};
    for (const f of files) {
      // group by fieldname
      if (!stored[f.fieldname]) stored[f.fieldname] = [];
      stored[f.fieldname].push(`/uploads/scholarships/${student.student_id}/${f.filename}`);
    }

    const meta = req.body.meta ? JSON.stringify(JSON.parse(req.body.meta)) : null;
    const result = await run('INSERT INTO scholarship_applications (student_internal_id, student_id, scholarship_type, files, meta, status) VALUES (?, ?, ?, ?, ?, ?)',
      [student.id, student.student_id, scholarship_type || null, JSON.stringify(stored), meta, 'Pending']);

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (err) {
    console.error('Submit scholarship application error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

export const listStudentApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const studs = await query('SELECT * FROM students WHERE student_id = ? OR id = ? LIMIT 1', [studentId, studentId]);
    if (studs.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const student = studs[0];

    const apps = await query('SELECT * FROM scholarship_applications WHERE student_internal_id = ? ORDER BY created_at DESC', [student.id]);
    const parsed = apps.map((a: any) => ({ ...a, files: a.files ? JSON.parse(a.files) : {}, meta: a.meta ? JSON.parse(a.meta) : null }));
    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('List student scholarship apps error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const listAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const apps = await query('SELECT a.*, s.student_id as student_number, s.first_name, s.last_name FROM scholarship_applications a LEFT JOIN students s ON a.student_internal_id = s.id ORDER BY a.created_at DESC');
    const parsed = apps.map((a: any) => ({ ...a, files: a.files ? JSON.parse(a.files) : {}, meta: a.meta ? JSON.parse(a.meta) : null }));
    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('List all scholarship apps error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const apps = await query('SELECT a.*, s.student_id as student_number, s.first_name, s.last_name FROM scholarship_applications a LEFT JOIN students s ON a.student_internal_id = s.id WHERE a.id = ? LIMIT 1', [id]);
    if (apps.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    const app = apps[0];
    app.files = app.files ? JSON.parse(app.files) : {};
    app.meta = app.meta ? JSON.parse(app.meta) : null;
    res.json({ success: true, data: app });
  } catch (err) {
    console.error('Get scholarship app error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const decideApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, coverage, remarks } = req.body; // action: approve|deny
    const apps = await query('SELECT * FROM scholarship_applications WHERE id = ? LIMIT 1', [id]);
    if (apps.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });

    let statusToSet: string | null = null;
    if (action === 'approve') statusToSet = 'Approved';
    else if (action === 'deny' || action === 'deny') statusToSet = 'Denied';
    else if (action === 'suspend') statusToSet = 'Suspended';
    // 'edit' will only update coverage/remarks but keep current status


    if (statusToSet) {
      await run('UPDATE scholarship_applications SET status = ?, coverage = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [statusToSet, coverage || null, remarks || null, id]);
    } else {
      // edit
      await run('UPDATE scholarship_applications SET coverage = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [coverage || null, remarks || null, id]);
    }

    // Optionally, notify student - omitted for brevity (could insert into activity_logs table)

    const msg = statusToSet ? `Application ${statusToSet.toLowerCase()}` : 'Application updated';
    res.json({ success: true, message: msg });
  } catch (err) {
    console.error('Decide scholarship app error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
