import express from 'express';
import {
  submitApplication,
  listStudentApplications,
  listAllApplications,
  getApplication,
  decideApplication
} from '../controllers/scholarship.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Student endpoints
router.post('/students/:studentId/applications', authenticate, authorize('student'), submitApplication as any);
router.get('/students/:studentId/applications', authenticate, authorize('student'), listStudentApplications);

// Registrar/Admin endpoints
router.get('/registrar/applications', authenticate, authorize('registrar', 'admin', 'superadmin'), listAllApplications);
router.get('/registrar/applications/:id', authenticate, authorize('registrar', 'admin', 'superadmin'), getApplication);
router.put('/registrar/applications/:id/decision', authenticate, authorize('registrar', 'admin', 'superadmin'), decideApplication);

export default router;
