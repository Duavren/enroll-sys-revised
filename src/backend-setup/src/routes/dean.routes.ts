import express from 'express';
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getCurriculumByProgram,
  addSubjectToCurriculum,
  removeSubjectFromCurriculum,
  getDeanDashboardStats
} from '../controllers/dean.controller';
import { approveSubjectSelection, rejectEnrollmentByDean } from '../controllers/enrollment.controller';
import { getEnrollmentForAssessment } from '../controllers/registrar.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticate, authorize('dean', 'superadmin'), getDeanDashboardStats);

// Enrollment Approval
router.get('/enrollments/:id/details', authenticate, authorize('dean', 'superadmin'), getEnrollmentForAssessment);
router.put('/enrollments/:id/approve-subjects', authenticate, authorize('dean', 'superadmin'), approveSubjectSelection);
router.put('/enrollments/:id/reject', authenticate, authorize('dean', 'superadmin'), rejectEnrollmentByDean);

// Programs
router.get('/programs', authenticate, authorize('dean', 'superadmin'), getAllPrograms);
router.get('/programs/:id', authenticate, authorize('dean', 'superadmin'), getProgramById);
router.post('/programs', authenticate, authorize('dean', 'superadmin'), createProgram);
router.put('/programs/:id', authenticate, authorize('dean', 'superadmin'), updateProgram);
router.delete('/programs/:id', authenticate, authorize('dean', 'superadmin'), deleteProgram);

// Curriculum
router.get('/programs/:programId/curriculum', authenticate, authorize('dean', 'superadmin'), getCurriculumByProgram);
router.post('/curriculum', authenticate, authorize('dean', 'superadmin'), addSubjectToCurriculum);
router.delete('/curriculum/:id', authenticate, authorize('dean', 'superadmin'), removeSubjectFromCurriculum);

export default router;
