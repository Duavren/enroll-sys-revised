import api from '../utils/api';

export const listCourses = async () => {
  const res = await api.get('/courses');
  return res.data;
};

export const createCourse = async (payload: any) => {
  const res = await api.post('/courses', payload);
  return res.data;
};

export const updateCourse = async (id: string, payload: any) => {
  const res = await api.put(`/courses/${id}`, payload);
  return res.data;
};

export const deleteCourse = async (id: string) => {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
};

export const reassignTeacher = async (payload: any) => {
  const res = await api.post('/courses/reassign', payload);
  return res.data;
};

export default { listCourses, createCourse, updateCourse, deleteCourse, reassignTeacher };
