import { Router } from 'express';
import payments from '../controllers/payments.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Assessment and payment history - authenticated users and appropriate roles
router.get('/assessment/:studentId', authenticate, authorize('student', 'admin', 'superadmin', 'registrar', 'cashier'), payments.getAssessment);
router.get('/student/:studentId', authenticate, authorize('student', 'admin', 'superadmin', 'registrar', 'cashier'), payments.listPayments);
router.get('/approved/:studentId', authenticate, authorize('student', 'admin', 'superadmin', 'registrar', 'cashier'), payments.getApprovedPayments);

// Add a payment (students can submit, cashier/admin can also add)
router.post('/student/:studentId', authenticate, authorize('student', 'cashier', 'admin', 'superadmin'), payments.addPayment);

// Installment payment submission
router.post('/installment', authenticate, authorize('student', 'cashier', 'admin', 'superadmin'), payments.submitInstallmentPayment);

// Get installment schedule for an enrollment
router.get('/installment-schedule/:enrollmentId', authenticate, authorize('student', 'admin', 'superadmin', 'registrar', 'cashier'), payments.getInstallmentSchedule);

// Get all installment payments (admin only)
router.get('/installments', authenticate, authorize('admin', 'superadmin', 'registrar'), payments.getAllInstallmentPayments);

// Update installment payment status (admin only)
router.put('/installments/:id', authenticate, authorize('admin', 'superadmin'), payments.updateInstallmentPaymentStatus);

export default router;
