import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  CloudRain,
  Compass,
  Droplets,
  MapPin,
  Sun,
  Volume2,
  Wind,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Translations } from '../catalog/i18n';
import { DISTRICT_PRESETS } from '../catalog/seedData';
import { describeWeatherCode, detectDeviceGps, getAqiStatus } from '../lib/weatherService';
import {
  AppLanguage,
  GeoLocationInfo,
  PushNotificationItem,
  WeatherCacheRecord,
} from '../types/agri';

interface WeatherAlertSectionProps {
  t: Translations;
  lang: AppLanguage;
  weather: WeatherCacheRecord | null;
  isLoading: boolean;
  pushEnabled: boolean;
  notificationLogs: PushNotificationItem[];
  onUpdateLocation: (loc: GeoLocationInfo) => Promise<void>;
  onTogglePush: (enable: boolean) => Promise<{ osGranted: boolean }>;
  onSendPushAlert: (
    title: string,
    body: string,
    level?: 'warning' | 'danger' | 'info'
  ) => Promise<void>;
}

export const WeatherAlertSection: React.FC<WeatherAlertSectionProps> = ({
  t,
  lang,
  weather,
  isLoading,
  pushEnabled,
  notificationLogs,
  onUpdateLocation,
  onTogglePush,
  onSendPushAlert,
}) => {
  const { playTrack } = useAudioPlayer();
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<{ text: string; tone: 'ok' | 'warn' } | null>(null);
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setGpsStatusMsg(null);
    try {
      const gpsLoc = await detectDeviceGps(lang);
      await onUpdateLocation(gpsLoc);
      const okMsg =
        gpsLoc.detectedMethod === 'ip-location'
          ? lang === 'bn'
            ? `নেটওয়ার্ক থেকে আপনার কাছাকাছি এলাকা (${gpsLoc.districtName}) পাওয়া গেছে।`
            : lang === 'hi'
            ? `नेटवर्क से आपका नजदीकी क्षेत्र (${gpsLoc.districtName}) मिल गया है।`
            : `Detected approximate area via network: ${gpsLoc.districtName}.`
          : lang === 'bn'
          ? `জিপিএস দিয়ে আপনার বর্তমান অবস্থান (${gpsLoc.districtName}) পাওয়া গেছে!`
          : lang === 'hi'
          ? `जीपीएस से आपका वर्तमान स्थान (${gpsLoc.districtName}) मिल गया है!`
          : `Live GPS locked on ${gpsLoc.districtName}!`;
      setGpsStatusMsg({ text: okMsg, tone: 'ok' });
    } catch {
      setGpsStatusMsg({ text: t.weather.gpsError, tone: 'warn' });
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleSelectDistrict = async (districtId: string) => {
    const preset = DISTRICT_PRESETS.find((d) => d.id === districtId);
    if (!preset) return;
    setGpsStatusMsg(null);
    await onUpdateLocation({
      lat: preset.lat,
      lon: preset.lon,
      districtName: preset.name[lang],
      regionName: preset.region[lang],
      source: 'manual',
      detectedMethod: 'manual',
      updatedAt: new Date().toISOString(),
    });
  };

  const getGpsMethodLabel = (loc: GeoLocationInfo): string => {
    if (loc.detectedMethod === 'gps-satellite') {
      return lang === 'bn' ? 'স্যাটেলাইট জিপিএস' : lang === 'hi' ? 'सैटेलाइट GPS' : 'Satellite GPS';
    }
    if (loc.detectedMethod === 'gps-network') {
      return lang === 'bn' ? 'নেটওয়ার্ক জিপিএস' : lang === 'hi' ? 'नेटवर्क GPS' : 'Network GPS';
    }
    if (loc.detectedMethod === 'ip-location') {
      return lang === 'bn' ? 'আইপি লোকেশন' : lang === 'hi' ? 'IP लोकेशन' : 'IP Location';
    }
    if (loc.source === 'cached') {
      return t.status.cachedOffline;
    }
    return lang === 'bn' ? 'নির্বাচিত জেলা' : lang === 'hi' ? 'चयनित जिला' : 'Selected District';
  };

  const handleEnablePush = async () => {
    const { osGranted } = await onTogglePush(true);
    setPushFeedback(osGranted ? t.weather.pushEnabled : t.weather.pushBlocked);
  };

  const handleDisablePush = async () => {
    await onTogglePush(false);
    setPushFeedback(null);
  };

  const handleTestPush = async () => {
    if (!pushEnabled) {
      await handleEnablePush();
      return;
    }
    const topAlert = weather?.alerts[0];
    const title = topAlert ? topAlert.title[lang] : `${t.brandName} · ${weather?.location.districtName ?? ''}`;
    const body = topAlert
      ? `${topAlert.message[lang]} ${topAlert.advice[lang]}`
      : `${weather?.temperature ?? '--'}°C · ${t.weather.humidity} ${weather?.humidity ?? '--'}%`;

    await onSendPushAlert(title, body, topAlert?.level ?? 'info');
    setPushFeedback(
      typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
        ? t.weather.pushInAppActive
        : t.weather.pushBlocked
    );
  };

  const handleListenWeather = () => {
    if (!weather) return;
    const condition = describeWeatherCode(weather.weatherCode, lang);
    const hasAqi = typeof weather.aqi === 'number' && Number.isFinite(weather.aqi);
    const aqiVal = weather.aqi;
    const aqiInfo = hasAqi ? getAqiStatus(aqiVal, lang) : null;
    const nextRainProb = weather.forecast[0]?.rainProb ?? 0;
    const alertPart =
      weather.alerts.length > 0
        ? weather.alerts.map((a) => `${a.title[lang]}. ${a.message[lang]} ${a.advice[lang]}`).join(' ')
        : t.weather.noAlerts;

    const aqiSentence = hasAqi && aqiInfo
      ? lang === 'bn'
        ? ` এবং এয়ার কোয়ালিটি ইনডেক্স ${aqiVal} (${aqiInfo.label})`
        : lang === 'hi'
        ? ` और वायु गुणवत्ता सूचकांक ${aqiVal} (${aqiInfo.label})`
        : `, and Air Quality Index ${aqiVal} (${aqiInfo.label})`
      : '';

    const script =
      lang === 'bn'
        ? `${weather.location.districtName} এলাকার বর্তমান তাপমাত্রা ${weather.temperature} ডিগ্রি সেলসিয়াস, আবহাওয়া ${condition}, বাতাসের আর্দ্রতা ${weather.humidity} শতাংশ, বৃষ্টির সম্ভাবনা ${nextRainProb} শতাংশ${aqiSentence}। ${alertPart}`
        : lang === 'hi'
        ? `${weather.location.districtName} का वर्तमान तापमान ${weather.temperature} डिग्री सेल्सियस है, मौसम ${condition}, नमी ${weather.humidity} प्रतिशत, बारिश की संभावना ${nextRainProb} प्रतिशत${aqiSentence} है। ${alertPart}`
        : `Current weather in ${weather.location.districtName}: ${weather.temperature} degrees Celsius, ${condition}, humidity ${weather.humidity} percent, rain chance ${nextRainProb} percent${aqiSentence}. ${alertPart}`;

    playTrack({
      id: `weather-${weather.location.districtName}-${lang}`,
      title: `${weather.location.districtName} · ${t.nav.weather}`,
      subtitle: hasAqi ? `${condition} · AQI ${aqiVal}` : condition,
      text: script,
      language: lang,
    });
  };

  return (
    <section id="weather" className="scroll-mt-20 border-b border-stone-200 bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header + Location Controls */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl text-balance">
              {t.weather.sectionTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600">{t.weather.sectionSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isDetectingGps}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Compass className={`h-4 w-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
              {isDetectingGps ? t.weather.detectingGps : t.weather.detectGps}
            </button>

            <label className="sr-only" htmlFor="district-select">
              {t.weather.selectDistrict}
            </label>
            <select
              id="district-select"
              onChange={(e) => handleSelectDistrict(e.target.value)}
              defaultValue=""
              className="min-h-[44px] w-full sm:w-auto rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-emerald-800 focus:outline-none"
            >
              <option value="" disabled>
                {t.weather.selectDistrict}
              </option>
              {DISTRICT_PRESETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name[lang]}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleListenWeather}
              disabled={!weather}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Volume2 className="h-4 w-4 text-emerald-900" />
              {t.weather.listenWeather}
            </button>
          </div>
        </div>

        {gpsStatusMsg && (
          <p
            className={`mt-3 text-xs font-semibold ${
              gpsStatusMsg.tone === 'ok' ? 'text-emerald-800' : 'text-amber-800'
            }`}
          >
            {gpsStatusMsg.text}
          </p>
        )}

        {/* Main Weather + Alert Split */}
        {isLoading && !weather ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="h-56 animate-pulse rounded-xl bg-stone-100 lg:col-span-7" />
            <div className="h-56 animate-pulse rounded-xl bg-stone-100 lg:col-span-5" />
          </div>
        ) : weather ? (
          <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-12">
            {/* Left: Current Conditions + 5-Day Strip */}
            <div className="rounded-xl border border-stone-200 bg-[#F7F8F5] p-4 sm:p-6 lg:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600">
                    <MapPin className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                    <span className="font-medium text-stone-800">{weather.location.regionName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{getGpsMethodLabel(weather.location)}</span>
                    {typeof weather.location.accuracyMeters === 'number' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">±{weather.location.accuracyMeters}m</span>
                      </>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-2xl font-bold text-stone-900">
                    {weather.location.districtName}
                  </h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-600">
                    <span>{describeWeatherCode(weather.weatherCode, lang)}</span>
                    {weather.location.nearestStationName &&
                      typeof weather.location.nearestDistanceKm === 'number' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-xs text-stone-500">
                            {lang === 'bn'
                              ? `নিকটস্থ জেলা: ${weather.location.nearestStationName} (${weather.location.nearestDistanceKm} কি.মি.)`
                              : lang === 'hi'
                              ? `नजदीकी जिला: ${weather.location.nearestStationName} (${weather.location.nearestDistanceKm} किमी)`
                              : `Nearest: ${weather.location.nearestStationName} (${weather.location.nearestDistanceKm} km)`}
                          </span>
                        </>
                      )}
                    <a
                      href={`https://www.google.com/maps?q=${weather.location.lat},${weather.location.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-900 hover:underline underline-offset-4"
                    >
                      {lang === 'bn' ? 'মানচিত্রে দেখুন' : lang === 'hi' ? 'नक्शे पर देखें' : 'View on Map'}
                    </a>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="font-mono-tabular text-4xl font-bold text-emerald-950">
                    {weather.temperature}°C
                  </div>
                  <div className="mt-1 text-xs text-stone-500 font-mono-tabular">
                    {t.status.lastUpdated}:{' '}
                    {new Date(weather.fetchedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              {/* 5 Key Metrics including AQI */}
              <div className="grid grid-cols-2 gap-4 py-5 sm:grid-cols-3 xl:grid-cols-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Droplets className="h-3.5 w-3.5 text-emerald-800" />
                    <span>{t.weather.humidity}</span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-lg font-semibold text-stone-900">
                    {weather.humidity}%
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Wind className="h-3.5 w-3.5 text-emerald-800" />
                    <span>{t.weather.wind}</span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-lg font-semibold text-stone-900">
                    {weather.windSpeed} km/h
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <CloudRain className="h-3.5 w-3.5 text-emerald-800" />
                    <span>{t.weather.rain}</span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-lg font-semibold text-stone-900">
                    {weather.precipitation} mm
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Sun className="h-3.5 w-3.5 text-amber-700" />
                    <span>{t.weather.uv}</span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-lg font-semibold text-stone-900">
                    {weather.uvIndex}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Activity className="h-3.5 w-3.5 text-emerald-800" />
                    <span>{t.weather.aqi}</span>
                  </div>
                  {typeof weather.aqi === 'number' && Number.isFinite(weather.aqi) ? (
                    (() => {
                      const aqiInfo = getAqiStatus(weather.aqi, lang);
                      return (
                        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                          <span className={`font-mono-tabular text-lg font-bold ${aqiInfo.toneClass}`}>
                            {weather.aqi}
                          </span>
                          <span className="text-xs font-semibold text-stone-700">
                            {aqiInfo.label}
                          </span>
                          {typeof weather.pm25 === 'number' && (
                            <span className="w-full font-mono-tabular text-xs text-stone-500">
                              {t.weather.pm25Label}: {weather.pm25} µg/m³
                            </span>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="mt-1 text-xs font-medium text-stone-500">
                      -- ({t.status.offline})
                    </div>
                  )}
                </div>
              </div>

              {/* 5-Day Forecast Strip (responsive 2-col + full last card on narrow screens, 5-col on sm+) */}
              <div className="border-t border-stone-200 pt-4">
                <h4 className="text-xs sm:text-sm font-semibold text-stone-700">{t.weather.forecastTitle}</h4>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {weather.forecast.map((day, idx) => {
                    const label = new Date(day.date).toLocaleDateString(
                      lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US',
                      { weekday: 'short' }
                    );
                    const isLastOnMobile = idx === weather.forecast.length - 1 && weather.forecast.length % 2 === 1;
                    return (
                      <div
                        key={day.date}
                        className={`rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-center ${
                          isLastOnMobile ? 'col-span-2 sm:col-span-1' : ''
                        }`}
                      >
                        <div className="text-xs font-medium text-stone-600 leading-tight">{label}</div>
                        <div className="mt-1 font-mono-tabular text-base sm:text-sm font-bold text-stone-900">
                          {day.tempMax}°
                        </div>
                        <div className="font-mono-tabular text-xs text-stone-500">{day.tempMin}°</div>
                        <div className="mt-1 font-mono-tabular text-xs font-medium text-sky-800">
                          {day.rainProb}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Push Notification Controls + Agro Advisories */}
            <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 sm:p-6 lg:col-span-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <h3 className="text-base font-bold text-stone-900">{t.weather.alertsTitle}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {pushEnabled ? (
                      <>
                        <button
                          type="button"
                          onClick={handleTestPush}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-emerald-800 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-100 whitespace-nowrap shrink-0"
                        >
                          <BellRing className="h-3.5 w-3.5" />
                          {t.weather.testPush}
                        </button>
                        <button
                          type="button"
                          onClick={handleDisablePush}
                          title={t.weather.disablePush}
                          aria-label={t.weather.disablePush}
                          className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 whitespace-nowrap shrink-0"
                        >
                          <BellOff className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnablePush}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap shrink-0"
                      >
                        <Bell className="h-3.5 w-3.5" />
                        {t.weather.enablePush}
                      </button>
                    )}
                  </div>
                </div>

                {pushFeedback ? (
                  <p className="mt-2.5 text-xs font-medium text-emerald-800">{pushFeedback}</p>
                ) : pushEnabled ? (
                  <p className="mt-2.5 text-xs font-medium text-emerald-800">
                    {t.weather.pushInAppActive}
                  </p>
                ) : null}

                <div className="mt-4 divide-y divide-stone-200">
                  {weather.alerts.length === 0 ? (
                    <p className="py-4 text-sm text-stone-600">{t.weather.noAlerts}</p>
                  ) : (
                    weather.alerts.map((alert) => {
                      const tone =
                        alert.level === 'danger'
                          ? 'text-red-800'
                          : alert.level === 'warning'
                          ? 'text-amber-800'
                          : 'text-sky-900';
                      return (
                        <div key={alert.id} className="py-3.5 first:pt-0 last:pb-0">
                          <div className={`flex items-center gap-2 text-sm font-semibold ${tone}`}>
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>{alert.title[lang]}</span>
                          </div>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-700">{alert.message[lang]}</p>
                          <p className="mt-1 text-xs sm:text-sm font-medium leading-relaxed text-stone-900">{alert.advice[lang]}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {notificationLogs.length > 0 && (
                  <div className="mt-5 border-t border-stone-200 pt-4">
                    <h4 className="text-xs font-semibold text-stone-600">
                      {t.weather.recentAlertsLog}
                    </h4>
                    <div className="mt-2 max-h-60 divide-y divide-stone-200 overflow-y-auto pr-1">
                      {notificationLogs.slice(0, 4).map((log) => (
                        <div key={log.id} className="py-2 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-stone-800">
                              {log.title}
                            </span>
                            <span className="shrink-0 font-mono-tabular text-xs text-stone-500">
                              {new Date(log.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{log.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
