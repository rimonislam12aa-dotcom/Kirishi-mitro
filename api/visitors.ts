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

function readStore(): VisitorStore {
  const todayKey = new Date().toISOString().slice(0, 10);
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8')) as Partial<VisitorStore>;
      const uniqueVisitorIds = Array.isArray(parsed.uniqueVisitorIds)
        ? Array.from(new Set(parsed.uniqueVisitorIds.filter((x): x is string => typeof x === 'string')))
        : [];
      const dailyUniqueVisitors =
        parsed.dailyUniqueVisitors && typeof parsed.dailyUniqueVisitors === 'object'
          ? parsed.dailyUniqueVisitors
          : {};
      const todayUnique = Array.isArray(dailyUniqueVisitors[todayKey]) ? dailyUniqueVisitors[todayKey] : [];
      return {
        totalVisits: Math.max(
          typeof parsed.totalVisits === 'number' ? parsed.totalVisits : 0,
          uniqueVisitorIds.length
        ),
        uniqueVisitorIds,
        dailyVisits:
          parsed.dailyVisits && typeof parsed.dailyVisits === 'object'
            ? parsed.dailyVisits
            : { [todayKey]: todayUnique.length },
        dailyUniqueVisitors: { ...dailyUniqueVisitors, [todayKey]: todayUnique },
        lastVisitAt: typeof parsed.lastVisitAt === 'string' ? parsed.lastVisitAt : new Date().toISOString(),
      };
    }
  } catch {
    // Fallback below
  }
  return {
    totalVisits: 0,
    uniqueVisitorIds: [],
    dailyVisits: { [todayKey]: 0 },
    dailyUniqueVisitors: { [todayKey]: [] },
    lastVisitAt: new Date().toISOString(),
  };
}

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const store = readStore();
  const todayKey = new Date().toISOString().slice(0, 10);
  const uniqueVisitors = store.uniqueVisitorIds.length;
  const totalVisits = Math.max(store.totalVisits, uniqueVisitors);
  const todayUniqueVisitors = store.dailyUniqueVisitors[todayKey]?.length ?? 0;
  const todayVisits = Math.max(store.dailyVisits[todayKey] ?? 0, todayUniqueVisitors);
  const returningVisits = Math.max(0, totalVisits - uniqueVisitors);
  const avgViewsPerVisitor =
    uniqueVisitors > 0 ? Math.round((totalVisits / uniqueVisitors) * 10) / 10 : 0;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
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
