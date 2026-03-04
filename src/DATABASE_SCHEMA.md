# Database Schema - Enrollment System

## Database Name
`enrollment_system`

---

## Tables Overview

1. **users** - Authentication and user accounts
2. **students** - Student profile information
3. **enrollments** - Enrollment records per semester
4. **subjects** - Available courses/subjects
5. **enrollment_subjects** - Student subject selections
6. **documents** - Uploaded student documents
7. **transactions** - Payment records
8. **activity_logs** - System activity tracking

---

## Table Schemas

### 1. users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'superadmin', 'dean', 'registrar') NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
);
```

### 2. students
```sql
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  suffix VARCHAR(20),
  student_type ENUM('New', 'Transferee', 'Returning', 'Continuing', 'Scholar') NOT NULL,
  course VARCHAR(100),
  year_level INT,
  contact_number VARCHAR(20),
  address TEXT,
  birth_date DATE,
  gender ENUM('Male', 'Female', 'Other'),
  status ENUM('Active', 'Inactive', 'Graduated') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_student_type (student_type),
  INDEX idx_status (status)
);
```

### 3. enrollments
```sql
CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  school_year VARCHAR(20) NOT NULL,
  semester ENUM('1st', '2nd', 'Summer') NOT NULL,
  status ENUM('Pending', 'For Assessment', 'Assessed', 'For Approval', 'Approved', 'Enrolled', 'Rejected') DEFAULT 'Pending',
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assessed_by INT,
  assessed_at TIMESTAMP NULL,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  total_units INT DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0.00,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (assessed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_enrollment (student_id, school_year, semester),
  INDEX idx_status (status)
);
```

### 4. subjects
```sql
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(200) NOT NULL,
  description TEXT,
  units INT NOT NULL,
  course VARCHAR(100),
  year_level INT,
  semester ENUM('1st', '2nd', 'Summer'),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subject_code (subject_code),
  INDEX idx_course_year (course, year_level)
);
```

### 5. enrollment_subjects
```sql
CREATE TABLE enrollment_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  subject_id INT NOT NULL,
  schedule VARCHAR(100),
  room VARCHAR(50),
  instructor VARCHAR(100),
  status ENUM('Enrolled', 'Dropped', 'Completed') DEFAULT 'Enrolled',
  grade VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment_subject (enrollment_id, subject_id),
  INDEX idx_enrollment (enrollment_id),
  INDEX idx_subject (subject_id)
);
```

### 6. documents
```sql
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  enrollment_id INT,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
  verified_by INT,
  verified_at TIMESTAMP NULL,
  remarks TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_docs (student_id),
  INDEX idx_enrollment_docs (enrollment_id)
);
```

### 7. transactions
```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  transaction_type ENUM('Enrollment Fee', 'Tuition', 'Miscellaneous', 'Refund', 'Other') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Online Payment', 'Check') NOT NULL,
  reference_number VARCHAR(100),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_by INT,
  status ENUM('Pending', 'Completed', 'Cancelled', 'Refunded') DEFAULT 'Pending',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_enrollment_transactions (enrollment_id),
  INDEX idx_reference (reference_number),
  INDEX idx_status (status)
);
```

### 8. activity_logs
```sql
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  description TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_activity (user_id, created_at),
  INDEX idx_entity (entity_type, entity_id)
);
```

---

## Relationships

```
users (1) ──────< (M) students
users (1) ──────< (M) enrollments (assessed_by, approved_by)
users (1) ──────< (M) documents (verified_by)
users (1) ──────< (M) transactions (processed_by)
users (1) ──────< (M) activity_logs

students (1) ────< (M) enrollments
students (1) ────< (M) documents

enrollments (1) ─< (M) enrollment_subjects
enrollments (1) ─< (M) documents
enrollments (1) ─< (M) transactions

subjects (1) ────< (M) enrollment_subjects
```

---

## Setup Command

```bash
cd backend-setup

# First, install dependencies
npm install

# Then create database and tables
npm run db:setup

# Optionally add sample students
npm run db:add-students
```

This creates all tables with proper indexes and foreign keys.

---

## Initial Data

### Default Users (Created by `npm run db:setup`)

```sql
INSERT INTO users (username, password, role, email) 
VALUES 
  ('superadmin', '[hashed]', 'superadmin', 'superadmin@informatics.edu'),
  ('admin1', '[hashed]', 'admin', 'admin@informatics.edu'),
  ('dean1', '[hashed]', 'dean', 'dean@informatics.edu'),
  ('registrar1', '[hashed]', 'registrar', 'registrar@informatics.edu');
```

**Login Credentials:**
| Username    | Password | Role       | Email                        |
|-------------|----------|------------|------------------------------|
| superadmin  | admin123 | superadmin | superadmin@informatics.edu   |
| admin1      | admin123 | admin      | admin@informatics.edu        |
| dean1       | admin123 | dean       | dean@informatics.edu         |
| registrar1  | admin123 | registrar  | registrar@informatics.edu    |

### Sample Subjects (Created by `npm run db:setup`)

```sql
INSERT INTO subjects (subject_code, subject_name, units, course, year_level, semester) 
VALUES 
  ('CS101', 'Introduction to Computer Science', 3, 'BSCS', 1, '1st'),
  ('MATH101', 'College Algebra', 3, 'BSCS', 1, '1st'),
  ('ENG101', 'Communication Skills 1', 3, 'BSCS', 1, '1st'),
  ('PE101', 'Physical Education 1', 2, 'BSCS', 1, '1st'),
  ('NSTP101', 'National Service Training Program 1', 3, 'BSCS', 1, '1st'),
  ('CS102', 'Programming Fundamentals', 3, 'BSCS', 1, '2nd'),
  ('MATH102', 'Trigonometry', 3, 'BSCS', 1, '2nd'),
  ('ENG102', 'Communication Skills 2', 3, 'BSCS', 1, '2nd'),
  ('IT101', 'Introduction to Information Technology', 3, 'BSIT', 1, '1st'),
  ('IT102', 'Web Development Basics', 3, 'BSIT', 1, '2nd');
```

### Sample Students (Optional - Created by `npm run db:add-students`)

**Student Users:**
| Username       | Password   | Role    | Email                                    |
|----------------|------------|---------|------------------------------------------|
| juan.delacruz  | student123 | student | juan.delacruz@student.informatics.edu    |
| maria.santos   | student123 | student | maria.santos@student.informatics.edu     |
| pedro.reyes    | student123 | student | pedro.reyes@student.informatics.edu      |
| ana.garcia     | student123 | student | ana.garcia@student.informatics.edu       |
| carlos.lopez   | student123 | student | carlos.lopez@student.informatics.edu     |

**Student Profiles:**
| Student ID   | Name                  | Type       | Course | Year | Contact     | Address                          |
|--------------|-----------------------|------------|--------|------|-------------|----------------------------------|
| 2024-001234  | Juan S. Dela Cruz     | Continuing | BSCS   | 2    | 09171234567 | 123 Rizal Street, Manila City    |
| 2024-001235  | Maria R. Santos       | New        | BSCS   | 1    | 09187654321 | 456 Bonifacio Ave, Quezon City   |
| 2024-001236  | Pedro G. Reyes Jr.    | Transferee | BSIT   | 2    | 09191234567 | 789 Luna Street, Makati City     |
| 2024-001237  | Ana L. Garcia         | Scholar    | BSCS   | 1    | 09201234567 | 321 Mabini Street, Pasig City    |
| 2024-001238  | Carlos M. Lopez       | Returning  | BSIT   | 3    | 09211234567 | 654 Del Pilar St, Taguig City    |

---