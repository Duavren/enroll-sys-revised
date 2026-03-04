# Code Changes Reference - Student Creation & Document Upload Fix

## AdminDashboard.tsx Changes

### 1. Fixed Student Type Default (Line 112)
```typescript
// BEFORE
student_type: 'College',

// AFTER
student_type: 'New',
```

### 2. Fixed Student Type Dropdown Options (Lines 1835-1842)
```typescript
// BEFORE
<SelectContent>
  <SelectItem value="College">College</SelectItem>
  <SelectItem value="SHS">SHS</SelectItem>
</SelectContent>

// AFTER
<SelectContent>
  <SelectItem value="New">New</SelectItem>
  <SelectItem value="Transferee">Transferee</SelectItem>
  <SelectItem value="Returning">Returning</SelectItem>
  <SelectItem value="Continuing">Continuing</SelectItem>
  <SelectItem value="Scholar">Scholar</SelectItem>
</SelectContent>
```

### 3. Removed Conditional Rendering & Added Missing Fields (Lines 1895-1968)
```typescript
// BEFORE - Only showed fields if student_type === 'College'
{newStudentForm.student_type === 'College' && (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="course">Course</Label>
        // ... course dropdown
      </div>
      <div>
        <Label htmlFor="year-level">Year Level</Label>
        // ... year level input
      </div>
    </div>
  </>
)}

// AFTER - Fields always visible + added missing fields
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="course">Course</Label>
    // ... course dropdown
  </div>
  <div>
    <Label htmlFor="year-level">Year Level</Label>
    // ... year level input
  </div>
</div>

<div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="gender">Gender</Label>
    <Select 
      value={newStudentForm.gender}
      onValueChange={(value) => setNewStudentForm({...newStudentForm, gender: value})}
    >
      <SelectTrigger id="gender" className="mt-2">
        <SelectValue placeholder="Select gender" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Male">Male</SelectItem>
        <SelectItem value="Female">Female</SelectItem>
        <SelectItem value="Other">Other</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div>
    <Label htmlFor="birth-date">Birth Date</Label>
    <Input 
      id="birth-date" 
      type="date"
      className="mt-2"
      value={newStudentForm.birth_date}
      onChange={(e) => setNewStudentForm({...newStudentForm, birth_date: e.target.value})}
    />
  </div>
</div>

<div>
  <Label htmlFor="address">Address</Label>
  <Input 
    id="address" 
    placeholder="Street address" 
    className="mt-2"
    value={newStudentForm.address}
    onChange={(e) => setNewStudentForm({...newStudentForm, address: e.target.value})}
  />
</div>
```

### 4. Fixed Form Reset Value (Line 476)
```typescript
// BEFORE
student_type: 'College',

// AFTER
student_type: 'New',
```

---

## StudentDashboard.tsx Changes

### 1. Added DocumentUpload Import
```typescript
import { DocumentUpload } from './ui/document-upload';
```

### 2. Enhanced handleDocumentUpload Function
```typescript
// BEFORE
const handleDocumentUpload = (docType: string, file: File) => {
  setUploadedDocuments({...uploadedDocuments, [docType]: file});
};

// AFTER
const handleDocumentUpload = (docType: string, file: File | null) => {
  if (file === null) {
    const updated = { ...uploadedDocuments };
    delete updated[docType];
    setUploadedDocuments(updated);
  } else {
    setUploadedDocuments({...uploadedDocuments, [docType]: file});
  }
};
```

### 3. Fixed Type Checking in handleSubmitForAssessment
```typescript
// BEFORE
for (const [docType, file] of Object.entries(uploadedDocuments)) {
  await studentService.uploadDocument(file, docType, enrollment.enrollment.id);
}

// AFTER
for (const [docType, file] of Object.entries(uploadedDocuments)) {
  if (file instanceof File) {
    await studentService.uploadDocument(file, docType, enrollment.enrollment.id);
  }
}
```

