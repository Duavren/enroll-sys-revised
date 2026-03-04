import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, authorize } from '../middleware/auth.middleware';
import forms from '../controllers/forms.controller';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads', 'documents')),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC/DOCX, JPG/PNG files are allowed'));
    }
  }
});

// Admin routes for managing form templates
router.get('/', authenticate, authorize('admin', 'superadmin'), forms.listTemplates);
router.post('/', authenticate, authorize('admin', 'superadmin'), upload.single('template'), forms.uploadTemplate);
router.delete('/:name', authenticate, authorize('admin', 'superadmin'), forms.deleteTemplate);

export default router;
