import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Calendar,
  Camera,
  CloudSun,
  Database,
  Globe,
  Sprout,
  Store,
  Volume2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { Header } from './components/Header';
import { PWAInstallButton } from './components/PWAInstallButton';
import { VisitorGreetingBanner } from './components/VisitorGreetingBanner';
import { WeatherAlertSection } from './components/WeatherAlertSection';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';

const CropCalendarSection = lazy(() =>
  import('./components/CropCalendarSection').then((m) => ({ default: m.CropCalendarSection }))
);
const DiseaseScannerSection = lazy(() =>
  import('./components/DiseaseScannerSection').then((m) => ({ default: m.DiseaseScannerSection }))
);
const CropTipsSection = lazy(() =>
  import('./components/CropTipsSection').then((m) => ({ default: m.CropTipsSection }))
);
const MarketPricesSection = lazy(() =>
  import('./components/MarketPricesSection').then((m) => ({ default: m.MarketPricesSection }))
);
const VisitorCounter = lazy(() =>
  import('./components/VisitorCounter').then((m) => ({ default: m.VisitorCounter }))
);
const OfflineSyncDrawer = lazy(() =>
  import('./components/OfflineSyncDrawer').then((m) => ({ default: m.OfflineSyncDrawer }))
);
const AgroServiceHubSection = lazy(() =>
  import('./components/AgroServiceHubSection').then((m) => ({ default: m.AgroServiceHubSection }))
);

const SectionSkeleton: React.FC = () => (
  <div className="border-b border-stone-200 bg-[#F7F8F5] py-10 sm:py-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="h-7 w-56 animate-pulse rounded-lg bg-stone-200" />
      <div className="mt-4 h-44 w-full animate-pulse rounded-xl bg-stone-200/70" />
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
  getMarketPrices,
  getMarketSyncMeta,
  getNotificationLogs,
  getOfflineDbStats,
  getOrCreateVisitorId,
  getPendingScans,
  getSavedLanguage,
  getSavedPushEnabled,
  getWeatherCache,
  initializeOfflineDatabase,
  MarketSyncMeta,
  mergeServerMarketPrices,
  saveAutoSyncIntervalMinutes,
  saveCachedVisitorStats,
  saveLanguagePreference,
  saveLastAutoUpdateAt,
  saveMarketSyncMeta,
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
  MarketPrice,
  NavSection,
  OfflineDbStats,
  OfflinePendingScan,
  PushNotificationItem,
  VisitorStats,
  WeatherCacheRecord,
} from './types/agri';

import heroFarmlandImg from './assets/images/hero_farmland_dawn_1795261297830.jpg';

