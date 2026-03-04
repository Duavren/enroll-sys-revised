import express from 'express';
import {
  getAllSubjects,
  getSubjectById,
  getSchedulesForSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByCourse
} from '../controllers/subject.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getAllSubjects);
router.get('/course/:course', authenticate, getSubjectsByCourse);
router.get('/:id/schedules', authenticate, getSchedulesForSubject);
router.get('/:id', authenticate, getSubjectById);
router.post('/', authenticate, authorize('admin', 'superadmin', 'dean'), createSubject);
router.put('/:id', authenticate, authorize('admin', 'superadmin', 'dean'), updateSubject);
router.delete('/:id', authenticate, authorize('superadmin'), deleteSubject);

export default router;
