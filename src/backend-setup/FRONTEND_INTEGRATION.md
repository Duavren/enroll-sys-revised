# Frontend Integration Guide

This guide shows how to integrate the backend API with your React frontend.

## 🔧 Setup API Client

Create an API utility file in your frontend:

### `/src/utils/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 📱 API Service Functions

### `/src/services/auth.service.ts`

```typescript
import api from '../utils/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      role: string;
      email: string;
    };
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
```

### `/src/services/student.service.ts`

```typescript
import api from '../utils/api';

export const studentService = {
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/students/profile', data);
    return response.data;
  },

  getEnrollments: async () => {
    const response = await api.get('/students/enrollments');
    return response.data;
  },

  uploadDocument: async (file: File, documentType: string, enrollmentId?: number) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);
    if (enrollmentId) {
      formData.append('enrollment_id', enrollmentId.toString());
    }

    const response = await api.post('/students/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
```

### `/src/services/enrollment.service.ts`

```typescript
import api from '../utils/api';

export const enrollmentService = {
  createEnrollment: async (schoolYear: string, semester: string) => {
    const response = await api.post('/enrollments', {
      school_year: schoolYear,
      semester: semester,
    });
    return response.data;
  },

  getMyEnrollments: async () => {
    const response = await api.get('/enrollments/my');
    return response.data;
  },

  getEnrollmentDetails: async (id: number) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  },

  addSubject: async (enrollmentId: number, subjectId: number, schedule?: string) => {
    const response = await api.post(`/enrollments/${enrollmentId}/subjects`, {
      subject_id: subjectId,
      schedule: schedule,
    });
    return response.data;
  },

  removeSubject: async (enrollmentId: number, subjectId: number) => {
    const response = await api.delete(`/enrollments/${enrollmentId}/subjects/${subjectId}`);
    return response.data;
  },

  submitForAssessment: async (enrollmentId: number) => {
    const response = await api.put(`/enrollments/${enrollmentId}/submit`);
    return response.data;
  },
};
```

### `/src/services/admin.service.ts`

```typescript
import api from '../utils/api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getAllStudents: async (filters?: any) => {
    const response = await api.get('/admin/students', { params: filters });
    return response.data;
  },

  getStudentById: async (id: number) => {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData: any) => {
    const response = await api.post('/admin/students', studentData);
    return response.data;
  },

  updateStudent: async (id: number, studentData: any) => {
    const response = await api.put(`/admin/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id: number) => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },

  getAllEnrollments: async (filters?: any) => {
    const response = await api.get('/admin/enrollments', { params: filters });
    return response.data;
  },

  updateEnrollmentStatus: async (id: number, status: string, remarks?: string) => {
    const response = await api.put(`/admin/enrollments/${id}/status`, {
      status,
      remarks,
    });
    return response.data;
  },
};
```

### `/src/services/subject.service.ts`

```typescript
import api from '../utils/api';

export const subjectService = {
  getAllSubjects: async (filters?: any) => {
    const response = await api.get('/subjects', { params: filters });
    return response.data;
  },

  getSubjectsByCourse: async (course: string, yearLevel?: number) => {
    const response = await api.get(`/subjects/course/${course}`, {
      params: { year_level: yearLevel },
    });
    return response.data;
  },

  createSubject: async (subjectData: any) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  updateSubject: async (id: number, subjectData: any) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },
};
```

## 🎯 Update LoginPage Component

Update your `LoginPage.tsx` to use the API:

```typescript
import { useState } from 'react';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      
      if (response.success) {
        toast.success('Login successful!');
        onLogin(response.data.user.role as UserRole);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

## 📊 Using API in Dashboards

### Example: StudentDashboard with Real Data

```typescript
import { useEffect, useState } from 'react';
import { studentService } from '../services/student.service';
import { enrollmentService } from '../services/enrollment.service';

export default function StudentDashboard({ onLogout }: Props) {
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, enrollmentsData] = await Promise.all([
        studentService.getProfile(),
        enrollmentService.getMyEnrollments(),
      ]);

      setProfile(profileData.data);
      setEnrollments(enrollmentsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

## 🔄 Example: Admin Managing Enrollments

```typescript
import { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { toast } from 'sonner';

export default function AdminDashboard({ onLogout }: Props) {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const response = await adminService.getAllEnrollments({
        status: 'For Assessment'
      });
      setEnrollments(response.data);
    } catch (error) {
      toast.error('Failed to load enrollments');
    }
  };

  const handleApprove = async (enrollmentId: number) => {
    try {
      await adminService.updateEnrollmentStatus(
        enrollmentId,
        'Approved',
        'Enrollment approved by admin'
      );
      toast.success('Enrollment approved!');
      loadEnrollments(); // Reload data
    } catch (error) {
      toast.error('Failed to approve enrollment');
    }
  };

  // ... rest of component
}
```

## 🌐 CORS Configuration

The backend already has CORS enabled. If you need to restrict origins in production:

In `backend-setup/src/server.ts`:

```typescript
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
```

## 🔐 Protected Routes

Create a higher-order component for protected routes:

```typescript
// /src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.getProfile();
      const userRole = response.data.user.role;
      
      if (allowedRoles.includes(userRole)) {
        setAuthorized(true);
      } else {
        // Redirect to unauthorized page
      }
    } catch (error) {
      // Redirect to login
    }
  };

  if (!authorized) return <div>Loading...</div>;

  return <>{children}</>;
}
```

## 📦 Install Required Dependencies

In your frontend project:

```bash
npm install axios
npm install sonner  # For toast notifications (already installed)
```

## ✅ Testing Checklist

1. ✅ Backend API is running on port 5000
2. ✅ Frontend can connect to API
3. ✅ Login works and stores token
4. ✅ Protected routes check authentication
5. ✅ CRUD operations work for all entities
6. ✅ File uploads work correctly
7. ✅ Error handling shows user-friendly messages

## 🚀 Production Deployment

### Backend (Node.js)
- Deploy to services like Heroku, Railway, or DigitalOcean
- Use environment variables for configuration
- Enable HTTPS

### Database (MySQL)
- Use managed MySQL service (AWS RDS, DigitalOcean, PlanetScale)
- Regular backups
- Connection pooling

### Frontend
- Update API_BASE_URL to production backend URL
- Enable production build optimizations

## 📝 Notes

- Always validate user input on both frontend and backend
- Use proper error handling and user feedback
- Implement rate limiting for production
- Add request/response logging for debugging
- Consider using React Query for better data fetching and caching
