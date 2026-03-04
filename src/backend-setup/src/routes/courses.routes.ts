import { Router } from 'express';
import courses from '../controllers/courses.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Listing available courses requires authentication
router.get('/', authenticate, authorize('admin', 'dean', 'superadmin', 'registrar'), courses.listCourses);

// Course management (create/update) limited to dean/admin/superadmin
router.post('/', authenticate, authorize('dean', 'admin', 'superadmin'), courses.createCourse);
router.put('/:id', authenticate, authorize('dean', 'admin', 'superadmin'), courses.updateCourse);

// Deletion restricted to superadmin
router.delete('/:id', authenticate, authorize('superadmin'), courses.deleteCourse);

// Reassign teacher endpoint - dean/admin/superadmin
router.post('/reassign', authenticate, authorize('dean', 'admin', 'superadmin'), courses.reassignTeacher);

export default router;
