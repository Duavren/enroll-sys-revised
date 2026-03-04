import express from 'express';
import {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
} from '../controllers/faculty.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'superadmin', 'dean'), getAllFaculty);
router.get('/:id', authenticate, authorize('admin', 'superadmin', 'dean'), getFacultyById);
router.post('/', authenticate, authorize('admin', 'superadmin', 'dean'), createFaculty);
router.put('/:id', authenticate, authorize('admin', 'superadmin', 'dean'), updateFaculty);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteFaculty);

export default router;
