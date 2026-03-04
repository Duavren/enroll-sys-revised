import api, { handleApiError } from '../utils/api';

class RegistrarService {
  async assignSection(enrollmentId: number, sectionId: number): Promise<any> {
    try {
      const response = await api.post('/registrar/sections/assign', { enrollment_id: enrollmentId, section_id: sectionId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEnrollmentReport(): Promise<any> {
    try {
      const response = await api.get('/registrar/reports/enrollments');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getDashboardStats(): Promise<any> {
    try {
      const response = await api.get('/registrar/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // CORs
  async getAllCORs(filters?: {
    status?: string;
    studentId?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/registrar/cors', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async generateCOR(enrollmentId: number): Promise<any> {
    try {
      const response = await api.post('/registrar/cors/generate', { enrollmentId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async approveCOR(id: number): Promise<any> {
    try {
      const response = await api.put(`/registrar/cors/${id}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Clearances
  async getAllClearances(filters?: {
    status?: string;
    clearance_type?: string;
    studentId?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/registrar/clearances', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createClearance(clearanceData: {
    student_id: number;
    clearance_type: string;
    issue_description?: string;
  }): Promise<any> {
    try {
      const response = await api.post('/registrar/clearances', clearanceData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async resolveClearance(id: number, remarks?: string): Promise<any> {
    try {
      const response = await api.put(`/registrar/clearances/${id}/resolve`, { remarks });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Subject Assessment (new step after subject selection)
  async getPendingSubjectAssessments(): Promise<any> {
    try {
      const response = await api.get('/registrar/enrollments/pending-assessment');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEnrollmentAssessmentDetails(enrollmentId: number): Promise<any> {
    try {
      const response = await api.get(`/registrar/enrollments/${enrollmentId}/assessment-details`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async approveSubjectAssessment(
    enrollmentId: number,
    assessmentData: {
      tuition?: number;
      registration?: number;
      library?: number;
      lab?: number;
      id_fee?: number;
      others?: number;
      remarks?: string;
    }
  ): Promise<any> {
    try {
      const response = await api.put(`/registrar/enrollments/${enrollmentId}/approve-assessment`, assessmentData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Assess enrollment and set fees
   */
  async assessEnrollment(
    enrollmentId: number,
    assessmentData: {
      tuition: number;
      registration: number;
      library: number;
      lab: number;
      id_fee: number;
      others: number;
      remarks?: string;
    }
  ): Promise<any> {
    try {
      const response = await api.put(`/registrar/enrollments/${enrollmentId}/assess`, assessmentData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(
    enrollmentId: number,
    verificationData: {
      transaction_id: number;
      remarks?: string;
    }
  ): Promise<any> {
    try {
      const response = await api.put(`/registrar/enrollments/${enrollmentId}/verify-payment`, verificationData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Approve enrollment (moves to "For Subject Selection")
   */
  async approveEnrollment(enrollmentId: number, remarks?: string): Promise<any> {
    try {
      const response = await api.put(`/registrar/enrollments/${enrollmentId}/approve`, { remarks });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reject enrollment
   */
  async rejectEnrollment(enrollmentId: number, remarks?: string): Promise<any> {
    try {
      const response = await api.put(`/registrar/enrollments/${enrollmentId}/reject`, { remarks });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const registrarService = new RegistrarService();
