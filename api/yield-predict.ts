import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_LANGS = new Set(['bn', 'hi', 'en']);
const ALLOWED_STAGES = new Set(['seedling', 'vegetative', 'flowering', 'grain_fill']);
const ALLOWED_UNITS = new Set(['bigha', 'decimal', 'acre', 'hectare']);

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
  res.setHeader('Cache-Control', 'no-store');
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
      ? 'সার্ভারের দৈনিক এআই কোটা সীমায় পৌঁছেছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
      : lang === 'hi'
      ? 'एआई सेवा की सीमा पूरी हो गई है। कृपया थोड़ी देर बाद प्रयास करें।'
      : 'AI request quota reached. Please try again shortly.';
  }
  if (
    raw.includes('403') ||
    raw.includes('PERMISSION_DENIED') ||
    raw.includes('API_KEY_INVALID') ||
    raw.includes('API key not valid')
  ) {
    return lang === 'bn'
      ? 'API Key সঠিক নয় বা অনুমতি নেই। Settings > Secrets পরীক্ষা করুন।'
      : lang === 'hi'
      ? 'API कुंजी अमान्य है। कृपया Settings > Secrets जांचें।'
      : 'API key permission issue. Please check Settings > Secrets.';
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand') || raw.includes('503_TIMEOUT')) {
    return lang === 'bn'
      ? 'এআই সার্ভারে চাপ বেশি আছে। অনুগ্রহ করে ১০–১৫ সেকেন্ড পর আবার চেষ্টা করুন।'
      : lang === 'hi'
      ? 'सर्वर पर अभी अधिक लोड है। कृपया 10-15 सेकंड बाद पुनः प्रयास करें।'
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
  throw new Error('Could not parse structured yield prediction output.');
}

function normalizeStringArray(value: unknown, max = 5): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
    .slice(0, max);
}

function toBighas(area: number, unit: string): number {
  if (unit === 'decimal') return area / 33;
  if (unit === 'acre') return area * 3.03;
  if (unit === 'hectare') return area * 7.47;
  return area; // 1 Bigha = 33 decimals in Bangladesh/Eastern India
}

