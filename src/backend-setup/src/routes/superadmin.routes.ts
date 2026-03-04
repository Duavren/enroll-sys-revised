import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  backupDatabase,
  getSuperadminDashboardStats
} from '../controllers/superadmin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticate, authorize('superadmin'), getSuperadminDashboardStats);

// User Management
router.get('/users', authenticate, authorize('superadmin'), getAllUsers);
router.post('/users', authenticate, authorize('superadmin'), createUser);
router.put('/users/:id', authenticate, authorize('superadmin'), updateUser);
router.delete('/users/:id', authenticate, authorize('superadmin'), deleteUser);

// System Settings
router.post('/backup', authenticate, authorize('superadmin'), backupDatabase);

export default router;
