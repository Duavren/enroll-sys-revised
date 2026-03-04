# Enrollment System Wireframe

This is a code bundle for Enrollment System Wireframe. The original project is available at https://www.figma.com/design/QuqnGPxNPlqTMRVIixU3Ub/Enrollment-System-Wireframe.

## 🚀 Quick Start

**This project now uses SQLite database (no MySQL required!)**

### For Complete Setup Instructions:

👉 **See [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) for detailed setup instructions**

### Quick Commands:

1. **Install Backend Dependencies:**
   ```bash
   cd src/backend-setup
   npm install
   ```

2. **Setup SQLite Database:**
   ```bash
   npm run db:setup
   ```

3. **Start Backend Server:**
   ```bash
   npm run dev
   ```
   (Keep this terminal running)

4. **Install Frontend Dependencies** (in a new terminal):
   ```bash
   # From project root
   npm install
   ```

5. **Start Frontend:**
   ```bash
   npm run dev
   ```

### Default Login Credentials:

**Admin & Staff Accounts:**
- **Superadmin:** `superadmin` / `admin123`
- **Admin:** `admin1` / `admin123`
- **Dean:** `dean1` / `admin123`
- **Registrar:** `registrar1` / `admin123`

**Student Account (Sample):**
- **Student:** `student1` / `password`
  - Student ID: `2024-0001`
  - Name: Juan Santos Dela Cruz
  - Course: BSCS
  - Year Level: 1st Year

---

## 📚 Documentation

- **[LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)** - Complete local setup guide with SQLite
- **[src/README_START_HERE.md](./src/README_START_HERE.md)** - Original project documentation

---

## 🗄️ Database

This project uses **SQLite** - a file-based database that requires no separate server installation.

The database file (`enrollment_system.db`) is created automatically when you run `npm run db:setup` in the `src/backend-setup` directory.

---

## 🛠️ Technology Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite (better-sqlite3)
- **Authentication:** JWT

---

## 👥 User Roles & Functionalities

### 🎓 Student
**Main Features:**
- **Dashboard:** View enrollment status, enrolled courses, and statistics
- **Subjects:** Browse and enroll in available subjects
- **My Schedule:** View class schedule organized by day
- **My Profile:** Update personal information, contact details, username, and password
- **Enrollment:** Submit enrollment requests with required documents

### 👨‍💼 Admin
**Main Features:**
- **Dashboard:** Overview of enrollments, students, and transactions
- **Enrollment Requests:** Review, assess, and approve/reject student enrollments
- **Transactions:** View and manage payment transactions
- **Manage Students:** Create, view, update student records and status (COR, grades, clearance)
- **Manage Teachers:** CRUD operations for faculty/teacher records
- **SHS Grades:** View and manage Senior High School student grades
- **College Grades:** View and manage College student grades
- **Sections:** Manage class sections
- **SHS Subjects:** Manage Senior High School subjects
- **College Subjects:** Manage College subjects
- **School Year:** Manage academic school years

### 🎓 Dean
**Main Features:**
- **Dashboard:** Statistics on programs, faculty, and curriculum
- **Faculty Management:** Create, view, update, and manage faculty members
- **Program Management:** Create and manage academic programs
- **Curriculum:** Design and manage curriculum structures

### 📋 Registrar
**Main Features:**
- **Dashboard:** Overview of student records, grades, and clearances
- **Student Records:** View and manage comprehensive student records
- **Grades Management:** View and manage student grades
- **COR Management:** Manage Certificate of Registration (COR) for students
- **Clearances:** Track and manage student clearances

### 🔐 Superadmin
**Main Features:**
- **Dashboard:** System-wide statistics and overview
- **User Management:** Create, update, and delete admin, dean, and registrar accounts
- **System Settings:** Database backup functionality

---

## 📝 Notes

- No MySQL installation required!
- SQLite database file is portable and easy to backup
- Perfect for local development and testing
- Default student password is `password` (changed from previous `student123`)
- See LOCAL_SETUP_GUIDE.md for troubleshooting
- For more student accounts, see [LOGIN_CREDENTIALS.md](./src/LOGIN_CREDENTIALS.md)