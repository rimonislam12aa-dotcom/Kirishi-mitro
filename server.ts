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
const FEEDBACK_FILE = path.resolve(DATA_DIR, 'farmer-feedback.json');
const VISITORS_FILE = path.resolve(DATA_DIR, 'visitors.json');
const PEST_REPORTS_FILE = path.resolve(DATA_DIR, 'pest-reports.json');

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

interface StoredPestObservation {
  id: string;
  districtName: string;
  cropName: string;
  pestName: string;
  severity: 'early' | 'moderate' | 'severe';
  note?: string;
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

  // Multi-Stage Crop Yield Prediction Endpoint (Growth-Stage Photo + Field Analysis)
  app.post('/api/yield-predict', async (req, res) => {
    const ALLOWED_STAGES = new Set(['seedling', 'vegetative', 'flowering', 'grain_fill']);
    const ALLOWED_UNITS = new Set(['bigha', 'decimal', 'acre', 'hectare']);
    const STAGE_TITLES: Record<string, Record<string, string>> = {
      seedling: { bn: '১. চারা / অঙ্কুরোদগম ধাপ', hi: '1. पौध / अंकुरण चरण', en: '1. Seedling Stage' },
      vegetative: { bn: '২. বাড়ন্ত / কুঁশি ধাপ', hi: '2. बढ़वार / कल्ले चरण', en: '2. Vegetative Growth' },
      flowering: { bn: '৩. ফুল ও শীষ বের হওয়া', hi: '3. फूल व बाली निकलना', en: '3. Flowering / Heading' },
      grain_fill: { bn: '৪. দানা পুষ্ট ও পরিপক্বতা', hi: '4. दाना भराव व पकना', en: '4. Grain / Fruit Fill' },
    };

    const safeLang = ALLOWED_LANGS.has(req.body?.language) ? req.body.language : 'bn';

    try {
      const {
        stages,
        cropName = '',
        variety = '',
        landArea = 1,
        landUnit = 'bigha',
        soilType = 'loam',
        irrigationLevel = 'adequate',
        fertilizerRegime = 'balanced',
        sowingDate = '',
        weatherContext = null,
      } = req.body ?? {};

      if (!Array.isArray(stages) || stages.length === 0 || stages.length > 4) {
        res.status(400).json({ error: 'Provide between 1 and 4 growth-stage photos for yield analysis.' });
        return;
      }

      const validStages: { stageKey: string; imageBase64: string; mimeType: string; note: string }[] = [];
      let totalBase64Bytes = 0;

      for (const rawStage of stages) {
        if (!rawStage || typeof rawStage !== 'object') {
          res.status(400).json({ error: 'Invalid growth stage entry.' });
          return;
        }
        const s = rawStage as Record<string, unknown>;
        const stageKey = typeof s.stageKey === 'string' && ALLOWED_STAGES.has(s.stageKey) ? s.stageKey : '';
        const imageBase64 = typeof s.imageBase64 === 'string' ? s.imageBase64.trim() : '';
        const rawMime = typeof s.mimeType === 'string' ? s.mimeType.toLowerCase() : '';

        if (!stageKey) {
          res.status(400).json({ error: 'Invalid growth stage identifier.' });
          return;
        }
        if (imageBase64.length < 100 || imageBase64.length > 4_000_000) {
          res.status(400).json({ error: `Invalid image payload size for stage ${stageKey}.` });
          return;
        }
        if (!ALLOWED_IMAGE_MIME.has(rawMime)) {
          res.status(400).json({ error: 'Unsupported image format. Use JPEG, PNG, or WebP.' });
          return;
        }
        totalBase64Bytes += imageBase64.length;
        if (totalBase64Bytes > 5_800_000) {
          res.status(400).json({ error: 'Combined image size exceeds upload limit. Please use smaller photos.' });
          return;
        }
        validStages.push({
          stageKey,
          imageBase64,
          mimeType: rawMime === 'image/jpg' ? 'image/jpeg' : rawMime,
          note: typeof s.note === 'string' ? s.note.trim().slice(0, 140) : '',
        });
      }

      const safeCrop = typeof cropName === 'string' ? cropName.trim().slice(0, 80) : '';
      const safeVariety = typeof variety === 'string' ? variety.trim().slice(0, 80) : '';
      const parsedArea = Number(landArea);
      const safeArea = Number.isFinite(parsedArea) && parsedArea > 0 && parsedArea <= 10000 ? parsedArea : 1;
      const safeUnit = typeof landUnit === 'string' && ALLOWED_UNITS.has(landUnit) ? landUnit : 'bigha';
      const bighaEquivalent = Math.max(
        0.03,
        safeUnit === 'decimal'
          ? safeArea / 33
          : safeUnit === 'acre'
          ? safeArea * 3.03
          : safeUnit === 'hectare'
          ? safeArea * 7.47
          : safeArea
      );

      const safeSoil = typeof soilType === 'string' ? soilType.trim().slice(0, 50) : 'loam';
      const safeIrrigation = typeof irrigationLevel === 'string' ? irrigationLevel.trim().slice(0, 50) : 'adequate';
      const safeFertilizer = typeof fertilizerRegime === 'string' ? fertilizerRegime.trim().slice(0, 50) : 'balanced';
      const safeSowingDate = typeof sowingDate === 'string' ? sowingDate.trim().slice(0, 30) : '';

      const weatherSummary =
        weatherContext && typeof weatherContext === 'object'
          ? [
              typeof weatherContext.districtName === 'string' ? `District: ${weatherContext.districtName}` : '',
              typeof weatherContext.temperature === 'number' ? `Temp: ${weatherContext.temperature}°C` : '',
              typeof weatherContext.humidity === 'number' ? `Humidity: ${weatherContext.humidity}%` : '',
              typeof weatherContext.precipitation === 'number' ? `Rain: ${weatherContext.precipitation}mm` : '',
            ]
              .filter(Boolean)
              .join(', ')
          : '';

      const languageLabel =
        safeLang === 'bn'
          ? 'Bengali (বাংলা) — use clear, practical Bangladeshi/West Bengal farmer terms (মণ, বিঘা, কেজি)'
          : safeLang === 'hi'
          ? 'Hindi (हिन्दी) — use clear Indian farmer terms (मन, बीघा, किलोग्राम)'
          : 'English — clear agronomic terms with Kg per Bigha (33 decimals) and total Kg';

      const ai = getGeminiClient();

      const systemInstruction = `You are a Principal Agronomist and Quantitative Crop Yield Forecaster (BRRI/BARI/ICAR precision phenotyping specialist).
Analyze the sequential crop growth-stage photographs provided by the farmer alongside plot and weather data.
Evaluate plant stand density, leaf chlorophyll vigor, tiller/branch architecture, panicle/pod/fruit initiation, canopy gap stress, and biotic/abiotic defects at each stage.
Calculate realistic yield projections per 1 Bigha (33 decimals / ~0.1338 hectare) AND total plot yield for ${bighaEquivalent.toFixed(2)} bighas (${safeArea} ${safeUnit}).
All text fields must be written in ${languageLabel}. Respond strictly in valid JSON matching the schema.`;

      const stageManifest = validStages
        .map(
          (st, idx) =>
            `Image ${idx + 1} corresponds to stageKey="${st.stageKey}" (${STAGE_TITLES[st.stageKey]?.en ?? st.stageKey})${
              st.note ? `. Farmer note: ${st.note}` : ''
            }`
        )
        .join('\n');

      const promptText = `Perform a multi-stage crop phenotyping & harvest yield forecast from these ${validStages.length} stage image(s):
${stageManifest}

Farm & Environment Context:
- Crop: ${safeCrop || 'Identify crop visually from the photos'}
${safeVariety ? `- Variety: ${safeVariety}` : ''}
- Plot size: ${safeArea} ${safeUnit} (equivalent to ${bighaEquivalent.toFixed(2)} Bighas)
- Soil type: ${safeSoil}
- Irrigation regime: ${safeIrrigation}
- Fertilizer practice: ${safeFertilizer}
${safeSowingDate ? `- Sowing / Planting date: ${safeSowingDate}` : ''}
${weatherSummary ? `- Local weather telemetry: ${weatherSummary}` : ''}

Output rules:
1. Return an entry in stagesAnalyzed for EACH uploaded stageKey in the exact order uploaded.
2. Give realistic projectedYieldPerBighaKg adjusted cleanly for the crop health visible in the photos.
3. Compute projectedTotalYieldKg = Math.round(projectedYieldPerBighaKg * ${bighaEquivalent.toFixed(2)}), plus realistic projectedYieldMinKg and projectedYieldMaxKg bounds.
4. ConfidencePercent should reflect how many stages were supplied (1 stage ~55-70%, 2-3 stages ~72-85%, 4 stages ~86-94% if clear).
5. Provide 3-4 yieldDrivers, 2-3 yieldBottlenecks, and 3-4 high-ROI boosterActionPlan steps before harvest.
6. Provide a clear 3-sentence audioSummary speaking directly to the farmer about expected total harvest, confidence, and top yield-boosting step.`;

      const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];
      for (const st of validStages) {
        parts.push({ inlineData: { mimeType: st.mimeType, data: st.imageBase64 } });
      }
      parts.push({ text: promptText });

      const yieldSchema = {
        type: Type.OBJECT,
        properties: {
          cropName: { type: Type.STRING },
          stagesAnalyzed: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stageKey: { type: Type.STRING },
                stageLabel: { type: Type.STRING },
                healthScore: { type: Type.INTEGER },
                vigorStatus: { type: Type.STRING },
                visualObservations: { type: Type.STRING },
                stageRecommendation: { type: Type.STRING },
              },
              required: [
                'stageKey',
                'stageLabel',
                'healthScore',
                'vigorStatus',
                'visualObservations',
                'stageRecommendation',
              ],
            },
          },
          projectedYieldPerBighaKg: { type: Type.NUMBER },
          projectedTotalYieldKg: { type: Type.NUMBER },
          projectedYieldMinKg: { type: Type.NUMBER },
          projectedYieldMaxKg: { type: Type.NUMBER },
          yieldGrade: { type: Type.STRING },
          confidencePercent: { type: Type.INTEGER },
          estimatedHarvestWindow: { type: Type.STRING },
          weatherImpactSummary: { type: Type.STRING },
          yieldDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
          yieldBottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
          boosterActionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          audioSummary: { type: Type.STRING },
        },
        required: [
          'cropName',
          'stagesAnalyzed',
          'projectedYieldPerBighaKg',
          'projectedTotalYieldKg',
          'projectedYieldMinKg',
          'projectedYieldMaxKg',
          'yieldGrade',
          'confidencePercent',
          'estimatedHarvestWindow',
          'weatherImpactSummary',
          'yieldDrivers',
          'yieldBottlenecks',
          'boosterActionPlan',
          'audioSummary',
        ],
      };

      const attempts: { model: string; level: ThinkingLevel; timeoutMs: number; delayAfterMs: number }[] = [
        { model: 'gemini-4-hydrogen', level: ThinkingLevel.LOW, timeoutMs: 26000, delayAfterMs: 700 },
        { model: 'gemini-3.1-flash-lite', level: ThinkingLevel.MINIMAL, timeoutMs: 18000, delayAfterMs: 0 },
      ];

      let response;
      let lastErr: unknown;

      for (let idx = 0; idx < attempts.length; idx += 1) {
        const attempt = attempts[idx];
        try {
          response = await Promise.race([
            ai.models.generateContent({
              model: attempt.model,
              contents: [{ role: 'user', parts }],
              config: {
                systemInstruction,
                thinkingConfig: { thinkingLevel: attempt.level },
                responseMimeType: 'application/json',
                responseSchema: yieldSchema,
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('503_TIMEOUT: Model response timed out.')), attempt.timeoutMs)
            ),
          ]);
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
        throw lastErr ?? new Error('Failed to generate yield prediction.');
      }

      const parsed = safeParseDiagnosisJson(response.text ?? '{}');
      const validGrades = new Set(['bumper', 'above_average', 'average', 'below_average', 'at_risk']);
      const validVigor = new Set(['excellent', 'good', 'moderate', 'stressed']);

      const perBighaRaw = Number(parsed.projectedYieldPerBighaKg);
      const perBigha = Number.isFinite(perBighaRaw) && perBighaRaw > 0 ? Math.round(perBighaRaw) : 720;
      const totalRaw = Number(parsed.projectedTotalYieldKg);
      const totalYield =
        Number.isFinite(totalRaw) && totalRaw > 0 ? Math.round(totalRaw) : Math.round(perBigha * bighaEquivalent);
      const minRaw = Number(parsed.projectedYieldMinKg);
      const maxRaw = Number(parsed.projectedYieldMaxKg);
      const yieldMin =
        Number.isFinite(minRaw) && minRaw > 0 ? Math.round(minRaw) : Math.round(totalYield * 0.88);
      const yieldMax =
        Number.isFinite(maxRaw) && maxRaw >= yieldMin ? Math.round(maxRaw) : Math.round(totalYield * 1.12);

      const rawStages = Array.isArray(parsed.stagesAnalyzed) ? parsed.stagesAnalyzed : [];
      const stagesAnalyzed = validStages.map((inputStage, idx) => {
        const candidate =
          (rawStages.find(
            (item) =>
              item &&
              typeof item === 'object' &&
              String((item as Record<string, unknown>).stageKey) === inputStage.stageKey
          ) as Record<string, unknown> | undefined) ??
          (rawStages[idx] as Record<string, unknown> | undefined) ??
          {};
        const vigorRaw = String(candidate.vigorStatus || '').toLowerCase();
        return {
          stageKey: inputStage.stageKey,
          stageLabel:
            typeof candidate.stageLabel === 'string' && candidate.stageLabel.trim()
              ? candidate.stageLabel.trim()
              : STAGE_TITLES[inputStage.stageKey]?.[safeLang] ?? inputStage.stageKey,
          healthScore: Math.max(15, Math.min(100, Number(candidate.healthScore) || 76)),
          vigorStatus: validVigor.has(vigorRaw) ? vigorRaw : 'good',
          visualObservations: String(candidate.visualObservations || ''),
          stageRecommendation: String(candidate.stageRecommendation || ''),
        };
      });

      const gradeRaw = String(parsed.yieldGrade || '').toLowerCase();

      res.json({
        cropName: String(parsed.cropName || safeCrop || 'Crop'),
        stagesAnalyzed,
        projectedYieldPerBighaKg: perBigha,
        projectedTotalYieldKg: totalYield,
        projectedYieldMinKg: Math.min(yieldMin, totalYield),
        projectedYieldMaxKg: Math.max(yieldMax, totalYield),
        yieldGrade: validGrades.has(gradeRaw) ? gradeRaw : 'average',
        confidencePercent: Math.max(
          35,
          Math.min(97, Number(parsed.confidencePercent) || Math.min(92, 56 + validStages.length * 9))
        ),
        estimatedHarvestWindow: String(parsed.estimatedHarvestWindow || ''),
        weatherImpactSummary: String(parsed.weatherImpactSummary || ''),
        yieldDrivers: normalizeStringArray(parsed.yieldDrivers),
        yieldBottlenecks: normalizeStringArray(parsed.yieldBottlenecks),
        boosterActionPlan: normalizeStringArray(parsed.boosterActionPlan),
        audioSummary: String(parsed.audioSummary || '').trim(),
      });
    } catch (err: unknown) {
      const message = formatFriendlyGeminiError(err, safeLang);
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

  // Predictive Regional Pest Outbreak Surveillance Endpoints
  app.get('/api/pest-radar', (_req, res) => {
    const reports = safeReadJson<StoredPestObservation[]>(PEST_REPORTS_FILE, []);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ reports: reports.slice(0, 25) });
  });

  app.post('/api/pest-radar', async (req, res) => {
    const ALLOWED_SEVERITY = new Set(['early', 'moderate', 'severe']);
    const safeLang = ALLOWED_LANGS.has(req.body?.language) ? req.body.language : 'bn';

    try {
      const body = req.body ?? {};
      const action = typeof body.action === 'string' ? body.action : 'predict';

      if (action === 'report') {
        const districtName = typeof body.districtName === 'string' ? body.districtName.trim().slice(0, 60) : '';
        const cropName = typeof body.cropName === 'string' ? body.cropName.trim().slice(0, 60) : '';
        const pestName = typeof body.pestName === 'string' ? body.pestName.trim().slice(0, 80) : '';
        const severityRaw = typeof body.severity === 'string' ? body.severity : 'early';
        const severity = ALLOWED_SEVERITY.has(severityRaw)
          ? (severityRaw as 'early' | 'moderate' | 'severe')
          : 'early';
        const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) : '';

        if (districtName.length < 2 || pestName.length < 2 || cropName.length < 2) {
          res.status(400).json({ error: 'District, crop name, and pest observation are required.' });
          return;
        }

        const entry: StoredPestObservation = {
          id: `pr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          districtName,
          cropName,
          pestName,
          severity,
          note: note || undefined,
          createdAt: new Date().toISOString(),
        };
        const existing = safeReadJson<StoredPestObservation[]>(PEST_REPORTS_FILE, []);
        const updated = [entry, ...existing].slice(0, 150);
        safeWriteJson(PEST_REPORTS_FILE, updated);
        res.status(201).json({ report: entry, reports: updated.slice(0, 25) });
        return;
      }

      const districtName =
        typeof body.districtName === 'string' && body.districtName.trim()
          ? body.districtName.trim().slice(0, 60)
          : 'Dhaka';
      const regionName = typeof body.regionName === 'string' ? body.regionName.trim().slice(0, 80) : '';
      const cropFocus =
        typeof body.cropFocus === 'string' && body.cropFocus.trim()
          ? body.cropFocus.trim().slice(0, 80)
          : 'Rice, Potato, Tomato & Vegetables';
      const cropStage = typeof body.cropStage === 'string' ? body.cropStage.trim().slice(0, 50) : 'vegetative';
      const soilMoisture = typeof body.soilMoisture === 'string' ? body.soilMoisture.trim().slice(0, 40) : 'moist';
      const canopyDensity = typeof body.canopyDensity === 'string' ? body.canopyDensity.trim().slice(0, 40) : 'dense';
      const recentScans = Array.isArray(body.recentLocalDiagnoses)
        ? body.recentLocalDiagnoses
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, 8)
            .map((s) => s.trim().slice(0, 80))
        : [];
      const fieldSignals = Array.isArray(body.fieldSignals)
        ? body.fieldSignals
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, 8)
            .map((s) => s.trim().slice(0, 60))
        : [];

      const weatherData =
        body.weather && typeof body.weather === 'object' ? (body.weather as Record<string, unknown>) : null;
      const forecastSummary = Array.isArray(weatherData?.forecast)
        ? weatherData.forecast
            .slice(0, 5)
            .map((day) => {
              const d = day as Record<string, unknown>;
              return `${String(d.date ?? '')}: ${d.tempMin ?? '?'}–${d.tempMax ?? '?'}°C, rain ${d.rainMm ?? 0}mm (${d.rainProb ?? 0}%)`;
            })
            .join(' | ')
        : '';

      const allReports = safeReadJson<StoredPestObservation[]>(PEST_REPORTS_FILE, []);
      const districtReports = allReports
        .filter(
          (r) =>
            r.districtName.toLowerCase().includes(districtName.toLowerCase()) ||
            (regionName && r.districtName.toLowerCase() === regionName.toLowerCase())
        )
        .slice(0, 12);

      const communityReportsText =
        districtReports.length > 0
          ? districtReports.map((r) => `${r.cropName}: ${r.pestName} (${r.severity}) at ${r.districtName}`).join('; ')
          : 'No community reports submitted yet; infer risk from weather trends, field moisture, canopy, and calendar month.';

      const currentMonth = new Date().getMonth() + 1;
      const languageLabel =
        safeLang === 'bn'
          ? 'Bengali (বাংলা) — farmer-friendly pest names, practical scouting tips, exact bio/chemical shield'
          : safeLang === 'hi'
          ? 'Hindi (हिन्दी) — farmer-friendly pest names, scouting cues, exact preventive shield'
          : 'English — clear South Asian agricultural pest names and preventive guidance';

      const ai = getGeminiClient();

      const systemInstruction = `You are a Regional Plant Epidemiologist and Predictive Pest Surveillance Director (DAE/BARI/BRRI/ICAR Early Warning System).
Analyze hyper-local meteorological trends (temperature, humidity, rainfall forecast), soil moisture, canopy density, local crop stage, recent device scan signals, and community scouting reports to forecast regional pest and disease outbreaks 5 to 14 days BEFORE epidemic spread.
Respond strictly in valid JSON following the schema. All descriptive strings must be in ${languageLabel}.`;

      const promptText = `Run a predictive regional pest & disease outbreak analysis for:
- District / Zone: ${districtName}${regionName ? ` (${regionName})` : ''}
- Current Calendar Month: ${currentMonth}
- Primary Crops Monitored: ${cropFocus}
- Predominant Field Stage: ${cropStage}
- Local Soil Moisture Status: ${soilMoisture}
- Crop Canopy Density: ${canopyDensity}
- Current Weather: ${
        weatherData
          ? `Temp ${weatherData.temperature ?? 'N/A'}°C, Humidity ${weatherData.humidity ?? 'N/A'}%, Wind ${weatherData.windSpeed ?? 'N/A'} km/h, Rain ${weatherData.precipitation ?? 0} mm`
          : 'Moderate humid subtropical agro-climate'
      }
- 5-Day Weather Forecast: ${forecastSummary || 'Unavailable'}
- Local Farmer Field Signals Observed: ${fieldSignals.length > 0 ? fieldSignals.join(', ') : 'Routine preventive monitoring'}
- Recent Local Leaf Scanner Detections on Device: ${recentScans.length > 0 ? recentScans.join(', ') : 'None'}
- Regional Scouting Reports: ${communityReportsText}

Predict 3 to 4 highest-probability pest/pathogen threats over the next 5–14 days, ranked from highest riskPercent to lowest.
Include early scouting indicators and exact preventive interventions BEFORE economic threshold level (ETL) is crossed.
Write a crisp 3-sentence audioSummary warning the farmer about the top regional outbreak threat and immediate preventive action.`;

      const radarSchema = {
        type: Type.OBJECT,
        properties: {
          overallRiskLevel: { type: Type.STRING },
          overallRiskScore: { type: Type.INTEGER },
          outbreakWindowDays: { type: Type.INTEGER },
          weatherTriggerSummary: { type: Type.STRING },
          regionalScoutingSummary: { type: Type.STRING },
          predictedOutbreaks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pestName: { type: Type.STRING },
                scientificName: { type: Type.STRING },
                targetCrops: { type: Type.ARRAY, items: { type: Type.STRING } },
                riskPercent: { type: Type.INTEGER },
                riskLevel: { type: Type.STRING },
                onsetWindow: { type: Type.STRING },
                earlyWarningSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                preventiveShield: { type: Type.STRING },
                affectedRadiusNote: { type: Type.STRING },
              },
              required: [
                'pestName',
                'scientificName',
                'targetCrops',
                'riskPercent',
                'riskLevel',
                'onsetWindow',
                'earlyWarningSignals',
                'preventiveShield',
                'affectedRadiusNote',
              ],
            },
          },
          audioSummary: { type: Type.STRING },
        },
        required: [
          'overallRiskLevel',
          'overallRiskScore',
          'outbreakWindowDays',
          'weatherTriggerSummary',
          'regionalScoutingSummary',
          'predictedOutbreaks',
          'audioSummary',
        ],
      };

      const attempts: { model: string; level: ThinkingLevel; timeoutMs: number; delayAfterMs: number }[] = [
        { model: 'gemini-4-hydrogen', level: ThinkingLevel.LOW, timeoutMs: 24000, delayAfterMs: 700 },
        { model: 'gemini-3.1-flash-lite', level: ThinkingLevel.MINIMAL, timeoutMs: 18000, delayAfterMs: 0 },
      ];

      let response;
      let lastErr: unknown;

      for (let idx = 0; idx < attempts.length; idx += 1) {
        const attempt = attempts[idx];
        try {
          response = await Promise.race([
            ai.models.generateContent({
              model: attempt.model,
              contents: [{ role: 'user', parts: [{ text: promptText }] }],
              config: {
                systemInstruction,
                thinkingConfig: { thinkingLevel: attempt.level },
                responseMimeType: 'application/json',
                responseSchema: radarSchema,
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('503_TIMEOUT: Model response timed out.')), attempt.timeoutMs)
            ),
          ]);
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
        throw lastErr ?? new Error('Failed to generate pest outbreak forecast.');
      }

      const parsed = safeParseDiagnosisJson(response.text ?? '{}');
      const validRisks = new Set(['low', 'moderate', 'high', 'critical']);
      const rawOutbreaks = Array.isArray(parsed.predictedOutbreaks) ? parsed.predictedOutbreaks : [];

      const predictedOutbreaks = rawOutbreaks.slice(0, 4).map((item) => {
        const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
        const rLevel = String(row.riskLevel || '').toLowerCase();
        return {
          pestName: String(row.pestName || ''),
          scientificName: String(row.scientificName || ''),
          targetCrops: normalizeStringArray(row.targetCrops),
          riskPercent: Math.max(5, Math.min(99, Number(row.riskPercent) || 55)),
          riskLevel: validRisks.has(rLevel) ? rLevel : 'moderate',
          onsetWindow: String(row.onsetWindow || ''),
          earlyWarningSignals: normalizeStringArray(row.earlyWarningSignals),
          preventiveShield: String(row.preventiveShield || ''),
          affectedRadiusNote: String(row.affectedRadiusNote || ''),
        };
      });

      const overallLevelRaw = String(parsed.overallRiskLevel || '').toLowerCase();

      res.json({
        districtName,
        cropFocus,
        overallRiskLevel: validRisks.has(overallLevelRaw) ? overallLevelRaw : 'moderate',
        overallRiskScore: Math.max(5, Math.min(100, Number(parsed.overallRiskScore) || 58)),
        outbreakWindowDays: Math.max(3, Math.min(21, Number(parsed.outbreakWindowDays) || 7)),
        weatherTriggerSummary: String(parsed.weatherTriggerSummary || ''),
        regionalScoutingSummary: String(parsed.regionalScoutingSummary || ''),
        communitySignalCount: districtReports.length + recentScans.length,
        predictedOutbreaks,
        recentReports: allReports.slice(0, 12),
        audioSummary: String(parsed.audioSummary || '').trim(),
      });
    } catch (err: unknown) {
      const message = formatFriendlyGeminiError(err, safeLang);
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
