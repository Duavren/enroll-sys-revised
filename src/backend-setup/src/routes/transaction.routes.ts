import express from 'express';
import {
  createTransaction,
  getTransactionsByEnrollment,
  getAllTransactions,
  updateTransactionStatus
} from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, authorize('admin', 'superadmin', 'registrar'), createTransaction);
router.get('/enrollment/:enrollmentId', authenticate, getTransactionsByEnrollment);
router.get('/', authenticate, authorize('admin', 'superadmin', 'registrar'), getAllTransactions);
router.put('/:id/status', authenticate, authorize('admin', 'superadmin', 'registrar'), updateTransactionStatus);

export default router;
