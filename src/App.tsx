import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Calendar,
  Camera,
  CheckCircle2,
  Circle,
  CloudRain,
  CloudSun,
  Database,
  Droplets,
  Globe,
  MapPin,
  Radar,
  ShieldCheck,
  Sprout,
  Volume2,
  Wifi,
  WifiOff,
  Wind,
  X,
} from 'lucide-react';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { Header } from './components/Header';
import { PWAInstallButton } from './components/PWAInstallButton';
import { VisitorGreetingBanner } from './components/VisitorGreetingBanner';
import { WeatherAlertSection } from './components/WeatherAlertSection';
import { getTimeSlotFieldAdvisory } from './catalog/agroAdvisoryData';
import { CROP_CALENDAR_DATA } from './catalog/cropCalendarData';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';

const CropCalendarSection = lazy(() =>
  import('./components/CropCalendarSection').then((m) => ({ default: m.CropCalendarSection }))
);
const DiseaseScannerSection = lazy(() =>
  import('./components/DiseaseScannerSection').then((m) => ({ default: m.DiseaseScannerSection }))
);
const YieldAndPestIntelligenceSection = lazy(() =>
  import('./components/YieldAndPestIntelligenceSection').then((m) => ({
    default: m.YieldAndPestIntelligenceSection,
  }))
);
const CropTipsSection = lazy(() =>
  import('./components/CropTipsSection').then((m) => ({ default: m.CropTipsSection }))
);
const OfflineSyncDrawer = lazy(() =>
  import('./components/OfflineSyncDrawer').then((m) => ({ default: m.OfflineSyncDrawer }))
);
const AgroServiceHubSection = lazy(() =>
  import('./components/AgroServiceHubSection').then((m) => ({ default: m.AgroServiceHubSection }))
);

const SectionSkeleton: React.FC = () => (
  <div className="border-b border-zinc-200 bg-[#F4F5F2] py-10 sm:py-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="h-7 w-56 animate-pulse rounded-lg bg-zinc-200" />
      <div className="mt-4 h-44 w-full animate-pulse rounded-xl bg-zinc-200/70" />
    </div>
  </div>
);
import { LANGUAGE_OPTIONS, TRANSLATIONS } from './catalog/i18n';
import { DISTRICT_PRESETS } from './catalog/seedData';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { runFullOfflineSync } from './lib/offlineArchitecture';
import {
  appendNotificationLog,
  getAutoSyncIntervalMinutes,
  getCachedVisitorStats,
  getCropTips,
  getDiagnoses,
  getLastAutoUpdateAt,
  getNotificationLogs,
  getOfflineDbStats,
  getOrCreateVisitorId,
  getPendingScans,
  getSavedLanguage,
  getSavedPushEnabled,
  getWeatherCache,
  initializeOfflineDatabase,
  saveAutoSyncIntervalMinutes,
  saveCachedVisitorStats,
  saveLanguagePreference,
  saveLastAutoUpdateAt,
  savePushEnabled,
  toggleCropTipBookmark,
} from './lib/offlineDb';
import {
  describeWeatherCode,
  dispatchWeatherPushNotification,
  fetchLiveWeather,
} from './lib/weatherService';
import {
  AppLanguage,
  AutoSyncIntervalMinutes,
  CropTip,
  DiseaseDiagnosis,
  GeoLocationInfo,
  NavSection,
  OfflineDbStats,
  OfflinePendingScan,
  PushNotificationItem,
  VisitorStats,
  WeatherCacheRecord,
} from './types/agri';

import heroFarmlandImg from './assets/images/hero_farmland_dawn_1795261297830.jpg';

const LOCAL_VISITOR_STATS_KEY = 'krishi_mitra_local_visitor_stats';
const PENDING_VISITOR_HITS_KEY = 'krishi_mitra_pending_visitor_hits';

interface PendingVisitorHit {
  visitorId: string;
  eventId: string;
  createdAt: string;
}

function createVisitorEventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readPendingVisitorHits(): PendingVisitorHit[] {
  try {
    const raw = window.localStorage.getItem(PENDING_VISITOR_HITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is PendingVisitorHit =>
          Boolean(item) &&
          typeof item.visitorId === 'string' &&
          typeof item.eventId === 'string'
      )
      .slice(-50);
  } catch {
    return [];
  }
}

function writePendingVisitorHits(queue: PendingVisitorHit[]): void {
  try {
    if (queue.length === 0) {
      window.localStorage.removeItem(PENDING_VISITOR_HITS_KEY);
    } else {
      window.localStorage.setItem(PENDING_VISITOR_HITS_KEY, JSON.stringify(queue.slice(-50)));
    }
  } catch {
    // Ignore storage quota errors
  }
}

function enqueuePendingVisitorHit(visitorId: string, eventId: string): void {
  const queue = readPendingVisitorHits();
  if (queue.some((item) => item.eventId === eventId)) return;
  queue.push({ visitorId, eventId, createdAt: new Date().toISOString() });
  writePendingVisitorHits(queue);
}

function removePendingVisitorHit(eventId: string): void {
  const queue = readPendingVisitorHits();
  const next = queue.filter((item) => item.eventId !== eventId);
  if (next.length !== queue.length) {
    writePendingVisitorHits(next);
  }
}

const SafeVercelAnalytics: React.FC = () => {
  const [vercelInsightsAvailable, setVercelInsightsAvailable] = useState(false);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.location.protocol === 'file:' ||
      !navigator.onLine
    ) {
      return;
    }

    const host = window.location.hostname.toLowerCase();
    if (host.endsWith('.vercel.app')) {
      setVercelInsightsAvailable(true);
      return;
    }
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.github.io') ||
      host.endsWith('.run.app')
    ) {
      return;
    }

    let cancelled = false;
    fetch('/_vercel/insights/script.js', { method: 'HEAD', cache: 'no-store' })
      .then((res) => {
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (!cancelled && res.ok && !contentType.includes('text/html')) {
          setVercelInsightsAvailable(true);
        }
      })
      .catch(() => {
        // Not hosted on Vercel — avoid triggering 404 analytics errors
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!vercelInsightsAvailable) {
    return null;
  }

  return (
    <Analytics
      beforeSend={(event) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return null;
        }
        return event;
      }}
    />
  );
};

