import api, { handleApiError } from '../utils/api';

class FacultyService {
  async getAllFaculty(filters?: {
    department?: string;
    status?: string;
    search?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/faculty', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFacultyById(id: number): Promise<any> {
    try {
      const response = await api.get(`/faculty/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createFaculty(facultyData: {
    faculty_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    suffix?: string;
    department?: string;
    specialization?: string;
    email?: string;
    contact_number?: string;
  }): Promise<any> {
    try {
      const response = await api.post('/faculty', facultyData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateFaculty(id: number, facultyData: any): Promise<any> {
    try {
      const response = await api.put(`/faculty/${id}`, facultyData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteFaculty(id: number): Promise<any> {
    try {
      const response = await api.delete(`/faculty/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const facultyService = new FacultyService();
