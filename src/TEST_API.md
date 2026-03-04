# API Testing Guide

Use these methods to test if your backend is working correctly.

---

## Method 1: Browser Tests (Easiest)

### Test 1: Health Check
Open in browser:
```
http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Enrollment System API is running"
}
```

---

## Method 2: Command Line Tests

### Test Login API

**Windows (PowerShell):**
```powershell
$body = @{
    username = "superadmin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Mac/Linux:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "superadmin",
      "role": "superadmin",
      "email": "superadmin@informatics.edu"
    }
  }
}
```

**Copy the token!** You'll need it for other tests.

---

### Test Get Students (Protected Route)

Replace `YOUR_TOKEN_HERE` with the token from login:

**Mac/Linux:**
```bash
curl -X GET http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows (PowerShell):**
```powershell
$token = "YOUR_TOKEN_HERE"
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/students" -Headers @{Authorization = "Bearer $token"}
```

---

## Method 3: Using Postman or Insomnia

### Download:
- **Postman**: https://www.postman.com/downloads/
- **Insomnia**: https://insomnia.rest/download

### Setup:

1. **Create a new request**
2. **Set URL**: `http://localhost:5000/api/auth/login`
3. **Set Method**: POST
4. **Headers**: 
   - Content-Type: application/json
5. **Body** (raw JSON):
   ```json
   {
     "username": "superadmin",
     "password": "admin123"
   }
   ```
6. **Send** - You should get a token

### Test Protected Routes:

1. **Copy the token** from login response
2. **Create new request**: `http://localhost:5000/api/admin/students`
3. **Set Method**: GET
4. **Headers**:
   - Authorization: Bearer YOUR_TOKEN_HERE
5. **Send**

---

## Method 4: From Browser Console (Frontend Running)

### Open browser console (F12), then paste:

```javascript
// Test login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'superadmin',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login response:', data);
  // Store token
  localStorage.setItem('auth_token', data.data.token);
  return data.data.token;
})
.then(token => {
  // Test protected route
  return fetch('http://localhost:5000/api/admin/students', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
})
.then(res => res.json())
.then(data => console.log('Students:', data));
```

---

## Test All API Endpoints

### Authentication
- ✅ POST `/api/auth/login` - Login
- ✅ POST `/api/auth/register` - Register
- ✅ GET `/api/auth/profile` - Get profile (needs token)
- ✅ PUT `/api/auth/change-password` - Change password (needs token)

### Students
- ✅ GET `/api/students/profile` - Get student profile
- ✅ PUT `/api/students/profile` - Update profile
- ✅ GET `/api/students/enrollments` - Get enrollments
- ✅ POST `/api/students/documents` - Upload document

### Admin
- ✅ GET `/api/admin/dashboard/stats` - Dashboard statistics
- ✅ GET `/api/admin/students` - All students
- ✅ GET `/api/admin/students/:id` - Student details
- ✅ POST `/api/admin/students` - Create student
- ✅ PUT `/api/admin/students/:id` - Update student
- ✅ DELETE `/api/admin/students/:id` - Delete student
- ✅ GET `/api/admin/enrollments` - All enrollments
- ✅ PUT `/api/admin/enrollments/:id/status` - Update status

### Enrollments
- ✅ POST `/api/enrollments` - Create enrollment
- ✅ GET `/api/enrollments/my` - My enrollments
- ✅ GET `/api/enrollments/:id` - Enrollment details
- ✅ POST `/api/enrollments/:id/subjects` - Add subject
- ✅ DELETE `/api/enrollments/:id/subjects/:subjectId` - Remove subject
- ✅ PUT `/api/enrollments/:id/submit` - Submit for assessment

### Subjects
- ✅ GET `/api/subjects` - All subjects
- ✅ GET `/api/subjects/course/:course` - By course
- ✅ GET `/api/subjects/:id` - Subject details
- ✅ POST `/api/subjects` - Create subject
- ✅ PUT `/api/subjects/:id` - Update subject
- ✅ DELETE `/api/subjects/:id` - Delete subject

### Transactions
- ✅ POST `/api/transactions` - Create transaction
- ✅ GET `/api/transactions/enrollment/:enrollmentId` - By enrollment
- ✅ GET `/api/transactions` - All transactions
- ✅ PUT `/api/transactions/:id/status` - Update status

---

## Expected Sample Data

After running `npm run db:setup`, you should have:

### Users (4 default accounts):
- superadmin / admin123
- admin1 / admin123
- dean1 / admin123
- registrar1 / admin123

### Subjects (10 sample subjects):
- CS101 - Introduction to Computer Science
- MATH101 - College Algebra
- ENG101 - Communication Skills 1
- PE101 - Physical Education 1
- NSTP101 - National Service Training Program 1
- ... and 5 more

---

## Quick SQL Queries to Check Data

```sql
-- Login to MySQL
mysql -u root -p

-- Use the database
USE enrollment_system;

-- Check users
SELECT id, username, role, email FROM users;

-- Check subjects
SELECT subject_code, subject_name, units FROM subjects;

-- Count tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'enrollment_system';
```

Expected: 8 tables (users, students, enrollments, subjects, enrollment_subjects, documents, transactions, activity_logs)

---

## Troubleshooting

### "Network Error" or "Connection Refused"
- ✅ Check backend is running (`npm run dev` in backend-setup folder)
- ✅ Verify URL is `http://localhost:5000` (not https)
- ✅ Check terminal for backend errors

### "401 Unauthorized"
- ✅ Token expired (login again)
- ✅ Token not included in Authorization header
- ✅ Wrong token format (should be: `Bearer YOUR_TOKEN`)

### "403 Forbidden"
- ✅ User role doesn't have permission
- ✅ Try with superadmin account

### "500 Internal Server Error"
- ✅ Check backend terminal for error details
- ✅ Verify database connection
- ✅ Check if database tables exist

---

## Success Indicators

If all is working:
1. ✅ Health check returns OK
2. ✅ Login returns a token
3. ✅ Protected routes work with token
4. ✅ Can see data from database
5. ✅ Backend terminal shows no errors
6. ✅ Database has 8 tables with sample data

---

**All tests passing? Your backend is ready to integrate with the frontend! 🎉**