function getOrUpdateLocalVisitorStats(countVisit: boolean): VisitorStats {
  const todayKey = new Date().toISOString().slice(0, 10);
  let stored: {
    totalVisits: number;
    todayKey: string;
    todayVisits: number;
    uniqueVisitors: number;
  } = {
    totalVisits: 0,
    todayKey,
    todayVisits: 0,
    uniqueVisitors: 1,
  };

  try {
    const raw = window.localStorage.getItem(LOCAL_VISITOR_STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        stored = {
          totalVisits: Number(parsed.totalVisits) || 0,
          todayKey: typeof parsed.todayKey === 'string' ? parsed.todayKey : todayKey,
          todayVisits: parsed.todayKey === todayKey ? Number(parsed.todayVisits) || 0 : 0,
          uniqueVisitors: Math.max(1, Number(parsed.uniqueVisitors) || 1),
        };
      }
    }
  } catch {
    // Ignore storage access errors
  }

  if (countVisit) {
    stored.totalVisits += 1;
    stored.todayVisits += 1;
    stored.todayKey = todayKey;
    try {
      window.localStorage.setItem(LOCAL_VISITOR_STATS_KEY, JSON.stringify(stored));
    } catch {
      // Ignore storage quota errors
    }
  } else if (stored.totalVisits === 0) {
    stored.totalVisits = 1;
    stored.todayVisits = 1;
  }

  const total = Math.max(1, stored.totalVisits);
  const unique = Math.min(total, Math.max(1, stored.uniqueVisitors));
  return {
    totalVisits: total,
    todayVisits: Math.max(1, stored.todayVisits),
    uniqueVisitors: unique,
    todayUniqueVisitors: 1,
    returningVisits: Math.max(0, total - unique),
    avgViewsPerVisitor: Math.round((total / unique) * 10) / 10,
    activeNow: 1,
    lastVisitAt: new Date().toISOString(),
  };
}

