# Database Setup Guide - Step by Step

This guide explains **exactly what you need to put in your MySQL database** for the Enrollment System.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Structure Overview](#database-structure-overview)
3. [Step-by-Step Setup Process](#step-by-step-setup-process)
4. [What Data Gets Added](#what-data-gets-added)
5. [Manual Setup (Alternative)](#manual-setup-alternative)

---

## Prerequisites

Before setting up the database, ensure you have:
- ✅ MySQL Server installed and running
- ✅ MySQL credentials (username and password)
- ✅ Node.js and npm installed
- ✅ Backend dependencies installed (`cd backend-setup && npm install`)

---

## Database Structure Overview

Your enrollment system needs **8 tables** in total:

```
enrollment_system (Database)
│
├── users                  # All system users (students, admins, etc.)
├── students              # Student-specific information
├── enrollments           # Enrollment records per semester
├── subjects              # Available subjects/courses
├── enrollment_subjects   # Subjects enrolled by students
├── documents             # Uploaded student documents
├── transactions          # Payment records
└── activity_logs         # System activity tracking
```

---

## Step-by-Step Setup Process

### **STEP 1: Create the Database and Tables**

Run this command from your project root:

```bash
cd backend-setup
npm run db:setup
```

**What this does:**
1. Creates database named `enrollment_system`
2. Creates all 8 tables with proper relationships
3. Sets up indexes for faster queries
4. Adds foreign key constraints

**Tables created:**

#### 1️⃣ **users** table
- Stores login credentials for all system users
- Fields: `id`, `username`, `password`, `role`, `email`, `created_at`, `updated_at`
- Roles: `student`, `admin`, `superadmin`, `dean`, `registrar`

#### 2️⃣ **students** table
- Stores detailed student information
- Fields: `id`, `user_id`, `student_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `student_type`, `course`, `year_level`, `contact_number`, `address`, `birth_date`, `gender`, `status`
- Student types: `New`, `Transferee`, `Returning`, `Continuing`, `Scholar`
- Links to `users` table via `user_id`

#### 3️⃣ **enrollments** table
- Tracks each enrollment period
- Fields: `id`, `student_id`, `school_year`, `semester`, `status`, `enrollment_date`, `assessed_by`, `assessed_at`, `approved_by`, `approved_at`, `total_units`, `total_amount`, `remarks`
- Statuses: `Pending`, `For Assessment`, `Assessed`, `For Approval`, `Approved`, `Enrolled`, `Rejected`
- Links to `students` table

#### 4️⃣ **subjects** table
- Available subjects for enrollment
- Fields: `id`, `subject_code`, `subject_name`, `description`, `units`, `course`, `year_level`, `semester`, `is_active`

#### 5️⃣ **enrollment_subjects** table
- Junction table linking enrollments to subjects
- Fields: `id`, `enrollment_id`, `subject_id`, `schedule`, `room`, `instructor`, `status`, `grade`
- Links `enrollments` and `subjects` tables

#### 6️⃣ **documents** table
- Uploaded student documents
- Fields: `id`, `student_id`, `enrollment_id`, `document_type`, `file_name`, `file_path`, `file_size`, `upload_date`, `status`, `verified_by`, `verified_at`, `remarks`

#### 7️⃣ **transactions** table
- Payment records
- Fields: `id`, `enrollment_id`, `transaction_type`, `amount`, `payment_method`, `reference_number`, `payment_date`, `processed_by`, `status`, `remarks`
- Transaction types: `Enrollment Fee`, `Tuition`, `Miscellaneous`, `Refund`, `Other`
- Payment methods: `Cash`, `Bank Transfer`, `Credit Card`, `Debit Card`, `Online Payment`, `Check`

#### 8️⃣ **activity_logs** table
- Tracks all system activities
- Fields: `id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `created_at`

---

### **STEP 2: Insert Default Admin Users**

The `db:setup` script automatically creates **4 admin users**:

| Username    | Password  | Role        | Email                          |
|-------------|-----------|-------------|--------------------------------|
| superadmin  | admin123  | superadmin  | superadmin@informatics.edu     |
| admin1      | admin123  | admin       | admin@informatics.edu          |
| dean1       | admin123  | dean        | dean@informatics.edu           |
| registrar1  | admin123  | registrar   | registrar@informatics.edu      |

**Note:** Passwords are hashed using bcrypt before storage.

---

### **STEP 3: Insert Sample Subjects**

The setup script also creates **10 sample subjects**:

| Subject Code | Subject Name                          | Units | Course | Year | Semester |
|--------------|---------------------------------------|-------|--------|------|----------|
| CS101        | Introduction to Computer Science      | 3     | BSCS   | 1    | 1st      |
| MATH101      | College Algebra                       | 3     | BSCS   | 1    | 1st      |
| ENG101       | Communication Skills 1                | 3     | BSCS   | 1    | 1st      |
| PE101        | Physical Education 1                  | 2     | BSCS   | 1    | 1st      |
| NSTP101      | National Service Training Program 1  | 3     | BSCS   | 1    | 1st      |
| CS102        | Programming Fundamentals              | 3     | BSCS   | 1    | 2nd      |
| MATH102      | Trigonometry                          | 3     | BSCS   | 1    | 2nd      |
| ENG102       | Communication Skills 2                | 3     | BSCS   | 1    | 2nd      |
| IT101        | Introduction to Information Technology| 3     | BSIT   | 1    | 1st      |
| IT102        | Web Development Basics                | 3     | BSIT   | 1    | 2nd      |

---

### **STEP 4: Add Sample Students (Optional)**

To test the system with sample student accounts, run:

```bash
npm run db:add-students
```

**What this does:**
Creates **5 Filipino student accounts** with different student types:

| Username       | Password    | Name                  | Student ID   | Type        | Course | Year |
|----------------|-------------|-----------------------|--------------|-------------|--------|------|
| juan.delacruz  | student123  | Juan S. Dela Cruz     | 2024-001234  | Continuing  | BSCS   | 2    |
| maria.santos   | student123  | Maria R. Santos       | 2024-001235  | New         | BSCS   | 1    |
| pedro.reyes    | student123  | Pedro G. Reyes Jr.    | 2024-001236  | Transferee  | BSIT   | 2    |
| ana.garcia     | student123  | Ana L. Garcia         | 2024-001237  | Scholar     | BSCS   | 1    |
| carlos.lopez   | student123  | Carlos M. Lopez       | 2024-001238  | Returning   | BSIT   | 3    |

Each student has complete profile information including:
- Full name (Filipino names)
- Student ID
- Contact number (Philippine format)
- Address (Philippine cities)
- Birth date
- Gender
- Course and year level

---

## What Data Gets Added

### After `npm run db:setup`:
✅ Database: `enrollment_system` created  
✅ 8 tables created with relationships  
✅ 4 admin/staff users added  
✅ 10 sample subjects added  

### After `npm run db:add-students`:
✅ 5 student users added  
✅ 5 student profiles created  

### What's NOT added yet (you'll add this as users interact):
❌ Enrollments (created when students enroll)  
❌ Enrollment subjects (added when students select subjects)  
❌ Documents (uploaded by students)  
❌ Transactions (created during payment)  
❌ Activity logs (automatically logged by system)  

---

## Manual Setup (Alternative)

If you prefer to set up the database manually using MySQL commands:

### 1. Create Database
```sql
CREATE DATABASE enrollment_system;
USE enrollment_system;
```

### 2. Run SQL Scripts

You can extract the SQL commands from `/backend-setup/src/database/setup.ts` and run them manually in MySQL Workbench or phpMyAdmin.

The setup file contains all CREATE TABLE statements starting from line 22.

---

## Verification

To verify your database setup:

### 1. Check Database Exists
```bash
mysql -u root -p
```
```sql
SHOW DATABASES;
USE enrollment_system;
```

### 2. Check Tables
```sql
SHOW TABLES;
```
You should see 8 tables.

### 3. Check Users
```sql
SELECT username, role, email FROM users;
```
You should see 4 admin/staff users (and 5 students if you ran `db:add-students`).

### 4. Check Subjects
```sql
SELECT subject_code, subject_name, units, course FROM subjects;
```
You should see 10 subjects.

### 5. Check Students (if you added sample students)
```sql
SELECT student_id, first_name, last_name, student_type, course FROM students;
```
You should see 5 students.

---

## Environment Variables

Make sure your `.env` file in `/backend-setup` has these settings:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=enrollment_system
DB_PORT=3306

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## Next Steps

After database setup:

1. ✅ **Test the Backend**
   ```bash
   npm run dev
   ```
   Backend should run on http://localhost:5000

2. ✅ **Test API Endpoints**
   - Use the credentials from LOGIN_CREDENTIALS.md
   - Follow TEST_API.md for testing guide

3. ✅ **Connect Frontend**
   - Frontend is already configured to connect to http://localhost:5000
   - See FRONTEND_INTEGRATION.md for details

---

## Troubleshooting

### Error: "Can't connect to MySQL server"
- Make sure MySQL is running
- Check your DB_HOST, DB_USER, and DB_PASSWORD in .env

### Error: "Database already exists"
- This is normal if you've run setup before
- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times

### Error: "Duplicate entry for key 'username'"
- This is normal if you've added users before
- The script uses `ON DUPLICATE KEY UPDATE` to handle this

### Want to Start Fresh?
```sql
DROP DATABASE enrollment_system;
```
Then run `npm run db:setup` again.

---

## Summary

**What you MUST do:**
1. Run `npm run db:setup` - Creates database, tables, admin users, and subjects
2. Configure `.env` file with your MySQL credentials

**What's OPTIONAL:**
- Run `npm run db:add-students` - Adds 5 sample students for testing

**What's AUTOMATIC:**
- Enrollments, documents, transactions, and activity logs are created automatically as users interact with the system

---

## Quick Reference

```bash
# Navigate to backend
cd backend-setup

# Install dependencies
npm install

# Setup database (creates tables, admins, subjects)
npm run db:setup

# Add sample students (optional)
npm run db:add-students

# Start backend server
npm run dev

# Verify connection
curl http://localhost:5000/api/test
```

---

Need help? Check these files:
- **LOGIN_CREDENTIALS.md** - All login credentials
- **QUICK_START.md** - Quick setup guide
- **SETUP_GUIDE.md** - Detailed setup instructions
- **TEST_API.md** - API testing guide
