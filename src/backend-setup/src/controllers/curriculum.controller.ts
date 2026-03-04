import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
const filePath = path.join(dataDir, 'curriculums.json');

function readAll() { try { return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]'); } catch (e) { return []; } }
function writeAll(items: any[]) { fs.writeFileSync(filePath, JSON.stringify(items, null, 2)); }

export const uploadCurriculum = (req: Request, res: Response) => {
  const payload = req.body; // expect { program, uploadedBy, data }
  const items = readAll();
  const entry = { id: Date.now().toString(), status: 'pending', ts: new Date().toISOString(), ...payload };
  items.unshift(entry);
  writeAll(items);
  res.json({ success: true, data: entry });
};

export const listPending = (req: Request, res: Response) => {
  const items = readAll();
  res.json({ success: true, data: items.filter((i: any) => i.status === 'pending') });
};

export const approveCurriculum = (req: Request, res: Response) => {
  const { id } = req.params;
  const items = readAll();
  const idx = items.findIndex((i: any) => i.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  items[idx].status = 'approved';
  items[idx].approvedBy = req.body.approvedBy || 'dean';
  items[idx].approvedAt = new Date().toISOString();
  writeAll(items);
  res.json({ success: true, data: items[idx] });
};

export default { uploadCurriculum, listPending, approveCurriculum };
