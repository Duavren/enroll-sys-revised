# 🚀 Local Setup Guide - Enrollment System with SQLite

This guide will help you set up and run the Enrollment System locally using SQLite database.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A code editor (VS Code recommended)
- Git (optional, for version control)

**Note:** You do NOT need MySQL or any other database server! SQLite is file-based and requires no separate installation.

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Dependencies

#### Backend Dependencies
```bash
cd src/backend-setup
npm install
```

#### Frontend Dependencies
```bash
# From project root
npm install
```

### Step 2: Setup SQLite Database

```bash
# Make sure you're in the backend-setup directory
cd src/backend-setup

# Run the database setup script
npm run db:setup
```

This will:
- Create a SQLite database file (`enrollment_system.db`)
- Create all necessary tables
- Insert default admin users
- Insert sample subjects

**Expected Output:**
```
✅ Users table created
✅ Students table created
✅ Enrollments table created
✅ Subjects table created
✅ Enrollment subjects table created
✅ Documents table created
✅ Transactions table created
✅ Activity logs table created
✅ Default users created
✅ Sample subjects created

🎉 Database setup completed successfully!
```

### Step 3: (Optional) Add Sample Students

```bash
# Still in backend-setup directory
npm run db:add-students
```

This adds 5 sample student accounts for testing.

### Step 4: Start Backend Server

```bash
# Still in backend-setup directory
npm run dev
```

The backend will start on **http://localhost:5000**

You should see:
```
🚀 Server running on port 5000
📚 Enrollment System API - Environment: development
✅ SQLite database connected successfully
📁 Database location: [path to enrollment_system.db]
```

**Keep this terminal running!**

### Step 5: Start Frontend (New Terminal)

Open a **new terminal window** and run:

```bash
# From project root
npm run dev
```

The frontend will start on **http://localhost:3000** (or another port if 3000 is busy)

---

## 🔐 Default Login Credentials

After setup, you can login with these accounts:

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `superadmin` | `admin123` | Superadmin | Full system access |
| `admin1` | `admin123` | Admin | Manage students & enrollments |
| `dean1` | `admin123` | Dean | View academic data |
| `registrar1` | `admin123` | Registrar | Process enrollments |

**Sample Students** (if you ran `db:add-students`):
| Username | Password | Type | Course | Year |
|----------|----------|------|--------|------|
| `juan.delacruz` | `student123` | Continuing | BSCS | 2 |
| `maria.santos` | `student123` | New | BSCS | 1 |
| `pedro.reyes` | `student123` | Transferee | BSIT | 2 |
| `ana.garcia` | `student123` | Scholar | BSCS | 1 |
| `carlos.lopez` | `student123` | Returning | BSIT | 3 |

---

## 📁 Project Structure

```
en-sys-figma/
│
├── src/
│   ├── backend-setup/          ← Backend API (Node.js + Express + SQLite)
│   │   ├── src/
│   │   │   ├── controllers/    ← Request handlers
│   │   │   ├── routes/         ← API routes
│   │   │   ├── database/       ← Database config & setup
│   │   │   │   ├── connection.ts    ← SQLite connection
│   │   │   │   ├── setup.ts         ← Database setup script
│   │   │   │   └── add-sample-students.ts
│   │   │   ├── middleware/     ← Authentication
│   │   │   └── server.ts        ← Main server file
│   │   ├── enrollment_system.db ← SQLite database file (created after setup)
│   │   ├── package.json
│   │   └── .env                 ← Environment variables (optional)
│   │
│   ├── components/             ← Frontend React Components
│   ├── services/               ← API Service Layer
│   └── utils/                  ← Utilities
│
├── package.json                ← Frontend dependencies
└── vite.config.ts             ← Vite configuration
```

---

## 🗄️ SQLite Database

### Database Location

The SQLite database file (`enrollment_system.db`) is created in:
```
src/backend-setup/enrollment_system.db
```

### Viewing the Database

You can view and edit the database using:

1. **DB Browser for SQLite** (Recommended GUI)
   - Download: https://sqlitebrowser.org/
   - Open the `enrollment_system.db` file

2. **VS Code Extension**
   - Install "SQLite Viewer" extension
   - Right-click on `enrollment_system.db` → "Open Database"

