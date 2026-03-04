# 🎓 Enrollment System - START HERE

Welcome! This is your complete enrollment system with frontend, backend, and database.

---

## 📚 What This System Does

This is a complete enrollment management system for educational institutions with:

- ✅ **Student Management** - Track student information and enrollment history
- ✅ **Enrollment Processing** - Handle student enrollments with approval workflow
- ✅ **Subject Management** - Manage courses and subjects
- ✅ **Transaction Tracking** - Record payments and fees
- ✅ **Multi-Role Access** - Superadmin, Admin, Dean, Registrar, and Student roles
- ✅ **Document Management** - Upload and verify student documents
- ✅ **Real-time Dashboard** - Statistics and recent activities

---

## 🚀 Quick Start (5 Minutes)

### Don't have time to read? Follow this:

1. **Read:** `QUICK_START.md` ← **START HERE FOR SETUP**

This will get you up and running in 5 minutes with step-by-step instructions.

---

## 📖 Documentation Guide

Depending on what you need, read these files in order:

### 🔰 For First-Time Setup:

1. **`QUICK_START.md`** ← Read this FIRST
   - 5-minute setup guide
   - Gets everything running quickly
   - Perfect for beginners

2. **`SETUP_GUIDE.md`**
   - Detailed setup instructions
   - Troubleshooting tips
   - Installation help

### 🔌 For Connecting Frontend & Backend:

3. **`COMPLETE_INTEGRATION_GUIDE.md`**
   - How to integrate frontend with backend
   - Update components to use real data
   - Complete examples

### 🧪 For Testing:

4. **`TEST_API.md`**
   - How to test your backend API
   - Sample API calls
   - Verification steps

### 📚 For Detailed Backend Info:

5. **`backend-setup/README.md`**
   - Complete backend documentation
   - API endpoint reference
   - Database schema details

6. **`backend-setup/FRONTEND_INTEGRATION.md`**
   - API service examples
   - Code snippets for integration

---

## 🗂️ Project Structure

```
your-enrollment-system/
│
├── 📁 backend-setup/           ← Backend API (Node.js + Express + MySQL)
│   ├── src/
│   │   ├── controllers/        ← Request handlers
│   │   ├── routes/             ← API routes
│   │   ├── database/           ← Database config & setup
│   │   ├── middleware/         ← Authentication & authorization
│   │   └── server.ts           ← Main server file
│   ├── uploads/                ← File uploads
│   ├── .env                    ← Configuration (create this!)
│   ├── package.json
│   └── README.md
│
├── 📁 components/              ← Frontend React Components
│   ├── LoginPage.tsx
│   ├── StudentDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── SuperadminDashboard.tsx
│   ├── DeanDashboard.tsx
│   └── RegistrarDashboard.tsx
│
├── 📁 services/                ← API Service Layer (connects to backend)
│   ├── auth.service.ts         ← Authentication
│   ├── admin.service.ts        ← Admin operations
│   ├── student.service.ts      ← Student operations
│   ├── enrollment.service.ts   ← Enrollment management
│   ├── subject.service.ts      ← Subject management
│   └── transaction.service.ts  ← Transaction handling
│
├── 📁 utils/                   ← Utilities
│   └── api.ts                  ← Axios API client with interceptors
│
├── 📄 App.tsx                  ← Main React application
├── 📄 package.json
│
└── 📚 Documentation Files:
    ├── README_START_HERE.md    ← This file
    ├── QUICK_START.md          ← 5-minute setup
    ├── SETUP_GUIDE.md          ← Detailed setup
    ├── COMPLETE_INTEGRATION_GUIDE.md  ← Integration guide
    └── TEST_API.md             ← Testing guide
```

---

## 🎯 System Features

### For Students:
- ✅ View and update profile
- ✅ Create new enrollment
- ✅ Select subjects based on course and year level
- ✅ Submit enrollment for assessment
- ✅ Upload required documents
- ✅ Track enrollment status
- ✅ View enrollment history

### For Admins/Registrars:
- ✅ View all students and enrollments
- ✅ Approve or reject enrollments
- ✅ Assess student submissions
- ✅ Create and manage student records
- ✅ Process transactions and payments
- ✅ Generate reports and statistics
- ✅ Verify documents

### For Deans:
- ✅ View academic data and statistics
- ✅ Manage subjects and courses
- ✅ Review enrollment reports
- ✅ Monitor student progress

### For Superadmins:
- ✅ Full system access
- ✅ Manage all user accounts
- ✅ System configuration
- ✅ Delete records
- ✅ View activity logs

---

## 🔐 Default Login Credentials

After setup, use these accounts:

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `superadmin` | `admin123` | Superadmin | Full access |
| `admin1` | `admin123` | Admin | Manage students & enrollments |
| `dean1` | `admin123` | Dean | View academic data |
| `registrar1` | `admin123` | Registrar | Process enrollments |

**⚠️ IMPORTANT:** Change these passwords in production!

---

## 🛠️ Technology Stack

### Frontend:
- ⚛️ React with TypeScript
- 🎨 Tailwind CSS
- 📡 Axios for API calls
- 🔄 React Hooks for state management

### Backend:
- 🟢 Node.js
- ⚡ Express.js
- 🔷 TypeScript
- 🔐 JWT for authentication
- 🔒 bcrypt for password hashing

