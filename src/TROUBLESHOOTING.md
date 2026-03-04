# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Missing script: db:setup" Error

**Problem:** Running `npm run db:setup` shows "Missing script" error

**Solution:**
```bash
# Make sure you're in the backend-setup directory
cd backend-setup

# Install dependencies first
npm install

# Then run the setup
npm run db:setup
```

**If still not working:**
```bash
# Check if package.json exists
ls package.json

# View available scripts
npm run

# Make sure you have these scripts in package.json
```

Your `package.json` should have these scripts:
```json
"scripts": {
  "dev": "nodemon src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "db:setup": "ts-node src/database/setup.ts",
  "db:add-students": "ts-node src/database/add-sample-students.ts"
}
```

---

### 2. "Cannot find module 'ts-node'" Error

**Problem:** Error about missing `ts-node` module

**Solution:**
```bash
# Install ts-node globally
npm install -g ts-node

# OR install all dependencies locally
npm install
```

---

### 3. "Cannot connect to MySQL" Error

**Problem:** Database connection fails

**Solution:**

1. **Make sure MySQL is running:**
   - Windows: Check MySQL service in Services app
   - Mac: Check with `brew services list` (if using Homebrew)
   - Linux: `sudo systemctl status mysql`

2. **Check your .env file:**
```bash
# Create .env file in backend-setup folder if it doesn't exist
cd backend-setup
```

Your `.env` should contain:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=enrollment_system
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development
```

3. **Test MySQL connection:**
```bash
mysql -u root -p
```

---

### 4. "Access denied for user" Error

**Problem:** MySQL authentication fails

**Solution:**

Update your `.env` file with correct MySQL credentials:
```env
DB_USER=root
DB_PASSWORD=your_actual_password
```

Or create a new MySQL user:
```sql
mysql -u root -p

CREATE USER 'enrollment_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON enrollment_system.* TO 'enrollment_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `.env`:
```env
DB_USER=enrollment_user
DB_PASSWORD=your_password
```

---

### 5. "Database already exists" Warning

**Problem:** You see warnings about existing database/tables

**Solution:** This is normal! The scripts use `IF NOT EXISTS` clauses, so they're safe to run multiple times.

**To start fresh:**
```sql
mysql -u root -p
DROP DATABASE enrollment_system;
exit;
```

Then run setup again:
```bash
npm run db:setup
```

---

### 6. "ECONNREFUSED" Error

**Problem:** Backend can't connect to database

**Solution:**

1. Check MySQL is running on the correct port (default: 3306)
2. Check firewall settings
3. Verify `.env` has correct `DB_PORT=3306`

---

### 7. "bcryptjs not found" Error

**Problem:** Missing bcryptjs dependency

**Solution:**
```bash
cd backend-setup
npm install bcryptjs @types/bcryptjs
```

---

### 8. TypeScript Compilation Errors

**Problem:** Errors when running TypeScript files

**Solution:**
```bash
# Install all dev dependencies
npm install --save-dev typescript ts-node @types/node

# Or reinstall everything
rm -rf node_modules package-lock.json
npm install
```

---

### 9. Port Already in Use

**Problem:** Error: "Port 5000 is already in use"

**Solution:**

**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

**Or change the port in `.env`:**
```env
PORT=5001
```

---

### 10. MySQL Not Installed

**Problem:** MySQL command not found

**Solution:**

**Windows:**
- Download from: https://dev.mysql.com/downloads/installer/
- Choose "MySQL Installer for Windows"
- Select "Developer Default" installation

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

---

## Verification Steps

After setup, verify everything works:

### 1. Check Database Exists
```bash
mysql -u root -p
```
```sql
SHOW DATABASES;
-- Should see: enrollment_system

USE enrollment_system;
SHOW TABLES;
-- Should see 8 tables
```

### 2. Check Users Were Created
```sql
SELECT username, role FROM users;
```
Should show:
- superadmin
- admin1
- dean1
- registrar1

### 3. Check Subjects Were Created
```sql
SELECT COUNT(*) FROM subjects;
```
Should return: 10

### 4. Test Backend Server
```bash
cd backend-setup
npm run dev
```

Should see:
```
🚀 Server running on port 5000
✅ Database connected successfully
```

### 5. Test API
Open browser: http://localhost:5000/api/test

Or use curl:
```bash
curl http://localhost:5000/api/test
```

---

## Getting Help

If issues persist:

1. **Check all documentation files:**
   - `DATABASE_SCHEMA.md` - Database structure
   - `QUICK_START.md` - Quick setup guide
   - `SETUP_GUIDE.md` - Detailed setup
   - `LOGIN_CREDENTIALS.md` - All login credentials
   - `TEST_API.md` - API testing guide

2. **Check logs:**
```bash
# Backend logs
cd backend-setup
npm run dev
# Watch for error messages
```

3. **Common checklist:**
   - [ ] MySQL is installed and running
   - [ ] `.env` file exists with correct credentials
   - [ ] All npm dependencies installed (`npm install`)
   - [ ] You're in the `backend-setup` directory
   - [ ] Port 5000 is not in use
   - [ ] Database `enrollment_system` exists

---

## Quick Reset

To completely reset and start over:

```bash
# 1. Drop database
mysql -u root -p
DROP DATABASE IF EXISTS enrollment_system;
exit;

# 2. Reinstall dependencies
cd backend-setup
rm -rf node_modules package-lock.json
npm install

# 3. Run setup again
npm run db:setup
npm run db:add-students

# 4. Start server
npm run dev
```

---

## System Requirements

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **MySQL**: v8.0 or higher
- **Operating System**: Windows 10+, macOS 10.14+, or Linux

Check versions:
```bash
node --version
npm --version
mysql --version
```
