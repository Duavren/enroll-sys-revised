import api from '../utils/api';

export const fetchUsage = async () => {
  const res = await api.get('/analytics/usage');
  return res.data;
};

export const fetchStudentsPerProgram = async () => {
  const res = await api.get('/analytics/students-per-program');
  return res.data;
};

export const fetchEnrollmentStats = async () => {
  const res = await api.get('/analytics/enrollment-stats');
  return res.data;
};

export const fetchDeanSummary = async () => {
  const res = await api.get('/analytics/dean-summary');
  return res.data;
};

export default { fetchUsage, fetchStudentsPerProgram, fetchEnrollmentStats, fetchDeanSummary };
