import { Router } from 'express';
import cashier from '../controllers/cashier.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/transactions/pending', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.listPendingTransactions);
router.get('/transactions', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.listTransactions);
router.put('/transactions/:id/process', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.processTransaction);
router.get('/reports/summary', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.cashierReport);
router.get('/assessments', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.listTuitionAssessments);
router.put('/enrollments/:id/approve-assessment', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.approveTuitionAssessment);
router.get('/installment-payments', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.listInstallmentPayments);
router.put('/installment-payments/:paymentId/approve', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.approveInstallmentPayment);
router.put('/installment-payments/:paymentId/reject', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.rejectInstallmentPayment);
router.put('/installment-payments/:paymentId/penalty', authenticate, authorize('cashier', 'superadmin'), cashier.addInstallmentPenalty);

// Enrollment Review (Cashier reviews fees before Dean)
router.get('/enrollment-reviews', authenticate, authorize('cashier', 'registrar', 'superadmin', 'admin'), cashier.listEnrollmentsForReview);
router.put('/enrollment-reviews/:id/update-fees', authenticate, authorize('cashier', 'superadmin'), cashier.updateEnrollmentFees);
router.put('/enrollment-reviews/:id/approve', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.approveEnrollmentReview);
router.put('/enrollment-reviews/:id/reject', authenticate, authorize('cashier', 'registrar', 'superadmin'), cashier.rejectEnrollmentReview);

// Fee Management - Predefined fees
router.get('/fees', authenticate, authorize('cashier', 'superadmin', 'registrar', 'admin', 'student', 'dean'), cashier.getFees);
router.put('/fees', authenticate, authorize('cashier', 'superadmin'), cashier.updateFees);

export default router;
