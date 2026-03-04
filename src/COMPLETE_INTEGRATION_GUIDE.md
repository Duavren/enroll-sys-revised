# Complete Integration Guide
## Connecting Your Frontend to the Backend

Now that you have both frontend and backend set up, this guide shows you how to integrate them.

---

## 📁 What You Have Now

```
your-project/
├── backend-setup/              ← Backend API (Node.js + MySQL)
│   ├── src/
│   ├── uploads/
│   └── .env
│
├── components/                 ← Frontend Components (React)
│   ├── LoginPage.tsx
│   ├── StudentDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── ...
│
├── services/                   ← NEW! API Services
│   ├── auth.service.ts
│   ├── admin.service.ts
│   ├── student.service.ts
│   ├── enrollment.service.ts
│   ├── subject.service.ts
│   └── transaction.service.ts
│
├── utils/                      ← NEW! API Utilities
│   └── api.ts
│
└── App.tsx
```

---

## 🔌 How the Integration Works

```
Frontend (React)
    ↓
Services (auth.service.ts, admin.service.ts, etc.)
    ↓
API Utility (api.ts with axios)
    ↓
Backend API (Express on port 5000)
    ↓
MySQL Database
```

---

## ✅ Step 1: Verify Backend is Running

1. **Open terminal in backend-setup folder**
2. **Make sure it's running:**
   ```bash
   npm run dev
   ```
3. **You should see:**
   ```
   ✅ Database connected successfully
   🚀 Server running on port 5000
   ```

4. **Test it in browser:**
   ```
   http://localhost:5000/api/health
   ```
   Should show: `{"status":"OK","message":"Enrollment System API is running"}`

---

## ✅ Step 2: Update Your LoginPage Component

Now let's connect the login page to the real backend.

### Find your `/components/LoginPage.tsx`

Add these imports at the top:

```typescript
import { authService } from '../services/auth.service';
```

### Update the login handler:

Replace your current login logic with:

```typescript
const handleLogin = async () => {
  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }

  try {
    // Call real backend API
    const response = await authService.login({ username, password });
    
    if (response.success) {
      // Get user role from response
      const userRole = response.data.user.role;
      
      // Route to appropriate dashboard
      onLogin(userRole as 'student' | 'admin' | 'superadmin' | 'dean' | 'registrar');
    }
  } catch (error: any) {
    alert(error.message || 'Login failed. Please check your credentials.');
  }
};
```

### Test Login:

1. **Start your frontend** (if not already running)
2. **Open browser** to your frontend URL
3. **Login with:**
   - Username: `superadmin`
   - Password: `admin123`

If it works, you'll be redirected to the dashboard! 🎉

---

## ✅ Step 3: Update App.tsx for Authentication

Update your main App component to handle authentication properly:

```typescript
import { useState, useEffect } from 'react';
import { authService } from './services/auth.service';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const role = authService.getUserRole();
        setUserRole(role);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUserRole(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // ... rest of your App component
}
```

---

## ✅ Step 4: Fetch Real Data in Dashboards

### Example: Admin Dashboard with Real Data

```typescript
import { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';

export default function AdminDashboard({ onLogout }: Props) {
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const statsResponse = await adminService.getDashboardStats();
      setStats(statsResponse.data);

      // Fetch recent enrollments
      const enrollmentsResponse = await adminService.getAllEnrollments({
        status: 'For Assessment'
      });
      setEnrollments(enrollmentsResponse.data);

      // Fetch students
      const studentsResponse = await adminService.getAllStudents();
      setStudents(studentsResponse.data);
      
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  // Now use the real data in your component
  return (
    <div>
      <h1>Total Students: {stats?.totalStudents || 0}</h1>
      
      {/* Display enrollments */}
      {enrollments.map(enrollment => (
        <div key={enrollment.id}>
          {enrollment.student_id} - {enrollment.status}
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Step 5: Test Common Operations

### Create Enrollment (Student Dashboard)

```typescript
import { enrollmentService } from '../services/enrollment.service';

