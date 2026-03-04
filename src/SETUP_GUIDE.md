# Complete Setup Guide - Enrollment System
## Backend + Database + Frontend Integration

This guide will walk you through setting up the complete enrollment system with backend, database, and frontend.

---

## 📋 Prerequisites

Before you begin, install these on your computer:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **MySQL** (v8 or higher)
   - **Windows**: Download MySQL Installer from https://dev.mysql.com/downloads/installer/
   - **Mac**: `brew install mysql` or download from website
   - **Linux**: `sudo apt-get install mysql-server`
   - Verify: `mysql --version`

3. **VS Code** (you already have this)

---

## 🗄️ STEP 1: Setup MySQL Database

### Option A: MySQL Workbench (Recommended for Beginners)

1. **Install MySQL Server**
   - During installation, set a root password (remember this!)
   - Default port: 3306

2. **Open MySQL Workbench** (comes with MySQL installer)
   - Click on "Local instance 3306"
   - Enter your root password

3. **Test Connection**
   - If you see the SQL editor, you're connected!

### Option B: Command Line

1. **Start MySQL Service**
   ```bash
   # Windows
   net start MySQL80
   
   # Mac
   brew services start mysql
   
   # Linux
   sudo service mysql start
   ```

2. **Login to MySQL**
   ```bash
   mysql -u root -p
   ```
   - Enter your password when prompted

3. **Test Connection**
   ```sql
   SHOW DATABASES;
   ```
   - If you see a list of databases, you're good!

---

## ⚙️ STEP 2: Setup Backend

### 1. Open Backend Folder in Terminal

In VS Code:
- Open terminal: `Ctrl + \`` (backtick) or Terminal → New Terminal
- Navigate to backend folder:
  ```bash
  cd backend-setup
  ```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages (~2-3 minutes).

### 3. Configure Environment Variables

Create a `.env` file in the `backend-setup` folder:

```bash
# Copy the example file
cp .env.example .env
```

Or manually create `.env` file and paste this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=enrollment_system
DB_PORT=3306

# JWT Secret (change this to something random)
JWT_SECRET=my_super_secret_key_12345_change_this
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**IMPORTANT**: Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password!

### 4. Create Upload Directory

```bash
mkdir -p uploads/documents
```

### 5. Setup Database Tables

This will create the database and all tables:

```bash
npm run db:setup
```

You should see:
```
✅ Database created
✅ Users table created
✅ Students table created
✅ Enrollments table created
... (more tables)
✅ Default users created
✅ Sample subjects created

🎉 Database setup completed successfully!
```

### 6. Start the Backend Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
📚 Enrollment System API - Environment: development
```

**Keep this terminal running!** The backend is now live at `http://localhost:5000`

### 7. Test the Backend

Open a new terminal and test:

```bash
curl http://localhost:5000/api/health
```

Or open browser: `http://localhost:5000/api/health`

You should see: `{"status":"OK","message":"Enrollment System API is running"}`

---

## 🎨 STEP 3: Connect Frontend to Backend

The frontend is already created. Now we need to add API integration.

### 1. Install Frontend Dependencies

Open a **NEW terminal** (keep backend running):

```bash
# Make sure you're in the root directory (not backend-setup)
npm install axios
```

### 2. Test Login with Real Backend

The backend comes with these default accounts:

| Username | Password | Role |
|----------|----------|------|
| superadmin | admin123 | Superadmin |
| admin1 | admin123 | Admin |
| dean1 | admin123 | Dean |
| registrar1 | admin123 | Registrar |

**Try logging in with:** `superadmin` / `admin123`

---

## 🧪 STEP 4: Verify Everything Works

### Backend Checklist:
- [ ] MySQL is running
- [ ] Backend server is running on port 5000
- [ ] Database tables are created
- [ ] API health check works

### Frontend Checklist:
- [ ] Frontend is running (default: port 3000)
- [ ] Can login with default credentials
- [ ] Dashboard loads for different user types

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot connect to MySQL"
**Solution:**
- Check MySQL is running: `mysql -u root -p`
- Verify password in `.env` file
- Check port (default: 3306)

### Issue 2: "Port 5000 already in use"
**Solution:**
Change PORT in `.env` file:
```env
PORT=5001
```

### Issue 3: "bcryptjs not found" or missing packages
**Solution:**
```bash
cd backend-setup
npm install
```

### Issue 4: Database tables not created
**Solution:**
Delete database and recreate:
```sql
mysql -u root -p
DROP DATABASE enrollment_system;
```
Then run: `npm run db:setup` again

### Issue 5: "Access denied for user"
**Solution:**
Your MySQL password is wrong. Update `.env` file with correct password.

---

## 📂 Project Structure

```
your-project/
├── backend-setup/              ← Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── database/
│   │   └── server.ts
│   ├── uploads/                ← File uploads stored here
│   ├── .env                    ← Your configuration (DON'T COMMIT!)
│   ├── package.json
│   └── README.md
│
├── components/                 ← Frontend React components
│   ├── LoginPage.tsx
│   ├── StudentDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── ...
│
├── App.tsx                     ← Main app
├── package.json
└── SETUP_GUIDE.md             ← This file
```

---

## 🚀 Running the Complete System

You need **TWO terminals running at the same time**:

### Terminal 1: Backend
```bash
cd backend-setup
npm run dev
```

### Terminal 2: Frontend
```bash
# In root directory
npm run dev
# or
npm start
```

---

## 🎯 Next Steps

After basic setup works:

1. **Create API Service Files** - I'll help you create these to connect frontend to backend
2. **Update Components** - Modify dashboards to fetch real data
3. **Test All Features** - Enrollment, subjects, transactions
4. **Add More Students** - Use the admin dashboard
5. **Customize** - Add your school's specific requirements

---

## 📞 Testing the API

### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
```

### Test Get Students (need token from login):
```bash
curl -X GET http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 💾 Database Access

### View Data in MySQL:
```bash
mysql -u root -p
```

```sql
USE enrollment_system;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM students;
SELECT * FROM enrollments;
```

---

## 🔐 Security Notes

- **NEVER commit `.env` file** to Git (already in `.gitignore`)
- Change `JWT_SECRET` to something random
- Change default passwords in production
- Don't use this for real student data without proper security review

---

## ✅ You're Ready!

Once you see both servers running without errors, you have:
- ✅ MySQL database with all tables
- ✅ Backend API running
- ✅ Frontend React app running
- ✅ Ready to integrate them together!

**Need help with the next step?** Let me know and I'll help you:
1. Create API service files to connect frontend to backend
2. Update your components to use real data
3. Add new features
