import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const MARKET_FILE = path.resolve(DATA_DIR, 'market-updates.json');
const FEEDBACK_FILE = path.resolve(DATA_DIR, 'farmer-feedback.json');
const VISITORS_FILE = path.resolve(DATA_DIR, 'visitors.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    if (!filePath.startsWith(DATA_DIR + path.sep)) {
      return fallback;
    }
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson(filePath: string, data: unknown): void {
  if (!filePath.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Invalid storage path');
  }
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

function getGeminiClient(apiVersion?: 'v1' | 'v1beta'): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientCapacityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('429')
  );
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
  if (
    raw.includes('403') ||
    raw.includes('PERMISSION_DENIED') ||
    raw.includes('API_KEY_INVALID') ||
    raw.includes('API key not valid')
  ) {
    return lang === 'bn'
      ? 'API Key সঠিক নয় বা অনুমতি নেই। অনুগ্রহ করে Settings > Secrets প্যানেল পরীক্ষা করুন।'
      : lang === 'hi'
      ? 'API कुंजी अमान्य है। कृपया Settings > Secrets पैनल जांचें।'
      : 'API key permission issue. Please check Settings > Secrets.';
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return trimmed;
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

interface MarketSourceLink {
  title: string;
  uri: string;
}

interface MarketStorePayload {
  updates: StoredMarketUpdate[];
  lastAutoRefreshAt: string | null;
  sources: MarketSourceLink[];
}

interface StoredFeedback {
  id: string;
  name: string;
  phone: string;
  village: string;
  crop: string;
  category: string;
  message: string;
  language: string;
  lat?: number;
  lon?: number;
  createdAt: string;
}

interface VisitorStore {
  totalVisits: number;
  uniqueVisitorIds: string[];
  archivedUniqueCount?: number;
  dailyVisits: Record<string, number>;
  dailyUniqueVisitors: Record<string, string[]>;
  recentEventIds?: string[];
  lastVisitAt: string;
}

const activeHttpSessions = new Map<string, number>();
const wsClients = new Map<WebSocket, { visitorId: string; isAlive: boolean }>();
const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeVisitorStore(raw: Partial<VisitorStore> | null | undefined): VisitorStore {
  const uniqueVisitorIds = Array.isArray(raw?.uniqueVisitorIds)
    ? Array.from(
        new Set(raw.uniqueVisitorIds.filter((id): id is string => typeof id === 'string' && id.length > 0))
      )
    : [];
  const archivedUniqueCount =
    typeof raw?.archivedUniqueCount === 'number' && Number.isFinite(raw.archivedUniqueCount)
      ? Math.max(0, raw.archivedUniqueCount)
      : 0;
  const uniqueCount = archivedUniqueCount + uniqueVisitorIds.length;
  const rawTotal = typeof raw?.totalVisits === 'number' && Number.isFinite(raw.totalVisits) ? raw.totalVisits : 0;
  const totalVisits = Math.max(rawTotal, uniqueCount);

  const dailyVisits: Record<string, number> =
    raw?.dailyVisits && typeof raw.dailyVisits === 'object' ? { ...raw.dailyVisits } : {};
  const dailyUniqueVisitors: Record<string, string[]> =
    raw?.dailyUniqueVisitors && typeof raw.dailyUniqueVisitors === 'object'
      ? { ...raw.dailyUniqueVisitors }
      : {};

  const todayKey = getTodayDateKey();
  if (!Array.isArray(dailyUniqueVisitors[todayKey])) {
    dailyUniqueVisitors[todayKey] = [];
  } else {
    dailyUniqueVisitors[todayKey] = Array.from(
      new Set(dailyUniqueVisitors[todayKey].filter((id): id is string => typeof id === 'string' && id.length > 0))
    );
  }
  const rawToday = typeof dailyVisits[todayKey] === 'number' && Number.isFinite(dailyVisits[todayKey]) ? dailyVisits[todayKey] : 0;
  dailyVisits[todayKey] = Math.max(rawToday, dailyUniqueVisitors[todayKey].length);

  const recentEventIds = Array.isArray(raw?.recentEventIds)
    ? Array.from(
        new Set(raw.recentEventIds.filter((id): id is string => typeof id === 'string' && id.length > 0))
      ).slice(-1000)
    : [];

  return {
    totalVisits,
    uniqueVisitorIds,
    archivedUniqueCount,
    dailyVisits,
    dailyUniqueVisitors,
    recentEventIds,
    lastVisitAt: typeof raw?.lastVisitAt === 'string' ? raw.lastVisitAt : new Date().toISOString(),
  };
}

function getActiveVisitorCount(): number {
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;
  const activeSet = new Set<string>();

  for (const [id, lastSeen] of activeHttpSessions.entries()) {
    if (lastSeen < cutoff) {
      activeHttpSessions.delete(id);
    } else {
      activeSet.add(id);
    }
  }

  for (const [ws, meta] of wsClients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      activeSet.add(meta.visitorId);
    }
  }

  return Math.max(1, activeSet.size);
}

