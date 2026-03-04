import { Router } from 'express';
import curriculum from '../controllers/curriculum.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Upload curriculum - authenticated users (admin, faculty, dean, superadmin)
router.post('/upload', authenticate, authorize('admin', 'faculty', 'dean', 'superadmin'), curriculum.uploadCurriculum);

// List pending curricula - dean and superadmin
router.get('/pending', authenticate, authorize('dean', 'superadmin'), curriculum.listPending);

// Approve curriculum - dean or superadmin
router.put('/:id/approve', authenticate, authorize('dean', 'superadmin'), curriculum.approveCurriculum);

export default router;
