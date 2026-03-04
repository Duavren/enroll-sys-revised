import api, { handleApiError } from '../utils/api';

class DeanService {
  async getDashboardStats(): Promise<any> {
    try {
      const response = await api.get('/dean/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Programs
  async getAllPrograms(filters?: {
    status?: string;
    department?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/dean/programs', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getProgramById(id: number): Promise<any> {
    try {
      const response = await api.get(`/dean/programs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createProgram(programData: {
    program_code: string;
    program_name: string;
    description?: string;
    department?: string;
    degree_type?: string;
    duration_years?: number;
    total_units?: number;
  }): Promise<any> {
    try {
      const response = await api.post('/dean/programs', programData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateProgram(id: number, programData: any): Promise<any> {
    try {
      const response = await api.put(`/dean/programs/${id}`, programData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteProgram(id: number): Promise<any> {
    try {
      const response = await api.delete(`/dean/programs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Curriculum
  async getCurriculumByProgram(programId: number): Promise<any> {
    try {
      const response = await api.get(`/dean/programs/${programId}/curriculum`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async addSubjectToCurriculum(curriculumData: {
    program_id: number;
    subject_id: number;
    year_level: number;
    semester: string;
    is_core?: boolean;
    prerequisite_subject_id?: number;
  }): Promise<any> {
    try {
      const response = await api.post('/dean/curriculum', curriculumData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async removeSubjectFromCurriculum(id: number): Promise<any> {
    try {
      const response = await api.delete(`/dean/curriculum/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Approve subject selection (moves to "For Payment"), optionally saving edited fees
   */
  async approveSubjectSelection(enrollmentId: number, data?: {
    remarks?: string;
    tuition?: number; registration?: number; library?: number;
    lab?: number; id_fee?: number; others?: number;
  }): Promise<any> {
    try {
      const response = await api.put(`/dean/enrollments/${enrollmentId}/approve-subjects`, data || {});
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async rejectEnrollment(enrollmentId: number, remarks: string): Promise<any> {
    try {
      const response = await api.put(`/dean/enrollments/${enrollmentId}/reject`, { remarks });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEnrollmentDetails(enrollmentId: number): Promise<any> {
    try {
      const response = await api.get(`/dean/enrollments/${enrollmentId}/details`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEnrollmentDocuments(enrollmentId: number): Promise<any> {
    try {
      const response = await api.get(`/admin/enrollments/${enrollmentId}/documents`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Fetch enrollments (admin endpoint is accessible to dean) with optional filters
  async getEnrollments(filters?: { status?: string }): Promise<any> {
    try {
      const response = await api.get('/admin/enrollments', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async reassignTeacher(payload: { teacherId: string; fromSubjectId?: string; toSubjectId?: string; }) {
    try {
      const response = await api.post('/courses/reassign', payload);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const deanService = new DeanService();
