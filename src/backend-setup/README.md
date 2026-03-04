# Enrollment System Backend API

Complete Node.js + Express + TypeScript backend for the Informatics College Enrollment System.

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=enrollment_system
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Create Database and Tables

Run the database setup script:

```bash
npm run db:setup
```

This will:
- Create the database
- Create all required tables
- Insert default admin users
- Insert sample subjects

**Default Credentials:**
- Superadmin: `superadmin` / `admin123`
- Admin: `admin1` / `admin123`
- Dean: `dean1` / `admin123`
- Registrar: `registrar1` / `admin123`

### 4. Create Upload Directory

```bash
mkdir -p uploads/documents
```

### 5. Run the Development Server

```bash
npm run dev
```

The API will start on http://localhost:5000

### 6. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
backend-setup/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── student.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── enrollment.controller.ts
│   │   ├── subject.controller.ts
│   │   └── transaction.controller.ts
│   ├── database/           # Database configuration
│   │   ├── connection.ts
│   │   └── setup.ts
│   ├── middleware/         # Express middleware
│   │   └── auth.middleware.ts
│   ├── routes/             # API routes
│   │   ├── auth.routes.ts
│   │   ├── student.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── enrollment.routes.ts
│   │   ├── subject.routes.ts
│   │   └── transaction.routes.ts
│   └── server.ts           # Main application entry
├── uploads/                # File uploads directory
├── .env                    # Environment variables
├── .env.example            # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Students (Student Role)
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/enrollments` - Get student enrollments
- `POST /api/students/documents` - Upload document

### Admin Operations
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/students` - Get all students
- `GET /api/admin/students/:id` - Get student by ID
- `POST /api/admin/students` - Create new student
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student (superadmin only)
- `GET /api/admin/enrollments` - Get all enrollments
- `GET /api/admin/enrollments/:id` - Get enrollment details
- `PUT /api/admin/enrollments/:id/status` - Update enrollment status

### Enrollments
- `POST /api/enrollments` - Create enrollment
- `GET /api/enrollments/my` - Get my enrollments
- `GET /api/enrollments/:id` - Get enrollment details
- `POST /api/enrollments/:id/subjects` - Add subject to enrollment
- `DELETE /api/enrollments/:id/subjects/:subjectId` - Remove subject
- `PUT /api/enrollments/:id/submit` - Submit for assessment

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/course/:course` - Get subjects by course
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (admin/dean only)
- `PUT /api/subjects/:id` - Update subject (admin/dean only)
- `DELETE /api/subjects/:id` - Delete subject (superadmin only)

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/enrollment/:enrollmentId` - Get enrollment transactions
- `GET /api/transactions` - Get all transactions
- `PUT /api/transactions/:id/status` - Update transaction status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 👥 User Roles

1. **Superadmin** - Full system access
2. **Admin** - Manage students, enrollments, subjects
3. **Dean** - View and manage academic data
4. **Registrar** - Handle enrollments and transactions
5. **Student** - Manage own enrollment and profile

## 🗄️ Database Tables

- **users** - User accounts and authentication
- **students** - Student information
- **enrollments** - Enrollment records
- **subjects** - Available subjects/courses
- **enrollment_subjects** - Student subject selections
- **documents** - Uploaded documents
- **transactions** - Payment transactions
- **activity_logs** - System activity tracking

## 📝 Example Usage

### Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
```

### Get Students (with auth)
```bash
curl -X GET http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Enrollment
```bash
curl -X POST http://localhost:5000/api/enrollments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"school_year":"2024-2025","semester":"1st"}'
```

## 🛠️ Development

### Watch Mode
```bash
npm run dev
```

### Type Checking
```bash
npx tsc --noEmit
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- SQL injection protection (parameterized queries)
- File upload validation
- Activity logging

## 📊 Monitoring

All user actions are logged in the `activity_logs` table for audit purposes.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### Port Already in Use
Change the PORT in `.env` file

### File Upload Errors
Ensure `uploads/documents` directory exists and has write permissions

## 📄 License

This project is for educational purposes.
