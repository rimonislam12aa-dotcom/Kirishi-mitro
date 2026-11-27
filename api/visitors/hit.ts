import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join('/tmp', 'krishi-mitra-visitors.json');

interface VisitorStore {
  totalVisits: number;
  uniqueVisitorIds: string[];
  dailyVisits: Record<string, number>;
  dailyUniqueVisitors: Record<string, string[]>;
  lastVisitAt: string;
}

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
  const todayKey = new Date().toISOString().slice(0, 10);
  let store: VisitorStore = {
    totalVisits: 0,
    uniqueVisitorIds: [],
    dailyVisits: { [todayKey]: 0 },
    dailyUniqueVisitors: { [todayKey]: [] },
    lastVisitAt: new Date().toISOString(),
  };

  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8')) as Partial<VisitorStore>;
      store = {
        totalVisits: typeof parsed.totalVisits === 'number' ? parsed.totalVisits : 0,
        uniqueVisitorIds: Array.isArray(parsed.uniqueVisitorIds)
          ? Array.from(new Set(parsed.uniqueVisitorIds.filter((x): x is string => typeof x === 'string')))
          : [],
        dailyVisits: parsed.dailyVisits && typeof parsed.dailyVisits === 'object' ? parsed.dailyVisits : {},
        dailyUniqueVisitors:
          parsed.dailyUniqueVisitors && typeof parsed.dailyUniqueVisitors === 'object'
            ? parsed.dailyUniqueVisitors
            : {},
        lastVisitAt: typeof parsed.lastVisitAt === 'string' ? parsed.lastVisitAt : new Date().toISOString(),
      };
    }
  } catch {
    // Use fresh store
  }

  if (!Array.isArray(store.dailyUniqueVisitors[todayKey])) {
    store.dailyUniqueVisitors[todayKey] = [];
  }

  const body = req.method === 'POST' ? await parseJsonBody(req) : {};
  const sanitized =
    typeof body.visitorId === 'string'
      ? body.visitorId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
      : '';
  const countVisit = body.countVisit !== false;

  if (countVisit || sanitized.length >= 4) {
    const visitorId = sanitized.length >= 4 ? sanitized : `anon_${Date.now()}`;
    if (countVisit) {
      store.totalVisits += 1;
      store.dailyVisits[todayKey] = (store.dailyVisits[todayKey] ?? 0) + 1;
      store.lastVisitAt = new Date().toISOString();
    }

    if (!store.uniqueVisitorIds.includes(visitorId)) {
      store.uniqueVisitorIds.push(visitorId);
    }
    if (!store.dailyUniqueVisitors[todayKey].includes(visitorId)) {
      store.dailyUniqueVisitors[todayKey].push(visitorId);
    }

    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(store), 'utf-8');
    } catch {
      // Ignore /tmp write error
    }
  }

  const uniqueVisitors = store.uniqueVisitorIds.length;
  const totalVisits = Math.max(store.totalVisits, uniqueVisitors);
  const todayUniqueVisitors = store.dailyUniqueVisitors[todayKey]?.length ?? 0;
  const todayVisits = Math.max(store.dailyVisits[todayKey] ?? 0, todayUniqueVisitors);
  const returningVisits = Math.max(0, totalVisits - uniqueVisitors);
  const avgViewsPerVisitor =
    uniqueVisitors > 0 ? Math.round((totalVisits / uniqueVisitors) * 10) / 10 : 0;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      totalVisits,
      todayVisits,
      uniqueVisitors,
      todayUniqueVisitors,
      returningVisits,
      avgViewsPerVisitor,
      activeNow: 1,
      lastVisitAt: store.lastVisitAt,
    })
  );
}
