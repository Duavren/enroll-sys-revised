import { Router } from 'express';
import logs from '../controllers/logs.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Only admin and superadmin can list logs
router.get('/', authenticate, authorize('admin', 'superadmin'), logs.listLogs);

// Adding logs allowed for any authenticated user (system actions)
router.post('/', authenticate, logs.addLog);

export default router;
