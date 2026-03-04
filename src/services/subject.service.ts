import api, { handleApiError } from '../utils/api';

class SubjectService {
  /**
   * Get all subjects with optional filters
   */
  async getAllSubjects(filters?: {
    course?: string;
    year_level?: number;
    semester?: string;
    is_active?: boolean;
  }): Promise<any> {
    try {
      const response = await api.get('/subjects', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get subjects by course
   */
  async getSubjectsByCourse(
    course: string,
    yearLevel?: number,
    semester?: string
  ): Promise<any> {
    try {
      const response = await api.get(`/subjects/course/${course}`, {
        params: { year_level: yearLevel, semester },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(id: number): Promise<any> {
    try {
      const response = await api.get(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getSchedules(id: number): Promise<any> {
    try {
      const response = await api.get(`/subjects/${id}/schedules`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new subject (admin/dean only)
   */
  async createSubject(subjectData: {
    subject_code: string;
    subject_name: string;
    description?: string;
    units: number;
    course?: string;
    year_level?: number;
    semester?: string;
  }): Promise<any> {
    try {
      const response = await api.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update subject (admin/dean only)
   */
  async updateSubject(id: number, subjectData: any): Promise<any> {
    try {
      const response = await api.put(`/subjects/${id}`, subjectData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete subject (superadmin only)
   */
  async deleteSubject(id: number): Promise<any> {
    try {
      const response = await api.delete(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const subjectService = new SubjectService();
