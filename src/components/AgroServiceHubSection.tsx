import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Droplets,
  Leaf,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import {
  FARMER_HELPLINES,
  formatMinutesRemaining,
  getMonthlyAgroBrief,
  getTimeSlotFieldAdvisory,
  IRRIGATION_CRITICAL_STAGES,
  SOIL_AND_SPRAY_RULES,
} from '../catalog/agroAdvisoryData';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { AppLanguage, AutoSyncIntervalMinutes, WeatherCacheRecord } from '../types/agri';

interface AgroServiceHubSectionProps {
  lang: AppLanguage;
  isOnline: boolean;
  weather: WeatherCacheRecord | null;
  nowMs: number;
  autoSyncIntervalMinutes: AutoSyncIntervalMinutes;
  lastAutoUpdateAt: string | null;
  nextAutoUpdateMs: number;
  isAutoRefreshing: boolean;
  onChangeAutoSyncInterval: (minutes: AutoSyncIntervalMinutes) => void;
  onTriggerAutoRefresh: () => void;
}

type ReferenceTab = 'irrigation' | 'rules' | 'helpline';

const LABELS: Record<
  AppLanguage,
  {
    sectionTitle: string;
    sectionSubtitle: string;
    autoUpdateLabel: string;
    lastUpdatedPrefix: string;
    nextUpdatePrefix: string;
    neverSynced: string;
    offlineScheduleNote: string;
    intervalLabel: string;
    intervals: Record<AutoSyncIntervalMinutes, string>;
    refreshNowBtn: string;
    refreshingBtn: string;
    listenAdvisoryBtn: string;
    nowWindowTitle: string;
    sprayStatusTitle: string;
    monthBriefLabel: string;
    keyCropsLabel: string;
    tabs: Record<ReferenceTab, string>;
    callNowBtn: string;
    copyBtn: string;
    copiedBtn: string;
  }
