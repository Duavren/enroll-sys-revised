import api, { handleApiError } from '../utils/api';

class GradesService {
  async approveGrade(enrollmentSubjectId: number, remarks?: string): Promise<any> {
    try {
      const response = await api.post(`/grades/${enrollmentSubjectId}/approve`, { remarks });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getStudentGrades(studentId: string, filters?: {
    school_year?: string;
    semester?: string;
    subject_type?: 'SHS' | 'College';
  }): Promise<any> {
    try {
      const response = await api.get(`/grades/student/${studentId}`, { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateGrade(enrollmentSubjectId: number, grade: string): Promise<any> {
    try {
      const response = await api.put(`/grades/${enrollmentSubjectId}`, { grade });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async bulkUpdateGrades(grades: Array<{ enrollment_subject_id: number; grade: string }>): Promise<any> {
    try {
      const response = await api.post('/grades/bulk', { grades });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getGradesBySection(filters?: {
    sectionId?: number;
    subjectId?: number;
  }): Promise<any> {
    try {
      const response = await api.get('/grades/section', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const gradesService = new GradesService();
