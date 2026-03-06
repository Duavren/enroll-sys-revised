import api, { handleApiError } from '../utils/api';

class CashierService {
  async listPending() {
    try {
      const res = await api.get('/cashier/transactions/pending');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async listTransactions(filters?: { search?: string; status?: string; school_year?: string; semester?: string; }) {
    try {
      const res = await api.get('/cashier/transactions', { params: filters });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async process(transactionId: number | string, action: 'complete' | 'reject', remarks?: string) {
    try {
      const res = await api.put(`/cashier/transactions/${transactionId}/process`, { action, remarks });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getSummary() {
    try {
      const res = await api.get('/cashier/reports/summary');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAnalyticsSnapshot() {
    try {
      const res = await api.get('/analytics/cashier-summary');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getTuitionAssessments() {
    try {
      const res = await api.get('/cashier/assessments');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async approveAssessment(enrollmentId: number | string) {
    try {
      const res = await api.put(`/cashier/enrollments/${enrollmentId}/approve-assessment`);
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getInstallmentPayments(filters?: { search?: string; status?: string; school_year?: string; semester?: string; }) {
    try {
      const res = await api.get('/cashier/installment-payments', { params: filters });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async approveInstallmentPayment(paymentId: number | string) {
    try {
      const res = await api.put(`/cashier/installment-payments/${paymentId}/approve`);
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async rejectInstallmentPayment(paymentId: number | string, reason: string) {
    try {
      const res = await api.put(`/cashier/installment-payments/${paymentId}/reject`, { reason });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async addInstallmentPenalty(paymentId: number | string, penaltyAmount: number, reason?: string) {
    try {
      const res = await api.put(`/cashier/installment-payments/${paymentId}/penalty`, { penalty_amount: penaltyAmount, reason });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Enrollment Review endpoints
  async getEnrollmentsForReview() {
    try {
      const res = await api.get('/cashier/enrollment-reviews');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateEnrollmentFees(enrollmentId: number | string, fees: { tuition?: number; registration?: number; library?: number; lab?: number; id_fee?: number; others?: number; }) {
    try {
      const res = await api.put(`/cashier/enrollment-reviews/${enrollmentId}/update-fees`, fees);
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async approveEnrollmentReview(enrollmentId: number | string, remarks?: string) {
    try {
      const res = await api.put(`/cashier/enrollment-reviews/${enrollmentId}/approve`, { remarks });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async rejectEnrollmentReview(enrollmentId: number | string, remarks?: string) {
    try {
      const res = await api.put(`/cashier/enrollment-reviews/${enrollmentId}/reject-review`, { remarks });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Enrollment Review (Cashier reviews fees before Dean)
  async getEnrollmentReviews() {
    try {
      const res = await api.get('/cashier/enrollment-reviews');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async approveEnrollmentReview(enrollmentId: number | string, remarks?: string) {
    try {
      const res = await api.put(`/cashier/enrollment-reviews/${enrollmentId}/approve`, { remarks });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async rejectEnrollmentReview(enrollmentId: number | string, remarks?: string) {
    try {
      const res = await api.put(`/cashier/enrollment-reviews/${enrollmentId}/reject-review`, { remarks });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Fee Management - Per-course tuition per unit and fixed fees
  async getFees(course?: string) {
    try {
      const params = course ? { course } : {};
      const res = await api.get('/cashier/fees', { params });
      return res.data?.data || res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateFees(fees: {
    course: string;
    tuition_per_unit: number;
    registration: number;
    library: number;
    lab: number;
    id_fee: number;
    others: number;
  }) {
    try {
      const res = await api.put('/cashier/fees', fees);
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const cashierService = new CashierService();