const handleCreateEnrollment = async () => {
  try {
    const response = await enrollmentService.createEnrollment(
      '2024-2025',  // school year
      '1st'         // semester
    );
    
    alert('Enrollment created successfully!');
    // Reload enrollments
    loadEnrollments();
  } catch (error: any) {
    alert(error.message);
  }
};
```

### Approve Enrollment (Admin Dashboard)

```typescript
import { adminService } from '../services/admin.service';

const handleApproveEnrollment = async (enrollmentId: number) => {
  try {
    await adminService.approveEnrollment(
      enrollmentId,
      'Enrollment approved by admin'
    );
    
    alert('Enrollment approved!');
    loadEnrollments(); // Refresh list
  } catch (error: any) {
    alert(error.message);
  }
};
```

### Add Subject to Enrollment (Student Dashboard)

```typescript
import { enrollmentService } from '../services/enrollment.service';

const handleAddSubject = async (enrollmentId: number, subjectId: number) => {
  try {
    await enrollmentService.addSubject(enrollmentId, subjectId);
    alert('Subject added!');
    loadEnrollmentDetails();
  } catch (error: any) {
    alert(error.message);
  }
};
```

---

## 🎯 Available Services & Methods

### Auth Service (`auth.service.ts`)
- ✅ `login(username, password)` - Login user
- ✅ `logout()` - Logout user
- ✅ `getProfile()` - Get current user profile
- ✅ `changePassword(current, new)` - Change password
- ✅ `isAuthenticated()` - Check if logged in
- ✅ `getCurrentUser()` - Get user data
- ✅ `getUserRole()` - Get user role

### Admin Service (`admin.service.ts`)
- ✅ `getDashboardStats()` - Get statistics
- ✅ `getAllStudents(filters?)` - Get all students
- ✅ `getStudentById(id)` - Get student details
- ✅ `createStudent(data)` - Create new student
- ✅ `updateStudent(id, data)` - Update student
- ✅ `deleteStudent(id)` - Delete student
- ✅ `getAllEnrollments(filters?)` - Get all enrollments
- ✅ `updateEnrollmentStatus(id, status)` - Update enrollment
- ✅ `approveEnrollment(id)` - Approve enrollment
- ✅ `rejectEnrollment(id)` - Reject enrollment

### Student Service (`student.service.ts`)
- ✅ `getProfile()` - Get student profile
- ✅ `updateProfile(data)` - Update profile
- ✅ `getEnrollments()` - Get my enrollments
- ✅ `uploadDocument(file, type)` - Upload document

### Enrollment Service (`enrollment.service.ts`)
- ✅ `createEnrollment(year, semester)` - Create enrollment
- ✅ `getMyEnrollments()` - Get my enrollments
- ✅ `getEnrollmentDetails(id)` - Get details
- ✅ `addSubject(enrollmentId, subjectId)` - Add subject
- ✅ `removeSubject(enrollmentId, subjectId)` - Remove subject
- ✅ `submitForAssessment(id)` - Submit enrollment

### Subject Service (`subject.service.ts`)
- ✅ `getAllSubjects(filters?)` - Get all subjects
- ✅ `getSubjectsByCourse(course)` - Get by course
- ✅ `createSubject(data)` - Create subject
- ✅ `updateSubject(id, data)` - Update subject
- ✅ `deleteSubject(id)` - Delete subject

### Transaction Service (`transaction.service.ts`)
- ✅ `createTransaction(data)` - Create transaction
- ✅ `getTransactionsByEnrollment(id)` - Get by enrollment
- ✅ `getAllTransactions(filters?)` - Get all
- ✅ `updateTransactionStatus(id, status)` - Update status

---

## 🔒 Authentication & Authorization

### How it works:

1. **User logs in** → Backend returns JWT token
2. **Token stored** in `localStorage` as `auth_token`
3. **Every API call** automatically includes token in header
4. **Backend verifies** token and checks user role
5. **If unauthorized** → Automatically redirected to login

### Protected Routes:

The API automatically handles permissions:

- **Student role** → Can only access `/api/students/*` and `/api/enrollments/my`
- **Admin role** → Can access `/api/admin/*`
- **Superadmin** → Can access everything including delete operations
- **Dean** → Can view and manage academic data
- **Registrar** → Can handle enrollments and transactions

---

## 🧪 Testing Checklist

### Basic Tests:
- [ ] Can login with superadmin/admin123
- [ ] Token is stored in localStorage
- [ ] Dashboard loads without errors
- [ ] Can logout and token is removed
- [ ] Invalid login shows error

### Admin Tests:
- [ ] Can view all students
- [ ] Can view all enrollments
- [ ] Can approve/reject enrollments
- [ ] Dashboard stats load correctly

### Student Tests:
- [ ] Can view own profile
- [ ] Can create enrollment
- [ ] Can add subjects to enrollment
- [ ] Can view enrollment history

---

## 🐛 Common Issues & Solutions

### 1. "Network Error" when calling API

**Problem:** Frontend can't reach backend

**Solutions:**
- Check backend is running: `npm run dev` in backend-setup
- Verify URL is `http://localhost:5000` (check `utils/api.ts`)
- Check browser console for CORS errors

### 2. "401 Unauthorized" on API calls

**Problem:** Token is missing or invalid

**Solutions:**
- Login again to get fresh token
- Check if token exists: `localStorage.getItem('auth_token')`
- Clear localStorage and login again

### 3. "CORS Error" in browser console

**Problem:** Cross-origin request blocked

**Solution:**
Backend already has CORS enabled. If still having issues, restart backend server.

### 4. Data not showing up

**Problem:** Database is empty or API call failed

**Solutions:**
- Check backend terminal for errors
- Verify database has data: Run `npm run db:setup` again
- Check browser console for API errors
- Use browser DevTools → Network tab to see API responses

---

## 📊 Viewing Database Data

### Using MySQL Command Line:

```sql
mysql -u root -p
USE enrollment_system;

-- View all users
SELECT * FROM users;

-- View all students
SELECT * FROM students;

-- View enrollments with student info
SELECT e.*, s.student_id, s.first_name, s.last_name
FROM enrollments e
JOIN students s ON e.student_id = s.id;

-- View subjects
SELECT * FROM subjects;
```

### Using MySQL Workbench:

1. Open MySQL Workbench
2. Connect to Local instance
3. Click on `enrollment_system` database
4. Click on Tables
5. Right-click table → Select Rows

---

## 🚀 Next Steps

Now that integration is working:

1. **Replace Mock Data** - Update all components to use real API
2. **Add Error Handling** - Show user-friendly error messages
3. **Add Loading States** - Show spinners while loading data
4. **Implement Forms** - Create/edit students, subjects, etc.
5. **File Uploads** - Implement document upload functionality
6. **Real-time Updates** - Refresh data after changes
7. **Pagination** - For large lists of students/enrollments
8. **Search & Filters** - Add search functionality
9. **Validation** - Add form validation
10. **Reports** - Generate enrollment reports, payment reports

---

## 📱 Example: Complete Working Component

Here's a complete example showing the full pattern:

```typescript
import { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminService.getAllEnrollments({
        status: 'For Assessment'
      });
      
      setEnrollments(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await adminService.approveEnrollment(id, 'Approved by admin');
      alert('Enrollment approved!');
      loadEnrollments(); // Refresh list
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div>Loading enrollments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Enrollments Pending Approval ({enrollments.length})</h2>
      
      {enrollments.map((enrollment: any) => (
        <div key={enrollment.id}>
          <p>Student: {enrollment.first_name} {enrollment.last_name}</p>
          <p>Status: {enrollment.status}</p>
          <button onClick={() => handleApprove(enrollment.id)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Final Checklist

Before going live:

- [ ] Both frontend and backend running
- [ ] Can login with all user types
- [ ] All dashboards load correctly
- [ ] Can create/edit/delete data
- [ ] Errors are handled gracefully
- [ ] Loading states work properly
- [ ] Logout works correctly
- [ ] Database has sample/test data
- [ ] All API endpoints tested
- [ ] Forms validate input
- [ ] File uploads work (if implemented)

---

**🎉 Congratulations! Your frontend and backend are now fully integrated!**

You now have a complete enrollment system with:
- ✅ React frontend
- ✅ Node.js + Express backend
- ✅ MySQL database
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Full CRUD operations
- ✅ API services layer
