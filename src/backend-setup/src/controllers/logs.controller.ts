import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
const logsFile = path.join(dataDir, 'activityLogs.json');

function readLogs() {
  try { return JSON.parse(fs.readFileSync(logsFile, 'utf8') || '[]'); } catch (e) { return []; }
}

function writeLogs(items: any[]) {
  fs.writeFileSync(logsFile, JSON.stringify(items, null, 2));
}

export const listLogs = (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.max(1, Math.min(200, parseInt(String(req.query.limit || '25'), 10)));
  const q = (req.query.q || '').toString().toLowerCase();
  const since = req.query.since ? new Date(String(req.query.since)) : null;

  let logs = readLogs();

  if (since && !isNaN(since.getTime())) {
    logs = logs.filter((l: any) => {
      const t = new Date(l.created_at || l.ts || l.time || Date.now());
      return t >= since;
    });
  }

  if (q) {
    logs = logs.filter((l: any) => {
      const hay = ((l.action || '') + ' ' + (l.user || '') + ' ' + (l.meta && JSON.stringify(l.meta) || '') + ' ' + (l.details || l.message || '')).toLowerCase();
      return hay.includes(q);
    });
  }

  const total = logs.length;
  const start = (page - 1) * limit;
  const pageItems = logs.slice(start, start + limit);

  res.json({ success: true, data: pageItems, meta: { page, limit, total } });
};

export const addLog = (req: Request, res: Response) => {
  const { user, action, meta } = req.body;
  const logs = readLogs();
  const entry = {
    id: Date.now(),
    user: user || 'system',
    action: action || 'unknown',
    meta: meta || null,
    ts: new Date().toISOString()
  };
  logs.unshift(entry);
  writeLogs(logs);
  res.json({ success: true, data: entry });
};

export default { listLogs, addLog };