### 4. Replaced New Student Document UI (Lines 450-469)
```typescript
// BEFORE - Plain buttons
<div className="space-y-3">
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <Label>Form 137</Label>
      <Button size="sm" variant="outline" className="gap-2">
        <Upload className="h-4 w-4" />
        Upload
      </Button>
    </div>
    <p className="text-xs text-slate-500">Upload your Form 137 (Report Card)</p>
  </div>
  // ... repeated for other documents
</div>

// AFTER - DocumentUpload components
<DocumentUpload
  label="Form 137"
  description="Upload your Form 137 (Report Card)"
  docType="form137"
  onFileSelect={handleDocumentUpload}
  selectedFile={uploadedDocuments['form137']}
  acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
/>

<DocumentUpload
  label="Form 138"
  description="Upload your Form 138 (Transcript of Records)"
  docType="form138"
  onFileSelect={handleDocumentUpload}
  selectedFile={uploadedDocuments['form138']}
  acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
/>

<DocumentUpload
  label="Birth Certificate"
  description="Upload a copy of your Birth Certificate"
  docType="birth_certificate"
  onFileSelect={handleDocumentUpload}
  selectedFile={uploadedDocuments['birth_certificate']}
  acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
/>

<DocumentUpload
  label="Good Moral Certificate"
  description="Upload your Good Moral Certificate"
  docType="moral_certificate"
  onFileSelect={handleDocumentUpload}
  selectedFile={uploadedDocuments['moral_certificate']}
  acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
/>
```

### 5. Similar replacements for Transferee, Returning, and Scholar sections
All document upload sections were replaced with DocumentUpload components with appropriate labels and document types.

---

## New File: document-upload.tsx

```typescript
import { useState } from 'react';
import { Button } from './button';
import { Upload, X, File } from 'lucide-react';
import { Label } from './label';

interface DocumentUploadProps {
  label: string;
  description: string;
  docType: string;
  onFileSelect: (docType: string, file: File | null) => void;
  selectedFile?: File;
  acceptedFormats?: string;
}

export function DocumentUpload({
  label,
  description,
  docType,
  onFileSelect,
  selectedFile,
  acceptedFormats = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFormats = acceptedFormats.split(',').map(f => f.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return false;
    }

    if (!validFormats.includes(fileExtension)) {
      setError(`Invalid file format. Accepted: ${acceptedFormats}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(docType, file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Label className="block mb-1">{label}</Label>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {selectedFile && (
          <button
            onClick={() => onFileSelect(docType, null)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400'
          }`}
        >
          <input
            type="file"
            id={`upload-${docType}`}
            className="hidden"
            onChange={handleInputChange}
            accept={acceptedFormats}
          />
          <label htmlFor={`upload-${docType}`} className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {acceptedFormats}
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <File className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-green-700">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
```

---

## Database Constraint Compliance

### Before Fix
- Form was sending: `'College'` or `'SHS'`
- Database expected: `'New'`, `'Transferee'`, `'Returning'`, `'Continuing'`, `'Scholar'`
- Result: **CHECK constraint failed** ❌

### After Fix
- Form now sends: `'New'`, `'Transferee'`, `'Returning'`, `'Continuing'`, `'Scholar'`
- Database accepts all these values ✅
- Student creation now works correctly ✅

---

## Summary of Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Student Type Options | 2 (College, SHS) | 5 (New, Transferee, Returning, Continuing, Scholar) |
| Form Fields | 11 fields | 14 fields (added Gender, Birth Date, Address) |
| Document Upload UI | Plain buttons, non-functional | Full-featured DocumentUpload component |
| File Validation | None | Size (5MB) and type validation |
| Drag-and-drop | Not supported | Fully supported |
| File Feedback | No feedback | Shows file name and size |
| File Removal | Not possible | Easy removal with X button |
| Type Safety | Potential issues | Full TypeScript type checking |
