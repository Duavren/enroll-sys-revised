import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';

const documentsDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
const indexFile = path.join(documentsDir, 'index.json');

const readIndex = () => {
  try {
    if (!fs.existsSync(indexFile)) return [];
    const raw = fs.readFileSync(indexFile, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed reading templates index:', err);
    return [];
  }
};

const writeIndex = (items: any[]) => {
  try {
    fs.writeFileSync(indexFile, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing templates index:', err);
  }
};

export const listTemplates = (req: Request, res: Response) => {
  try {
    // Only return templates that were added via the upload endpoint (tracked in index.json)
    const items = readIndex().map((it: any) => ({
      ...it,
      url: `/uploads/documents/${encodeURIComponent(it.name)}`
    }));

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadTemplate = (req: AuthRequest, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const item = {
      name: file.filename,
      size: file.size,
      mtime: new Date()
    };

    const current = readIndex();
    current.unshift(item);
    writeIndex(current);

    res.status(201).json({ success: true, data: { ...item, url: `/uploads/documents/${encodeURIComponent(item.name)}` } });
  } catch (error) {
    console.error('Upload template error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteTemplate = (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ success: false, message: 'Filename required' });

    const safeName = path.basename(name);
    const filePath = path.join(documentsDir, safeName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const current = readIndex().filter((it: any) => it.name !== safeName);
    writeIndex(current);

    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default { listTemplates, uploadTemplate, deleteTemplate };