### Database:
- 🗄️ MySQL 8.0+
- 📊 8 tables with relationships
- 🔗 Foreign keys and indexes
- 📝 Activity logging

---

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ **Node.js** v18+ installed
- ✅ **MySQL** v8+ installed and running
- ✅ **VS Code** or any code editor
- ✅ Terminal/Command Prompt access
- ✅ Basic knowledge of React and Node.js

---

## ⚡ Quick Commands Reference

### Backend (in `backend-setup/` folder):
```bash
npm install          # Install dependencies
npm run db:setup     # Setup database and tables
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production server
```

### Frontend (in root folder):
```bash
npm install axios    # Install API client
npm run dev          # Start development server
npm start            # Alternative start command
```

### MySQL:
```bash
mysql -u root -p                    # Login to MySQL
USE enrollment_system;              # Select database
SHOW TABLES;                        # List all tables
SELECT * FROM users;                # View users
```

---

## 🎬 Getting Started Steps

### Step 1: Setup Backend & Database
```bash
cd backend-setup
npm install
# Create .env file (copy from .env.example)
# Edit .env with your MySQL password
npm run db:setup
npm run dev
```
**Keep this terminal running!**

### Step 2: Setup Frontend
```bash
# Open new terminal
cd ..  # Back to root
npm install axios
npm run dev
```
**Keep this terminal running too!**

### Step 3: Test Login
- Open browser to your frontend URL
- Login with: `superadmin` / `admin123`
- You should see the dashboard!

---

## 🔍 How to Verify Everything Works

### ✅ Checklist:

1. **MySQL Running:**
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   # Should see 'enrollment_system'
   ```

2. **Backend Running:**
   - Terminal shows: "Server running on port 5000"
   - Browser: http://localhost:5000/api/health shows "OK"

3. **Frontend Running:**
   - Terminal shows local URL
   - Browser opens login page

4. **Integration Working:**
   - Can login successfully
   - Dashboard loads without errors
   - No errors in browser console

---

## 🆘 Common Issues

### "Cannot connect to database"
→ Check MySQL is running and password in `.env` is correct

### "Port 5000 already in use"
→ Change PORT in `.env` file or stop other process

### "Module not found"
→ Run `npm install` in the correct folder

### "401 Unauthorized"
→ Login again to get fresh authentication token

**For more help:** See `SETUP_GUIDE.md` troubleshooting section

---

## 📞 What to Do Next

After successful setup:

1. ✅ Test all default user logins
2. ✅ Explore each dashboard (Student, Admin, Dean, etc.)
3. ✅ Read `COMPLETE_INTEGRATION_GUIDE.md` to connect frontend to backend
4. ✅ Create test students and enrollments
5. ✅ Customize for your specific needs
6. ✅ Add your school's branding and data

---

## 🎓 Learning Path

### Beginner:
1. Get system running (QUICK_START.md)
2. Test with default accounts
3. Understand basic workflow

### Intermediate:
1. Connect frontend to backend (COMPLETE_INTEGRATION_GUIDE.md)
2. Modify existing components
3. Add new features

### Advanced:
1. Add new API endpoints
2. Customize database schema
3. Implement additional features
4. Deploy to production

---

## 📊 Database Tables

The system includes these tables:

1. **users** - User accounts and authentication
2. **students** - Student information
3. **enrollments** - Enrollment records
4. **subjects** - Available subjects/courses
5. **enrollment_subjects** - Student subject selections
6. **documents** - Uploaded documents
7. **transactions** - Payment records
8. **activity_logs** - System activity audit trail

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ SQL injection prevention
- ✅ File upload validation
- ✅ Activity logging
- ✅ Automatic token expiration

---

## 📈 System Workflow

```
1. Student Registration
   ↓
2. Student Creates Enrollment
   ↓
3. Student Selects Subjects
   ↓
4. Student Uploads Documents
   ↓
5. Student Submits for Assessment
   ↓
6. Admin/Registrar Assesses
   ↓
7. Admin/Registrar Approves
   ↓
8. Student Can Add More Subjects
   ↓
9. Registrar Processes Payment
   ↓
10. Enrollment Complete
```

---

## 🎯 Files to Read in Order

**For complete beginners:**
1. This file (README_START_HERE.md) ✓ You are here
2. QUICK_START.md
3. COMPLETE_INTEGRATION_GUIDE.md

**For experienced developers:**
1. SETUP_GUIDE.md
2. backend-setup/README.md
3. COMPLETE_INTEGRATION_GUIDE.md
4. TEST_API.md

---

## ✨ You're Ready!

You now have everything you need to:
- ✅ Set up the complete system
- ✅ Run frontend and backend
- ✅ Connect them together
- ✅ Test all features
- ✅ Customize for your needs

**Next Step:** Open `QUICK_START.md` and follow the 5-minute setup guide!

---

## 💡 Tips

- Keep both backend and frontend terminals running
- Use MySQL Workbench for easier database viewing
- Check browser console for frontend errors
- Check backend terminal for API errors
- Read error messages carefully - they usually tell you what's wrong

---

**Happy coding! 🚀**

Need help? Check the documentation files or review the error messages - they're designed to be helpful!