> = {
  bn: {
    sectionTitle: 'স্মার্ট কৃষি সেবা ও স্বয়ংক্রিয় সময়সূচি',
    sectionSubtitle:
      'দিনের বর্তমান প্রহর, আবহাওয়া ও মাস অনুযায়ী মাঠের জরুরি পরামর্শ এবং নির্দিষ্ট সময় পরপর স্বয়ংক্রিয় তথ্য আপডেট।',
    autoUpdateLabel: 'স্বয়ংক্রিয় আপডেট সময়সূচি',
    lastUpdatedPrefix: 'সর্বশেষ আপডেট',
    nextUpdatePrefix: 'পরবর্তী আপডেট',
    neverSynced: 'লোকাল ক্যাশ সক্রিয়',
    offlineScheduleNote: 'অফলাইনে নির্ধারিত সময়ের পরামর্শ ও সংরক্ষিত তথ্য সক্রিয় আছে',
    intervalLabel: 'আপডেট ব্যবধান',
    intervals: {
      15: 'প্রতি ১৫ মিনিট',
      30: 'প্রতি ৩০ মিনিট',
      60: 'প্রতি ১ ঘণ্টা',
      180: 'প্রতি ৩ ঘণ্টা',
    },
    refreshNowBtn: 'এখনই আপডেট করুন',
    refreshingBtn: 'আপডেট হচ্ছে...',
    listenAdvisoryBtn: 'পরামর্শ শুনুন',
    nowWindowTitle: 'এখনকার সময়ের মাঠ-কাজের নির্দেশিকা',
    sprayStatusTitle: 'স্প্রে ও বালাইনাশক নিরাপত্তা',
    monthBriefLabel: 'চলতি মাসের বিশেষ কৃষি ব্রিফিং',
    keyCropsLabel: 'এ মাসের মূল ফসল',
    tabs: {
      irrigation: 'সেচের সংকটকাল',
      rules: 'মাটি ও স্প্রে নিয়ম',
      helpline: 'কৃষি হেল্পলাইন',
    },
    callNowBtn: 'কল করুন',
    copyBtn: 'নম্বর কপি',
    copiedBtn: 'কপি হয়েছে',
  },
  hi: {
    sectionTitle: 'स्मार्ट कृषि सेवा व स्वचालित अपडेट केंद्र',
    sectionSubtitle:
      'दिन के समय, मौसम और महीने के अनुसार खेत सलाह तथा तय समय अंतराल पर मौसम और कृषि डेटा का ऑटो-अपडेट।',
    autoUpdateLabel: 'ऑटो-अपडेट समय सारणी',
    lastUpdatedPrefix: 'अंतिम अपडेट',
    nextUpdatePrefix: 'अगला अपडेट',
    neverSynced: 'ऑफलाइन कैश सक्रिय',
    offlineScheduleNote: 'ऑफलाइन होने पर भी समय व महीने के अनुसार सलाह काम करती है',
    intervalLabel: 'अपडेट अंतराल',
    intervals: {
      15: 'हर 15 मिनट',
      30: 'हर 30 मिनट',
      60: 'हर 1 घंटा',
      180: 'हर 3 घंटे',
    },
    refreshNowBtn: 'अभी अपडेट करें',
    refreshingBtn: 'अपडेट हो रहा है...',
    listenAdvisoryBtn: 'सलाह सुनें',
    nowWindowTitle: 'अभी के समय का खेत कार्य मार्गदर्शन',
    sprayStatusTitle: 'छिड़काव सुरक्षा स्थिति',
    monthBriefLabel: 'इस महीने का कृषि बुलेटिन',
    keyCropsLabel: 'मुख्य फसलें',
    tabs: {
      irrigation: 'सिंचाई के नाजुक चरण',
      rules: 'मिट्टी व स्प्रे नियम',
      helpline: 'कृषि हेल्पलाइन',
    },
    callNowBtn: 'कॉल करें',
    copyBtn: 'कॉपी करें',
    copiedBtn: 'कॉपी हुआ',
  },
  en: {
    sectionTitle: 'Smart Agro Service & Scheduled Auto-Updates',
    sectionSubtitle:
      'Time-of-day field guidance, weather-aware spray checks, seasonal briefs, and automatic scheduled syncing for weather and alerts.',
    autoUpdateLabel: 'Scheduled Auto-Sync',
    lastUpdatedPrefix: 'Last Sync',
    nextUpdatePrefix: 'Next Sync',
    neverSynced: 'Local Cache Active',
    offlineScheduleNote: 'Time-of-day & monthly agronomic advisories remain live offline',
    intervalLabel: 'Interval',
    intervals: {
      15: 'Every 15 min',
      30: 'Every 30 min',
      60: 'Every 1 hour',
      180: 'Every 3 hours',
    },
    refreshNowBtn: 'Update Now',
    refreshingBtn: 'Updating...',
    listenAdvisoryBtn: 'Listen Advice',
    nowWindowTitle: 'Right-Now Field Action Guide',
    sprayStatusTitle: 'Foliar Spray Safety Check',
    monthBriefLabel: 'This Month’s Agronomy Brief',
    keyCropsLabel: 'Priority Crops',
    tabs: {
      irrigation: 'Critical Irrigation',
      rules: 'Soil & Spray Rules',
      helpline: 'Farmer Helplines',
    },
    callNowBtn: 'Call',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
  },
};

