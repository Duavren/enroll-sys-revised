import { Router } from 'express';
import analytics from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Protected analytics endpoints - only admin/dean/superadmin
router.get('/usage', authenticate, authorize('admin', 'dean', 'superadmin'), analytics.getUsage);
router.get('/students-per-program', authenticate, authorize('admin', 'dean', 'superadmin'), analytics.getStudentsPerProgram);
router.get('/enrollment-stats', authenticate, authorize('admin', 'dean', 'superadmin'), analytics.getEnrollmentStats);
router.get('/cashier-summary', authenticate, authorize('cashier', 'registrar', 'admin', 'superadmin'), analytics.getCashierSummary);
router.get('/dean-summary', authenticate, authorize('dean', 'admin', 'superadmin'), analytics.getDeanSummary);

export default router;
