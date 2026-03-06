import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import db from '../database/connection';

const dataDir = path.join(__dirname, '../../data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
const coursesFile = path.join(dataDir, 'courses.json');

function readCourses() {
  try { return JSON.parse(fs.readFileSync(coursesFile, 'utf8') || '[]'); } catch (e) { return []; }
}

function writeCourses(items: any[]) { fs.writeFileSync(coursesFile, JSON.stringify(items, null, 2)); }

export const listCourses = (req: Request, res: Response) => {
  try {
    const jsonCourses = readCourses();

    // Also pull distinct courses from the database (courses_fees + subjects)
    const dbCourses: any[] = [];
    try {
      const feeCourses = db.prepare('SELECT DISTINCT course FROM courses_fees WHERE course IS NOT NULL AND course != ""').all();
      const subjectCourses = db.prepare('SELECT DISTINCT course FROM subjects WHERE course IS NOT NULL AND course != ""').all();
      const seen = new Set(jsonCourses.map((c: any) => (c.program_code || '').toUpperCase()));
      for (const row of [...(feeCourses || []), ...(subjectCourses || [])]) {
        const name = (row as any).course;
        if (name && !seen.has(name.toUpperCase())) {
          seen.add(name.toUpperCase());
          dbCourses.push({ id: `db-${name}`, program_code: name, program_name: name, description: '' });
        }
      }
    } catch (e) {
      console.error('Failed to load DB courses:', e);
    }

    res.json({ success: true, data: [...jsonCourses, ...dbCourses] });
  } catch (e) {
    res.json({ success: true, data: readCourses() });
  }
};

export const createCourse = (req: Request, res: Response) => {
  const payload = req.body;
  const courses = readCourses();
  const newCourse = { id: Date.now().toString(), ...payload };
  courses.push(newCourse);
  writeCourses(courses);
  res.json({ success: true, data: newCourse });
};

export const updateCourse = (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const courses = readCourses();
  const idx = courses.findIndex((c: any) => c.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  courses[idx] = { ...courses[idx], ...payload };
  writeCourses(courses);
  res.json({ success: true, data: courses[idx] });
};

export const deleteCourse = (req: Request, res: Response) => {
  const { id } = req.params;
  const courses = readCourses();
  const filtered = courses.filter((c: any) => c.id !== id);
  writeCourses(filtered);
  res.json({ success: true });
};

export const reassignTeacher = (req: Request, res: Response) => {
  const { teacherId, fromSubjectId, toSubjectId } = req.body;
  // very small placeholder: record action into course file as audit
  const courses = readCourses();
  const entry = { id: Date.now(), teacherId, fromSubjectId, toSubjectId, ts: new Date().toISOString() };
  const auditsFile = path.join(dataDir, 'reassignments.json');
  const audits = (() => { try { return JSON.parse(fs.readFileSync(auditsFile, 'utf8') || '[]'); } catch (e) { return []; } })();
  audits.unshift(entry);
  fs.writeFileSync(auditsFile, JSON.stringify(audits, null, 2));
  res.json({ success: true, data: entry });
};

export default { listCourses, createCourse, updateCourse, deleteCourse, reassignTeacher };