3. **Command Line**
   ```bash
   sqlite3 src/backend-setup/enrollment_system.db
   ```

### Database Tables

The system includes these tables:
- `users` - User accounts and authentication
- `students` - Student information
- `enrollments` - Enrollment records
- `subjects` - Available subjects/courses
- `enrollment_subjects` - Student subject selections
- `documents` - Uploaded documents
- `transactions` - Payment records
- `activity_logs` - System activity audit trail

---

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in `src/backend-setup/` if you want to customize:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (SQLite)
DB_PATH=./enrollment_system.db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

If you don't create a `.env` file, the system will use default values.

### Frontend API Configuration

The frontend connects to the backend API. Make sure the API URL in `src/utils/api.ts` matches your backend URL (default: `http://localhost:5000`).

---

## 🧪 Testing the Setup

### 1. Test Backend API

Open your browser and visit:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Enrollment System API is running"
}
```

### 2. Test Frontend

Open your browser and visit:
```
http://localhost:3000
```

You should see the login page.

### 3. Test Login

1. Login with: `superadmin` / `admin123`
2. You should see the Superadmin Dashboard
3. Try navigating to different sections

---

## 🐛 Troubleshooting

### Database Connection Issues

**Problem:** "Database connection failed"

**Solutions:**
1. Make sure you ran `npm run db:setup` first
2. Check that `enrollment_system.db` exists in `src/backend-setup/`
3. Delete the database file and run setup again:
   ```bash
   rm src/backend-setup/enrollment_system.db
   npm run db:setup
   ```

### Port Already in Use

**Problem:** "Port 5000 already in use" or "Port 3000 already in use"

**Solutions:**
1. Stop the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill
   ```

2. Or change the port in `.env` file (backend) or `vite.config.ts` (frontend)

### Module Not Found Errors

**Problem:** "Cannot find module 'better-sqlite3'"

**Solutions:**
1. Make sure you installed dependencies:
   ```bash
   cd src/backend-setup
   npm install
   ```

2. If on Windows, you might need to rebuild native modules:
   ```bash
   npm rebuild better-sqlite3
   ```

### Frontend Can't Connect to Backend

**Problem:** API calls fail with CORS or connection errors

**Solutions:**
1. Make sure backend is running on port 5000
2. Check `src/utils/api.ts` has the correct API URL
3. Check browser console for specific error messages

### Database Locked Error

**Problem:** "SQLITE_BUSY: database is locked"

**Solutions:**
1. Close any database viewers (DB Browser, VS Code extension)
2. Make sure only one backend server is running
3. Restart the backend server

---

## 📝 Common Commands

### Backend Commands

```bash
cd src/backend-setup

# Install dependencies
npm install

# Setup database
npm run db:setup

# Add sample students
npm run db:add-students

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Commands

```bash
# From project root

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔄 Resetting the Database

If you want to start fresh:

```bash
cd src/backend-setup

# Delete the database file
rm enrollment_system.db
# On Windows: del enrollment_system.db

# Run setup again
npm run db:setup

# Optionally add sample students
npm run db:add-students
```

---

## 📚 Next Steps

After successful setup:

1. ✅ Test all default user logins
2. ✅ Explore each dashboard (Student, Admin, Dean, etc.)
3. ✅ Create test enrollments
4. ✅ Test enrollment workflow
5. ✅ Customize for your specific needs

---

## 💡 Tips

- **Keep both terminals running** - Backend and frontend need to run simultaneously
- **Use DB Browser for SQLite** - Makes it easy to view/edit data
- **Check browser console** - For frontend errors
- **Check backend terminal** - For API errors
- **Database file is portable** - You can copy `enrollment_system.db` to backup or share

---

## 🆘 Getting Help

If you encounter issues:

1. Check the error messages - they usually tell you what's wrong
2. Verify all prerequisites are installed
3. Make sure you followed all setup steps
4. Check the troubleshooting section above
5. Review the backend logs in the terminal

---

## ✨ You're All Set!

Your Enrollment System is now running locally with SQLite! 🎉

**Backend:** http://localhost:5000  
**Frontend:** http://localhost:3000

Happy coding! 🚀
