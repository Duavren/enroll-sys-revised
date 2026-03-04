import api, { handleApiError } from '../utils/api';

class MaintenanceService {
  // Sections
  async getAllSections(filters?: {
    course?: string;
    year_level?: number;
    school_year?: string;
    semester?: string;
    status?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/maintenance/sections', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createSection(sectionData: {
    section_code: string;
    section_name: string;
    course: string;
    year_level: number;
    school_year: string;
    semester: string;
    capacity?: number;
    adviser_id?: number;
  }): Promise<any> {
    try {
      const response = await api.post('/maintenance/sections', sectionData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateSection(id: number, sectionData: any): Promise<any> {
    try {
      const response = await api.put(`/maintenance/sections/${id}`, sectionData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteSection(id: number): Promise<any> {
    try {
      const response = await api.delete(`/maintenance/sections/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // School Years
  async getAllSchoolYears(): Promise<any> {
    try {
      const response = await api.get('/maintenance/school-years');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createSchoolYear(schoolYearData: {
    school_year: string;
    start_date: string;
    end_date: string;
    enrollment_start?: string;
    enrollment_end?: string;
    is_active?: boolean;
  }): Promise<any> {
    try {
      const response = await api.post('/maintenance/school-years', schoolYearData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateSchoolYear(id: number, schoolYearData: any): Promise<any> {
    try {
      const response = await api.put(`/maintenance/school-years/${id}`, schoolYearData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteSchoolYear(id: number): Promise<any> {
    try {
      const response = await api.delete(`/maintenance/school-years/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Subjects (SHS and College)
  async getAllSubjectsByType(filters?: {
    subject_type?: 'SHS' | 'College';
    course?: string;
    year_level?: number;
    semester?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/maintenance/subjects', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createSubject(subjectData: {
    subject_code: string;
    subject_name: string;
    description?: string;
    units: number;
    course?: string;
    year_level?: number;
    semester?: string;
    subject_type?: 'SHS' | 'College';
  }): Promise<any> {
    try {
      const response = await api.post('/maintenance/subjects', subjectData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateSubject(id: number, subjectData: any): Promise<any> {
    try {
      const response = await api.put(`/maintenance/subjects/${id}`, subjectData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteSubject(id: number): Promise<any> {
    try {
      const response = await api.delete(`/maintenance/subjects/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Subject schedules
  async getSchedules(subjectId: number): Promise<any> {
    try {
      const response = await api.get(`/maintenance/subjects/${subjectId}/schedules`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createSchedule(subjectId: number, scheduleData: { day_time: string; room?: string; instructor?: string; capacity?: number; }): Promise<any> {
    try {
      const response = await api.post(`/maintenance/subjects/${subjectId}/schedules`, scheduleData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateSchedule(id: number, scheduleData: any): Promise<any> {
    try {
      const response = await api.put(`/maintenance/schedules/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteSchedule(id: number): Promise<any> {
    try {
      const response = await api.delete(`/maintenance/schedules/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const maintenanceService = new MaintenanceService();