function buildVisitorPayload(store: VisitorStore) {
  const todayKey = getTodayDateKey();
  const uniqueVisitors = (store.archivedUniqueCount ?? 0) + store.uniqueVisitorIds.length;
  const totalVisits = Math.max(store.totalVisits, uniqueVisitors);
  const todayUniqueVisitors = store.dailyUniqueVisitors[todayKey]?.length ?? 0;
  const todayVisits = Math.max(store.dailyVisits[todayKey] ?? 0, todayUniqueVisitors);
  const returningVisits = Math.max(0, totalVisits - uniqueVisitors);
  const avgViewsPerVisitor =
    uniqueVisitors > 0 ? Math.round((totalVisits / uniqueVisitors) * 10) / 10 : 0;

  return {
    totalVisits,
    todayVisits,
    uniqueVisitors,
    todayUniqueVisitors,
    returningVisits,
    avgViewsPerVisitor,
    activeNow: getActiveVisitorCount(),
    lastVisitAt: store.lastVisitAt,
  };
}

function broadcastVisitorStats(store?: VisitorStore): void {
  if (wsClients.size === 0) return;
  const resolvedStore = store ?? normalizeVisitorStore(safeReadJson<Partial<VisitorStore>>(VISITORS_FILE, {}));
  const payload = JSON.stringify({
    type: 'visitors:update',
    stats: buildVisitorPayload(resolvedStore),
  });
  for (const [ws] of wsClients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_LANGS = new Set(['bn', 'hi', 'en']);

function safeParseDiagnosisJson(rawText: string): Record<string, unknown> {
  const cleaned = stripJsonFences(rawText);
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      const parsed = JSON.parse(objMatch[0]);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    }
  }
  throw new Error('Could not parse structured diagnosis output.');
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
    .slice(0, 6);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use(express.text({ type: 'text/plain', limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Visitor & View Counter Endpoints (Real-Time Separated Total Views vs Unique Visitors)
  app.get('/api/visitors', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const raw = safeReadJson<Partial<VisitorStore>>(VISITORS_FILE, {});
    const store = normalizeVisitorStore(raw);
    res.json(buildVisitorPayload(store));
  });

  app.post('/api/visitors/hit', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    let parsedBody: Record<string, unknown> = {};
    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        if (parsed && typeof parsed === 'object') {
          parsedBody = parsed as Record<string, unknown>;
        }
      } catch {
        parsedBody = {};
      }
    } else if (req.body && typeof req.body === 'object') {
      parsedBody = req.body as Record<string, unknown>;
    }

    const { visitorId, countVisit = true, eventId } = parsedBody;
    const sanitized =
      typeof visitorId === 'string'
        ? visitorId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
        : '';
    const sanitizedEventId =
      typeof eventId === 'string'
        ? eventId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)
        : '';

    const raw = safeReadJson<Partial<VisitorStore>>(VISITORS_FILE, {});
    const store = normalizeVisitorStore(raw);

    if (countVisit === false && sanitized.length < 4) {
      res.json(buildVisitorPayload(store));
      return;
    }

    const safeId = sanitized.length >= 4 ? sanitized : `anon_${Date.now()}`;
    const todayKey = getTodayDateKey();
    const recentEvents = store.recentEventIds ?? [];
    const isDuplicateEvent = Boolean(sanitizedEventId && recentEvents.includes(sanitizedEventId));

    if (countVisit && !isDuplicateEvent) {
      store.totalVisits += 1;
      store.dailyVisits[todayKey] = (store.dailyVisits[todayKey] ?? 0) + 1;
      store.lastVisitAt = new Date().toISOString();

      if (sanitizedEventId) {
        recentEvents.push(sanitizedEventId);
        if (recentEvents.length > 1000) {
          recentEvents.splice(0, recentEvents.length - 1000);
        }
        store.recentEventIds = recentEvents;
      }

      // Keep only the most recent 60 days of daily counters
      const keys = Object.keys(store.dailyVisits).sort();
      if (keys.length > 60) {
        for (const oldKey of keys.slice(0, keys.length - 60)) {
          delete store.dailyVisits[oldKey];
          delete store.dailyUniqueVisitors[oldKey];
        }
      }
    }

    if (!store.uniqueVisitorIds.includes(safeId)) {
      store.uniqueVisitorIds.push(safeId);
      if (store.uniqueVisitorIds.length > 50000) {
        const overflow = store.uniqueVisitorIds.length - 50000;
        store.archivedUniqueCount = (store.archivedUniqueCount ?? 0) + overflow;
        store.uniqueVisitorIds = store.uniqueVisitorIds.slice(-50000);
      }
    }

    if (!store.dailyUniqueVisitors[todayKey].includes(safeId)) {
      store.dailyUniqueVisitors[todayKey].push(safeId);
    }

    safeWriteJson(VISITORS_FILE, store);
    activeHttpSessions.set(safeId, Date.now());

    const payload = buildVisitorPayload(store);
    broadcastVisitorStats(store);
    res.json(payload);
  });

  // Crop Disease Scanner Endpoint (Precision Pathology & Detailed Advisory)
  app.post('/api/diagnose', async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType,
        language = 'bn',
        cropHint = '',
        affectedPart = '',
        growthStage = '',
        symptomTags = [],
        weatherContext = null,
      } = req.body ?? {};

      if (typeof imageBase64 !== 'string' || imageBase64.length < 100 || imageBase64.length > 15_000_000) {
        res.status(400).json({ error: 'Valid base64 crop image is required.' });
        return;
      }
      if (typeof mimeType !== 'string' || !ALLOWED_IMAGE_MIME.has(mimeType.toLowerCase())) {
        res.status(400).json({ error: 'Unsupported image format. Use JPEG, PNG, or WebP.' });
        return;
      }
      const normalizedMime = mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType.toLowerCase();

      const safeLang = ALLOWED_LANGS.has(language) ? language : 'bn';
      const safeHint = typeof cropHint === 'string' ? cropHint.slice(0, 80).trim() : '';
      const safePart = typeof affectedPart === 'string' ? affectedPart.slice(0, 40).trim() : '';
      const safeStage = typeof growthStage === 'string' ? growthStage.slice(0, 40).trim() : '';
      const safeTags = Array.isArray(symptomTags)
        ? symptomTags
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, 8)
            .map((s) => s.trim().slice(0, 50))
        : [];

      const weatherSummary =
        weatherContext && typeof weatherContext === 'object'
          ? [
              typeof weatherContext.districtName === 'string' ? `Location: ${weatherContext.districtName}` : '',
              typeof weatherContext.temperature === 'number' ? `Temp: ${weatherContext.temperature}°C` : '',
              typeof weatherContext.humidity === 'number' ? `Humidity: ${weatherContext.humidity}%` : '',
              typeof weatherContext.precipitation === 'number'
                ? `Rain: ${weatherContext.precipitation}mm`
                : '',
            ]
              .filter(Boolean)
              .join(', ')
          : '';

      const languageLabel =
        safeLang === 'bn'
          ? 'Bengali (বাংলা) — use simple, clear farmer-friendly Bengali words with clear measurements (গ্রাম/মিলি প্রতি লিটার)'
          : safeLang === 'hi'
          ? 'Hindi (हिन्दी) — use simple, clear farmer-friendly Hindi words with clear measurements (ग्राम/मिली प्रति लीटर)'
          : 'English — use simple, clear farmer-friendly English with clear measurements (g/ml per liter)';

      const ai = getGeminiClient();

      const systemInstruction = `You are a senior South Asian agricultural plant pathologist (BARI/BRRI/ICAR field extension specialist) advising smallholder farmers.
Examine visual evidence carefully: lesion margins, concentric rings, water-soaked spots, chlorosis patterns (interveinal vs uniform yellowing), powdery spores, rust pustules, insect frass/chewing, or wilting.
Factor in crop context and local weather (high humidity favors fungal/bacterial blights; dry heat favors mites/thrips/moisture stress).
Respond strictly in valid JSON following the schema. All descriptive text must be in ${languageLabel}.
If the photo is blurry, too dark, or does not show a plant, set pathogenType to "unclear", severity to "low", confidence to 15-30, and clearly explain what clearer close-up photo is needed.`;

      const promptText = `Analyze this crop/plant image carefully and provide a complete, accurate diagnostic report and treatment plan.
Context provided by farmer:
${safeHint ? `- Crop name: ${safeHint}` : '- Crop name: Not specified (identify from photo if possible)'}
${safePart ? `- Affected part: ${safePart}` : ''}
${safeStage ? `- Plant growth stage: ${safeStage}` : ''}
${safeTags.length > 0 ? `- Farmer observed symptoms: ${safeTags.join(', ')}` : ''}
${weatherSummary ? `- Local weather conditions: ${weatherSummary}` : ''}

Requirements:
1. Identify pathogenType accurately ('fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency' | 'healthy' | 'unclear').
2. Give a calibrated confidence percentage (0-100) and diseaseStage + spreadRisk ('low' | 'moderate' | 'high').
3. Explain rootCause in plain language (including weather/soil trigger).
4. Give immediateAction for the next 24 hours so the farmer knows what to do right away.
5. List 3-5 visible symptoms, 3 practical organic/home remedies with water proportions, and 2-3 recommended chemical active ingredients (generic chemical names common in South Asia).
6. In dosageAndSprayGuide, specify exact mixing amount per 1 liter of water and per 16-liter knapsack tank/bigha, best time of day to spray, and safety gear note.
7. In harvestWaitDays, mention safe pre-harvest interval (PHI) after spraying.
8. In differentialDiagnosis, briefly tell the farmer how to distinguish this issue from one similar-looking problem.
9. Make audioSummary 3 clear spoken sentences covering the diagnosis, immediate action, and key treatment dosage.`;

      const diagnosisSchema = {
        type: Type.OBJECT,
        properties: {
          cropName: { type: Type.STRING, description: 'Identified crop or plant name in the target language' },
          diseaseName: { type: Type.STRING, description: 'Detected disease, pest, nutrient deficiency, or Healthy status' },
          scientificName: { type: Type.STRING, description: 'Scientific name of pathogen/pest or Nutrient/Healthy status' },
          pathogenType: {
            type: Type.STRING,
            description: 'Exact enum value: fungal, bacterial, viral, pest, deficiency, healthy, or unclear',
          },
          severity: { type: Type.STRING, description: 'Exact enum value: healthy, low, moderate, or high' },
          diseaseStage: { type: Type.STRING, description: 'Current stage of infection or crop stress in target language' },
          spreadRisk: { type: Type.STRING, description: 'Exact enum value: low, moderate, or high' },
          confidence: { type: Type.INTEGER, description: 'Confidence percentage between 0 and 100' },
          rootCause: { type: Type.STRING, description: 'Plain-language root cause and weather/moisture factor' },
          immediateAction: { type: Type.STRING, description: 'Urgent step the farmer should take within the next 24 hours' },
          symptoms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 to 5 specific visual symptoms observed on the plant',
          },
          organicTreatment: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 practical organic, biological, or cultural treatment steps with quantities',
          },
          chemicalTreatment: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 targeted active ingredient recommendations safe for smallholder farmers',
          },
          dosageAndSprayGuide: {
            type: Type.STRING,
            description: 'Exact dosage per liter/16L tank, spray timing (morning/late afternoon), and spray safety note',
          },
          harvestWaitDays: {
            type: Type.STRING,
            description: 'Pre-harvest safety waiting days after spraying',
          },
          differentialDiagnosis: {
            type: Type.STRING,
            description: 'How to tell this apart from 1 similar-looking disease or deficiency',
          },
          prevention: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 to 4 preventive field practices for current and next season',
          },
          audioSummary: {
            type: Type.STRING,
            description: '3 concise, natural spoken sentences summarizing diagnosis, urgent action, and treatment',
          },
        },
        required: [
          'cropName',
          'diseaseName',
          'scientificName',
          'pathogenType',
          'severity',
          'diseaseStage',
          'spreadRisk',
          'confidence',
          'rootCause',
          'immediateAction',
          'symptoms',
          'organicTreatment',
          'chemicalTreatment',
          'dosageAndSprayGuide',
          'harvestWaitDays',
          'differentialDiagnosis',
          'prevention',
          'audioSummary',
        ],
      };

      const callModel = (model: string, thinkingLevel: ThinkingLevel, timeoutMs: number) =>
        Promise.race([
          ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: normalizedMime,
                      data: imageBase64,
                    },
                  },
                  { text: promptText },
                ],
              },
            ],
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel },
              responseMimeType: 'application/json',
              responseSchema: diagnosisSchema,
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('503_TIMEOUT: Model response timed out.')), timeoutMs)
          ),
        ]);

      const attempts: { model: string; level: ThinkingLevel; timeoutMs: number; delayAfterMs: number }[] = [
        { model: 'gemini-4-hydrogen', level: ThinkingLevel.LOW, timeoutMs: 25000, delayAfterMs: 800 },
        { model: 'gemini-3.1-flash-lite', level: ThinkingLevel.MINIMAL, timeoutMs: 18000, delayAfterMs: 1000 },
        { model: 'gemini-3.1-flash-lite', level: ThinkingLevel.LOW, timeoutMs: 18000, delayAfterMs: 0 },
      ];

      let response;
      let lastErr: unknown;

      for (let idx = 0; idx < attempts.length; idx += 1) {
        const attempt = attempts[idx];
        try {
          response = await callModel(attempt.model, attempt.level, attempt.timeoutMs);
          break;
        } catch (err) {
          lastErr = err;
          const retryable =
            isTransientCapacityError(err) ||
            (err instanceof Error && err.message.includes('503_TIMEOUT'));
          if (!retryable || idx === attempts.length - 1) {
            throw err;
          }
          await sleep(attempt.delayAfterMs);
        }
      }

      if (!response) {
        throw lastErr ?? new Error('Failed to obtain diagnosis response.');
      }

      const parsed = safeParseDiagnosisJson(response.text ?? '{}');
      const validSeverities = new Set(['healthy', 'low', 'moderate', 'high']);
      const validPathogens = new Set(['fungal', 'bacterial', 'viral', 'pest', 'deficiency', 'healthy', 'unclear']);
      const validSpread = new Set(['low', 'moderate', 'high']);

      const pathogenRaw = String(parsed.pathogenType || '').toLowerCase();
      const severityRaw = String(parsed.severity || '').toLowerCase();
      const spreadRaw = String(parsed.spreadRisk || '').toLowerCase();

      res.json({
        cropName: String(parsed.cropName || safeHint || 'Crop'),
        diseaseName: String(parsed.diseaseName || 'Plant Inspection Result'),
        scientificName: String(parsed.scientificName || ''),
        pathogenType: validPathogens.has(pathogenRaw) ? pathogenRaw : 'fungal',
        severity: validSeverities.has(severityRaw) ? severityRaw : 'moderate',
        diseaseStage: String(parsed.diseaseStage || ''),
        spreadRisk: validSpread.has(spreadRaw) ? spreadRaw : 'moderate',
        confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 78)),
        affectedPart: safePart || undefined,
        growthStage: safeStage || undefined,
        rootCause: String(parsed.rootCause || ''),
        immediateAction: String(parsed.immediateAction || ''),
        symptoms: normalizeStringArray(parsed.symptoms),
        organicTreatment: normalizeStringArray(parsed.organicTreatment),
        chemicalTreatment: normalizeStringArray(parsed.chemicalTreatment),
        dosageAndSprayGuide: String(parsed.dosageAndSprayGuide || ''),
        harvestWaitDays: String(parsed.harvestWaitDays || ''),
        differentialDiagnosis: String(parsed.differentialDiagnosis || ''),
        prevention: normalizeStringArray(parsed.prevention),
        audioSummary: String(parsed.audioSummary || `${parsed.cropName || ''} ${parsed.diseaseName || ''}`).trim(),
      });
    } catch (err: unknown) {
      const safeLang = ALLOWED_LANGS.has(req.body?.language) ? req.body.language : 'bn';
      const message = formatFriendlyGeminiError(err, safeLang);
      console.error('Diagnose error:', err instanceof Error ? err.message : message);
      const rawMsg = err instanceof Error ? err.message : '';
      const statusCode =
        rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')
          ? 429
          : isTransientCapacityError(err)
          ? 503
          : 500;
      res.status(statusCode).json({ error: message });
    }
  });

  // Text-to-Speech Endpoint
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, language = 'bn' } = req.body ?? {};
      if (typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({ error: 'Text is required for speech generation.' });
        return;
      }

      const trimmedText = text.trim().slice(0, 1800);
      const safeLang = ALLOWED_LANGS.has(language) ? language : 'bn';
      const styleHint =
        safeLang === 'bn'
          ? 'Warm, clear, reassuring Bengali agricultural advisor speaking calmly to a farmer'
          : safeLang === 'hi'
          ? 'Warm, clear, reassuring Hindi agricultural advisor speaking calmly to a farmer'
          : 'Warm, clear, reassuring agricultural advisor speaking calmly to a farmer';

      const ai = getGeminiClient('v1beta');
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: trimmedText,
                speechMetadata: {
                  style: styleHint,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        res.status(502).json({ error: 'Speech model returned no audio data.' });
        return;
      }

      res.json({
        audioBase64: base64Audio,
        mimeType: response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'TTS generation failed.';
      console.error('TTS error:', message);
      res.status(500).json({ error: message });
    }
  });

  const MARKET_REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000;
  const MARKET_SCHEDULER_POLL_MS = 30 * 60 * 1000;
  const MARKET_QUOTA_BACKOFF_MS = 60 * 60 * 1000;
  let marketRefreshInFlight: Promise<MarketStorePayload> | null = null;
  let marketRefreshBackoffUntil = 0;

  function readMarketStore(): MarketStorePayload {
    const raw = safeReadJson<StoredMarketUpdate[] | Partial<MarketStorePayload>>(MARKET_FILE, {
      updates: [],
      lastAutoRefreshAt: null,
      sources: [],
    });
    if (Array.isArray(raw)) {
      return { updates: raw, lastAutoRefreshAt: null, sources: [] };
    }
    return {
      updates: Array.isArray(raw.updates) ? raw.updates : [],
      lastAutoRefreshAt: typeof raw.lastAutoRefreshAt === 'string' ? raw.lastAutoRefreshAt : null,
      sources: Array.isArray(raw.sources) ? raw.sources : [],
    };
  }

  function writeMarketStore(payload: MarketStorePayload): void {
    safeWriteJson(MARKET_FILE, payload);
  }

  async function refreshLiveMarketPrices(districtHint = 'Dhaka'): Promise<MarketStorePayload> {
    if (marketRefreshInFlight) {
      return marketRefreshInFlight;
    }

    marketRefreshInFlight = (async () => {
      const ai = getGeminiClient();
      const todayIso = new Date().toISOString().slice(0, 10);
      const prompt = `Search for the latest verified wholesale and retail agricultural crop market prices in Bangladesh (DAM Bangladesh dam.gov.bd / TCB / Dhaka Karwan Bazar / Bogura / Rajshahi / Jashore) and West Bengal Nadia as of ${todayIso}.
STRICT UNIT RULE: Always convert to 1 kilogram (per-kg) rate ONLY (never return 40-kg maund or 100-kg quintal prices as pricePerKg).
Return ONLY a valid JSON array (no markdown outside JSON) with realistic current per-kg prices for these exact cropId entries:
1. "rice-br28" (Miniket / BR-28 Rice, category: "grain", currency: "BDT", market: "বগুড়া রাজাবাজার", district: "Bogura")
2. "potato-diamond" (Diamond Potato, category: "vegetable", currency: "BDT", market: "জয়পুরহাট হাট", district: "Bogura")
3. "tomato-local" (Ripe Local Tomato, category: "vegetable", currency: "BDT", market: "কুমিল্লা নিমসার বাজার", district: "Cumilla")
4. "onion-desi" (Desi Red Onion, category: "spice", currency: "BDT", market: "ফরিদপুর কানাইপুর হাট", district: "Faridpur")
5. "mustard-seed" (Mustard Seed, category: "grain", currency: "BDT", market: "রাজশাহী বানেশ্বর হাট", district: "Rajshahi")
6. "chili-green" (Green Chili, category: "spice", currency: "BDT", market: "যশোর খাজুরা বাজার", district: "Jashore")
7. "garlic-desi" (Desi Garlic, category: "spice", currency: "BDT", market: "নাটোর গুরুদাসপুর হাট", district: "Rajshahi")
8. "lentil-masoor" (Red Lentil / Masoor Dal, category: "grain", currency: "BDT", market: "ঢাকা কারওয়ান বাজার", district: "Dhaka")
9. "mango-himsagar" (Seasonal Mango / Local Fruit, category: "fruit", currency: "BDT", market: "চাঁপাইনবাবগঞ্জ কানসাট", district: "Rajshahi")
10. "wheat-nadia" (Milling Wheat, category: "grain", currency: "INR", market: "কৃষ্ণনগর কৃষি মণ্ডী", district: "Nadia")

District context requested: ${districtHint}.
Each object in the JSON array MUST have:
{
  "cropId": string,
  "category": "grain" | "vegetable" | "spice" | "fruit",
  "cropNameBn": string,
  "cropNameHi": string,
  "cropNameEn": string,
  "marketName": string,
  "district": string,
  "pricePerKg": number,
  "currency": "BDT" | "INR"
}`;

      const marketModels = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
      let response;
      let lastMarketErr: unknown;
      for (let i = 0; i < marketModels.length; i += 1) {
        try {
          response = await Promise.race([
            ai.models.generateContent({
              model: marketModels[i],
              contents: prompt,
              config: {
                tools: [{ googleSearch: {} }],
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('503_TIMEOUT: Live market lookup timed out.')), 24000)
            ),
          ]);
          break;
        } catch (err) {
          lastMarketErr = err;
          if (!isTransientCapacityError(err) || i === marketModels.length - 1) {
            throw err;
          }
          await sleep(400);
        }
      }
      if (!response) {
        throw lastMarketErr ?? new Error('Live market lookup failed.');
      }

      const rawText = stripJsonFences(response.text ?? '[]');
      const arrayMatch = rawText.match(/\[[\s\S]*\]/);
      const jsonText = arrayMatch ? arrayMatch[0] : rawText;
      const parsedList = JSON.parse(jsonText);
      if (!Array.isArray(parsedList) || parsedList.length === 0) {
        throw new Error('Could not parse live market prices from search output.');
      }

      const groundingChunks =
        (response.candidates?.[0]?.groundingMetadata?.groundingChunks as
          | Array<{ web?: { uri?: string; title?: string } }>
          | undefined) ?? [];

      const sources: MarketSourceLink[] = [];
      const seenUris = new Set<string>();
      for (const chunk of groundingChunks) {
        const uri = chunk?.web?.uri;
        const title = chunk?.web?.title;
        if (typeof uri === 'string' && uri.startsWith('http') && !seenUris.has(uri)) {
          seenUris.add(uri);
          sources.push({ title: typeof title === 'string' && title ? title : uri, uri });
        }
        if (sources.length >= 4) break;
      }

      const currentStore = readMarketStore();
      const existingByCropId = new Map(currentStore.updates.map((u) => [u.cropId, u]));
      const nowIso = new Date().toISOString();
      const validCategories = new Set(['grain', 'vegetable', 'spice', 'fruit']);

      const refreshedEntries: StoredMarketUpdate[] = [];
      for (const row of parsedList) {
        if (!row || typeof row !== 'object') continue;
        const cropId = String(row.cropId || '').trim().slice(0, 40);
        const pricePerKg = Math.round(Number(row.pricePerKg) * 10) / 10;
        if (!cropId || !Number.isFinite(pricePerKg) || pricePerKg < 5 || pricePerKg > 2500) continue;

        const prev = existingByCropId.get(cropId);
        const previousPricePerKg = prev ? prev.pricePerKg : pricePerKg;
        const diffRatio = previousPricePerKg > 0 ? (pricePerKg - previousPricePerKg) / previousPricePerKg : 0;
        const trend: 'up' | 'down' | 'stable' =
          diffRatio >= 0.015 ? 'up' : diffRatio <= -0.015 ? 'down' : 'stable';

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

      if (refreshedEntries.length === 0) {
        throw new Error('No valid price entries returned from live lookup.');
      }

      const refreshedCropIds = new Set(refreshedEntries.map((e) => e.cropId));
      const preservedCustom = currentStore.updates.filter((u) => !refreshedCropIds.has(u.cropId));
      const mergedPayload: MarketStorePayload = {
        updates: [...refreshedEntries, ...preservedCustom].slice(0, 120),
        lastAutoRefreshAt: nowIso,
        sources,
      };
      writeMarketStore(mergedPayload);
      return mergedPayload;
    })();

    try {
      return await marketRefreshInFlight;
    } finally {
      marketRefreshInFlight = null;
    }
  }

  function maybeScheduleBackgroundMarketRefresh() {
    if (!process.env.GEMINI_API_KEY) return;
    if (Date.now() < marketRefreshBackoffUntil) return;
    const store = readMarketStore();
    const lastMs = store.lastAutoRefreshAt ? new Date(store.lastAutoRefreshAt).getTime() : 0;
    if (!lastMs || Date.now() - lastMs > MARKET_REFRESH_INTERVAL_MS) {
      refreshLiveMarketPrices('Dhaka').catch(() => {
        // Back off silently on quota / transient upstream limits so cached prices continue serving cleanly
        marketRefreshBackoffUntil = Date.now() + MARKET_QUOTA_BACKOFF_MS;
      });
    }
  }

  setInterval(() => {
    maybeScheduleBackgroundMarketRefresh();
  }, MARKET_SCHEDULER_POLL_MS);

  setTimeout(() => {
    maybeScheduleBackgroundMarketRefresh();
  }, 8000);

  app.get('/api/market-prices', (_req, res) => {
    const store = readMarketStore();
    maybeScheduleBackgroundMarketRefresh();
    const lastMs = store.lastAutoRefreshAt ? new Date(store.lastAutoRefreshAt).getTime() : 0;
    const nextScheduledRefreshAt = lastMs
      ? new Date(lastMs + MARKET_REFRESH_INTERVAL_MS).toISOString()
      : null;
    res.json({
      ...store,
      nextScheduledRefreshAt,
      refreshIntervalHours: 4,
      refreshBackoffActive: Date.now() < marketRefreshBackoffUntil,
    });
  });

  app.post('/api/market-prices', async (req, res) => {
    const body = req.body ?? {};
    if (body.action === 'refresh') {
      try {
        const district = typeof body.district === 'string' ? body.district.slice(0, 60) : 'Dhaka';
        const payload = await refreshLiveMarketPrices(district);
        marketRefreshBackoffUntil = 0;
        res.json(payload);
      } catch (err: unknown) {
        if (isTransientCapacityError(err)) {
          marketRefreshBackoffUntil = Date.now() + 30 * 60 * 1000;
        }
        const safeLang = ALLOWED_LANGS.has(body.language) ? body.language : 'bn';
        const message = formatFriendlyGeminiError(err, safeLang);
        res.status(isTransientCapacityError(err) ? 503 : 500).json({ error: message });
      }
      return;
    }

    const {
      id: existingId,
      cropId,
      category,
      cropNameBn,
      cropNameHi,
      cropNameEn,
      marketName,
      district,
      pricePerKg,
      previousPricePerKg: clientPrevPrice,
      trend,
      currency,
      reportedBy,
    } = body;

    if (typeof marketName !== 'string' || marketName.trim().length < 2) {
      res.status(400).json({ error: 'Market name is required.' });
      return;
    }
    const numericPrice = Number(pricePerKg);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0 || numericPrice > 50000) {
      res.status(400).json({ error: 'Valid price per kg is required.' });
      return;
    }

    const store = readMarketStore();
    const trimmedMarket = marketName.trim().slice(0, 80);
    const safeCropId = String(cropId || 'custom').slice(0, 40);
    const existingIdx = store.updates.findIndex(
      (u) =>
        (typeof existingId === 'string' && existingId && u.id === existingId) ||
        (u.cropId === safeCropId && u.marketName.toLowerCase() === trimmedMarket.toLowerCase())
    );
    const prevEntry = existingIdx >= 0 ? store.updates[existingIdx] : undefined;
    const roundedPrice = Math.round(numericPrice * 10) / 10;
    const priorPrice =
      prevEntry?.pricePerKg ??
      (Number.isFinite(Number(clientPrevPrice)) && Number(clientPrevPrice) > 0
        ? Math.round(Number(clientPrevPrice) * 10) / 10
        : roundedPrice);

    const computedTrend: 'up' | 'down' | 'stable' =
      trend === 'up' || trend === 'down' || trend === 'stable'
        ? trend
        : roundedPrice > priorPrice
        ? 'up'
        : roundedPrice < priorPrice
        ? 'down'
        : 'stable';

    const validCategories = new Set(['grain', 'vegetable', 'spice', 'fruit']);
    const safeCategory = validCategories.has(category)
      ? (category as StoredMarketUpdate['category'])
      : prevEntry?.category ?? 'vegetable';
    const safeCurrency = currency === 'INR' ? 'INR' : 'BDT';

    const entry: StoredMarketUpdate = {
      id:
        (typeof existingId === 'string' && existingId) ||
        prevEntry?.id ||
        `mkt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      cropId: safeCropId,
      category: safeCategory,
      cropNameBn: String(cropNameBn || prevEntry?.cropNameBn || cropNameEn || 'ফসল').slice(0, 60),
      cropNameHi: String(cropNameHi || prevEntry?.cropNameHi || cropNameEn || 'फसल').slice(0, 60),
      cropNameEn: String(cropNameEn || prevEntry?.cropNameEn || cropNameBn || 'Crop').slice(0, 60),
      marketName: trimmedMarket,
      district: String(district || prevEntry?.district || 'Local').slice(0, 50),
      pricePerKg: roundedPrice,
      pricePerMaund: Math.round(roundedPrice * 40),
      previousPricePerKg: priorPrice,
      trend: computedTrend,
      currency: safeCurrency,
      updatedAt: new Date().toISOString(),
      reportedBy: String(reportedBy || 'Farmer / Market Report').slice(0, 60),
      sourceLabel: 'Local Market Update',
      isLiveVerified: false,
    };

    const filtered = store.updates.filter((u) => u.id !== entry.id);
    const nextStore: MarketStorePayload = {
      ...store,
      updates: [entry, ...filtered].slice(0, 120),
    };
    writeMarketStore(nextStore);
    res.status(201).json({ update: entry });
  });

  app.get('/api/feedback', (_req, res) => {
    const items = safeReadJson<StoredFeedback[]>(FEEDBACK_FILE, []);
    res.json({ items });
  });

  app.post('/api/feedback', (req, res) => {
    const { name, phone, village, crop, category, message, language, lat, lon } = req.body ?? {};
    if (typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Farmer name is required.' });
      return;
    }
    if (typeof message !== 'string' || message.trim().length < 4) {
      res.status(400).json({ error: 'Feedback message is required.' });
      return;
    }

    const entry: StoredFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim().slice(0, 80),
      phone: typeof phone === 'string' ? phone.trim().slice(0, 30) : '',
      village: typeof village === 'string' ? village.trim().slice(0, 80) : '',
      crop: typeof crop === 'string' ? crop.trim().slice(0, 60) : '',
      category: typeof category === 'string' ? category.trim().slice(0, 40) : 'general',
      message: message.trim().slice(0, 1500),
      language: ALLOWED_LANGS.has(language) ? language : 'bn',
      lat: typeof lat === 'number' && Number.isFinite(lat) ? lat : undefined,
      lon: typeof lon === 'number' && Number.isFinite(lon) ? lon : undefined,
      createdAt: new Date().toISOString(),
    };

    const existing = safeReadJson<StoredFeedback[]>(FEEDBACK_FILE, []);
    const next = [entry, ...existing].slice(0, 200);
    safeWriteJson(FEEDBACK_FILE, next);
    res.status(201).json({ item: entry });
  });

  if (process.env.NODE_ENV !== 'production') {
    app.get('/@vite/client', (_req, res) => {
      res.type('application/javascript').send(`
const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    style.remove();
    sheetsMap.delete(id);
  }
}
export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    invalidate() {},
    decline() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url) {
  return url;
}
export class ErrorOverlay extends HTMLElement {}
`);
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use((_req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });
    app.use(
      express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => {
          const base = path.basename(filePath);
          if (base === 'sw.js' || base === 'index.html' || base.endsWith('.webmanifest')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=86400');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || path.extname(req.path)) {
        res.status(404).end();
        return;
      }
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    try {
      const reqUrl = new URL(request.url || '/', 'http://localhost');
      if (reqUrl.pathname === '/ws/visitors') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
        return;
      }
    } catch {
      // Ignore malformed upgrade URL
    }
    socket.destroy();
  });

  wss.on('connection', (ws, request) => {
    const reqUrl = new URL(request.url || '/', 'http://localhost');
    const rawId = reqUrl.searchParams.get('visitorId') || '';
    const visitorId =
      rawId.trim().length >= 4 ? rawId.trim().slice(0, 64) : `ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    wsClients.set(ws, { visitorId, isAlive: true });
    activeHttpSessions.set(visitorId, Date.now());

    const currentStore = normalizeVisitorStore(safeReadJson<Partial<VisitorStore>>(VISITORS_FILE, {}));
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'visitors:update', stats: buildVisitorPayload(currentStore) }));
    }
    broadcastVisitorStats(currentStore);

    ws.on('pong', () => {
      const meta = wsClients.get(ws);
      if (meta) {
        meta.isAlive = true;
        activeHttpSessions.set(meta.visitorId, Date.now());
      }
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(String(data));
        if (msg?.type === 'ping') {
          activeHttpSessions.set(visitorId, Date.now());
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        }
      } catch {
        // Ignore malformed client message
      }
    });

    ws.on('close', () => {
      const meta = wsClients.get(ws);
      wsClients.delete(ws);
      if (meta) {
        const hasAnotherSocket = Array.from(wsClients.values()).some(
          (entry) => entry.visitorId === meta.visitorId
        );
        if (!hasAnotherSocket) {
          activeHttpSessions.delete(meta.visitorId);
        }
      }
      broadcastVisitorStats();
    });
  });

  const wsHeartbeat = setInterval(() => {
    let removed = false;
    for (const [ws, meta] of wsClients.entries()) {
      if (!meta.isAlive) {
        wsClients.delete(ws);
        ws.terminate();
        removed = true;
        continue;
      }
      meta.isAlive = false;
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }
    if (removed) {
      broadcastVisitorStats();
    }
  }, 25000);

  httpServer.on('close', () => {
    clearInterval(wsHeartbeat);
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Krishi Mitra server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
