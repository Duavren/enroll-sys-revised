import api, { handleApiError } from '../utils/api';

class ScholarshipService {
  async submitApplication(studentId: string, form: FormData): Promise<any> {
    try {
      const response = await api.post(`/scholarships/students/${encodeURIComponent(studentId)}/applications`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async listStudentApplications(studentId: string): Promise<any> {
    try {
      const response = await api.get(`/scholarships/students/${encodeURIComponent(studentId)}/applications`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async listAllApplications(): Promise<any> {
    try {
      const response = await api.get('/scholarships/registrar/applications');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getApplication(id: number): Promise<any> {
    try {
      const response = await api.get(`/scholarships/registrar/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async decideApplication(id: number, payload: { action: string; coverage?: string; remarks?: string }): Promise<any> {
    try {
      const response = await api.put(`/scholarships/registrar/applications/${id}/decision`, payload);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const scholarshipService = new ScholarshipService();
