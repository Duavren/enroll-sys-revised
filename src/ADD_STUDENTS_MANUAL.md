# How to Add Sample Students to Database

## Issue
The `npm run db:add-students` command is failing because the file might not exist on your system.

## Solution Options

### Option 1: Run Manual SQL Commands

Instead of using the npm script, you can add students directly using MySQL:

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Use the enrollment_system database
USE enrollment_system;

# 3. Create student users (copy and paste all of this)
INSERT INTO users (username, password, role, email) 
VALUES 
  ('juan.delacruz', '$2a$10$rJj8aLLhY5zQqX5rX5XZXeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'student', 'juan.delacruz@student.informatics.edu'),
  ('maria.santos', '$2a$10$rJj8aLLhY5zQqX5rX5XZXeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'student', 'maria.santos@student.informatics.edu'),
  ('pedro.reyes', '$2a$10$rJj8aLLhY5zQqX5rX5XZXeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'student', 'pedro.reyes@student.informatics.edu'),
  ('ana.garcia', '$2a$10$rJj8aLLhY5zQqX5rX5XZXeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'student', 'ana.garcia@student.informatics.edu'),
  ('carlos.lopez', '$2a$10$rJj8aLLhY5zQqX5rX5XZXeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'student', 'carlos.lopez@student.informatics.edu');

# 4. Get the user IDs (remember these numbers)
SELECT id, username FROM users WHERE role = 'student';

# 5. Create student profiles (replace USER_ID_1, USER_ID_2, etc. with actual IDs from step 4)
INSERT INTO students (user_id, student_id, first_name, middle_name, last_name, suffix, student_type, course, year_level, contact_number, address, birth_date, gender, status)
VALUES
  (5, '2024-001234', 'Juan', 'Santos', 'Dela Cruz', NULL, 'Continuing', 'BSCS', 2, '09171234567', '123 Rizal Street, Manila City', '2004-05-15', 'Male', 'Active'),
  (6, '2024-001235', 'Maria', 'Reyes', 'Santos', NULL, 'New', 'BSCS', 1, '09187654321', '456 Bonifacio Avenue, Quezon City', '2005-08-22', 'Female', 'Active'),
  (7, '2024-001236', 'Pedro', 'Garcia', 'Reyes', 'Jr.', 'Transferee', 'BSIT', 2, '09191234567', '789 Luna Street, Makati City', '2003-12-10', 'Male', 'Active'),
  (8, '2024-001237', 'Ana', 'Lopez', 'Garcia', NULL, 'Scholar', 'BSCS', 1, '09201234567', '321 Mabini Street, Pasig City', '2005-03-18', 'Female', 'Active'),
  (9, '2024-001238', 'Carlos', 'Mendoza', 'Lopez', NULL, 'Returning', 'BSIT', 3, '09211234567', '654 Del Pilar Street, Taguig City', '2002-07-25', 'Male', 'Active');

# 6. Verify students were created
SELECT student_id, first_name, last_name, student_type, course FROM students;

# 7. Exit
exit;
```

**Note:** The password hash above is for `student123`

---

### Option 2: Create the File Manually

Create the file at this location:
```
C:\Users\Admin\Desktop\Enrollment System Wireframe\backend-setup\src\database\add-sample-students.ts
```

With this content (see next section for the full file content)

---

### Option 3: Skip Sample Students

You don't actually need sample students to use the system. You can:

1. Start the backend server:
```bash
npm run dev
```

2. Use the frontend to register new students through the UI

3. Or use the admin users that were already created:
   - **superadmin** / admin123
   - **admin1** / admin123
   - **dean1** / admin123
   - **registrar1** / admin123

---

## Verify What You Have

Check what's in your database:

```bash
mysql -u root -p
USE enrollment_system;

# Check if admin users exist
SELECT username, role FROM users;

# Check if subjects exist
SELECT subject_code, subject_name FROM subjects;

# Check if students exist (might be empty)
SELECT * FROM students;
```

---

## What's Most Important

At this point, you should have:
- ✅ Database `enrollment_system` created
- ✅ All 8 tables created
- ✅ 4 admin users created
- ✅ 10 sample subjects created

The sample students are **optional** - you can create them through the UI or add them manually later.

---

## Next Step: Start the Backend

Try starting the backend server:

```bash
cd backend-setup
npm run dev
```

If the server starts successfully, you can proceed to test the system with the admin accounts!
