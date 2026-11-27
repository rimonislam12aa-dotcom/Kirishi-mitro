import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const STORE_PATH = path.join('/tmp', 'krishi-mitra-market.json');

type JsonReq = IncomingMessage & { body?: unknown };

interface MarketSourceLink {
  title: string;
  uri: string;
}

interface StoredMarketUpdate {
  id: string;
  cropId: string;
  category: 'grain' | 'vegetable' | 'spice' | 'fruit';
  cropNameBn: string;
  cropNameHi: string;
  cropNameEn: string;
  marketName: string;
  district: string;
  pricePerKg: number;
  pricePerMaund: number;
  previousPricePerKg: number;
  trend: 'up' | 'down' | 'stable';
  currency: 'BDT' | 'INR';
  updatedAt: string;
  reportedBy: string;
  sourceLabel?: string;
  isLiveVerified?: boolean;
}

interface MarketStorePayload {
  updates: StoredMarketUpdate[];
  lastAutoRefreshAt: string | null;
  sources: MarketSourceLink[];
}

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

function readStore(): MarketStorePayload {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      if (Array.isArray(parsed)) {
        return { updates: parsed, lastAutoRefreshAt: null, sources: [] };
      }
      if (parsed && typeof parsed === 'object') {
        return {
          updates: Array.isArray(parsed.updates) ? parsed.updates : [],
          lastAutoRefreshAt: typeof parsed.lastAutoRefreshAt === 'string' ? parsed.lastAutoRefreshAt : null,
          sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        };
      }
    }
  } catch {
    // ignore read error
  }
  return { updates: [], lastAutoRefreshAt: null, sources: [] };
}

function writeStore(payload: MarketStorePayload): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(payload), 'utf-8');
  } catch {
    // ignore /tmp write error
  }
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return trimmed;
}

function isTransientCapacityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('429');
}

