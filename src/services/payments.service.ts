import api from '../utils/api';

export const getAssessment = async (studentId: string) => {
  const res = await api.get(`/payments/assessment/${studentId}`);
  return res.data;
};

export const listPayments = async (studentId: string) => {
  const res = await api.get(`/payments/student/${studentId}`);
  return res.data;
};

export const addPayment = async (studentId: string, payload: any) => {
  const res = await api.post(`/payments/student/${studentId}`, payload);
  return res.data;
};

export default { getAssessment, listPayments, addPayment };
