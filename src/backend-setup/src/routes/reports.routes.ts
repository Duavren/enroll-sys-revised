import express from 'express';
import { exportStudentsCsv, suggestSubjectsForStudent } from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Reports - students CSV
router.get('/students', authenticate, authorize('admin', 'superadmin', 'registrar'), exportStudentsCsv);

// Suggest subjects for a student (admin/registrar)
router.get('/suggest-subjects/:studentId', authenticate, authorize('admin', 'superadmin', 'registrar'), suggestSubjectsForStudent);

export default router;
