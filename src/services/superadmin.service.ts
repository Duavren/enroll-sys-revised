import api, { handleApiError } from '../utils/api';

class SuperadminService {
  async getDashboardStats(): Promise<any> {
    try {
      const response = await api.get('/superadmin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // User Management
  async getAllUsers(filters?: {
    role?: 'admin' | 'dean' | 'registrar' | 'cashier';
  }): Promise<any> {
    try {
      const response = await api.get('/superadmin/users', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createUser(userData: {
    username: string;
    password?: string;
    role: 'admin' | 'dean' | 'registrar' | 'cashier';
    email?: string;
  }): Promise<any> {
    try {
      const response = await api.post('/superadmin/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateUser(id: number, userData: {
    username?: string;
    password?: string;
    role?: 'admin' | 'dean' | 'registrar' | 'cashier';
    email?: string;
  }): Promise<any> {
    try {
      const response = await api.put(`/superadmin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteUser(id: number): Promise<any> {
    try {
      const response = await api.delete(`/superadmin/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // System Settings
  async backupDatabase(): Promise<any> {
    try {
      const response = await api.post('/superadmin/backup');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const superadminService = new SuperadminService();
