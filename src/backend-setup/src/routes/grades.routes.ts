import express from 'express';
import {
  getStudentGrades,
  updateGrade,
  bulkUpdateGrades,
  getGradesBySection
} from '../controllers/grades.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/student/:studentId', authenticate, authorize('admin', 'superadmin', 'registrar', 'dean'), getStudentGrades);
router.put('/:id', authenticate, authorize('admin', 'superadmin', 'registrar'), updateGrade);
router.post('/bulk', authenticate, authorize('admin', 'superadmin', 'registrar'), bulkUpdateGrades);
router.get('/section', authenticate, authorize('admin', 'superadmin', 'registrar', 'dean'), getGradesBySection);
router.post('/:id/approve', authenticate, authorize('dean', 'admin', 'superadmin'), (req, res, next) => require('../controllers/grades.controller').approveGrade(req, res).catch(next));

export default router;
