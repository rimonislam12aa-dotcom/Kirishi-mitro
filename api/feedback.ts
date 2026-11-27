import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join('/tmp', 'krishi-mitra-feedback.json');

type JsonReq = IncomingMessage & { body?: unknown };

async function parseJsonBody(req: JsonReq): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default async function handler(req: JsonReq, res: ServerResponse) {
  let items: Record<string, unknown>[] = [];
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      if (Array.isArray(parsed)) items = parsed;
    }
  } catch {
    items = [];
  }

  if (req.method === 'POST') {
    const body = await parseJsonBody(req);
    if (typeof body.name !== 'string' || body.name.trim().length < 2 || typeof body.message !== 'string' || body.message.trim().length < 4) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Valid name and message are required.' }));
      return;
    }
    const entry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: body.name.trim().slice(0, 80),
      phone: typeof body.phone === 'string' ? body.phone.trim().slice(0, 30) : '',
      village: typeof body.village === 'string' ? body.village.trim().slice(0, 80) : '',
      crop: typeof body.crop === 'string' ? body.crop.trim().slice(0, 60) : '',
      category: typeof body.category === 'string' ? body.category.trim().slice(0, 40) : 'general',
      message: body.message.trim().slice(0, 1500),
      language: body.language === 'hi' || body.language === 'en' ? body.language : 'bn',
      lat: typeof body.lat === 'number' && Number.isFinite(body.lat) ? body.lat : undefined,
      lon: typeof body.lon === 'number' && Number.isFinite(body.lon) ? body.lon : undefined,
      createdAt: new Date().toISOString(),
    };
    items = [entry, ...items].slice(0, 200);
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(items), 'utf-8');
    } catch {
      // Ignore /tmp write error
    }
    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ item: entry }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ items }));
}