function formatFriendlyGeminiError(err: unknown, lang: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (raw.includes('GEMINI_API_KEY')) {
    return lang === 'bn'
      ? 'সার্ভারে Gemini API কী সেট করা নেই (Settings > Secrets)।'
      : lang === 'hi'
      ? 'सर्वर में Gemini API कुंजी सेट नहीं है (Settings > Secrets)।'
      : 'Gemini API key is not configured in Settings > Secrets.';
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return lang === 'bn'
      ? 'সার্ভারের দৈনিক এআই কোটা সীমায় পৌঁছেছে। Settings > Secrets থেকে বিলিং-সক্রিয় API Key যোগ করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।'
      : lang === 'hi'
      ? 'एआई सेवा की सीमा पूरी हो गई है। कृपया Settings > Secrets में API कुंजी जांचें या थोड़ी देर बाद प्रयास करें।'
      : 'AI request quota reached. Please check your API key in Settings > Secrets or try again shortly.';
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand') || raw.includes('503_TIMEOUT')) {
    return lang === 'bn'
      ? 'এই মুহূর্তে সার্ভারে চাপ বেশি আছে। অনুগ্রহ করে ১০-১৫ সেকেন্ড পর আবার চেষ্টা করুন।'
      : lang === 'hi'
      ? 'अभी सर्वर पर अधिक ट्रैफ़िक है। कृपया 10-15 सेकंड बाद फिर प्रयास करें।'
      : 'Service is temporarily busy due to high demand. Please retry in 10–15 seconds.';
  }
  return raw;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req: JsonReq, res: ServerResponse) {
  const store = readStore();

  if (req.method === 'POST') {
    const body = await parseJsonBody(req);

    if (body.action === 'refresh') {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured in Vercel environment variables.' });
          return;
        }
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const district = typeof body.district === 'string' ? body.district.slice(0, 60) : 'Dhaka';
        const todayIso = new Date().toISOString().slice(0, 10);
        const prompt = `Search for the latest verified wholesale and retail agricultural crop market prices in Bangladesh (DAM Bangladesh dam.gov.bd / TCB / Dhaka Karwan Bazar / Bogura / Rajshahi / Jashore) and West Bengal Nadia as of ${todayIso}.
STRICT UNIT RULE: Always convert to 1 kilogram (per-kg) rate ONLY (never return 40-kg maund or 100-kg quintal values as pricePerKg).
Return ONLY a valid JSON array with realistic current per-kg prices for:
"rice-br28", "potato-diamond", "tomato-local", "onion-desi", "mustard-seed", "chili-green", "garlic-desi", "lentil-masoor", "mango-himsagar", "wheat-nadia".
District context: ${district}.
Fields per object: cropId, category ("grain"|"vegetable"|"spice"|"fruit"), cropNameBn, cropNameHi, cropNameEn, marketName, district, pricePerKg (number), currency ("BDT"|"INR").`;

        const marketModels = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
        let response;
        let lastErr: unknown;
        for (let i = 0; i < marketModels.length; i += 1) {
          try {
            response = await ai.models.generateContent({
              model: marketModels[i],
              contents: prompt,
              config: { tools: [{ googleSearch: {} }] },
            });
            break;
          } catch (err) {
            lastErr = err;
            if (!isTransientCapacityError(err) || i === marketModels.length - 1) throw err;
            await new Promise((r) => setTimeout(r, 400));
          }
        }
        if (!response) throw lastErr ?? new Error('Live market lookup failed.');

        const rawText = stripJsonFences(response.text ?? '[]');
        const arrayMatch = rawText.match(/\[[\s\S]*\]/);
        const parsedList = JSON.parse(arrayMatch ? arrayMatch[0] : rawText);
        if (!Array.isArray(parsedList) || parsedList.length === 0) {
          throw new Error('Could not parse live market prices.');
        }

        const groundingChunks =
          (response.candidates?.[0]?.groundingMetadata?.groundingChunks as
            | Array<{ web?: { uri?: string; title?: string } }>
            | undefined) ?? [];

        const sources: MarketSourceLink[] = [];
        const seen = new Set<string>();
        for (const c of groundingChunks) {
          const uri = c?.web?.uri;
          if (typeof uri === 'string' && uri.startsWith('http') && !seen.has(uri)) {
            seen.add(uri);
            sources.push({ title: c?.web?.title || uri, uri });
          }
          if (sources.length >= 4) break;
        }

        const prevByCrop = new Map(store.updates.map((u) => [u.cropId, u]));
        const nowIso = new Date().toISOString();
        const validCategories = new Set(['grain', 'vegetable', 'spice', 'fruit']);

        const refreshedEntries: StoredMarketUpdate[] = [];
        for (const row of parsedList) {
          if (!row || typeof row !== 'object') continue;
          const cropId = String(row.cropId || '').trim().slice(0, 40);
          const pricePerKg = Math.round(Number(row.pricePerKg) * 10) / 10;
          if (!cropId || !Number.isFinite(pricePerKg) || pricePerKg < 5 || pricePerKg > 2500) continue;
          const prev = prevByCrop.get(cropId);
          const previousPricePerKg = prev ? prev.pricePerKg : pricePerKg;
          const ratio = previousPricePerKg > 0 ? (pricePerKg - previousPricePerKg) / previousPricePerKg : 0;
          const trend: 'up' | 'down' | 'stable' = ratio >= 0.015 ? 'up' : ratio <= -0.015 ? 'down' : 'stable';
          const category = validCategories.has(String(row.category))
            ? (String(row.category) as StoredMarketUpdate['category'])
            : prev?.category ?? 'vegetable';

          refreshedEntries.push({
            id: prev?.id ?? `mkt-${cropId}`,
            cropId,
            category,
            cropNameBn: String(row.cropNameBn || prev?.cropNameBn || 'ফসল').slice(0, 60),
            cropNameHi: String(row.cropNameHi || prev?.cropNameHi || 'फसल').slice(0, 60),
            cropNameEn: String(row.cropNameEn || prev?.cropNameEn || 'Crop').slice(0, 60),
            marketName: String(row.marketName || prev?.marketName || 'স্থানীয় বাজার').slice(0, 80),
            district: String(row.district || prev?.district || 'Dhaka').slice(0, 50),
            pricePerKg,
            pricePerMaund: Math.round(pricePerKg * 40),
            previousPricePerKg,
            trend,
            currency: row.currency === 'INR' ? 'INR' : 'BDT',
            updatedAt: nowIso,
            reportedBy: 'Live Market Sync',
            sourceLabel: sources[0]?.title ?? 'DAM / Live Bazar Search',
            isLiveVerified: true,
          });
        }

        const refreshedCropIds = new Set(refreshedEntries.map((e) => e.cropId));
        const nextPayload: MarketStorePayload = {
          updates: [...refreshedEntries, ...store.updates.filter((u) => !refreshedCropIds.has(u.cropId))].slice(0, 120),
          lastAutoRefreshAt: nowIso,
          sources,
        };
        writeStore(nextPayload);
        sendJson(res, 200, nextPayload);
      } catch (err: unknown) {
        const lang = typeof body.language === 'string' ? body.language : 'bn';
        const msg = formatFriendlyGeminiError(err, lang);
        sendJson(res, isTransientCapacityError(err) ? 503 : 500, { error: msg });
      }
      return;
    }

    const numericPrice = Number(body.pricePerKg);
    if (typeof body.marketName !== 'string' || body.marketName.trim().length < 2 || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      sendJson(res, 400, { error: 'Valid market name and price per kg are required.' });
      return;
    }

    const trimmedMarket = body.marketName.trim().slice(0, 80);
    const safeCropId = String(body.cropId || 'custom').slice(0, 40);
    const prev = store.updates.find(
      (u) =>
        (typeof body.id === 'string' && body.id && u.id === body.id) ||
        (u.cropId === safeCropId && u.marketName.toLowerCase() === trimmedMarket.toLowerCase())
    );
    const roundedPrice = Math.round(numericPrice * 10) / 10;
    const priorPrice =
      prev?.pricePerKg ??
      (Number.isFinite(Number(body.previousPricePerKg)) && Number(body.previousPricePerKg) > 0
        ? Math.round(Number(body.previousPricePerKg) * 10) / 10
        : roundedPrice);
    const trend: 'up' | 'down' | 'stable' =
      body.trend === 'up' || body.trend === 'down' || body.trend === 'stable'
        ? body.trend
        : roundedPrice > priorPrice
        ? 'up'
        : roundedPrice < priorPrice
        ? 'down'
        : 'stable';
    const validCategories = new Set(['grain', 'vegetable', 'spice', 'fruit']);
    const category = validCategories.has(String(body.category))
      ? (String(body.category) as StoredMarketUpdate['category'])
      : prev?.category ?? 'vegetable';

    const entry: StoredMarketUpdate = {
      id: (typeof body.id === 'string' && body.id) || prev?.id || `mkt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      cropId: safeCropId,
      category,
      cropNameBn: String(body.cropNameBn || prev?.cropNameBn || body.cropNameEn || 'ফসল').slice(0, 60),
      cropNameHi: String(body.cropNameHi || prev?.cropNameHi || body.cropNameEn || 'फसल').slice(0, 60),
      cropNameEn: String(body.cropNameEn || prev?.cropNameEn || body.cropNameBn || 'Crop').slice(0, 60),
      marketName: trimmedMarket,
      district: String(body.district || prev?.district || 'Local').slice(0, 50),
      pricePerKg: roundedPrice,
      pricePerMaund: Math.round(roundedPrice * 40),
      previousPricePerKg: priorPrice,
      trend,
      currency: body.currency === 'INR' ? 'INR' : 'BDT',
      updatedAt: new Date().toISOString(),
      reportedBy: String(body.reportedBy || 'Farmer / Market Report').slice(0, 60),
      sourceLabel: 'Local Market Update',
      isLiveVerified: false,
    };
    const nextStore: MarketStorePayload = {
      ...store,
      updates: [entry, ...store.updates.filter((u) => u.id !== entry.id)].slice(0, 120),
    };
    writeStore(nextStore);
    sendJson(res, 201, { update: entry });
    return;
  }

  sendJson(res, 200, store);
}