const STAGE_TITLES: Record<string, Record<string, string>> = {
  seedling: { bn: '১. চারা / অঙ্কুরোদগম ধাপ', hi: '1. पौध / अंकुरण चरण', en: '1. Seedling Stage' },
  vegetative: { bn: '২. বাড়ন্ত / কুঁশি ধাপ', hi: '2. बढ़वार / कल्ले चरण', en: '2. Vegetative Growth' },
  flowering: { bn: '৩. ফুল ও শীষ বের হওয়া', hi: '3. फूल व बाली निकलना', en: '3. Flowering / Heading' },
  grain_fill: { bn: '৪. দানা পুষ্ট ও পরিপক্বতা', hi: '4. दाना भराव व पकना', en: '4. Grain / Fruit Fill' },
};

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
      stages,
      language = 'bn',
      cropName = '',
      variety = '',
      landArea = 1,
      landUnit = 'bigha',
      soilType = 'loam',
      irrigationLevel = 'adequate',
      fertilizerRegime = 'balanced',
      sowingDate = '',
      weatherContext = null,
    } = body;

    safeLang = typeof language === 'string' && ALLOWED_LANGS.has(language) ? language : 'bn';

    if (!Array.isArray(stages) || stages.length === 0 || stages.length > 4) {
      sendJson(res, 400, { error: 'Provide between 1 and 4 growth-stage photos for yield analysis.' });
      return;
    }

    interface NormalizedStage {
      stageKey: string;
      imageBase64: string;
      mimeType: string;
      note: string;
    }

    const validStages: NormalizedStage[] = [];
    let totalBase64Bytes = 0;

    for (const rawStage of stages) {
      if (!rawStage || typeof rawStage !== 'object') {
        sendJson(res, 400, { error: 'Invalid growth stage entry.' });
        return;
      }
      const s = rawStage as Record<string, unknown>;
      const stageKey = typeof s.stageKey === 'string' && ALLOWED_STAGES.has(s.stageKey) ? s.stageKey : '';
      const imageBase64 = typeof s.imageBase64 === 'string' ? s.imageBase64.trim() : '';
      const rawMime = typeof s.mimeType === 'string' ? s.mimeType.toLowerCase() : '';

      if (!stageKey) {
        sendJson(res, 400, { error: 'Invalid growth stage identifier.' });
        return;
      }
      if (imageBase64.length < 100 || imageBase64.length > 4_000_000) {
        sendJson(res, 400, { error: `Invalid image payload size for stage ${stageKey}.` });
        return;
      }
      if (!ALLOWED_IMAGE_MIME.has(rawMime)) {
        sendJson(res, 400, { error: 'Unsupported image format. Use JPEG, PNG, or WebP.' });
        return;
      }

      totalBase64Bytes += imageBase64.length;
      if (totalBase64Bytes > 5_800_000) {
        sendJson(res, 400, { error: 'Combined image size exceeds Vercel upload limit. Please use smaller photos.' });
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
    const bighaEquivalent = Math.max(0.03, toBighas(safeArea, safeUnit));

    const safeSoil = typeof soilType === 'string' ? soilType.trim().slice(0, 50) : 'loam';
    const safeIrrigation = typeof irrigationLevel === 'string' ? irrigationLevel.trim().slice(0, 50) : 'adequate';
    const safeFertilizer = typeof fertilizerRegime === 'string' ? fertilizerRegime.trim().slice(0, 50) : 'balanced';
    const safeSowingDate = typeof sowingDate === 'string' ? sowingDate.trim().slice(0, 30) : '';

    const wCtx =
      weatherContext && typeof weatherContext === 'object'
        ? (weatherContext as Record<string, unknown>)
        : null;
    const weatherSummary = wCtx
      ? [
          typeof wCtx.districtName === 'string' ? `District: ${wCtx.districtName}` : '',
          typeof wCtx.temperature === 'number' ? `Temp: ${wCtx.temperature}°C` : '',
          typeof wCtx.humidity === 'number' ? `Humidity: ${wCtx.humidity}%` : '',
          typeof wCtx.precipitation === 'number' ? `Rain: ${wCtx.precipitation}mm` : '',
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

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
2. Give realistic projectedYieldPerBighaKg (e.g. Boro rice 700-950 kg/bigha, Aman rice 550-750 kg/bigha, Potato 2200-3500 kg/bigha, Wheat 420-580 kg/bigha, Tomato 3200-5000 kg/bigha, Onion 1400-2200 kg/bigha, Mustard 180-270 kg/bigha) adjusted cleanly for the crop health visible in the photos.
3. Compute projectedTotalYieldKg = Math.round(projectedYieldPerBighaKg * ${bighaEquivalent.toFixed(2)}), plus realistic projectedYieldMinKg and projectedYieldMaxKg bounds.
4. ConfidencePercent should reflect how many stages were supplied (1 stage ~55-70%, 2-3 stages ~72-85%, 4 stages ~86-94% if clear).
5. Provide 3-4 yieldDrivers, 2-3 yieldBottlenecks, and 3-4 high-ROI boosterActionPlan steps to protect or increase final yield before harvest.
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
        await new Promise((r) => setTimeout(r, attempt.delayAfterMs));
      }
    }

    if (!response) {
      throw lastErr ?? new Error('Failed to generate yield prediction.');
    }

    const parsed = safeParseJsonObject(response.text ?? '{}');
    const validGrades = new Set(['bumper', 'above_average', 'average', 'below_average', 'at_risk']);
    const validVigor = new Set(['excellent', 'good', 'moderate', 'stressed']);

    const perBighaRaw = Number(parsed.projectedYieldPerBighaKg);
    const perBigha = Number.isFinite(perBighaRaw) && perBighaRaw > 0 ? Math.round(perBighaRaw) : 720;
    const totalRaw = Number(parsed.projectedTotalYieldKg);
    const totalYield =
      Number.isFinite(totalRaw) && totalRaw > 0
        ? Math.round(totalRaw)
        : Math.round(perBigha * bighaEquivalent);
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

    sendJson(res, 200, {
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
      yieldDrivers: normalizeStringArray(parsed.yieldDrivers, 5),
      yieldBottlenecks: normalizeStringArray(parsed.yieldBottlenecks, 4),
      boosterActionPlan: normalizeStringArray(parsed.boosterActionPlan, 5),
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