export const AgroServiceHubSection: React.FC<AgroServiceHubSectionProps> = ({
  lang,
  isOnline,
  weather,
  nowMs,
  autoSyncIntervalMinutes,
  lastAutoUpdateAt,
  nextAutoUpdateMs,
  isAutoRefreshing,
  onChangeAutoSyncInterval,
  onTriggerAutoRefresh,
}) => {
  const { playTrack } = useAudioPlayer();
  const [activeTab, setActiveTab] = useState<ReferenceTab>('irrigation');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const l = LABELS[lang];
  const nowDate = useMemo(() => new Date(nowMs), [nowMs]);
  const currentHour = nowDate.getHours();
  const currentMonth = nowDate.getMonth() + 1;

  const timeAdvisory = useMemo(
    () => getTimeSlotFieldAdvisory(currentHour, weather),
    [currentHour, weather]
  );
  const monthlyBrief = useMemo(() => getMonthlyAgroBrief(currentMonth), [currentMonth]);

  const localeCode = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US';
  const lastUpdatedText = lastAutoUpdateAt
    ? new Date(lastAutoUpdateAt).toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : l.neverSynced;

  const remainingMs = Math.max(0, nextAutoUpdateMs - nowMs);
  const countdownText = isOnline
    ? formatMinutesRemaining(remainingMs, lang)
    : l.offlineScheduleNote;

  const handleListenAdvisory = () => {
    const tasksJoined = timeAdvisory.tasks[lang].join(' ');
    const monthTasks = monthlyBrief.actionItems[lang].join(' ');
    const audioText = `${timeAdvisory.slotTitle[lang]}। ${timeAdvisory.spraySafety.headline[lang]}। ${timeAdvisory.spraySafety.reason[lang]} ${tasksJoined} ${l.monthBriefLabel}: ${monthlyBrief.headline[lang]}। ${monthTasks}`;

    playTrack({
      id: `agro-hub-${timeAdvisory.slotId}-${monthlyBrief.month}-${lang}`,
      title: `${timeAdvisory.timeRangeLabel[lang]} · ${monthlyBrief.banglaSeason[lang]}`,
      subtitle: l.sectionTitle,
      text: audioText,
      language: lang,
    });
  };

  const handleCopyHelpline = async (id: string, num: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(num);
        setCopiedId(id);
        window.setTimeout(() => {
          setCopiedId((curr) => (curr === id ? null : curr));
        }, 2200);
      }
    } catch {
      // Clipboard blocked on insecure contexts
    }
  };

  const sprayTone =
    timeAdvisory.spraySafety.status === 'safe'
      ? {
          container: 'border-emerald-300 bg-emerald-50 text-emerald-950',
          icon: <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-800" />,
        }
      : timeAdvisory.spraySafety.status === 'caution'
      ? {
          container: 'border-amber-300 bg-amber-50 text-amber-950',
          icon: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-800" />,
        }
      : {
          container: 'border-red-300 bg-red-50 text-red-950',
          icon: <ShieldAlert className="h-5 w-5 shrink-0 text-red-700" />,
        };

  return (
    <section
      id="agro-service"
      aria-label={l.sectionTitle}
      className="scroll-mt-20 border-b border-stone-200 bg-white py-9 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading + Auto-Update Schedule Strip */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl text-balance">
              {l.sectionTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600">{l.sectionSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleListenAdvisory}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#2E7D32]/30 bg-[#EEF4EA] px-4 py-2 text-xs sm:text-sm font-semibold text-[#1E5622] transition-colors hover:bg-[#E1ECDA]"
            >
              <Volume2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
              <span>{l.listenAdvisoryBtn}</span>
            </button>

            <button
              type="button"
              onClick={onTriggerAutoRefresh}
              disabled={!isOnline || isAutoRefreshing}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#2E7D32] px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#256628] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 shrink-0 ${isAutoRefreshing ? 'animate-spin' : ''}`} />
              <span>{isAutoRefreshing ? l.refreshingBtn : l.refreshNowBtn}</span>
            </button>
          </div>
        </div>

        {/* Auto-Update Status & Frequency Bar */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-[#F4F5F2] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-zinc-700">
            <div className="flex items-center gap-2 font-semibold text-[#1E5622]">
              <Clock className="h-4 w-4 shrink-0 text-[#2E7D32]" />
              <span>{l.autoUpdateLabel}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">{l.lastUpdatedPrefix}:</span>
              <span className="font-mono-tabular font-semibold text-zinc-900">
                {lastUpdatedText}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">{l.nextUpdatePrefix}:</span>
              <span className="font-mono-tabular font-semibold text-[#2E7D32]">
                {countdownText}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label
              htmlFor="auto-sync-interval-select"
              className="text-xs font-semibold text-stone-700 whitespace-nowrap"
            >
              {l.intervalLabel}:
            </label>
            <select
              id="auto-sync-interval-select"
              value={autoSyncIntervalMinutes}
              onChange={(e) =>
                onChangeAutoSyncInterval(Number(e.target.value) as AutoSyncIntervalMinutes)
              }
              className="min-h-[40px] rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none"
            >
              <option value={15}>{l.intervals[15]}</option>
              <option value={30}>{l.intervals[30]}</option>
              <option value={60}>{l.intervals[60]}</option>
              <option value={180}>{l.intervals[180]}</option>
            </select>
          </div>
        </div>

        {/* Main Two-Column Content Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Dynamic Time-Slot Tasks + Live Spray Check + Monthly Agro Brief */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            {/* 1. Time-Slot Field Guidance */}
            <div className="rounded-2xl border border-zinc-200 bg-[#F4F5F2] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
                  {l.nowWindowTitle}
                </span>
                <span className="font-mono-tabular text-xs font-semibold text-stone-700">
                  {timeAdvisory.timeRangeLabel[lang]}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-bold text-stone-900">
                {timeAdvisory.slotTitle[lang]}
              </h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-600">
                {timeAdvisory.focusSummary[lang]}
              </p>

              {/* Live Spray Safety Verdict */}
              <div className={`mt-4 flex items-start gap-3 rounded-lg border p-3.5 ${sprayTone.container}`}>
                {sprayTone.icon}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                    {l.sprayStatusTitle}
                  </p>
                  <p className="mt-0.5 text-sm font-bold">{timeAdvisory.spraySafety.headline[lang]}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-95">
                    {timeAdvisory.spraySafety.reason[lang]}
                  </p>
                </div>
              </div>

              <ol className="mt-4 space-y-2.5">
                {timeAdvisory.tasks[lang].map((task, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800">
                    <span className="font-mono-tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white border border-stone-200 text-xs font-bold text-emerald-900">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{task}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* 2. Monthly Seasonal Agro Brief */}
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
                  <CalendarDays className="h-4 w-4 text-emerald-800 shrink-0" />
                  <span>{l.monthBriefLabel}</span>
                </div>
                <span className="text-xs font-semibold text-stone-700">
                  {monthlyBrief.banglaSeason[lang]}
                </span>
              </div>

              <h3 className="mt-3 text-base sm:text-lg font-bold text-stone-900">
                {monthlyBrief.headline[lang]}
              </h3>

              <p className="mt-1.5 text-xs text-stone-600">
                <strong className="font-semibold text-stone-800">{l.keyCropsLabel}:</strong>{' '}
                {monthlyBrief.keyCropsFocus[lang]}
              </p>

              <ul className="mt-3.5 space-y-2 border-t border-stone-100 pt-3">
                {monthlyBrief.actionItems[lang].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                    <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right 5 Cols: Interactive Reference Guide (Irrigation Stages / Soil Rules / Helplines) */}
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-[#F4F5F2] p-4 sm:p-5 lg:col-span-5">
            <div
              role="tablist"
              aria-label={l.sectionTitle}
              className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-200/75 p-1"
            >
              {(['irrigation', 'rules', 'helpline'] as ReferenceTab[]).map((tabKey) => {
                const isActive = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tabKey)}
                    className={`min-h-[42px] rounded-md px-2 py-1.5 text-center text-xs font-semibold leading-tight transition-colors ${
                      isActive
                        ? 'bg-white text-emerald-950 shadow-xs'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    {l.tabs[tabKey]}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex-1 space-y-3">
              {activeTab === 'irrigation' &&
                IRRIGATION_CRITICAL_STAGES.map((stage) => (
                  <div
                    key={stage.id}
                    className="rounded-lg border border-stone-200 bg-white p-3.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                      <Droplets className="h-4 w-4 shrink-0 text-emerald-800" />
                      <span>{stage.crop[lang]}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-emerald-900 leading-relaxed">
                      {stage.stages[lang]}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {stage.note[lang]}
                    </p>
                  </div>
                ))}

              {activeTab === 'rules' &&
                SOIL_AND_SPRAY_RULES.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-lg border border-stone-200 bg-white p-3.5"
                  >
                    <h4 className="text-sm font-bold text-stone-900">{rule.title[lang]}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                      {rule.detail[lang]}
                    </p>
                  </div>
                ))}

              {activeTab === 'helpline' &&
                FARMER_HELPLINES.map((help) => {
                  const isCopied = copiedId === help.id;
                  return (
                    <div
                      key={help.id}
                      className="rounded-lg border border-stone-200 bg-white p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-stone-900 leading-snug">
                            {help.title[lang]}
                          </h4>
                          <p className="mt-1 text-xs text-stone-600">{help.regionNote[lang]}</p>
                          <p className="mt-0.5 text-xs text-stone-500">{help.hours[lang]}</p>
                        </div>
                        <span className="font-mono-tabular shrink-0 text-base font-bold text-emerald-900">
                          {help.number}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-2.5">
                        <a
                          href={`tel:${help.number.replace(/[^0-9+]/g, '')}`}
                          className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2E7D32] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#256628]"
                        >
                          <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                          <span>{l.callNowBtn}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyHelpline(help.id, help.number)}
                          className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-100"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-800" />
                              <span>{l.copiedBtn}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-stone-600" />
                              <span>{l.copyBtn}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
