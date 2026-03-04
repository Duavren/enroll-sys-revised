# 🚀 Quick Start Testing Guide

## What Was Fixed
The student creation error has been fixed:
- **Error**: `CHECK constraint failed: student_type IN ('New', 'Transferee', 'Returning', 'Continuing', 'Scholar')`
- **Status**: ✅ FIXED

## How to Test

### Step 1: Start the Application
```bash
# Terminal 1 - Backend
cd src/backend-setup
npm start

# Terminal 2 - Frontend  
npm run dev
```

### Step 2: Test Student Creation
1. Go to Admin Dashboard
2. Click "Students" tab
3. Click "Add Student"
4. **Fill the form**:
   - Student ID: `2024-001`
   - Student Type: `New` ← This now works!
   - First Name: `Juan`
   - Last Name: `Dela Cruz`
   - Gender: `Male` ← NEW field
   - Birth Date: `1995-05-15` ← NEW field
   - Address: `123 Rizal St` ← NEW field
   - Course: `BSIT`
   - Year Level: `1`
   - Email: `juan@example.com`
   - Contact: `09123456789`
5. Click "Add Student"
6. ✅ Should succeed (no more constraint error!)

### Step 3: Test Document Upload
1. Go to Student Dashboard
2. Click "Enrollments" tab
3. Click "Start New Enrollment"
4. Select "New Student"
5. Click "Next"
6. **Upload documents** (new interface):
   - Drag-drop a PDF or click to select
   - File appears with name and size
   - Can click X to remove
7. Click "Submit for Assessment"
8. ✅ Enrollment should be created

### Step 4: Verify Database
```bash
sqlite3 src/backend-setup/enrollment_system.db

# Check student was created
SELECT student_id, student_type, gender, birth_date FROM students LIMIT 1;

# Should show: 2024-001|New|Male|1995-05-15
```

## What to Look For

✅ **Success Signs**
- Student created with no errors
- All form fields accepted
- Document upload shows file names
- Enrollment status changes to "Pending"
- Database contains correct values

❌ **Error Signs**
- Constraint error in console
- Form won't submit
- Missing fields
- File upload fails

## File Upload Features
- 💾 **Drag-drop support** - Drop files anywhere
- ✏️ **Click upload** - Traditional file browser
- 📊 **File info** - Shows name and size
- ❌ **Remove button** - Easy file removal
- ⚠️ **Validation** - Max 5MB, specific formats
- ✅ **Visual feedback** - Green when uploaded

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Student type error | Ensure using "New", not "College" |
| File too large | Max 5MB, compress if needed |
| Wrong file format | Use PDF, DOC, DOCX, JPG, JPEG, PNG |
| Enrollment won't submit | Ensure files are uploaded |
| Database not found | Start backend first |

## Testing Checklist

### Admin Dashboard
- [ ] Can create student with type "New"
- [ ] Can create student with type "Transferee"  
- [ ] Can create student with type "Returning"
- [ ] Can create student with type "Continuing"
- [ ] Can create student with type "Scholar"
- [ ] All form fields (including Gender, Birth Date, Address) are visible
- [ ] Student appears in students list

### Student Dashboard
- [ ] Can start new enrollment
- [ ] Can select student type
- [ ] Can upload documents via drag-drop
- [ ] Can upload documents via click
- [ ] Can see uploaded file names and sizes
- [ ] Can remove uploaded files
- [ ] Can submit enrollment
- [ ] Enrollment status changes to "Pending"

### File Upload
- [ ] Drag-drop works
- [ ] Click upload works
- [ ] File size validation works (try >5MB)
- [ ] File type validation works (try .exe)
- [ ] File removal works (X button)
- [ ] Multiple files can be uploaded

## Database Queries for Testing

```sql
-- Check student created
SELECT id, student_id, student_type, gender, birth_date, address FROM students ORDER BY id DESC LIMIT 1;

-- Check enrollment created
SELECT id, student_id, status FROM enrollments ORDER BY id DESC LIMIT 1;

-- Check documents uploaded
SELECT id, enrollment_id, document_type FROM documents ORDER BY id DESC LIMIT 5;

-- Verify student_type values (should all be valid)
SELECT DISTINCT student_type FROM students;
```

## Contact Points in Code

| Component | File | Line |
|-----------|------|------|
| Student form | AdminDashboard.tsx | 1820-1970 |
| Form state | AdminDashboard.tsx | 107-119 |
| Student types | AdminDashboard.tsx | 1837-1841 |
| Document upload | StudentDashboard.tsx | 450-690 |
| Upload component | document-upload.tsx | 1-105 |

## Success Criteria

✅ **All of these should pass**:
1. Student creation form appears
2. All 5 student types in dropdown
3. Can create student with any type
4. No database constraint errors
5. Document upload interface works
6. Files can be uploaded and removed
7. Enrollment status updates correctly
8. Database records created properly

---

**Still having issues?** 
Check the detailed guides:
- `PROGRESS_UPDATE_JAN13.md` - Full details
- `CODE_CHANGES_REFERENCE.md` - Code comparisons
- `TESTING_CHECKLIST.js` - Extended tests