const KrishiAppContent: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { currentTrack, playTrack } = useAudioPlayer();

  // মূল অ্যাপের স্টেটসমূহ (সহজে বোঝার জন্য আলাদা আলাদা রাখা হয়েছে)
  const [lang, setLang] = useState<AppLanguage>('bn');
  const [activeSection, setActiveSection] = useState<NavSection>('weather');
  const [weather, setWeather] = useState<WeatherCacheRecord | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [tips, setTips] = useState<CropTip[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiseaseDiagnosis[]>([]);
  const [pendingScans, setPendingScans] = useState<OfflinePendingScan[]>([]);
  const [dbStats, setDbStats] = useState<OfflineDbStats>({
    cropTipsCount: 0,
    diagnosesCount: 0,
    yieldPredictionsCount: 0,
    pendingScansCount: 0,
    pendingSyncCount: 0,
    audioCachedCount: 0,
    hasWeatherCache: false,
    lastSyncAt: null,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<PushNotificationItem[]>([]);
  const [activeToast, setActiveToast] = useState<PushNotificationItem | null>(null);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [isLiveVisitorsConnected, setIsLiveVisitorsConnected] = useState(false);
  const [isRefreshingVisitors, setIsRefreshingVisitors] = useState(false);
  const [autoSyncIntervalMinutes, setAutoSyncIntervalMinutes] = useState<AutoSyncIntervalMinutes>(30);
  const [lastAutoUpdateAt, setLastAutoUpdateAt] = useState<string | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [activeCropId, setActiveCropId] = useState<string>(() => {
    try {
      return window.localStorage.getItem('krishi_mitra_active_crop_id') || CROP_CALENDAR_DATA[0].id;
    } catch {
      return CROP_CALENDAR_DATA[0].id;
    }
  });
  const [activeCropSowDate, setActiveCropSowDate] = useState<string>(() => {
    try {
      return window.localStorage.getItem('krishi_mitra_active_sow_date') || new Date().toISOString().slice(0, 10);
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  });
  const [cropViewMode, setCropViewMode] = useState<'directory' | 'crop-page'>('directory');
  const [completedStageKeys, setCompletedStageKeys] = useState<Record<string, boolean>>(() => {
    try {
      const raw = window.localStorage.getItem('krishi_mitra_completed_stages');
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const [completedDailyTasks, setCompletedDailyTasks] = useState<Record<string, boolean>>(() => {
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const raw = window.localStorage.getItem(`krishi_mitra_daily_tasks_${todayKey}`);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  const dispatchedAlertKeysRef = useRef<Set<string>>(new Set());
  const toastTimerRef = useRef<number | null>(null);
  const visitRecordedRef = useRef(false);
  const sessionEventIdRef = useRef<string>(createVisitorEventId());
  const activeVisitorIdRef = useRef<string | null>(null);
  const autoRefreshInFlightRef = useRef(false);
  const visitorWsRef = useRef<WebSocket | null>(null);
  const visitorWsPingRef = useRef<number | null>(null);
  const visitorWsReconnectRef = useRef<number | null>(null);
  const visitorWsSupportedRef = useRef(false);
  const visitorWsAttemptRef = useRef(0);

  const t = TRANSLATIONS[lang];

  const refreshStats = useCallback(async () => {
    const stats = await getOfflineDbStats();
    setDbStats(stats);
  }, []);

  const showToastNotification = useCallback((item: PushNotificationItem) => {
    setActiveToast(item);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setActiveToast((curr) => (curr?.id === item.id ? null : curr));
    }, 7000);
  }, []);

  const handleSendPushAlert = useCallback(
    async (
      title: string,
      body: string,
      level: 'warning' | 'danger' | 'info' = 'info'
    ) => {
      const { osDelivered } = await dispatchWeatherPushNotification(title, body);
      const item: PushNotificationItem = {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title,
        body,
        level,
        deliveredViaOs: osDelivered,
        createdAt: new Date().toISOString(),
      };
      const nextLogs = await appendNotificationLog(item);
      setNotificationLogs(nextLogs);
      showToastNotification(item);
    },
    [showToastNotification]
  );

  const handleTogglePush = useCallback(
    async (enable: boolean): Promise<{ osGranted: boolean }> => {
      if (!enable) {
        setPushEnabled(false);
        await savePushEnabled(false);
        setActiveToast(null);
        return { osGranted: false };
      }

      let osGranted = false;
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission === 'granted') {
            osGranted = true;
          } else if (Notification.permission !== 'denied') {
            const perm = await Notification.requestPermission();
            osGranted = perm === 'granted';
          }
        } catch {
          osGranted = false;
        }
      }

      setPushEnabled(true);
      await savePushEnabled(true);

      const currentLang = lang;
      const topAlert = weather?.alerts[0];
      const title = topAlert
        ? topAlert.title[currentLang]
        : `${TRANSLATIONS[currentLang].brandName} · ${weather?.location.districtName ?? ''}`;
      const body = topAlert
        ? `${topAlert.message[currentLang]} ${topAlert.advice[currentLang]}`
        : weather
        ? `${weather.location.districtName}: ${weather.temperature}°C, ${describeWeatherCode(
            weather.weatherCode,
            currentLang
          )}`
        : TRANSLATIONS[currentLang].weather.pushInAppActive;

      await handleSendPushAlert(title, body, topAlert?.level ?? 'info');
      return { osGranted };
    },
    [handleSendPushAlert, lang, weather]
  );

  // অ্যাপ চালু হলে প্রথমে অফলাইন ডাটাবেজ ও লাইভ আবহাওয়া লোড হয়
  const loadInitialData = useCallback(async () => {
    await initializeOfflineDatabase();
    const [
      savedLang,
      savedPush,
      savedLogs,
      cachedVisitors,
      loadedTips,
      loadedDiagnoses,
      loadedPendingScans,
      cachedWeather,
      savedAutoInterval,
      savedLastAutoUpdate,
    ] = await Promise.all([
      getSavedLanguage(),
      getSavedPushEnabled(),
      getNotificationLogs(),
      getCachedVisitorStats(),
      getCropTips(),
      getDiagnoses(),
      getPendingScans(),
      getWeatherCache(),
      getAutoSyncIntervalMinutes(),
      getLastAutoUpdateAt(),
    ]);

    setLang(savedLang);
    setPushEnabled(savedPush);
    setNotificationLogs(savedLogs);
    if (cachedVisitors) {
      setVisitorStats(cachedVisitors);
    }
    setTips(loadedTips);
    setDiagnoses(loadedDiagnoses);
    setPendingScans(loadedPendingScans);
    setAutoSyncIntervalMinutes(savedAutoInterval);
    if (savedLastAutoUpdate) {
      setLastAutoUpdateAt(savedLastAutoUpdate);
    }

    if (cachedWeather) {
      setWeather(cachedWeather);
      setIsWeatherLoading(false);
    }

    const defaultLoc: GeoLocationInfo = cachedWeather?.location ?? {
      lat: DISTRICT_PRESETS[0].lat,
      lon: DISTRICT_PRESETS[0].lon,
      districtName: DISTRICT_PRESETS[0].name[savedLang],
      regionName: DISTRICT_PRESETS[0].region[savedLang],
      source: 'manual',
      detectedMethod: 'manual',
      updatedAt: new Date().toISOString(),
    };

    const freshWeather = await fetchLiveWeather(defaultLoc);
    setWeather(freshWeather);
    setIsWeatherLoading(false);

    if (navigator.onLine) {
      const nowIso = new Date().toISOString();
      setLastAutoUpdateAt(nowIso);
      await saveLastAutoUpdateAt(nowIso);

      // রিলায়েবল ভিজিটর ও ভিউ ট্র্যাকিং (idempotent eventId + keepalive + ব্যর্থ হলে কিউ রিট্রাই)
      try {
        const visitorId = await getOrCreateVisitorId();
        activeVisitorIdRef.current = visitorId;
        const eventId = sessionEventIdRef.current;

        // পূর্বে ব্যর্থ/অফলাইন কোনো হিট কিউতে থাকলে আগে ফ্লাশ করা
        const queuedHits = readPendingVisitorHits();
        for (const pending of queuedHits) {
          if (pending.eventId === eventId) continue;
          try {
            const qRes = await fetch('/api/visitors/hit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              keepalive: true,
              body: JSON.stringify({
                visitorId: pending.visitorId,
                countVisit: true,
                eventId: pending.eventId,
              }),
            });
            if (qRes.ok) {
              removePendingVisitorHit(pending.eventId);
            }
          } catch {
            break;
          }
        }

        const countThisVisit = !visitRecordedRef.current;
        const visRes = await fetch('/api/visitors/hit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            visitorId,
            countVisit: countThisVisit,
            eventId,
          }),
        });

        if (visRes.ok) {
          visitRecordedRef.current = true;
          removePendingVisitorHit(eventId);
          const vData = (await visRes.json()) as VisitorStats;
          setVisitorStats(vData);
          await saveCachedVisitorStats(vData);
          visitorWsSupportedRef.current = true;
          window.dispatchEvent(new CustomEvent('krishi-visitors-ready', { detail: { visitorId } }));
        } else {
          if (countThisVisit) {
            enqueuePendingVisitorHit(visitorId, eventId);
          }
          const localStats = getOrUpdateLocalVisitorStats(false);
          setVisitorStats(localStats);
          await saveCachedVisitorStats(localStats);
        }
      } catch {
        const visitorId = activeVisitorIdRef.current || (await getOrCreateVisitorId());
        activeVisitorIdRef.current = visitorId;
        if (!visitRecordedRef.current) {
          enqueuePendingVisitorHit(visitorId, sessionEventIdRef.current);
        }
        const localStats = getOrUpdateLocalVisitorStats(false);
        setVisitorStats(localStats);
      }
    } else {
      const visitorId = await getOrCreateVisitorId();
      activeVisitorIdRef.current = visitorId;
      if (!visitRecordedRef.current) {
        enqueuePendingVisitorHit(visitorId, sessionEventIdRef.current);
        visitRecordedRef.current = true;
      }
      const localStats = getOrUpdateLocalVisitorStats(true);
      setVisitorStats(localStats);
    }

    await refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    loadInitialData();
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [loadInitialData]);

  // পেজ দ্রুত বন্ধ বা ট্যাব পরিবর্তনের সময় অসমাপ্ত ভিজিট হিট sendBeacon দিয়ে নিরাপদে পাঠানো
  useEffect(() => {
    const flushViaBeaconOnHide = () => {
      if (visitRecordedRef.current || !navigator.onLine) return;
      const visitorId = activeVisitorIdRef.current;
      if (!visitorId) return;
      const payload = JSON.stringify({
        visitorId,
        countVisit: true,
        eventId: sessionEventIdRef.current,
      });
      try {
        if (typeof navigator.sendBeacon === 'function') {
          const sent = navigator.sendBeacon(
            '/api/visitors/hit',
            new Blob([payload], { type: 'application/json' })
          );
          if (sent) {
            visitRecordedRef.current = true;
            removePendingVisitorHit(sessionEventIdRef.current);
            return;
          }
        }
        enqueuePendingVisitorHit(visitorId, sessionEventIdRef.current);
      } catch {
        enqueuePendingVisitorHit(visitorId, sessionEventIdRef.current);
      }
    };

    window.addEventListener('pagehide', flushViaBeaconOnHide);
    return () => window.removeEventListener('pagehide', flushViaBeaconOnHide);
  }, []);

  const refreshVisitorStats = useCallback(async () => {
    if (!navigator.onLine) {
      const localStats = getOrUpdateLocalVisitorStats(false);
      setVisitorStats(localStats);
      return;
    }
    setIsRefreshingVisitors(true);
    try {
      const visitorId = await getOrCreateVisitorId();
      activeVisitorIdRef.current = visitorId;

      // কিউতে থাকা অফলাইন বা ব্যর্থ ভিজিটগুলো আগে সার্ভারে ফ্লাশ করা
      const queuedHits = readPendingVisitorHits();
      for (const pending of queuedHits) {
        try {
          const qRes = await fetch('/api/visitors/hit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            body: JSON.stringify({
              visitorId: pending.visitorId,
              countVisit: true,
              eventId: pending.eventId,
            }),
          });
          if (qRes.ok) {
            removePendingVisitorHit(pending.eventId);
            if (pending.eventId === sessionEventIdRef.current) {
              visitRecordedRef.current = true;
            }
          }
        } catch {
          break;
        }
      }

      const countThisVisit = !visitRecordedRef.current;
      const res = await fetch('/api/visitors/hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          visitorId,
          countVisit: countThisVisit,
          eventId: sessionEventIdRef.current,
        }),
      });
      if (res.ok) {
        visitRecordedRef.current = true;
        removePendingVisitorHit(sessionEventIdRef.current);
        const vData = (await res.json()) as VisitorStats;
        setVisitorStats(vData);
        await saveCachedVisitorStats(vData);
      } else {
        const localStats = getOrUpdateLocalVisitorStats(false);
        setVisitorStats(localStats);
        await saveCachedVisitorStats(localStats);
      }
    } catch {
      const localStats = getOrUpdateLocalVisitorStats(false);
      setVisitorStats(localStats);
    } finally {
      setIsRefreshingVisitors(false);
    }
  }, []);

  useEffect(() => {
    if (!isOnline || typeof window === 'undefined' || window.location.protocol === 'file:') {
      setIsLiveVisitorsConnected(false);
      return;
    }

    let disposed = false;

    const cleanupSocket = () => {
      if (visitorWsPingRef.current) {
        window.clearInterval(visitorWsPingRef.current);
        visitorWsPingRef.current = null;
      }
      if (visitorWsReconnectRef.current) {
        window.clearTimeout(visitorWsReconnectRef.current);
        visitorWsReconnectRef.current = null;
      }
      if (visitorWsRef.current) {
        visitorWsRef.current.onopen = null;
        visitorWsRef.current.onmessage = null;
        visitorWsRef.current.onerror = null;
        visitorWsRef.current.onclose = null;
        visitorWsRef.current.close();
        visitorWsRef.current = null;
      }
    };

    const connectWs = async () => {
      if (disposed || !visitorWsSupportedRef.current) return;
      if (visitorWsRef.current && visitorWsRef.current.readyState === WebSocket.OPEN) return;

      const visitorId = await getOrCreateVisitorId();
      if (disposed) return;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/visitors?visitorId=${encodeURIComponent(
        visitorId
      )}`;

      try {
        const socket = new WebSocket(wsUrl);
        visitorWsRef.current = socket;

        socket.onopen = () => {
          if (disposed) {
            socket.close();
            return;
          }
          visitorWsAttemptRef.current = 0;
          setIsLiveVisitorsConnected(true);
          if (visitorWsPingRef.current) {
            window.clearInterval(visitorWsPingRef.current);
          }
          visitorWsPingRef.current = window.setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'ping' }));
            }
          }, 25000);
        };

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(String(event.data));
            if (parsed?.type === 'visitors:update' && parsed.stats) {
              const incoming = parsed.stats as VisitorStats;
              setVisitorStats(incoming);
              saveCachedVisitorStats(incoming).catch(() => {});
            }
          } catch {
            // Ignore non-JSON frame
          }
        };

        socket.onerror = () => {
          setIsLiveVisitorsConnected(false);
        };

        socket.onclose = () => {
          setIsLiveVisitorsConnected(false);
          if (visitorWsPingRef.current) {
            window.clearInterval(visitorWsPingRef.current);
            visitorWsPingRef.current = null;
          }
          if (!disposed && navigator.onLine && visitorWsAttemptRef.current < 5) {
            const delay = Math.min(30000, 3000 * Math.pow(2, visitorWsAttemptRef.current));
            visitorWsAttemptRef.current += 1;
            visitorWsReconnectRef.current = window.setTimeout(() => {
              connectWs();
            }, delay);
          }
        };
      } catch {
        setIsLiveVisitorsConnected(false);
      }
    };

    const handleReady = () => {
      connectWs();
    };
    window.addEventListener('krishi-visitors-ready', handleReady);
    if (visitorWsSupportedRef.current) {
      connectWs();
    }

    const fallbackInterval = window.setInterval(() => {
      if (!visitorWsRef.current || visitorWsRef.current.readyState !== WebSocket.OPEN) {
        refreshVisitorStats();
      }
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (visitorWsRef.current?.readyState === WebSocket.OPEN) {
          visitorWsRef.current.send(JSON.stringify({ type: 'ping' }));
        } else {
          refreshVisitorStats();
          if (visitorWsSupportedRef.current) {
            connectWs();
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      disposed = true;
      window.removeEventListener('krishi-visitors-ready', handleReady);
      window.clearInterval(fallbackInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      cleanupSocket();
      setIsLiveVisitorsConnected(false);
    };
  }, [isOnline, refreshVisitorStats]);

  useEffect(() => {
    if (!pushEnabled || !weather || weather.alerts.length === 0) return;
    const criticalAlert =
      weather.alerts.find((a) => a.level === 'danger') ||
      weather.alerts.find((a) => a.level === 'warning');
    if (!criticalAlert) return;

    const alertKey = `${weather.location.districtName}:${criticalAlert.id}`;
    if (dispatchedAlertKeysRef.current.has(alertKey)) return;
    dispatchedAlertKeysRef.current.add(alertKey);

    handleSendPushAlert(
      `${criticalAlert.title[lang]} · ${weather.location.districtName}`,
      `${criticalAlert.message[lang]} ${criticalAlert.advice[lang]}`,
      criticalAlert.level
    );
  }, [pushEnabled, weather, lang, handleSendPushAlert]);

  const reloadAllFromIndexedDb = useCallback(async () => {
    const [loadedTips, loadedDiagnoses, loadedPendingScans, cachedWeather] =
      await Promise.all([
        getCropTips(),
        getDiagnoses(),
        getPendingScans(),
        getWeatherCache(),
      ]);
    setTips(loadedTips);
    setDiagnoses(loadedDiagnoses);
    setPendingScans(loadedPendingScans);
    if (cachedWeather) {
      setWeather(cachedWeather);
    } else if (weather) {
      setWeather({ ...weather });
    }
    await refreshStats();
  }, [refreshStats, weather]);

  const handleSyncAll = useCallback(
    async (processScans = false) => {
      if (!isOnline) return;
      setIsSyncing(true);
      try {
        const result = await runFullOfflineSync({ processScans, weather });
        setDiagnoses(result.diagnoses);
        setPendingScans(result.pendingScans);
        await refreshStats();
      } finally {
        setIsSyncing(false);
      }
    },
    [isOnline, refreshStats, weather]
  );

  // লাইভ সময়সূচি ও কাউন্টডাউন প্রতি ৩০ সেকেন্ডে আপডেট হবে
  useEffect(() => {
    const ticker = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30000);
    return () => window.clearInterval(ticker);
  }, []);

  const runScheduledAutoSync = useCallback(async () => {
    if (!navigator.onLine || autoRefreshInFlightRef.current) return;
    autoRefreshInFlightRef.current = true;
    setIsAutoRefreshing(true);

    try {
      const targetLoc: GeoLocationInfo = weather?.location ?? {
        lat: DISTRICT_PRESETS[0].lat,
        lon: DISTRICT_PRESETS[0].lon,
        districtName: DISTRICT_PRESETS[0].name[lang],
        regionName: DISTRICT_PRESETS[0].region[lang],
        source: 'manual',
        detectedMethod: 'manual',
        updatedAt: new Date().toISOString(),
      };

      const [freshWeather] = await Promise.all([
        fetchLiveWeather(targetLoc),
        refreshVisitorStats(),
      ]);
      setWeather(freshWeather);

      try {
        const syncResult = await runFullOfflineSync({ processScans: false, weather: freshWeather });
        setDiagnoses(syncResult.diagnoses);
        setPendingScans(syncResult.pendingScans);
      } catch {
        // ব্যাকগ্রাউন্ড সিঙ্ক ত্রুটি হলে পরবর্তী সাইকেলে আবার চেষ্টা করবে
      }

      const doneIso = new Date().toISOString();
      setLastAutoUpdateAt(doneIso);
      setNowMs(Date.now());
      await saveLastAutoUpdateAt(doneIso);
      await refreshStats();
    } finally {
      autoRefreshInFlightRef.current = false;
      setIsAutoRefreshing(false);
    }
  }, [lang, refreshStats, refreshVisitorStats, weather]);

  const handleChangeAutoSyncInterval = useCallback(async (minutes: AutoSyncIntervalMinutes) => {
    setAutoSyncIntervalMinutes(minutes);
    await saveAutoSyncIntervalMinutes(minutes);
  }, []);

  const lastAutoUpdateMs = lastAutoUpdateAt ? new Date(lastAutoUpdateAt).getTime() : nowMs;
  const nextAutoUpdateMs = lastAutoUpdateMs + autoSyncIntervalMinutes * 60 * 1000;

  useEffect(() => {
    if (!isOnline || isWeatherLoading || !lastAutoUpdateAt) return;
    if (nowMs >= nextAutoUpdateMs) {
      runScheduledAutoSync();
    }
  }, [isOnline, isWeatherLoading, lastAutoUpdateAt, nextAutoUpdateMs, nowMs, runScheduledAutoSync]);

  useEffect(() => {
    const checkStaleAndRefresh = () => {
      if (!navigator.onLine || document.visibilityState === 'hidden') return;
      setNowMs(Date.now());
      const baseline = lastAutoUpdateAt ? new Date(lastAutoUpdateAt).getTime() : 0;
      if (baseline && Date.now() - baseline >= autoSyncIntervalMinutes * 60 * 1000) {
        runScheduledAutoSync();
      }
    };
    window.addEventListener('online', checkStaleAndRefresh);
    document.addEventListener('visibilitychange', checkStaleAndRefresh);
    return () => {
      window.removeEventListener('online', checkStaleAndRefresh);
      document.removeEventListener('visibilitychange', checkStaleAndRefresh);
    };
  }, [autoSyncIntervalMinutes, lastAutoUpdateAt, runScheduledAutoSync]);

  const handleLanguageChange = async (newLang: AppLanguage) => {
    setLang(newLang);
    await saveLanguagePreference(newLang);
    document.documentElement.lang = newLang;
  };

  // মেনুতে ক্লিক করলে এক-পাতার নির্দিষ্ট সেকশনে মসৃণভাবে স্ক্রল করে নিয়ে যাবে
  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectActiveCrop = useCallback((id: string) => {
    setActiveCropId(id);
    try {
      window.localStorage.setItem('krishi_mitra_active_crop_id', id);
    } catch {
      // Ignore storage error
    }
  }, []);

  const handleChangeActiveSowDate = useCallback((dateStr: string) => {
    setActiveCropSowDate(dateStr);
    try {
      window.localStorage.setItem('krishi_mitra_active_sow_date', dateStr);
    } catch {
      // Ignore storage error
    }
  }, []);

  const handleToggleStageComplete = useCallback((cropId: string, dayOffset: number) => {
    setCompletedStageKeys((prev) => {
      const key = `${cropId}:${dayOffset}`;
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem('krishi_mitra_completed_stages', JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }, []);

  const handleToggleDailyTask = useCallback((taskIdx: number) => {
    setCompletedDailyTasks((prev) => {
      const key = String(taskIdx);
      const next = { ...prev, [key]: !prev[key] };
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        window.localStorage.setItem(`krishi_mitra_daily_tasks_${todayKey}`, JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }, []);

  const handleOpenCropDedicatedPage = useCallback(
    (cropId?: string) => {
      if (cropId) {
        handleSelectActiveCrop(cropId);
      }
      setCropViewMode('crop-page');
      setActiveSection('calendar');
      window.setTimeout(() => {
        document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    },
    [handleSelectActiveCrop]
  );

  const handleUpdateLocation = async (loc: GeoLocationInfo) => {
    setIsWeatherLoading(true);
    const updatedWeather = await fetchLiveWeather(loc);
    setWeather(updatedWeather);
    setIsWeatherLoading(false);
    await refreshStats();
  };

  const handleToggleBookmark = async (tipId: string) => {
    const next = await toggleCropTipBookmark(tipId);
    setTips(next);
  };

  const handleHeroBriefingAudio = () => {
    const city = weather?.location.districtName ?? DISTRICT_PRESETS[0].name[lang];
    const hasTemp = typeof weather?.temperature === 'number';
    const hasHumidity = typeof weather?.humidity === 'number';
    const hasAqi = typeof weather?.aqi === 'number';
    const firstAlert = weather?.alerts[0]?.advice[lang] ?? t.weather.noAlerts;

    const weatherPart =
      lang === 'bn'
        ? hasTemp && hasHumidity
          ? `${city} এলাকার তাপমাত্রা ${weather.temperature} ডিগ্রি সেলসিয়াস, আর্দ্রতা ${weather.humidity} শতাংশ${
              hasAqi ? ` এবং বাতাসের মান ${weather.aqi}` : ''
            }।`
          : `${city} এলাকার আবহাওয়া তথ্য লোড হচ্ছে।`
        : lang === 'hi'
        ? hasTemp && hasHumidity
          ? `${city} में तापमान ${weather.temperature} डिग्री सेल्सियस, नमी ${weather.humidity} प्रतिशत${
              hasAqi ? ` और वायु गुणवत्ता ${weather.aqi}` : ''
            } है।`
          : `${city} का मौसम लोड हो रहा है।`
        : hasTemp && hasHumidity
        ? `In ${city}, temperature is ${weather.temperature} degrees Celsius, humidity ${weather.humidity} percent${
            hasAqi ? `, and Air Quality Index ${weather.aqi}` : ''
          }.`
        : `Loading weather briefing for ${city}.`;

    const briefing =
      lang === 'bn'
        ? `আসসালামু আলাইকুম, কৃষি মিত্রে স্বাগতম। ${weatherPart} ${firstAlert}`
        : lang === 'hi'
        ? `अस्सलामु अलैकुम, कृषि मित्र में आपका स्वागत है। ${weatherPart} ${firstAlert}`
        : `Assalamu Alaikum, welcome to Krishi Mitra. ${weatherPart} ${firstAlert}`;

    playTrack({
      id: `hero-briefing-${lang}`,
      title: `${t.brandName} · ${city}`,
      subtitle: t.heroSecondaryCta,
      text: briefing,
      language: lang,
    });
  };

  const hasAudioBar = Boolean(currentTrack);
  const nowDateObj = new Date(nowMs);
  const currentTimeAdvisory = getTimeSlotFieldAdvisory(nowDateObj.getHours(), weather);
  const activeCropItem =
    CROP_CALENDAR_DATA.find((c) => c.id === activeCropId) ?? CROP_CALENDAR_DATA[0];
  const sowParts = activeCropSowDate.split('-').map(Number);
  const sowMid =
    sowParts.length === 3 && sowParts.every((n) => Number.isFinite(n))
      ? new Date(sowParts[0], sowParts[1] - 1, sowParts[2])
      : new Date();
  const todayMid = new Date(
    nowDateObj.getFullYear(),
    nowDateObj.getMonth(),
    nowDateObj.getDate()
  );
  const activeCropElapsedDays = Math.round(
    (todayMid.getTime() - sowMid.getTime()) / (1000 * 60 * 60 * 24)
  );
  const activeCropProgressPct = Math.max(
    4,
    Math.min(
      100,
      Math.round((Math.max(0, activeCropElapsedDays) / activeCropItem.durationDaysMax) * 100)
    )
  );
  const nextActiveMilestone =
    activeCropItem.milestones.find(
      (m) =>
        !completedStageKeys[`${activeCropItem.id}:${m.dayOffset}`] &&
        activeCropElapsedDays < m.dayOffset
    ) ?? activeCropItem.milestones[activeCropItem.milestones.length - 1];

  return (
    <div
      className={`min-h-[100dvh] bg-[#F4F5F2] md:pb-10 ${
        hasAudioBar
          ? 'pb-[calc(10.5rem+env(safe-area-inset-bottom))] md:pb-28'
          : 'pb-[calc(5.25rem+env(safe-area-inset-bottom))]'
      }`}
    >
      {/* উপরের নেভিগেশন ও মোবাইলের নিচের নেভিগেশন বার */}
      <Header t={t} activeSection={activeSection} onNavigate={handleNavigate} />

      {/* তাৎক্ষণিক আবহাওয়া সতর্কতা নোটিফিকেশন বক্স */}
      {activeToast && (
        <div
          role="alert"
          className="fixed left-4 right-4 top-[calc(4.25rem+env(safe-area-inset-top))] z-50 mx-auto max-w-sm rounded-2xl border border-[#2E7D32] bg-white p-4 shadow-lg sm:left-auto"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-[#2E7D32]">
              {activeToast.level === 'danger' || activeToast.level === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              ) : (
                <BellRing className="h-5 w-5 text-[#2E7D32]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-zinc-900">{activeToast.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-700">{activeToast.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              aria-label={t.weather.dismissAlert}
              className="shrink-0 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ১. হিরো ব্যানার */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-[#255D28] text-white">
        {!heroImgError && (
          <img
            src={heroFarmlandImg}
            alt="Sunrise over terraced green rice paddies"
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
            onError={() => setHeroImgError(true)}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A3D1C]/85 via-[#2E5D28]/65 to-[#3F5A20]/35" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-lime-200 drop-shadow-xs">
              {t.heroEyebrow}
            </p>
            <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-4xl text-balance">
              {t.heroTitle}
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-zinc-100 drop-shadow-xs sm:text-base">
              {t.heroSubtitle}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => handleNavigate('scanner')}
                className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#2E7D32] border border-lime-300/40 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#388E3C] text-center"
              >
                <Camera className="h-4 w-4 shrink-0" />
                <span>{t.heroPrimaryCta}</span>
              </button>

              <button
                type="button"
                onClick={handleHeroBriefingAudio}
                className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/45 bg-black/25 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:bg-black/40 text-center"
              >
                <Volume2 className="h-4 w-4 shrink-0" />
                <span>{t.heroSecondaryCta}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ২. ভাষা পরিবর্তন, ইন্টারনেট অবস্থা, অফলাইন ডাটাবেজ ও ইনস্টল টুলবার */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 sm:gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Globe className="h-4 w-4 text-[#2E7D32] shrink-0" />
            <span className="text-xs font-semibold text-zinc-600">{t.status.languageLabel}:</span>
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleLanguageChange(opt.code)}
                  className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    lang === opt.code
                      ? 'bg-white text-[#255D28] font-semibold shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {opt.nativeName}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-[#2E7D32]" />
                  <span className="text-[#255D28]">{t.status.online}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-700" />
                  <span className="text-amber-900">{t.status.offline}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-zinc-300 bg-[#F8F9F7] px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 whitespace-nowrap shrink-0"
            >
              <Database className="h-3.5 w-3.5 text-[#2E7D32]" />
              <span>{t.status.offlineDbButton}</span>
              {dbStats.pendingSyncCount > 0 && (
                <span className="font-mono-tabular text-amber-800">({dbStats.pendingSyncCount})</span>
              )}
            </button>

            <PWAInstallButton t={t} variant="toolbar" />
          </div>
        </div>

        {!isOnline && (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
            {t.status.offlineBanner}
          </div>
        )}
      </div>

      {/* ৩. একক পাতার সম্পূর্ণ ও সুবিন্যস্ত কৃষি ড্যাশবোর্ড */}
      <main>
        {/* ভিজিটর স্বাগত বার্তা ও গ্রিটিং */}
        <VisitorGreetingBanner
          t={t}
          lang={lang}
          districtName={weather?.location.districtName}
          visitorStats={visitorStats}
        />

        {/* প্রধান পর্দার দুটি বড় কার্ড (আবহাওয়া + রানিং টাস্ক) ও ৬টি সেবা মেনু কার্ড */}
        <section
          aria-label={t.home.todayAtGlance}
          className="border-b border-zinc-200 bg-[#F4F5F2] py-6 sm:py-8"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
              {/* বড় কার্ড ১: লাইভ আবহাওয়া ও স্প্রে পূর্বাভাস */}
              <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#2E7D32] to-[#4D6A1F] px-5 py-4 text-white sm:px-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-lime-100">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {weather?.location.districtName ?? DISTRICT_PRESETS[0].name[lang]}
                          {weather?.location.regionName ? ` · ${weather.location.regionName}` : ''}
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-3">
                        <span className="font-mono-tabular text-4xl font-bold tracking-tight sm:text-5xl">
                          {weather ? `${weather.temperature}°C` : '—'}
                        </span>
                        <span className="text-sm font-semibold text-lime-50">
                          {weather
                            ? describeWeatherCode(weather.weatherCode, lang)
                            : t.weather.detectingGps}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleHeroBriefingAudio}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/25 whitespace-nowrap"
                      >
                        <Volume2 className="h-4 w-4 shrink-0" />
                        <span>{t.weather.listenWeather}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl border border-zinc-200 bg-[#F8F9F7] p-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <Droplets className="h-3.5 w-3.5 text-[#2E7D32]" />
                          <span>{t.weather.humidity}</span>
                        </div>
                        <p className="mt-1 font-mono-tabular text-lg font-bold text-zinc-900">
                          {weather ? `${weather.humidity}%` : '—'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-[#F8F9F7] p-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <CloudRain className="h-3.5 w-3.5 text-[#2E7D32]" />
                          <span>{t.home.rainChanceLabel}</span>
                        </div>
                        <p className="mt-1 font-mono-tabular text-lg font-bold text-zinc-900">
                          {weather?.forecast[0] ? `${weather.forecast[0].rainProb}%` : '0%'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-[#F8F9F7] p-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <Wind className="h-3.5 w-3.5 text-[#4D6A1F]" />
                          <span>{t.weather.wind}</span>
                        </div>
                        <p className="mt-1 font-mono-tabular text-lg font-bold text-zinc-900">
                          {weather ? `${weather.windSpeed} km/h` : '—'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-[#F8F9F7] p-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <CloudSun className="h-3.5 w-3.5 text-[#4D6A1F]" />
                          <span>{t.home.airQualityLabel}</span>
                        </div>
                        <p className="mt-1 font-mono-tabular text-lg font-bold text-zinc-900">
                          {weather?.aqi ?? '—'}
                        </p>
                      </div>
                    </div>

                    {weather && weather.forecast.length > 0 && (
                      <div className="grid grid-cols-3 gap-2.5">
                        {weather.forecast.slice(0, 3).map((day) => (
                          <div
                            key={day.date}
                            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs"
                          >
                            <p className="font-semibold text-zinc-700">
                              {new Date(day.date).toLocaleDateString(
                                lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-GB',
                                { weekday: 'short', day: 'numeric' }
                              )}
                            </p>
                            <p className="mt-1 font-mono-tabular text-sm font-bold text-zinc-900">
                              {Math.round(day.tempMin)}°–{Math.round(day.tempMax)}°
                            </p>
                            <p className="mt-0.5 font-mono-tabular text-[11px] text-[#2E7D32] font-medium">
                              {day.rainProb}% {t.weather.rain}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-start gap-2.5 rounded-xl border border-[#2E7D32]/20 bg-[#EEF4EA] p-3.5 text-xs">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                      <div>
                        <p className="font-bold text-[#1F4E23]">
                          {currentTimeAdvisory.spraySafety.headline[lang]}
                        </p>
                        <p className="mt-0.5 leading-relaxed text-zinc-700">
                          {currentTimeAdvisory.spraySafety.reason[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-zinc-200 bg-[#F8F9F7] px-5 py-3.5 sm:px-6">
                  <span className="text-xs font-medium text-zinc-600">
                    {weather?.alerts.length
                      ? `${weather.alerts[0].title[lang]}`
                      : t.weather.noAlerts}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('weather')}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#2E7D32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#256628] whitespace-nowrap shrink-0"
                  >
                    <span>{t.nav.weather}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* বড় কার্ড ২: রানিং টাস্ক ও চলমান ফসলের কাজ */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3.5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#4D6A1F]">
                        {currentTimeAdvisory.timeRangeLabel[lang]}
                      </p>
                      <h2 className="mt-0.5 text-lg font-bold text-zinc-900">
                        {lang === 'bn'
                          ? 'আজকের রানিং টাস্ক ও ফসলের কাজ'
                          : lang === 'hi'
                          ? 'आज के चालू कार्य और फसल स्थिति'
                          : 'Running Tasks & Active Field Work'}
                      </h2>
                    </div>
                    <span className="font-mono-tabular text-xs font-bold text-[#2E7D32]">
                      {Object.values(completedDailyTasks).filter(Boolean).length}/
                      {currentTimeAdvisory.tasks[lang].length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentTimeAdvisory.tasks[lang].map((taskText, idx) => {
                      const done = Boolean(completedDailyTasks[String(idx)]);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleDailyTask(idx)}
                          className={`flex min-h-[44px] w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs sm:text-sm transition-colors ${
                            done
                              ? 'border-[#2E7D32]/30 bg-[#EEF4EA]/70 text-zinc-500 line-through'
                              : 'border-zinc-200 bg-[#F8F9F7] text-zinc-800 hover:border-[#4D6A1F]'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#4D6A1F]" />
                          )}
                          <span className="leading-snug">{taskText}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-[#4D6A1F]/25 bg-[#F8F9F7] p-3.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#4D6A1F]">
                        {lang === 'bn'
                          ? 'চলমান ফসল সময়সূচি'
                          : lang === 'hi'
                          ? 'सक्रिय फसल शेड्यूल'
                          : 'Active Crop Schedule'}
                      </span>
                      <span className="font-mono-tabular font-semibold text-zinc-700">
                        {Math.max(0, activeCropElapsedDays)} / {activeCropItem.durationDaysMax}d
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-bold text-zinc-900">
                      {activeCropItem.cropName[lang]} ·{' '}
                      <span className="font-medium text-zinc-600">
                        {nextActiveMilestone.title[lang]}
                      </span>
                    </p>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full bg-[#4D6A1F]"
                        style={{ width: `${activeCropProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3.5">
                  {pendingScans.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleNavigate('scanner')}
                      className="text-xs font-semibold text-amber-800 hover:underline"
                    >
                      {pendingScans.length} {t.offlineDrawer.pendingScansCount}
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500">
                      {activeCropItem.seasonLabel[lang]}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenCropDedicatedPage(activeCropItem.id)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#4D6A1F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3E5618] whitespace-nowrap"
                  >
                    <span>
                      {lang === 'bn'
                        ? 'ফসলের ধাপভিত্তিক পেজ খুলুন'
                        : lang === 'hi'
                        ? 'फसल का चरण पेज खोलें'
                        : 'Open Crop Stage Page'}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ৬টি মূল কৃষি সেবা কার্ড (এক ক্লিকে সংশ্লিষ্ট সেকশনে স্ক্রল করবে) */}
            <div className="pt-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl text-balance">
                    {t.home.menuHeading}
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-zinc-600">
                    {t.home.menuSubheading}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    id: 'calendar',
                    title: t.home.calendarTitle,
                    desc: t.home.calendarDesc,
                    meta: `${CROP_CALENDAR_DATA.length} ${t.nav.cropsTab}`,
                    icon: <Calendar className="h-5 w-5 text-[#2E7D32]" />,
                    onClick: () => handleNavigate('calendar'),
                  },
                  {
                    id: 'weather',
                    title: t.home.weatherTitle,
                    desc: t.home.weatherDesc,
                    meta: weather
                      ? `${weather.temperature}°C · ${weather.location.districtName}`
                      : t.nav.weather,
                    icon: <CloudSun className="h-5 w-5 text-[#2E7D32]" />,
                    onClick: () => handleNavigate('weather'),
                  },
                  {
                    id: 'scanner',
                    title: t.home.scanTitle,
                    desc: t.home.scanDesc,
                    meta: `${t.scanner.savedHistoryTitle}: ${diagnoses.length}`,
                    icon: <Camera className="h-5 w-5 text-[#2E7D32]" />,
                    onClick: () => handleNavigate('scanner'),
                  },
                  {
                    id: 'yield-radar',
                    title: t.home.yieldRadarTitle,
                    desc: t.home.yieldRadarDesc,
                    meta: `${dbStats.yieldPredictionsCount} · ${t.nav.yieldRadar}`,
                    icon: <Radar className="h-5 w-5 text-[#4D6A1F]" />,
                    onClick: () => handleNavigate('yield-radar'),
                  },
                  {
                    id: 'agro-service',
                    title:
                      lang === 'bn'
                        ? 'দৈনিক মাঠ সহায়ক ও হেল্পলাইন'
                        : lang === 'hi'
                        ? 'दैनिक खेत सलाह और हेल्पलाइन'
                        : 'Daily Field Advisory & Helplines',
                    desc:
                      lang === 'bn'
                        ? 'স্প্রে নিরাপত্তা, সেচের ধাপ ও সরকারি কৃষি হেল্পলাইন নম্বর'
                        : lang === 'hi'
                        ? 'स्प्रे सुरक्षा, सिंचाई चरण और सरकारी कृषि हेल्पलाइन नंबर'
                        : 'Spray safety, critical irrigation stages & farmer helpline numbers',
                    meta: currentTimeAdvisory.timeRangeLabel[lang],
                    icon: <ShieldCheck className="h-5 w-5 text-[#4D6A1F]" />,
                    onClick: () => {
                      setActiveSection('weather');
                      document
                        .getElementById('agro-service')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    },
                  },
                  {
                    id: 'tips',
                    title: t.home.tipsTitle,
                    desc: t.home.tipsDesc,
                    meta: `${tips.length} ${t.nav.tips}`,
                    icon: <Sprout className="h-5 w-5 text-[#4D6A1F]" />,
                    onClick: () => handleNavigate('tips'),
                  },
                ].map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={feature.onClick}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 text-left shadow-xs transition-colors hover:border-[#2E7D32] hover:bg-[#F9FBF8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7D32]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF4EA]">
                          {feature.icon}
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#2E7D32]" />
                      </div>
                      <h3 className="mt-3 text-base font-bold text-zinc-900">{feature.title}</h3>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-600">
                        {feature.desc}
                      </p>
                    </div>

                    <div className="mt-3 flex w-full items-center justify-between gap-2 border-t border-zinc-100 pt-2.5 text-xs">
                      <span className="font-mono-tabular font-medium text-zinc-600">
                        {feature.meta}
                      </span>
                      <span className="font-semibold text-[#2E7D32]">{t.home.openFeature}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* স্মার্ট কৃষি সেবা: দিনের সময়, স্প্রে নিরাপত্তা ও হেল্পলাইন */}
        <Suspense fallback={<SectionSkeleton />}>
          <AgroServiceHubSection
            lang={lang}
            isOnline={isOnline}
            weather={weather}
            nowMs={nowMs}
            autoSyncIntervalMinutes={autoSyncIntervalMinutes}
            lastAutoUpdateAt={lastAutoUpdateAt}
            nextAutoUpdateMs={nextAutoUpdateMs}
            isAutoRefreshing={isAutoRefreshing}
            onChangeAutoSyncInterval={handleChangeAutoSyncInterval}
            onTriggerAutoRefresh={runScheduledAutoSync}
          />
        </Suspense>

        {/* জিপিএস অবস্থান ও আবহাওয়া সতর্কতা */}
        <WeatherAlertSection
          t={t}
          lang={lang}
          weather={weather}
          isLoading={isWeatherLoading}
          pushEnabled={pushEnabled}
          notificationLogs={notificationLogs}
          onUpdateLocation={handleUpdateLocation}
          onTogglePush={handleTogglePush}
          onSendPushAlert={handleSendPushAlert}
        />

        {/* ধাপভিত্তিক ফসল পরামর্শ ও প্রতিটি ফসলের নির্দিষ্ট বিস্তারিত পেজ */}
        <Suspense fallback={<SectionSkeleton />}>
          <CropCalendarSection
            t={t}
            lang={lang}
            selectedCropId={activeCropId}
            onSelectCropId={handleSelectActiveCrop}
            plantingDate={activeCropSowDate}
            onPlantingDateChange={handleChangeActiveSowDate}
            viewMode={cropViewMode}
            onViewModeChange={setCropViewMode}
            completedStageKeys={completedStageKeys}
            onToggleStageComplete={handleToggleStageComplete}
            onOpenTool={(tool) => handleNavigate(tool)}
          />
        </Suspense>

        {/* ক্যামেরায় ফসলের রোগ শনাক্তকরণ */}
        <Suspense fallback={<SectionSkeleton />}>
          <DiseaseScannerSection
            t={t}
            lang={lang}
            isOnline={isOnline}
            weather={weather}
            savedDiagnoses={diagnoses}
            pendingScans={pendingScans}
            onDiagnosesChange={(next) => {
              setDiagnoses(next);
              refreshStats();
            }}
            onPendingScansChange={(next) => {
              setPendingScans(next);
              refreshStats();
            }}
          />
        </Suspense>

        {/* বহু-ধাপ ফলন পূর্বাভাস এআই ও আঞ্চলিক বালাই রাডার */}
        <Suspense fallback={<SectionSkeleton />}>
          <YieldAndPestIntelligenceSection
            lang={lang}
            isOnline={isOnline}
            weather={weather}
            savedDiagnoses={diagnoses}
            onDataChange={refreshStats}
          />
        </Suspense>

        {/* মৌসুমভিত্তিক ফসল পরিচর্যা টিপস */}
        <Suspense fallback={<SectionSkeleton />}>
          <CropTipsSection
            t={t}
            lang={lang}
            tips={tips}
            onToggleBookmark={handleToggleBookmark}
          />
        </Suspense>
      </main>

      {/* ৪. ফুটার */}
      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs sm:text-sm text-zinc-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-zinc-900">{t.brandName}</p>
          <p className="mt-1">{t.heroEyebrow}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm font-medium text-zinc-600">
            <a
              href="#agro-service"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('weather');
                document
                  .getElementById('agro-service')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="hover:text-[#2E7D32] hover:underline underline-offset-4"
            >
              {lang === 'bn' ? 'মাঠ সহায়ক' : lang === 'hi' ? 'खेत सलाह' : 'Field Hub'}
            </a>
            <a
              href="#weather"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('weather');
              }}
              className="hover:text-[#2E7D32] hover:underline underline-offset-4"
            >
              {t.nav.weather}
            </a>
            <a
              href="#calendar"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('calendar');
              }}
              className="hover:text-[#2E7D32] hover:underline underline-offset-4"
            >
              {t.nav.calendar}
            </a>
            <a
              href="#scanner"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('scanner');
              }}
              className="hover:text-[#2E7D32] hover:underline underline-offset-4"
            >
              {t.nav.scanner}
            </a>
            <a
              href="#yield-radar"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('yield-radar');
              }}
              className="hover:text-[#2E7D32] hover:underline underline-offset-4"
            >
              {t.nav.yieldRadar}
            </a>
            <a
              href="#tips"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('tips');
              }}
              className="hover:text-[#2E7D32] hover:underline underline-offset-4"
            >
              {t.nav.tips}
            </a>
          </div>
        </div>
      </footer>

      <AudioPlayerBar t={t} />

      {drawerOpen && (
        <Suspense fallback={null}>
          <OfflineSyncDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            t={t}
            stats={dbStats}
            pendingScans={pendingScans}
            isOnline={isOnline}
            isSyncing={isSyncing}
            onSyncNow={handleSyncAll}
            onDataMutated={reloadAllFromIndexedDb}
          />
        </Suspense>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AudioPlayerProvider>
      <KrishiAppContent />
      <SafeVercelAnalytics />
    </AudioPlayerProvider>
  );
}
