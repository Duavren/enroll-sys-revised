import express from 'express';
import {
  createEnrollment,
  getMyEnrollments,
  getEnrollmentDetails,
  addSubjectToEnrollment,
  removeSubjectFromEnrollment,
  submitForAssessment,
  submitSubjects,
  submitPayment
} from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, authorize('student'), createEnrollment);
router.get('/my', authenticate, authorize('student'), getMyEnrollments);
router.get('/:id', authenticate, getEnrollmentDetails);
router.post('/:id/subjects', authenticate, authorize('student', 'registrar'), addSubjectToEnrollment);
router.delete('/:id/subjects/:subjectId', authenticate, authorize('student', 'registrar'), removeSubjectFromEnrollment);
router.put('/:id/submit', authenticate, authorize('student'), submitForAssessment);
router.put('/:id/submit-subjects', authenticate, authorize('student'), submitSubjects);
router.put('/:id/submit-payment', authenticate, authorize('student'), submitPayment);

export default router;
