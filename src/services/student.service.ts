import api, { handleApiError } from '../utils/api';

class StudentService {
  /**
   * Get student profile
   */
  async getProfile(): Promise<any> {
    try {
      const response = await api.get('/students/profile');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async listNotifications(): Promise<any> {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markNotificationRead(id: number | string): Promise<any> {
    try {
      const response = await api.post(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update student profile
   */
  async updateProfile(profileData: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    suffix?: string;
    contact_number?: string;
    address?: string;
    birth_date?: string;
    gender?: string;
    username?: string;
  }): Promise<any> {
    try {
      const response = await api.put('/students/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change password
   */
  async changePassword(newPassword: string): Promise<any> {
    try {
      const response = await api.put('/auth/change-password', {
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get student enrollments
   */
  async getEnrollments(): Promise<any> {
    try {
      const response = await api.get('/students/enrollments');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Upload document
   */
  async uploadDocument(
    file: File,
    documentType: string,
    enrollmentId?: number
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);
      if (enrollmentId) {
        formData.append('enrollment_id', enrollmentId.toString());
      }

      const response = await api.post('/students/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit installment payment
   */
  async submitInstallmentPayment(data: {
    enrollmentId: number;
    studentId: number;
    amount: number;
    period: string;
    paymentMethod: string;
    referenceNumber: string;
    receiptPath?: string;
  }): Promise<any> {
    try {
      const response = await api.post('/payments/installment', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get installment payment schedule for an enrollment
   */
  async getInstallmentSchedule(enrollmentId: number): Promise<any> {
    try {
      const response = await api.get(`/payments/installment-schedule/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const studentService = new StudentService();
