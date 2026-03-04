# 🔐 Login Credentials

All default credentials for the enrollment system.

---

## 📋 Admin & Staff Accounts

These accounts are created automatically when you run `npm run db:setup`

| Username | Password | Role | Email |
|----------|----------|------|-------|
| `superadmin` | `admin123` | Superadmin | superadmin@informatics.edu |
| `admin1` | `admin123` | Admin | admin@informatics.edu |
| `dean1` | `admin123` | Dean | dean@informatics.edu |
| `registrar1` | `admin123` | Registrar | registrar@informatics.edu |

---

## 👨‍🎓 Student Accounts

To create student accounts, run this command in the `backend-setup` folder:

```bash
npm run db:add-students
```

This will create 5 sample students with Filipino names:

| Username | Password | Student ID | Name | Type | Course | Year |
|----------|----------|------------|------|------|--------|------|
| `juan.delacruz` | `student123` | 2024-001234 | Juan Santos Dela Cruz | Continuing | BSCS | 2 |
| `maria.santos` | `student123` | 2024-001235 | Maria Reyes Santos | New | BSCS | 1 |
| `pedro.reyes` | `student123` | 2024-001236 | Pedro Garcia Reyes Jr. | Transferee | BSIT | 2 |
| `ana.garcia` | `student123` | 2024-001237 | Ana Lopez Garcia | Scholar | BSCS | 1 |
| `carlos.lopez` | `student123` | 2024-001238 | Carlos Mendoza Lopez | Returning | BSIT | 3 |

---

## 📧 Student Details

### Juan Dela Cruz (Continuing Student)
- **Username:** `juan.delacruz`
- **Password:** `student123`
- **Student ID:** 2024-001234
- **Email:** juan.delacruz@student.informatics.edu
- **Course:** BSCS (Computer Science)
- **Year Level:** 2nd Year
- **Type:** Continuing Student
- **Contact:** 0917-123-4567
- **Address:** 123 Rizal Street, Manila City
- **Gender:** Male
- **Birth Date:** May 15, 2004

### Maria Santos (New Student)
- **Username:** `maria.santos`
- **Password:** `student123`
- **Student ID:** 2024-001235
- **Email:** maria.santos@student.informatics.edu
- **Course:** BSCS (Computer Science)
- **Year Level:** 1st Year
- **Type:** New Student
- **Contact:** 0918-765-4321
- **Address:** 456 Bonifacio Avenue, Quezon City
- **Gender:** Female
- **Birth Date:** August 22, 2005

### Pedro Reyes (Transferee)
- **Username:** `pedro.reyes`
- **Password:** `student123`
- **Student ID:** 2024-001236
- **Email:** pedro.reyes@student.informatics.edu
- **Course:** BSIT (Information Technology)
- **Year Level:** 2nd Year
- **Type:** Transferee
- **Contact:** 0919-123-4567
- **Address:** 789 Luna Street, Makati City
- **Gender:** Male
- **Birth Date:** December 10, 2003

### Ana Garcia (Scholar)
- **Username:** `ana.garcia`
- **Password:** `student123`
- **Student ID:** 2024-001237
- **Email:** ana.garcia@student.informatics.edu
- **Course:** BSCS (Computer Science)
- **Year Level:** 1st Year
- **Type:** Scholar
- **Contact:** 0920-123-4567
- **Address:** 321 Mabini Street, Pasig City
- **Gender:** Female
- **Birth Date:** March 18, 2005

### Carlos Lopez (Returning Student)
- **Username:** `carlos.lopez`
- **Password:** `student123`
- **Student ID:** 2024-001238
- **Email:** carlos.lopez@student.informatics.edu
- **Course:** BSIT (Information Technology)
- **Year Level:** 3rd Year
- **Type:** Returning Student
- **Contact:** 0921-123-4567
- **Address:** 654 Del Pilar Street, Taguig City
- **Gender:** Male
- **Birth Date:** July 25, 2002

---

## 🚀 Quick Setup

### Step 1: Create Admin Accounts
```bash
cd backend-setup
npm run db:setup
```

### Step 2: Create Student Accounts
```bash
npm run db:add-students
```

### Step 3: Test Login
1. Start backend: `npm run dev`
2. Start frontend: `npm run dev` (in root folder)
3. Try logging in with any of the credentials above

---

## 🧪 Testing Different Student Types

Each student type has different enrollment workflows and document requirements:

### 1. New Student (Maria Santos)
- First time enrolling
- Requires: Birth Certificate, Report Card, Transfer Credentials
- Workflow: Document Verification → Assessment → Approval → Enrollment

### 2. Continuing Student (Juan Dela Cruz)
- Regular returning student
- Requires: Previous enrollment record
- Workflow: Assessment → Approval → Enrollment

### 3. Transferee (Pedro Reyes)
- From another school
- Requires: Transfer Credentials, Honorable Dismissal, TOR
- Workflow: Document Verification → Evaluation → Assessment → Approval

### 4. Scholar (Ana Garcia)
- Scholarship recipient
- Requires: Scholarship Certificate, Previous grades
- Workflow: Scholarship Validation → Assessment → Approval

### 5. Returning Student (Carlos Lopez)
- Previously enrolled but took a break
- Requires: Re-admission documents
- Workflow: Re-admission Review → Assessment → Approval

---

## 🔒 Security Notes

### ⚠️ IMPORTANT - For Development Only

These credentials are **FOR TESTING ONLY**. Before going to production:

1. ✅ Change all default passwords
2. ✅ Update the JWT_SECRET in `.env`
3. ✅ Use strong, unique passwords
4. ✅ Enable two-factor authentication
5. ✅ Implement password complexity requirements
6. ✅ Set up password expiration policies

### Changing Passwords

You can change passwords through:
- The admin dashboard (for admin users)
- Profile settings (for students)
- Direct database update (for development)

---

## 📊 Verification

### Check if students were created:

```sql
mysql -u root -p
USE enrollment_system;

-- View all students
SELECT s.student_id, s.first_name, s.last_name, s.student_type, s.course, s.year_level, u.username
FROM students s
JOIN users u ON s.user_id = u.id;

-- Count students by type
SELECT student_type, COUNT(*) as count
FROM students
GROUP BY student_type;
```

---

## 🎯 Quick Login Test

### Test Admin Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
```

### Test Student Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan.delacruz","password":"student123"}'
```

Both should return a JWT token if successful.

---

## 📝 Notes

- All passwords are hashed using bcrypt
- Default password for admins: `admin123`
- Default password for students: `student123`
- Student accounts include complete profile information
- Each student has a unique student ID and email
- All accounts are active by default

---

**Remember to change these passwords in production! 🔐**
