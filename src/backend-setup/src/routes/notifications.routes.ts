import { Router } from 'express';
import notifications from '../controllers/notifications.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Students can fetch their notifications
router.get('/', authenticate, authorize('student', 'admin', 'registrar', 'dean', 'cashier', 'superadmin'), notifications.listNotifications);
// Mark a notification (activity log) as read for the current user
router.post('/:id/read', authenticate, authorize('student', 'admin', 'registrar', 'dean', 'cashier', 'superadmin'), notifications.markAsRead);

export default router;
