import api, { handleApiError } from '../utils/api';

class TransactionService {
  /**
   * Create new transaction (admin/registrar only)
   */
  async createTransaction(transactionData: {
    enrollment_id: number;
    transaction_type: string;
    amount: number;
    payment_method: string;
    reference_number?: string;
    remarks?: string;
  }): Promise<any> {
    try {
      const response = await api.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get transactions by enrollment
   */
  async getTransactionsByEnrollment(enrollmentId: number): Promise<any> {
    try {
      const response = await api.get(`/transactions/enrollment/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all transactions with filters (admin/registrar only)
   */
  async getAllTransactions(filters?: {
    status?: string;
    payment_method?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/transactions', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update transaction status (admin/registrar only)
   */
  async updateTransactionStatus(
    id: number,
    status: string,
    remarks?: string
  ): Promise<any> {
    try {
      const response = await api.put(`/transactions/${id}/status`, {
        status,
        remarks,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const transactionService = new TransactionService();
