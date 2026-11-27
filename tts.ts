import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

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

export default async function handler(req: JsonReq, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const body = await parseJsonBody(req);
    const { text, language = 'bn' } = body;

    if (typeof text !== 'string' || text.trim().length === 0) {
      sendJson(res, 400, { error: 'Text is required for speech generation.' });
      return;
    }

    const trimmedText = text.trim().slice(0, 1800);
    const safeLang = typeof language === 'string' && ALLOWED_LANGS.has(language) ? language : 'bn';
    const styleHint =
      safeLang === 'bn'
        ? 'Warm, clear, reassuring Bengali agricultural advisor speaking calmly to a farmer'
        : safeLang === 'hi'
        ? 'Warm, clear, reassuring Hindi agricultural advisor speaking calmly to a farmer'
        : 'Warm, clear, reassuring agricultural advisor speaking calmly to a farmer';

    const ai = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
      sendJson(res, 502, { error: 'Speech model returned no audio data.' });
      return;
    }

    sendJson(res, 200, {
      audioBase64: base64Audio,
      mimeType: response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'TTS generation failed.';
    sendJson(res, 500, { error: message });
  }
}