const LOCAL_VISITOR_STATS_KEY = 'krishi_mitra_local_visitor_stats';

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
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiseaseDiagnosis[]>([]);
  const [pendingScans, setPendingScans] = useState<OfflinePendingScan[]>([]);
  const [dbStats, setDbStats] = useState<OfflineDbStats>({
    cropTipsCount: 0,
    marketPricesCount: 0,
    diagnosesCount: 0,
    pendingScansCount: 0,
    pendingPricesCount: 0,
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
  const [marketSyncMeta, setMarketSyncMeta] = useState<MarketSyncMeta>({ lastSyncAt: null, sources: [] });
  const [autoSyncIntervalMinutes, setAutoSyncIntervalMinutes] = useState<AutoSyncIntervalMinutes>(30);
  const [lastAutoUpdateAt, setLastAutoUpdateAt] = useState<string | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const dispatchedAlertKeysRef = useRef<Set<string>>(new Set());
  const toastTimerRef = useRef<number | null>(null);
  const visitRecordedRef = useRef(false);
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
      loadedPrices,
      loadedDiagnoses,
      loadedPendingScans,
      cachedWeather,
      savedMarketMeta,
      savedAutoInterval,
      savedLastAutoUpdate,
    ] = await Promise.all([
      getSavedLanguage(),
      getSavedPushEnabled(),
      getNotificationLogs(),
      getCachedVisitorStats(),
      getCropTips(),
      getMarketPrices(),
      getDiagnoses(),
      getPendingScans(),
      getWeatherCache(),
      getMarketSyncMeta(),
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
    setPrices(loadedPrices);
    setDiagnoses(loadedDiagnoses);
    setPendingScans(loadedPendingScans);
    setMarketSyncMeta(savedMarketMeta);
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
      try {
        const visitorId = await getOrCreateVisitorId();
        const countThisVisit = !visitRecordedRef.current;
        visitRecordedRef.current = true;
        const [mktRes, visRes] = await Promise.all([
          fetch('/api/market-prices'),
          fetch('/api/visitors/hit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId, countVisit: countThisVisit }),
          }),
        ]);

        if (mktRes.ok) {
          const data = await mktRes.json();
          if (Array.isArray(data.updates) && data.updates.length > 0) {
            const merged = await mergeServerMarketPrices(data.updates);
            setPrices(merged);
          }
          const nextMeta: MarketSyncMeta = {
            lastSyncAt: typeof data.lastAutoRefreshAt === 'string' ? data.lastAutoRefreshAt : savedMarketMeta.lastSyncAt,
            sources: Array.isArray(data.sources) ? data.sources : savedMarketMeta.sources,
          };
          setMarketSyncMeta(nextMeta);
          await saveMarketSyncMeta(nextMeta);
        }

        if (visRes.ok) {
          const vData = (await visRes.json()) as VisitorStats;
          setVisitorStats(vData);
          await saveCachedVisitorStats(vData);
          visitorWsSupportedRef.current = true;
          window.dispatchEvent(new CustomEvent('krishi-visitors-ready', { detail: { visitorId } }));
        } else {
          const localStats = getOrUpdateLocalVisitorStats(countThisVisit);
          setVisitorStats(localStats);
          await saveCachedVisitorStats(localStats);
        }

        const nowIso = new Date().toISOString();
        setLastAutoUpdateAt(nowIso);
        await saveLastAutoUpdateAt(nowIso);
      } catch {
        // অফলাইন বা স্ট্যাটিক হোস্টিং (যেমন GitHub Pages)-এ নিরাপদে লোকাল পরিসংখ্যান দেখাবে
        const localStats = getOrUpdateLocalVisitorStats(visitRecordedRef.current);
        setVisitorStats(localStats);
      }
    } else {
      const localStats = getOrUpdateLocalVisitorStats(!visitRecordedRef.current);
      visitRecordedRef.current = true;
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

  const refreshVisitorStats = useCallback(async () => {
    if (!navigator.onLine) {
      const localStats = getOrUpdateLocalVisitorStats(false);
      setVisitorStats(localStats);
      return;
    }
    setIsRefreshingVisitors(true);
    try {
      const visitorId = await getOrCreateVisitorId();
      const res = await fetch('/api/visitors/hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, countVisit: false }),
      });
      if (res.ok) {
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
    const [loadedTips, loadedPrices, loadedDiagnoses, loadedPendingScans, cachedWeather] =
      await Promise.all([
        getCropTips(),
        getMarketPrices(),
        getDiagnoses(),
        getPendingScans(),
        getWeatherCache(),
      ]);
    setTips(loadedTips);
    setPrices(loadedPrices);
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
        setPrices(result.prices);
        setDiagnoses(result.diagnoses);
        setPendingScans(result.pendingScans);
        await refreshStats();
      } finally {
        setIsSyncing(false);
      }
    },
    [isOnline, refreshStats, weather]
  );

  useEffect(() => {
    if (isOnline && dbStats.pendingPricesCount > 0) {
      handleSyncAll(false);
    }
  }, [isOnline, dbStats.pendingPricesCount, handleSyncAll]);

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
        const mktRes = await fetch('/api/market-prices');
        if (mktRes.ok) {
          const data = await mktRes.json();
          if (Array.isArray(data.updates) && data.updates.length > 0) {
            const merged = await mergeServerMarketPrices(data.updates);
            setPrices(merged);
          }
          const nextMeta: MarketSyncMeta = {
            lastSyncAt:
              typeof data.lastAutoRefreshAt === 'string'
                ? data.lastAutoRefreshAt
                : marketSyncMeta.lastSyncAt,
            sources: Array.isArray(data.sources) ? data.sources : marketSyncMeta.sources,
          };
          setMarketSyncMeta(nextMeta);
          await saveMarketSyncMeta(nextMeta);
        }
      } catch {
        // স্ট্যাটিক হোস্টিংয়ে মৃদুভাবে স্কিপ করবে
      }

      try {
        const syncResult = await runFullOfflineSync({ processScans: false, weather: freshWeather });
        setPrices(syncResult.prices);
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
  }, [lang, marketSyncMeta.lastSyncAt, marketSyncMeta.sources, refreshStats, refreshVisitorStats, weather]);

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

  // মেনুতে ক্লিক করলে নির্দিষ্ট সেকশনে মসৃণভাবে স্ক্রল করে নিয়ে যাবে
  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    const samplePrice = prices[0];
    const priceLine = samplePrice
      ? lang === 'bn'
        ? `আজকের বাজারে ${samplePrice.cropNameBn} প্রতি কেজি ${samplePrice.pricePerKg} টাকা।`
        : lang === 'hi'
        ? `आज मंडी में ${samplePrice.cropNameHi} ${samplePrice.pricePerKg} प्रति किलो है।`
        : `Today at ${samplePrice.marketName}, ${samplePrice.cropNameEn} is ${samplePrice.pricePerKg} per kg.`
      : '';

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
        ? `আসসালামু আলাইকুম, কৃষি মিত্রে স্বাগতম। ${weatherPart} ${firstAlert} ${priceLine}`
        : lang === 'hi'
        ? `अस्सलामु अलैकुम, कृषि मित्र में आपका स्वागत है। ${weatherPart} ${firstAlert} ${priceLine}`
        : `Assalamu Alaikum, welcome to Krishi Mitra. ${weatherPart} ${firstAlert} ${priceLine}`;

    playTrack({
      id: `hero-briefing-${lang}`,
      title: `${t.brandName} · ${city}`,
      subtitle: t.heroSecondaryCta,
      text: briefing,
      language: lang,
    });
  };

  const hasAudioBar = Boolean(currentTrack);

  return (
    <div
      className={`min-h-[100dvh] bg-[#F7F8F5] md:pb-10 ${
        hasAudioBar
          ? 'pb-[calc(10.5rem+env(safe-area-inset-bottom))] md:pb-28'
          : 'pb-[calc(5.25rem+env(safe-area-inset-bottom))]'
      }`}
    >
      {/* উপরের নেভিগেশন ও মোবাইলের নিচের ট্যাব বার */}
      <Header t={t} activeSection={activeSection} onNavigate={handleNavigate} />

      {/* তাৎক্ষণিক আবহাওয়া সতর্কতা নোটিফিকেশন বক্স */}
      {activeToast && (
        <div
          role="alert"
          className="fixed left-4 right-4 top-[calc(4.25rem+env(safe-area-inset-top))] z-50 mx-auto max-w-sm rounded-xl border border-emerald-800 bg-white p-4 shadow-lg sm:left-auto"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-emerald-900">
              {activeToast.level === 'danger' || activeToast.level === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              ) : (
                <BellRing className="h-5 w-5 text-emerald-800" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-stone-900">{activeToast.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-700">{activeToast.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              aria-label={t.weather.dismissAlert}
              className="shrink-0 rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ১. আসসালামু আলাইকুম ও প্রধান হিরো ব্যানার */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-emerald-950 text-white">
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
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/65 via-stone-950/35 to-stone-950/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-200 drop-shadow-xs">{t.heroEyebrow}</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl text-balance">
              {t.heroTitle}
            </h1>
            <p className="mt-3 sm:mt-4 max-w-2xl text-sm leading-relaxed text-stone-100 drop-shadow-xs sm:text-base">
              {t.heroSubtitle}
            </p>

            <div className="mt-6 sm:mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => handleNavigate('scanner')}
                className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 text-center"
              >
                <Camera className="h-4 w-4 shrink-0" />
                <span>{t.heroPrimaryCta}</span>
              </button>

              <button
                type="button"
                onClick={handleHeroBriefingAudio}
                className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/40 bg-stone-950/35 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:bg-stone-950/55 text-center"
              >
                <Volume2 className="h-4 w-4 shrink-0" />
                <span>{t.heroSecondaryCta}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ২. ভাষা পরিবর্তন, ইন্টারনেট অবস্থা, দর্শক সংখ্যা, ফোনে জমা তথ্য ও অ্যাপ ইনস্টল বার */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 sm:gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-900 shrink-0" />
            <span className="text-xs font-semibold text-stone-600">{t.status.languageLabel}:</span>
            <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleLanguageChange(opt.code)}
                  className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    lang === opt.code
                      ? 'bg-white text-emerald-950 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
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
                  <Wifi className="h-3.5 w-3.5 text-emerald-800" />
                  <span className="text-emerald-900">{t.status.online}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-800" />
                  <span className="text-amber-900">{t.status.offline}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap shrink-0"
            >
              <Database className="h-3.5 w-3.5 text-emerald-900" />
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

      {/* ৩. সব মূল কৃষি ফিচার (আগের মতোই ধারাবাহিকভাবে সাজানো) */}
      <main>
        {/* ভিজিটর স্বাগত বার্তা ও গ্রিটিং */}
        <VisitorGreetingBanner
          t={t}
          lang={lang}
          districtName={weather?.location.districtName}
          visitorStats={visitorStats}
        />

        {/* সব কৃষি ফিচার এক নজরে (সহজ দ্রুত নেভিগেশন) */}
        <section
          aria-label={t.home.menuHeading}
          className="border-b border-stone-200 bg-[#F7F8F5] py-7 sm:py-9"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-stone-900 sm:text-2xl text-balance">
                  {t.home.menuHeading}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-stone-600">
                  {t.home.menuSubheading}
                </p>
              </div>
              {weather && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                  <span className="font-semibold text-emerald-900">
                    {weather.location.districtName}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular font-semibold text-stone-900">
                    {weather.temperature}°C
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.home.rainChanceLabel}:{' '}
                    <strong className="font-mono-tabular text-stone-900">
                      {weather.forecast[0]?.rainProb ?? 0}%
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: 'agro-service',
                  title:
                    lang === 'bn'
                      ? 'স্মার্ট কৃষি সেবা ও সময়সূচি'
                      : lang === 'hi'
                      ? 'स्मार्ट कृषि सेवा व समय सारणी'
                      : 'Agro Service & Auto-Schedule',
                  desc:
                    lang === 'bn'
                      ? 'দিনের প্রহর অনুযায়ী মাঠ-কাজ, স্প্রে নিরাপত্তা, সেচের সংকটকাল ও কৃষি হেল্পলাইন।'
                      : lang === 'hi'
                      ? 'समय के अनुसार खेत सलाह, छिड़काव सुरक्षा, सिंचाई व कृषि हेल्पलाइन।'
                      : 'Time-of-day field guidance, spray safety, critical irrigation & helplines.',
                  meta: `${autoSyncIntervalMinutes}m auto-sync`,
                  icon: <Sprout className="h-5 w-5 text-emerald-900" />,
                  onClick: () =>
                    document.getElementById('agro-service')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                },
                {
                  id: 'weather',
                  title: t.home.weatherTitle,
                  desc: t.home.weatherDesc,
                  meta: weather ? `${weather.temperature}°C · ${weather.location.districtName}` : t.nav.weather,
                  icon: <CloudSun className="h-5 w-5 text-emerald-900" />,
                  onClick: () => handleNavigate('weather'),
                },
                {
                  id: 'scanner',
                  title: t.home.scanTitle,
                  desc: t.home.scanDesc,
                  meta: `${t.scanner.savedHistoryTitle}: ${diagnoses.length}`,
                  icon: <Camera className="h-5 w-5 text-emerald-900" />,
                  onClick: () => handleNavigate('scanner'),
                },
                {
                  id: 'calendar',
                  title: t.home.calendarTitle,
                  desc: t.home.calendarDesc,
                  meta: t.nav.calendar,
                  icon: <Calendar className="h-5 w-5 text-emerald-900" />,
                  onClick: () => handleNavigate('calendar'),
                },
                {
                  id: 'tips',
                  title: t.home.tipsTitle,
                  desc: t.home.tipsDesc,
                  meta: `${tips.length} ${t.nav.tips}`,
                  icon: <Sprout className="h-5 w-5 text-emerald-900" />,
                  onClick: () => handleNavigate('tips'),
                },
                {
                  id: 'market',
                  title: t.home.marketTitle,
                  desc: t.home.marketDesc,
                  meta: `${prices.length} ${t.nav.market}`,
                  icon: <Store className="h-5 w-5 text-emerald-900" />,
                  onClick: () => handleNavigate('market'),
                },
              ].map((feature) => (
                <button
                  key={feature.id}
                  type="button"
                  onClick={feature.onClick}
                  className="group flex h-full flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 text-left transition-colors hover:border-emerald-700 hover:bg-emerald-50/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                        {feature.icon}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-900" />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-stone-900">{feature.title}</h3>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-600">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5 text-xs">
                    <span className="font-mono-tabular font-medium text-stone-600">
                      {feature.meta}
                    </span>
                    <span className="font-semibold text-emerald-900">{t.home.openFeature}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* স্মার্ট কৃষি সেবা: দিনের সময়, মাসিক পরামর্শ ও স্বয়ংক্রিয় আপডেট সময়সূচি */}
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

        {/* ফসল রোপণ ও ফসল তোলার সময়সূচি */}
        <Suspense fallback={<SectionSkeleton />}>
          <CropCalendarSection t={t} lang={lang} />
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

        {/* মৌসুমভিত্তিক ফসল পরিচর্যা টিপস */}
        <Suspense fallback={<SectionSkeleton />}>
          <CropTipsSection
            t={t}
            lang={lang}
            tips={tips}
            onToggleBookmark={handleToggleBookmark}
          />
        </Suspense>

        {/* স্থানীয় বাজারের ফসলের দর */}
        <Suspense fallback={<SectionSkeleton />}>
          <MarketPricesSection
            t={t}
            lang={lang}
            isOnline={isOnline}
            districtName={weather?.location.districtName}
            prices={prices}
            syncMeta={marketSyncMeta}
            onPricesChange={(next) => {
              setPrices(next);
              refreshStats();
            }}
            onSyncMetaChange={(meta) => setMarketSyncMeta(meta)}
          />
        </Suspense>
      </main>

      {/* ৪. রিয়েল-টাইম দর্শক সংখ্যা ও দ্রুত স্ক্যান কিউআর কোড */}
      <Suspense fallback={<SectionSkeleton />}>
        <VisitorCounter
          t={t}
          lang={lang}
          stats={visitorStats}
          variant="card"
          isLiveConnected={isLiveVisitorsConnected}
          isRefreshing={isRefreshingVisitors}
          onRefresh={refreshVisitorStats}
        />
      </Suspense>

      {/* ৫. ফুটার */}
      <footer className="border-t border-stone-200 bg-[#F7F8F5] py-8 text-center text-xs sm:text-sm text-stone-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-stone-800">{t.brandName}</p>
          <p className="mt-1">{t.heroEyebrow}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm font-medium text-stone-600">
            <a href="#agro-service" onClick={(e) => { e.preventDefault(); document.getElementById('agro-service')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="hover:text-emerald-900 hover:underline underline-offset-4">{lang === 'bn' ? 'কৃষি সেবা' : lang === 'hi' ? 'कृषि सेवा' : 'Agro Service'}</a>
            <a href="#weather" onClick={(e) => { e.preventDefault(); handleNavigate('weather'); }} className="hover:text-emerald-900 hover:underline underline-offset-4">{t.nav.weather}</a>
            <a href="#calendar" onClick={(e) => { e.preventDefault(); handleNavigate('calendar'); }} className="hover:text-emerald-900 hover:underline underline-offset-4">{t.nav.calendar}</a>
            <a href="#scanner" onClick={(e) => { e.preventDefault(); handleNavigate('scanner'); }} className="hover:text-emerald-900 hover:underline underline-offset-4">{t.nav.scanner}</a>
            <a href="#tips" onClick={(e) => { e.preventDefault(); handleNavigate('tips'); }} className="hover:text-emerald-900 hover:underline underline-offset-4">{t.nav.tips}</a>
            <a href="#market" onClick={(e) => { e.preventDefault(); handleNavigate('market'); }} className="hover:text-emerald-900 hover:underline underline-offset-4">{t.nav.market}</a>
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
    </AudioPlayerProvider>
  );
}
