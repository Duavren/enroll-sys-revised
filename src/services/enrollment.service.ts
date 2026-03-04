import api, { handleApiError } from '../utils/api';

class EnrollmentService {
  /**
   * Create new enrollment
   */
  async createEnrollment(schoolYear: string, semester: string, scholarshipType?: string, scholarshipLetterPath?: string): Promise<any> {
    try {
      const response = await api.post('/enrollments', {
        school_year: schoolYear,
        semester: semester,
        scholarship_type: scholarshipType,
        scholarship_letter_path: scholarshipLetterPath
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get my enrollments (for students)
   */
  async getMyEnrollments(): Promise<any> {
    try {
      const response = await api.get('/enrollments/my');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get enrollment details with subjects
   */
  async getEnrollmentDetails(id: number): Promise<any> {
    try {
      const response = await api.get(`/enrollments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Add subject to enrollment
   */
  async addSubject(
    enrollmentId: number,
    subjectId: number,
    schedule?: string,
    room?: string,
    instructor?: string,
    schedule_id?: number
  ): Promise<any> {
    try {
      const response = await api.post(`/enrollments/${enrollmentId}/subjects`, {
        subject_id: subjectId,
        schedule,
        room,
        instructor,
        schedule_id
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove subject from enrollment
   */
  async removeSubject(enrollmentId: number, subjectId: number): Promise<any> {
    try {
      const response = await api.delete(
        `/enrollments/${enrollmentId}/subjects/${subjectId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit enrollment for assessment
   */
  async submitForAssessment(enrollmentId: number): Promise<any> {
    try {
      const response = await api.put(`/enrollments/${enrollmentId}/submit`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit subjects for Dean approval
   */
  async submitSubjects(enrollmentId: number): Promise<any> {
    try {
      const response = await api.put(`/enrollments/${enrollmentId}/submit-subjects`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit payment
   */
  async submitPayment(
    enrollmentId: number,
    paymentData: {
      payment_method: string;
      reference_number: string;
      receipt_path?: string;
      amount?: number;
    }
  ): Promise<any> {
    try {
      const response = await api.put(`/enrollments/${enrollmentId}/submit-payment`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const enrollmentService = new EnrollmentService();
