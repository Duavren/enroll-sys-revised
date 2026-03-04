# 🚀 Quick Start Guide

Follow these steps to get your enrollment system running in 5 minutes!

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:
- [ ] Node.js installed (`node --version` should work)
- [ ] MySQL installed and running
- [ ] MySQL root password ready
- [ ] VS Code open

---

## 📝 Step-by-Step Setup

### STEP 1: Setup MySQL Database (2 minutes)

1. **Start MySQL:**
   ```bash
   # Windows (Command Prompt as Administrator)
   net start MySQL80
   
   # Mac
   brew services start mysql
   
   # Linux
   sudo service mysql start
   ```

2. **Test MySQL connection:**
   ```bash
   mysql -u root -p
   # Enter your password
   # Type: exit
   ```

---

### STEP 2: Setup Backend (2 minutes)

1. **Open VS Code Terminal** (Ctrl + ` or View → Terminal)

2. **Go to backend folder:**
   ```bash
   cd backend-setup
   ```

3. **Install packages:**
   ```bash
   npm install
   ```
   *(This takes ~2 minutes)*

4. **Create .env file:**
   
   Copy `.env.example` to `.env`:
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

5. **Edit .env file:**
   
   Open `backend-setup/.env` and change:
   ```env
   DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
   ```
   Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL password.

6. **Create uploads folder:**
   ```bash
   # Windows
   mkdir uploads
   mkdir uploads\documents
   
   # Mac/Linux
   mkdir -p uploads/documents
   ```

7. **Setup database:**
   ```bash
   npm run db:setup
   ```
   
   You should see: ✅ Database setup completed successfully!

8. **Start backend:**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   ✅ Database connected successfully
   🚀 Server running on port 5000
   ```

   **✨ LEAVE THIS TERMINAL RUNNING!**

---

### STEP 3: Setup Frontend (1 minute)

1. **Open a NEW terminal** (Click the + button in terminal panel)

2. **Go back to root directory:**
   ```bash
   cd ..
   ```
   
   (Or if you're already in root, skip this)

3. **Install axios (for API calls):**
   ```bash
   npm install axios
   ```

4. **Start frontend:**
   ```bash
   npm run dev
   # OR
   npm start
   ```

   **✨ LEAVE THIS TERMINAL RUNNING TOO!**

---

## 🎉 You're Done! Test It Out

### Open Your Browser:
- Frontend: http://localhost:3000 (or whatever port shows in terminal)
- Backend API: http://localhost:5000/api/health

### Login with Default Accounts:

| Username | Password | Role |
|----------|----------|------|
| `superadmin` | `admin123` | Superadmin (Full Access) |
| `admin1` | `admin123` | Admin |
| `dean1` | `admin123` | Dean |
| `registrar1` | `admin123` | Registrar |

---

## 🖥️ Your Terminal Should Look Like This:

```
Terminal 1 (Backend):
  backend-setup> npm run dev
  ✅ Database connected successfully
  🚀 Server running on port 5000

Terminal 2 (Frontend):
  > npm run dev
  Local: http://localhost:3000
```

**Both must be running at the same time!**

---

## ⚡ Common Quick Fixes

### "Cannot connect to database"
```bash
# Check if MySQL is running:
mysql -u root -p
```

### "Port 5000 already in use"
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### "Module not found" errors
```bash
# In backend-setup folder
npm install

# In root folder
npm install axios
```

### Start Over (Nuclear Option)
```bash
# Stop both terminals (Ctrl+C)
# Delete database
mysql -u root -p
DROP DATABASE enrollment_system;
exit

# Then redo STEP 2 from beginning
```

---

## 🎯 What's Next?

Now that everything is running:

1. **Test Login** - Use `superadmin` / `admin123`
2. **Explore Dashboards** - Try different user roles
3. **Check the Backend Data**:
   ```sql
   mysql -u root -p
   USE enrollment_system;
   SELECT * FROM users;
   SELECT * FROM students;
   ```

---

## 📞 Verify Everything Works

### Test Backend API:
Open browser: http://localhost:5000/api/health

Should show: `{"status":"OK","message":"Enrollment System API is running"}`

### Test Login API:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"superadmin\",\"password\":\"admin123\"}"
```

Should return a token.

---

## 💡 Pro Tips

1. **Keep both terminals visible** - Split your VS Code terminal panel
2. **Check backend terminal for errors** - API errors show up there
3. **Refresh browser if connection fails** - Sometimes takes a second to connect
4. **Use MySQL Workbench** - Easier to view database data

---

## ✅ Success Checklist

- [ ] MySQL is running
- [ ] Backend terminal shows: "Server running on port 5000"
- [ ] Frontend terminal shows the local URL
- [ ] Browser opens the login page
- [ ] Can login with superadmin/admin123
- [ ] Dashboard loads without errors

---

## 🆘 Still Having Issues?

1. Check `.env` file has correct MySQL password
2. Make sure MySQL is actually running
3. Verify both terminals are running
4. Try restarting both servers
5. Check for typos in the `.env` file

---

**You're all set! 🎉**

Both servers are now running and connected. Your enrollment system is live!
