import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_LANGS = new Set(['bn', 'hi', 'en']);

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

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
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

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return trimmed;
}

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

export default async function handler(req: JsonReq, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  let safeLang = 'bn';
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured in Settings > Secrets.' });
      return;
    }

    const body = await parseJsonBody(req);
    const {
      imageBase64,
      mimeType,
      language = 'bn',
      cropHint = '',
      affectedPart = '',
      growthStage = '',
      symptomTags = [],
      weatherContext = null,
    } = body;

    safeLang = typeof language === 'string' && ALLOWED_LANGS.has(language) ? language : 'bn';

    if (typeof imageBase64 !== 'string' || imageBase64.length < 100 || imageBase64.length > 15_000_000) {
      sendJson(res, 400, { error: 'Valid base64 crop image is required.' });
      return;
    }
    if (typeof mimeType !== 'string' || !ALLOWED_IMAGE_MIME.has(mimeType.toLowerCase())) {
      sendJson(res, 400, { error: 'Unsupported image format. Use JPEG, PNG, or WebP.' });
      return;
    }
    const normalizedMime = mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType.toLowerCase();

    const safeHint = typeof cropHint === 'string' ? cropHint.slice(0, 80).trim() : '';
    const safePart = typeof affectedPart === 'string' ? affectedPart.slice(0, 40).trim() : '';
    const safeStage = typeof growthStage === 'string' ? growthStage.slice(0, 40).trim() : '';
    const safeTags = Array.isArray(symptomTags)
      ? symptomTags
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .slice(0, 8)
          .map((s) => s.trim().slice(0, 50))
      : [];

    const wCtx =
      weatherContext && typeof weatherContext === 'object'
        ? (weatherContext as Record<string, unknown>)
        : null;
    const weatherSummary = wCtx
      ? [
          typeof wCtx.districtName === 'string' ? `Location: ${wCtx.districtName}` : '',
          typeof wCtx.temperature === 'number' ? `Temp: ${wCtx.temperature}°C` : '',
          typeof wCtx.humidity === 'number' ? `Humidity: ${wCtx.humidity}%` : '',
          typeof wCtx.precipitation === 'number' ? `Rain: ${wCtx.precipitation}mm` : '',
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

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are a senior South Asian agricultural plant pathologist (BARI/BRRI/ICAR field extension specialist) advising smallholder farmers.
Examine visual evidence carefully: lesion margins, concentric rings, water-soaked spots, chlorosis patterns, powdery spores, rust pustules, insect frass/chewing, or wilting.
Factor in crop context and local weather. Respond strictly in valid JSON in ${languageLabel}.
If blurry or not a plant, set pathogenType to "unclear", severity to "low", confidence to 15-30, and explain clearly what photo is needed.`;

    const promptText = `Analyze this crop/plant image carefully and provide a complete diagnostic report and treatment plan.
Context provided by farmer:
${safeHint ? `- Crop name: ${safeHint}` : '- Crop name: Identify from photo if possible'}
${safePart ? `- Affected part: ${safePart}` : ''}
${safeStage ? `- Plant growth stage: ${safeStage}` : ''}
${safeTags.length > 0 ? `- Farmer observed symptoms: ${safeTags.join(', ')}` : ''}
${weatherSummary ? `- Local weather conditions: ${weatherSummary}` : ''}

Include pathogenType ('fungal'|'bacterial'|'viral'|'pest'|'deficiency'|'healthy'|'unclear'), severity, diseaseStage, spreadRisk ('low'|'moderate'|'high'), confidence, rootCause, immediateAction (next 24h), 3-5 symptoms, 3 organicTreatment steps, 2-3 chemicalTreatment generic actives, dosageAndSprayGuide (exact per-liter & 16L tank dosage, spray timing & safety), harvestWaitDays, differentialDiagnosis, 3-4 prevention steps, and 3-sentence audioSummary.`;

    const diagnosisSchema = {
      type: Type.OBJECT,
      properties: {
        cropName: { type: Type.STRING },
        diseaseName: { type: Type.STRING },
        scientificName: { type: Type.STRING },
        pathogenType: { type: Type.STRING },
        severity: { type: Type.STRING },
        diseaseStage: { type: Type.STRING },
        spreadRisk: { type: Type.STRING },
        confidence: { type: Type.INTEGER },
        rootCause: { type: Type.STRING },
        immediateAction: { type: Type.STRING },
        symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
        organicTreatment: { type: Type.ARRAY, items: { type: Type.STRING } },
        chemicalTreatment: { type: Type.ARRAY, items: { type: Type.STRING } },
        dosageAndSprayGuide: { type: Type.STRING },
        harvestWaitDays: { type: Type.STRING },
        differentialDiagnosis: { type: Type.STRING },
        prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
        audioSummary: { type: Type.STRING },
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
        response = await Promise.race([
          ai.models.generateContent({
            model: attempt.model,
            contents: [
              {
                role: 'user',
                parts: [
                  { inlineData: { mimeType: normalizedMime, data: imageBase64 } },
                  { text: promptText },
                ],
              },
            ],
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: attempt.level },
              responseMimeType: 'application/json',
              responseSchema: diagnosisSchema,
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
      throw lastErr ?? new Error('Failed to obtain diagnosis response.');
    }

    const parsed = safeParseDiagnosisJson(response.text ?? '{}');
    const validSeverities = new Set(['healthy', 'low', 'moderate', 'high']);
    const validPathogens = new Set(['fungal', 'bacterial', 'viral', 'pest', 'deficiency', 'healthy', 'unclear']);
    const validSpread = new Set(['low', 'moderate', 'high']);

    const pathogenRaw = String(parsed.pathogenType || '').toLowerCase();
    const severityRaw = String(parsed.severity || '').toLowerCase();
    const spreadRaw = String(parsed.spreadRisk || '').toLowerCase();

    sendJson(res, 200, {
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
