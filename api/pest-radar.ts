import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const STORE_PATH = path.join('/tmp', 'krishi-mitra-pest-reports.json');
const ALLOWED_LANGS = new Set(['bn', 'hi', 'en']);
const ALLOWED_SEVERITY = new Set(['early', 'moderate', 'severe']);

type JsonReq = IncomingMessage & { body?: unknown };

interface StoredPestObservation {
  id: string;
  districtName: string;
  cropName: string;
  pestName: string;
  severity: 'early' | 'moderate' | 'severe';
  note?: string;
  createdAt: string;
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

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function readReports(): StoredPestObservation[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is StoredPestObservation =>
            Boolean(item && typeof item === 'object' && typeof item.pestName === 'string')
        );
      }
    }
  } catch {
    // Ignore /tmp read errors
  }
  return [];
}

function writeReports(items: StoredPestObservation[]): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(items.slice(0, 150)), 'utf-8');
  } catch {
    // Ignore /tmp write errors
  }
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
      ? 'সার্ভারের দৈনিক এআই কোটা সীমায় পৌঁছেছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
      : lang === 'hi'
      ? 'एआई सेवा की सीमा पूरी हो गई है। कृपया थोड़ी देर बाद प्रयास करें।'
      : 'AI request quota reached. Please try again shortly.';
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand') || raw.includes('503_TIMEOUT')) {
    return lang === 'bn'
      ? 'এই মুহূর্তে সার্ভারে চাপ বেশি আছে। অনুগ্রহ করে ১০–১৫ সেকেন্ড পর আবার চেষ্টা করুন।'
      : lang === 'hi'
      ? 'अभी सर्वर पर अधिक ट्रैफ़िक है। कृपया 10-15 सेकंड बाद पुनः प्रयास करें।'
      : 'Service is temporarily busy due to high demand. Please retry in 10–15 seconds.';
  }
  return raw;
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return trimmed;
}

function safeParseJsonObject(rawText: string): Record<string, unknown> {
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
  throw new Error('Could not parse predictive pest radar output.');
}

function normalizeStringArray(value: unknown, max = 4): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
    .slice(0, max);
}

export default async function handler(req: JsonReq, res: ServerResponse) {
  if (req.method === 'GET') {
    const reports = readReports();
    sendJson(res, 200, { reports: reports.slice(0, 25) });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  let safeLang = 'bn';
  try {
    const body = await parseJsonBody(req);
    const action = typeof body.action === 'string' ? body.action : 'predict';
    safeLang = typeof body.language === 'string' && ALLOWED_LANGS.has(body.language) ? body.language : 'bn';

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
        sendJson(res, 400, { error: 'District, crop name, and pest observation are required.' });
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
      const existing = readReports();
      const updated = [entry, ...existing].slice(0, 150);
      writeReports(updated);
      sendJson(res, 201, { report: entry, reports: updated.slice(0, 25) });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured in Settings > Secrets.' });
      return;
    }

    const districtName = typeof body.districtName === 'string' && body.districtName.trim()
      ? body.districtName.trim().slice(0, 60)
      : 'Dhaka';
    const regionName = typeof body.regionName === 'string' ? body.regionName.trim().slice(0, 80) : '';
    const cropFocus = typeof body.cropFocus === 'string' && body.cropFocus.trim()
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

    const allReports = readReports();
    const districtReports = allReports
      .filter((r) => r.districtName.toLowerCase().includes(districtName.toLowerCase()) || districtReportsMatchFallback(r, regionName))
      .slice(0, 12);

    const communityReportsText =
      districtReports.length > 0
        ? districtReports
            .map((r) => `${r.cropName}: ${r.pestName} (${r.severity}) at ${r.districtName}`)
            .join('; ')
        : 'No community reports submitted yet in this session; base prediction on regional epidemiology, weather, and field signals.';

    const currentMonth = new Date().getMonth() + 1;
    const languageLabel =
      safeLang === 'bn'
        ? 'Bengali (বাংলা) — farmer-friendly pest names, practical scouting tips, exact bio/chemical shield'
        : safeLang === 'hi'
        ? 'Hindi (हिन्दी) — farmer-friendly pest names, scouting cues, exact preventive shield'
        : 'English — clear South Asian agricultural pest names and preventive guidance';

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are a Regional Plant Epidemiologist and Predictive Pest Surveillance Director (DAE/BARI/BRRI/ICAR Early Warning System).
Analyze hyper-local meteorological trends (temperature, humidity, rainfall forecast), soil moisture, canopy architecture, local crop stage, recent field scan signals, and community scouting reports to forecast pest and disease outbreaks 5 to 14 days BEFORE visible epidemic damage occurs.
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
Include early scouting indicators (e.g. sticky trap counts, morning dew inspection, lower-sheath checking) and exact preventive interventions BEFORE economic threshold level (ETL) is crossed.
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
        await new Promise((r) => setTimeout(r, attempt.delayAfterMs));
      }
    }

    if (!response) {
      throw lastErr ?? new Error('Failed to generate pest outbreak forecast.');
    }

    const parsed = safeParseJsonObject(response.text ?? '{}');
    const validRisks = new Set(['low', 'moderate', 'high', 'critical']);
    const rawOutbreaks = Array.isArray(parsed.predictedOutbreaks) ? parsed.predictedOutbreaks : [];

    const predictedOutbreaks = rawOutbreaks.slice(0, 4).map((item) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      const rLevel = String(row.riskLevel || '').toLowerCase();
      return {
        pestName: String(row.pestName || ''),
        scientificName: String(row.scientificName || ''),
        targetCrops: normalizeStringArray(row.targetCrops, 4),
        riskPercent: Math.max(5, Math.min(99, Number(row.riskPercent) || 55)),
        riskLevel: validRisks.has(rLevel) ? rLevel : 'moderate',
        onsetWindow: String(row.onsetWindow || ''),
        earlyWarningSignals: normalizeStringArray(row.earlyWarningSignals, 4),
        preventiveShield: String(row.preventiveShield || ''),
        affectedRadiusNote: String(row.affectedRadiusNote || ''),
      };
    });

    const overallLevelRaw = String(parsed.overallRiskLevel || '').toLowerCase();

    sendJson(res, 200, {
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
    sendJson(res, statusCode, { error: message });
  }
}

function districtReportsMatchFallback(report: StoredPestObservation, regionName: string): boolean {
  if (!regionName) return false;
  return report.districtName.toLowerCase() === regionName.toLowerCase();
}
