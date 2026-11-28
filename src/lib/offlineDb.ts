import { SEED_CROP_TIPS } from '../catalog/seedData';
import {
  AppLanguage,
  AutoSyncIntervalMinutes,
  CropTip,
  DiseaseDiagnosis,
  FarmerFeedback,
  OfflineDbStats,
  OfflinePendingScan,
  PushNotificationItem,
  RegionalPestRadarResult,
  VisitorStats,
  WeatherCacheRecord,
  YieldPredictionRecord,
} from '../types/agri';

const DB_NAME = 'krishi_mitra_db';
const DB_VERSION = 3;

const STORES = {
  CROP_TIPS: 'crop_tips',
  WEATHER_CACHE: 'weather_cache',
  DIAGNOSES: 'diagnoses',
  PENDING_SCANS: 'pending_scans',
  FEEDBACK_QUEUE: 'feedback_queue',
  AUDIO_CACHE: 'audio_cache',
  PREFERENCES: 'preferences',
  YIELD_PREDICTIONS: 'yield_predictions',
  PEST_RADAR_CACHE: 'pest_radar_cache',
} as const;

interface AudioCacheEntry {
  key: string;
  audioBase64: string;
  mimeType: string;
  cachedAt: string;
}

interface PreferenceEntry {
  key: string;
  value: unknown;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.CROP_TIPS)) {
        db.createObjectStore(STORES.CROP_TIPS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.WEATHER_CACHE)) {
        db.createObjectStore(STORES.WEATHER_CACHE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.DIAGNOSES)) {
        db.createObjectStore(STORES.DIAGNOSES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PENDING_SCANS)) {
        db.createObjectStore(STORES.PENDING_SCANS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.FEEDBACK_QUEUE)) {
        db.createObjectStore(STORES.FEEDBACK_QUEUE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.AUDIO_CACHE)) {
        db.createObjectStore(STORES.AUDIO_CACHE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
        db.createObjectStore(STORES.PREFERENCES, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.YIELD_PREDICTIONS)) {
        db.createObjectStore(STORES.YIELD_PREDICTIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PEST_RADAR_CACHE)) {
        db.createObjectStore(STORES.PEST_RADAR_CACHE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });

  return dbPromise;
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

async function getByKey<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function putInStore<T>(storeName: string, item: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function putManyInStore<T>(storeName: string, items: T[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const item of items) {
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteByKey(storeName: string, key: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function clearStore(storeName: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function initializeOfflineDatabase(): Promise<void> {
  const existingTips = await getAllFromStore<CropTip>(STORES.CROP_TIPS);
  if (existingTips.length === 0) {
    await putManyInStore(STORES.CROP_TIPS, SEED_CROP_TIPS);
  } else {
    const existingById = new Map(existingTips.map((tip) => [tip.id, tip]));
    const tipsToSave: CropTip[] = [];
    for (const seed of SEED_CROP_TIPS) {
      const existing = existingById.get(seed.id);
      if (!existing) {
        tipsToSave.push(seed);
      } else if (existing.imageUrl !== seed.imageUrl) {
        tipsToSave.push({ ...existing, imageUrl: seed.imageUrl });
      }
    }
    if (tipsToSave.length > 0) {
      await putManyInStore(STORES.CROP_TIPS, tipsToSave);
    }
  }
}

export async function getCropTips(): Promise<CropTip[]> {
  await initializeOfflineDatabase();
  return getAllFromStore<CropTip>(STORES.CROP_TIPS);
}

export async function toggleCropTipBookmark(tipId: string): Promise<CropTip[]> {
  const tip = await getByKey<CropTip>(STORES.CROP_TIPS, tipId);
  if (tip) {
    await putInStore(STORES.CROP_TIPS, { ...tip, bookmarked: !tip.bookmarked });
  }
  return getCropTips();
}

export async function getWeatherCache(): Promise<WeatherCacheRecord | undefined> {
  return getByKey<WeatherCacheRecord>(STORES.WEATHER_CACHE, 'current');
}

export async function saveWeatherCache(record: WeatherCacheRecord): Promise<void> {
  await putInStore(STORES.WEATHER_CACHE, { ...record, id: 'current' });
}

export async function clearWeatherCache(): Promise<void> {
  await deleteByKey(STORES.WEATHER_CACHE, 'current');
}

export async function getDiagnoses(): Promise<DiseaseDiagnosis[]> {
  const items = await getAllFromStore<DiseaseDiagnosis>(STORES.DIAGNOSES);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveDiagnosis(diagnosis: DiseaseDiagnosis): Promise<DiseaseDiagnosis[]> {
  await putInStore(STORES.DIAGNOSES, diagnosis);
  return getDiagnoses();
}

export async function saveManyDiagnoses(list: DiseaseDiagnosis[]): Promise<DiseaseDiagnosis[]> {
  if (list.length > 0) {
    await putManyInStore(STORES.DIAGNOSES, list);
  }
  return getDiagnoses();
}

export async function deleteDiagnosis(id: string): Promise<DiseaseDiagnosis[]> {
  await deleteByKey(STORES.DIAGNOSES, id);
  return getDiagnoses();
}

export async function getYieldPredictions(): Promise<YieldPredictionRecord[]> {
  const items = await getAllFromStore<YieldPredictionRecord>(STORES.YIELD_PREDICTIONS);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveYieldPrediction(record: YieldPredictionRecord): Promise<YieldPredictionRecord[]> {
  await putInStore(STORES.YIELD_PREDICTIONS, record);
  return getYieldPredictions();
}

export async function saveManyYieldPredictions(list: YieldPredictionRecord[]): Promise<YieldPredictionRecord[]> {
  if (list.length > 0) {
    await putManyInStore(STORES.YIELD_PREDICTIONS, list);
  }
  return getYieldPredictions();
}

export async function deleteYieldPrediction(id: string): Promise<YieldPredictionRecord[]> {
  await deleteByKey(STORES.YIELD_PREDICTIONS, id);
  return getYieldPredictions();
}

export async function getCachedPestRadar(): Promise<RegionalPestRadarResult | undefined> {
  return getByKey<RegionalPestRadarResult>(STORES.PEST_RADAR_CACHE, 'latest');
}

export async function saveCachedPestRadar(record: RegionalPestRadarResult): Promise<void> {
  await putInStore(STORES.PEST_RADAR_CACHE, { ...record, id: 'latest' });
}

export async function getPendingScans(): Promise<OfflinePendingScan[]> {
  const items = await getAllFromStore<OfflinePendingScan>(STORES.PENDING_SCANS);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function savePendingScan(scan: OfflinePendingScan): Promise<OfflinePendingScan[]> {
  await putInStore(STORES.PENDING_SCANS, scan);
  return getPendingScans();
}

export async function saveManyPendingScans(list: OfflinePendingScan[]): Promise<OfflinePendingScan[]> {
  if (list.length > 0) {
    await putManyInStore(STORES.PENDING_SCANS, list);
  }
  return getPendingScans();
}

export async function deletePendingScan(id: string): Promise<OfflinePendingScan[]> {
  await deleteByKey(STORES.PENDING_SCANS, id);
  return getPendingScans();
}

export async function setCropTipsBulk(tips: CropTip[]): Promise<CropTip[]> {
  if (tips.length > 0) {
    await putManyInStore(STORES.CROP_TIPS, tips);
  }
  return getCropTips();
}

export async function getFeedbackList(): Promise<FarmerFeedback[]> {
  const items = await getAllFromStore<FarmerFeedback>(STORES.FEEDBACK_QUEUE);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveFeedbackEntry(entry: FarmerFeedback): Promise<FarmerFeedback[]> {
  await putInStore(STORES.FEEDBACK_QUEUE, entry);
  return getFeedbackList();
}

export async function mergeServerFeedback(serverItems: FarmerFeedback[]): Promise<FarmerFeedback[]> {
  if (serverItems.length > 0) {
    await putManyInStore(
      STORES.FEEDBACK_QUEUE,
      serverItems.map((item) => ({ ...item, syncStatus: 'synced' as const }))
    );
  }
  return getFeedbackList();
}

export async function getCachedAudio(key: string): Promise<AudioCacheEntry | undefined> {
  return getByKey<AudioCacheEntry>(STORES.AUDIO_CACHE, key);
}

export async function saveCachedAudio(entry: AudioCacheEntry): Promise<void> {
  const existing = await getAllFromStore<AudioCacheEntry>(STORES.AUDIO_CACHE);
  if (existing.length > 24) {
    const oldest = existing.sort(
      (a, b) => new Date(a.cachedAt).getTime() - new Date(b.cachedAt).getTime()
    )[0];
    if (oldest) {
      const db = await openDatabase();
      const tx = db.transaction(STORES.AUDIO_CACHE, 'readwrite');
      tx.objectStore(STORES.AUDIO_CACHE).delete(oldest.key);
    }
  }
  await putInStore(STORES.AUDIO_CACHE, entry);
}

export async function clearAudioCache(): Promise<number> {
  const existing = await getAllFromStore<AudioCacheEntry>(STORES.AUDIO_CACHE);
  await clearStore(STORES.AUDIO_CACHE);
  return existing.length;
}

export async function getSavedLanguage(): Promise<AppLanguage> {
  try {
    const entry = await getByKey<PreferenceEntry>(STORES.PREFERENCES, 'language');
    const val = entry?.value;
    if (val === 'bn' || val === 'hi' || val === 'en') {
      return val;
    }
  } catch {
    // Ignore storage read errors
  }
  return 'bn';
}

export async function saveLanguagePreference(language: AppLanguage): Promise<void> {
  await putInStore(STORES.PREFERENCES, { key: 'language', value: language });
}

export async function getSavedPushEnabled(): Promise<boolean> {
  try {
    const entry = await getByKey<PreferenceEntry>(STORES.PREFERENCES, 'pushEnabled');
    return entry?.value === true;
  } catch {
    return false;
  }
}

export async function savePushEnabled(enabled: boolean): Promise<void> {
  await putInStore(STORES.PREFERENCES, { key: 'pushEnabled', value: enabled });
}

export async function getNotificationLogs(): Promise<PushNotificationItem[]> {
  try {
    const entry = await getByKey<PreferenceEntry>(STORES.PREFERENCES, 'notificationLogs');
    if (Array.isArray(entry?.value)) {
      return entry.value as PushNotificationItem[];
    }
  } catch {
    // Ignore
  }
  return [];
}

export async function appendNotificationLog(item: PushNotificationItem): Promise<PushNotificationItem[]> {
  const existing = await getNotificationLogs();
  const next = [item, ...existing].slice(0, 12);
  await putInStore(STORES.PREFERENCES, { key: 'notificationLogs', value: next });
  return next;
}

const VISITOR_ID_LS_KEY = 'krishi_mitra_visitor_id';

export async function getOrCreateVisitorId(): Promise<string> {
  let lsId: string | null = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const candidate = window.localStorage.getItem(VISITOR_ID_LS_KEY);
      if (candidate && candidate.length >= 6) {
        lsId = candidate;
      }
    }
  } catch {
    // Ignore localStorage restrictions
  }

  try {
    const entry = await getByKey<PreferenceEntry>(STORES.PREFERENCES, 'visitorId');
    const idbId = typeof entry?.value === 'string' && entry.value.length >= 6 ? entry.value : null;

    const resolvedId =
      lsId ||
      idbId ||
      `farmer_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    if (idbId !== resolvedId) {
      await putInStore(STORES.PREFERENCES, { key: 'visitorId', value: resolvedId });
    }
    if (lsId !== resolvedId && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(VISITOR_ID_LS_KEY, resolvedId);
      } catch {
        // Ignore storage quota/privacy error
      }
    }
    return resolvedId;
  } catch {
    const fallbackId = lsId || `farmer_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      if (typeof window !== 'undefined' && window.localStorage && !lsId) {
        window.localStorage.setItem(VISITOR_ID_LS_KEY, fallbackId);
      }
    } catch {
      // Ignore
    }
    return fallbackId;
  }
}

export async function getCachedVisitorStats(): Promise<VisitorStats | undefined> {
  try {
    const entry = await getByKey<PreferenceEntry>(STORES.PREFERENCES, 'visitorStats');
    return entry?.value as VisitorStats | undefined;
  } catch {
    return undefined;
  }
}

export async function saveCachedVisitorStats(stats: VisitorStats): Promise<void> {
  await putInStore(STORES.PREFERENCES, { key: 'visitorStats', value: stats });
}

export async function getLastOfflineSyncAt(): Promise<string | null> {
  try {
    const entry = await getByKey<PreferenceEntry>(STORES.PREFERENCES, 'lastOfflineSyncAt');
    return typeof entry?.value === 'string' ? entry.value : null;
  } catch {
    return null;
  }
}

export async function saveLastOfflineSyncAt(iso: string): Promise<void> {
  await putInStore(STORES.PREFERENCES, { key: 'lastOfflineSyncAt', value: iso });
}

export async function getAutoSyncIntervalMinutes(): Promise<AutoSyncIntervalMinutes> {
  try {
    const entry = await getByKey<PreferenceEntry>(STORES.PREFERENCES, 'autoSyncIntervalMinutes');
    const val = Number(entry?.value);
    if (val === 15 || val === 30 || val === 60 || val === 180) {
      return val;
    }
  } catch {
    // Ignore storage read errors
  }
  return 30;
}

export async function saveAutoSyncIntervalMinutes(minutes: AutoSyncIntervalMinutes): Promise<void> {
  await putInStore(STORES.PREFERENCES, { key: 'autoSyncIntervalMinutes', value: minutes });
}

export async function getLastAutoUpdateAt(): Promise<string | null> {
  try {
    const entry = await getByKey<PreferenceEntry>(STORES.PREFERENCES, 'lastAutoUpdateAt');
    return typeof entry?.value === 'string' ? entry.value : null;
  } catch {
    return null;
  }
}

export async function saveLastAutoUpdateAt(iso: string): Promise<void> {
  await putInStore(STORES.PREFERENCES, { key: 'lastAutoUpdateAt', value: iso });
}

export async function syncPendingOfflineRecords(): Promise<{ syncedFeedback: number }> {
  let syncedFeedback = 0;

  const feedbackList = await getFeedbackList();
  for (const fb of feedbackList) {
    if (fb.syncStatus === 'pending') {
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fb),
        });
        if (res.ok) {
          await putInStore(STORES.FEEDBACK_QUEUE, { ...fb, syncStatus: 'synced' });
          syncedFeedback += 1;
        }
      } catch {
        // Still offline or network error
      }
    }
  }

  return { syncedFeedback };
}

export async function getOfflineDbStats(): Promise<OfflineDbStats> {
  const [tips, diagnoses, yieldPredictions, pendingScans, weather, audio, lastSyncAt] = await Promise.all([
    getAllFromStore<CropTip>(STORES.CROP_TIPS),
    getAllFromStore<DiseaseDiagnosis>(STORES.DIAGNOSES),
    getAllFromStore<YieldPredictionRecord>(STORES.YIELD_PREDICTIONS),
    getAllFromStore<OfflinePendingScan>(STORES.PENDING_SCANS),
    getWeatherCache(),
    getAllFromStore<AudioCacheEntry>(STORES.AUDIO_CACHE),
    getLastOfflineSyncAt(),
  ]);

  const pendingScansCount = pendingScans.length;
  const pendingSyncCount = pendingScansCount;

  return {
    cropTipsCount: tips.length,
    diagnosesCount: diagnoses.length,
    yieldPredictionsCount: yieldPredictions.length,
    pendingScansCount,
    pendingSyncCount,
    audioCachedCount: audio.length,
    hasWeatherCache: Boolean(weather),
    lastSyncAt,
  };
}

export async function estimateFallbackBytes(): Promise<number> {
  const [tips, diagnoses, yieldPredictions, pendingScans, weather, audio] = await Promise.all([
    getAllFromStore<CropTip>(STORES.CROP_TIPS),
    getAllFromStore<DiseaseDiagnosis>(STORES.DIAGNOSES),
    getAllFromStore<YieldPredictionRecord>(STORES.YIELD_PREDICTIONS),
    getAllFromStore<OfflinePendingScan>(STORES.PENDING_SCANS),
    getWeatherCache(),
    getAllFromStore<AudioCacheEntry>(STORES.AUDIO_CACHE),
  ]);
  try {
    return new Blob([
      JSON.stringify({ tips, diagnoses, yieldPredictions, pendingScans, weather, audio }),
    ]).size;
  } catch {
    return 0;
  }
}

export async function exportAllOfflineData(): Promise<string> {
  const [tips, diagnoses, yieldPredictions, pendingScans, weather, pestRadar, language] = await Promise.all([
    getCropTips(),
    getDiagnoses(),
    getYieldPredictions(),
    getPendingScans(),
    getWeatherCache(),
    getCachedPestRadar(),
    getSavedLanguage(),
  ]);

  return JSON.stringify(
    {
      schemaVersion: 4,
      exportedAt: new Date().toISOString(),
      app: 'Krishi Mitra Offline Backup',
      language,
      weather,
      pestRadar,
      cropTips: tips,
      diagnoses,
      yieldPredictions,
      pendingScans,
    },
    null,
    2
  );
}
