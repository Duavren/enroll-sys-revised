import api from '../utils/api';

export const listLogs = async (params?: { page?: number; limit?: number; q?: string; since?: string }) => {
  const res = await api.get('/logs', { params });
  return res.data;
};

export const addLog = async (payload: any) => {
  const res = await api.post('/logs', payload);
  return res.data;
};

export default { listLogs, addLog };
