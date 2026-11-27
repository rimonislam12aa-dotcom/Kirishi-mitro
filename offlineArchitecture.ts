import {
  DiseaseDiagnosis,
  MarketPrice,
  MarketSourceLink,
  OfflinePendingScan,
  OfflineStorageHealth,
  OfflineSyncSummary,
  WeatherCacheRecord,
} from '../types/agri';
import {
  clearAudioCache,
  clearWeatherCache,
  deletePendingScan,
  estimateFallbackBytes,
  exportAllOfflineData,
  getCropTips,
  getDiagnoses,
  getMarketPrices,
  getMarketSyncMeta,
  getPendingScans,
  mergeServerMarketPrices,
  saveDiagnosis,
  saveLastOfflineSyncAt,
  saveManyDiagnoses,
  saveManyPendingScans,
  saveMarketPrice,
  saveMarketSyncMeta,
  savePendingScan,
  saveWeatherCache,
  setCropTipsBulk,
  syncPendingOfflineRecords,
} from './offlineDb';

export async function getOfflineStorageHealth(): Promise<OfflineStorageHealth> {
  let usedBytes = 0;
  let quotaBytes: number | null = null;
  let persisted = false;

  if (typeof navigator !== 'undefined' && navigator.storage) {
    try {
      if (typeof navigator.storage.persisted === 'function') {
        persisted = await navigator.storage.persisted();
      }
      if (typeof navigator.storage.estimate === 'function') {
        const estimate = await navigator.storage.estimate();
        if (typeof estimate.usage === 'number' && Number.isFinite(estimate.usage)) {
          usedBytes = estimate.usage;
        }
        if (typeof estimate.quota === 'number' && Number.isFinite(estimate.quota) && estimate.quota > 0) {
          quotaBytes = estimate.quota;
        }
      }
    } catch {
      // Fallback to local byte estimation below
    }
  }

  if (usedBytes === 0) {
    usedBytes = await estimateFallbackBytes();
  }

  const usagePercent =
    quotaBytes && quotaBytes > 0 ? Math.min(100, Math.round((usedBytes / quotaBytes) * 1000) / 10) : null;

  return {
    usedBytes,
    quotaBytes,
    usagePercent,
    persisted,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function') {
    try {
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}

export function formatStorageBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export async function processPendingScanItem(
  scan: OfflinePendingScan,
  weather?: WeatherCacheRecord | null
): Promise<{
  diagnosis?: DiseaseDiagnosis;
  diagnoses?: DiseaseDiagnosis[];
  pendingScans?: OfflinePendingScan[];
  error?: string;
  transient?: boolean;
}> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { error: 'Offline', transient: true };
  }

  const base64 = scan.imageDataUrl.split(',')[1] ?? '';
  if (base64.length < 100) {
    const remaining = await deletePendingScan(scan.id);
    return { pendingScans: remaining, error: 'Corrupt image skipped.' };
  }

  try {
    const res = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        imageBase64: base64,
        mimeType: scan.mimeType || 'image/jpeg',
        language: scan.language,
        cropHint: scan.cropHint,
        affectedPart: scan.affectedPart,
        growthStage: scan.growthStage,
        symptomTags: scan.symptomTags,
        weatherContext: weather
          ? {
              districtName: weather.location.districtName,
              temperature: weather.temperature,
              humidity: weather.humidity,
              precipitation: weather.precipitation,
            }
          : null,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : null;

    if (!res.ok || !data) {
      const msg = data?.error || `HTTP ${res.status}`;
      const isTransient = res.status === 429 || res.status === 503 || res.status === 502;
      const updatedPending = await savePendingScan({ ...scan, lastError: msg });
      return { error: msg, transient: isTransient, pendingScans: updatedPending };
    }

    const record: DiseaseDiagnosis = {
      id: `diag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      language: scan.language,
      imageDataUrl: scan.imageDataUrl,
      cropName: data.cropName || scan.cropHint || 'Crop',
      diseaseName: data.diseaseName || 'Unknown',
      scientificName: data.scientificName || '',
      pathogenType: data.pathogenType,
      severity: data.severity || 'moderate',
      diseaseStage: data.diseaseStage || '',
      spreadRisk: data.spreadRisk,
      confidence: Number(data.confidence) || 82,
      affectedPart: scan.affectedPart || undefined,
      growthStage: scan.growthStage || undefined,
      rootCause: data.rootCause || '',
      immediateAction: data.immediateAction || '',
      symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
      organicTreatment: Array.isArray(data.organicTreatment) ? data.organicTreatment : [],
      chemicalTreatment: Array.isArray(data.chemicalTreatment) ? data.chemicalTreatment : [],
      dosageAndSprayGuide: data.dosageAndSprayGuide || '',
      harvestWaitDays: data.harvestWaitDays || '',
      differentialDiagnosis: data.differentialDiagnosis || '',
      prevention: Array.isArray(data.prevention) ? data.prevention : [],
      audioSummary: data.audioSummary || `${data.cropName}: ${data.diseaseName}`,
    };

    const diagnoses = await saveDiagnosis(record);
    const pendingScans = await deletePendingScan(scan.id);
    return { diagnosis: record, diagnoses, pendingScans };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    const updatedPending = await savePendingScan({ ...scan, lastError: msg });
    return { error: msg, transient: true, pendingScans: updatedPending };
  }
}

export async function runFullOfflineSync(options?: {
  processScans?: boolean;
  weather?: WeatherCacheRecord | null;
}): Promise<
  OfflineSyncSummary & {
    prices: MarketPrice[];
    diagnoses: DiseaseDiagnosis[];
    pendingScans: OfflinePendingScan[];
    sources?: MarketSourceLink[];
  }
> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const [prices, diagnoses, pendingScans] = await Promise.all([
      getMarketPrices(),
      getDiagnoses(),
      getPendingScans(),
    ]);
    return {
      lastSyncAt: null,
      syncedPrices: 0,
      processedScans: 0,
      failedScans: 0,
      status: 'offline',
      prices,
      diagnoses,
      pendingScans,
    };
  }

  let syncedPrices = 0;
  let processedScans = 0;
  let failedScans = 0;
  let latestSources: MarketSourceLink[] | undefined;

  try {
    const pushRes = await syncPendingOfflineRecords();
    syncedPrices = pushRes.syncedPrices;

    // Pull latest server market prices without triggering forced AI quota calls
    try {
      const mktRes = await fetch('/api/market-prices');
      if (mktRes.ok) {
        const data = await mktRes.json();
        if (Array.isArray(data.updates) && data.updates.length > 0) {
          await mergeServerMarketPrices(data.updates);
        }
        const savedMeta = await getMarketSyncMeta();
        const resolvedSources: MarketSourceLink[] = Array.isArray(data.sources)
          ? (data.sources as MarketSourceLink[])
          : savedMeta.sources;
        latestSources = resolvedSources;
        await saveMarketSyncMeta({
          lastSyncAt:
            typeof data.lastAutoRefreshAt === 'string' ? data.lastAutoRefreshAt : savedMeta.lastSyncAt,
          sources: resolvedSources,
        });
      }
    } catch {
      // Non-fatal on static hosting
    }

    if (options?.processScans) {
      const queue = await getPendingScans();
      for (const item of queue) {
        const result = await processPendingScanItem(item, options.weather);
        if (result.diagnosis) {
          processedScans += 1;
        } else {
          failedScans += 1;
          if (result.transient) {
            break;
          }
        }
      }
    }

    const nowIso = new Date().toISOString();
    await saveLastOfflineSyncAt(nowIso);

    const [prices, diagnoses, pendingScans] = await Promise.all([
      getMarketPrices(),
      getDiagnoses(),
      getPendingScans(),
    ]);

    return {
      lastSyncAt: nowIso,
      syncedPrices,
      processedScans,
      failedScans,
      status: failedScans > 0 ? 'partial' : 'synced',
      prices,
      diagnoses,
      pendingScans,
      sources: latestSources,
    };
  } catch {
    const [prices, diagnoses, pendingScans] = await Promise.all([
      getMarketPrices(),
      getDiagnoses(),
      getPendingScans(),
    ]);
    return {
      lastSyncAt: null,
      syncedPrices,
      processedScans,
      failedScans,
      status: 'error',
      prices,
      diagnoses,
      pendingScans,
    };
  }
}

export async function exportOfflineBackupJson(): Promise<string> {
  return exportAllOfflineData();
}

export async function importOfflineBackupJson(rawText: string): Promise<{
  importedBookmarks: number;
  importedPrices: number;
  importedDiagnoses: number;
  importedPendingScans: number;
  restoredWeather: boolean;
}> {
  const parsed = JSON.parse(rawText);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid backup file format.');
  }

  let importedBookmarks = 0;
  let importedPrices = 0;
  let importedDiagnoses = 0;
  let importedPendingScans = 0;
  let restoredWeather = false;

  if (Array.isArray(parsed.cropTips)) {
    const existingTips = await getCropTips();
    const bookmarkedIds = new Set(
      parsed.cropTips
        .filter((t: unknown) => t && typeof t === 'object' && (t as { bookmarked?: boolean }).bookmarked)
        .map((t: unknown) => String((t as { id?: string }).id || ''))
    );
    if (bookmarkedIds.size > 0) {
      const mergedTips = existingTips.map((tip) =>
        bookmarkedIds.has(tip.id) ? { ...tip, bookmarked: true } : tip
      );
      await setCropTipsBulk(mergedTips);
      importedBookmarks = bookmarkedIds.size;
    }
  }

  if (Array.isArray(parsed.marketPrices)) {
    for (const row of parsed.marketPrices.slice(0, 120)) {
      if (
        row &&
        typeof row === 'object' &&
        typeof (row as MarketPrice).cropId === 'string' &&
        typeof (row as MarketPrice).marketName === 'string' &&
        typeof (row as MarketPrice).pricePerKg === 'number' &&
        Number.isFinite((row as MarketPrice).pricePerKg)
      ) {
        await saveMarketPrice(row as MarketPrice);
        importedPrices += 1;
      }
    }
  }

  if (Array.isArray(parsed.diagnoses)) {
    const validDiagnoses = parsed.diagnoses
      .filter(
        (d: unknown): d is DiseaseDiagnosis =>
          Boolean(
            d &&
              typeof d === 'object' &&
              typeof (d as DiseaseDiagnosis).id === 'string' &&
              typeof (d as DiseaseDiagnosis).diseaseName === 'string' &&
              typeof (d as DiseaseDiagnosis).cropName === 'string' &&
              typeof (d as DiseaseDiagnosis).imageDataUrl === 'string' &&
              (d as DiseaseDiagnosis).imageDataUrl.startsWith('data:image/')
          )
      )
      .slice(0, 60);
    if (validDiagnoses.length > 0) {
      await saveManyDiagnoses(validDiagnoses);
      importedDiagnoses = validDiagnoses.length;
    }
  }

  if (Array.isArray(parsed.pendingScans)) {
    const validScans = parsed.pendingScans
      .filter(
        (s: unknown): s is OfflinePendingScan =>
          Boolean(
            s &&
              typeof s === 'object' &&
              typeof (s as OfflinePendingScan).id === 'string' &&
              typeof (s as OfflinePendingScan).imageDataUrl === 'string' &&
              (s as OfflinePendingScan).imageDataUrl.startsWith('data:image/')
          )
      )
      .slice(0, 30);
    if (validScans.length > 0) {
      await saveManyPendingScans(validScans);
      importedPendingScans = validScans.length;
    }
  }

  if (
    parsed.weather &&
    typeof parsed.weather === 'object' &&
    typeof (parsed.weather as WeatherCacheRecord).temperature === 'number' &&
    (parsed.weather as WeatherCacheRecord).location
  ) {
    await saveWeatherCache(parsed.weather as WeatherCacheRecord);
    restoredWeather = true;
  }

  return {
    importedBookmarks,
    importedPrices,
    importedDiagnoses,
    importedPendingScans,
    restoredWeather,
  };
}

export { clearAudioCache, clearWeatherCache };
