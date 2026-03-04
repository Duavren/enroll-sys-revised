import api, { handleApiError } from '../utils/api';

class ReportsService {
  async exportStudentsCsv(): Promise<Blob> {
    try {
      const response = await api.get('/reports/students', { responseType: 'blob' as any });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async suggestSubjects(studentId: string): Promise<any> {
    try {
      const response = await api.get(`/reports/suggest-subjects/${encodeURIComponent(studentId)}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const reportsService = new ReportsService();
