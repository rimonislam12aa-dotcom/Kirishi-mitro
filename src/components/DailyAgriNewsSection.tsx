import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Newspaper,
  Plus,
  RefreshCw,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { getMonthlyAgroBrief } from '../catalog/agroAdvisoryData';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { AppLanguage, DailyAgriNewsItem, WeatherCacheRecord } from '../types/agri';

const DAILY_NEWS_STORAGE_KEY = 'krishi_mitra_daily_news_v1';

interface DailyAgriNewsSectionProps {
  lang: AppLanguage;
  isOnline: boolean;
  weather: WeatherCacheRecord | null;
  lastAutoUpdateAt: string | null;
  isRefreshing: boolean;
  onRefreshNews: () => Promise<void> | void;
  onOpenCropFeature?: (sectionId: 'calendar' | 'tips' | 'scanner') => void;
}

type NewsCategoryFilter = 'all' | DailyAgriNewsItem['category'];

const COPY: Record<
  AppLanguage,
  {
    sectionEyebrow: string;
    sectionTitle: string;
    sectionSubtitle: string;
    refreshBtn: string;
    refreshingBtn: string;
    addNewsBtn: string;
    closeFormBtn: string;
    formTitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    categoryLabel: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    summaryLabel: string;
    summaryPlaceholder: string;
    publishBtn: string;
    publishedMsg: string;
    listenBtn: string;
    deleteBtn: string;
    customBadge: string;
    autoBadge: string;
    lastUpdatedPrefix: string;
    categories: Record<NewsCategoryFilter, string>;
    emptyMsg: string;
    readTipsCta: string;
  }
> = {
  bn: {
    sectionEyebrow: 'দৈনিক কৃষি বুলেটিন',
    sectionTitle: 'প্রতিদিনের কৃষি খবর ও জরুরি আপডেট',
    sectionSubtitle:
      'আজকের আবহাওয়া, মৌসুমি চাষাবাদ ও সার-বীজের প্রতিদিনের খবর দেখুন এবং প্রয়োজনে নতুন কৃষি খবর নিজেই যোগ করে আপডেট রাখুন।',
    refreshBtn: 'আজকের খবর আপডেট করুন',
    refreshingBtn: 'আপডেট হচ্ছে...',
    addNewsBtn: 'নতুন খবর যোগ করুন',
    closeFormBtn: 'বন্ধ করুন',
    formTitle: 'দৈনিক কৃষি খবর প্রকাশ / আপডেট ফর্ম',
    titleLabel: 'খবরের শিরোনাম',
    titlePlaceholder: 'যেমন: বোরো ধানের চারা রোপণে পটাশ সার প্রয়োগের সময়সূচি',
    categoryLabel: 'খবরের বিভাগ',
    sourceLabel: 'এলাকা বা উৎস',
    sourcePlaceholder: 'যেমন: উপজেলা কৃষি অফিস / নিজস্ব খামার',
    summaryLabel: 'বিস্তারিত কৃষি সংবাদ',
    summaryPlaceholder: 'আজকের আবহাওয়া, সেচ, সার বা ফসল সংক্রান্ত প্রয়োজনীয় তথ্য লিখুন...',
    publishBtn: 'খবর আপডেট করুন',
    publishedMsg: 'নতুন কৃষি খবরটি সফলভাবে আজকের তালিকায় যুক্ত হয়েছে।',
    listenBtn: 'খবর শুনুন',
    deleteBtn: 'মুছুন',
    customBadge: 'ব্যবহারকারী আপডেট',
    autoBadge: 'দৈনিক বুলেটিন',
    lastUpdatedPrefix: 'সর্বশেষ আপডেট',
    categories: {
      all: 'সব খবর',
      weather: 'আবহাওয়া',
      crop: 'ফসল পরামর্শ',
      fertilizer: 'সার ও বীজ',
      govt: 'সরকারি প্রকল্প',
    },
    emptyMsg: 'এই বিভাগে এখনো কোনো কৃষি খবর নেই।',
    readTipsCta: 'ফসল পরামর্শ দেখুন',
  },
  hi: {
    sectionEyebrow: 'दैनिक कृषि बुलेटिन',
    sectionTitle: 'आज की कृषि खबरें और लाइव अपडेट',
    sectionSubtitle:
      'मौसम, मौसमी खेती, खाद-बीज और सरकारी योजनाओं की ताज़ा जानकारी देखें और अपने क्षेत्र की नई खबर जोड़कर अपडेट रखें।',
    refreshBtn: 'खबरें अपडेट करें',
    refreshingBtn: 'अपडेट हो रहा है...',
    addNewsBtn: 'नई खबर जोड़ें',
    closeFormBtn: 'बंद करें',
    formTitle: 'दैनिक कृषि समाचार जोड़ें',
    titleLabel: 'खबर का शीर्षक',
    titlePlaceholder: 'जैसे: गेहूं की पहली सिंचाई के बाद यूरिया की सही मात्रा',
    categoryLabel: 'श्रेणी',
    sourceLabel: 'क्षेत्र या स्रोत',
    sourcePlaceholder: 'जैसे: कृषि विज्ञान केंद्र / स्थानीय किसान सूचना',
    summaryLabel: 'विस्तृत जानकारी',
    summaryPlaceholder: 'फसल, सिंचाई, मौसम या सरकारी योजना से जुड़ा विवरण लिखें...',
    publishBtn: 'खबर प्रकाशित करें',
    publishedMsg: 'नई कृषि खबर सफलतापूर्वक आज की सूची में जुड़ गई है।',
    listenBtn: 'खबर सुनें',
    deleteBtn: 'हटाएं',
    customBadge: 'स्थानीय अपडेट',
    autoBadge: 'दैनिक बुलेटिन',
    lastUpdatedPrefix: 'अंतिम अपडेट',
    categories: {
      all: 'सभी खबरें',
      weather: 'मौसम',
      crop: 'फसल सलाह',
      fertilizer: 'खाद व बीज',
      govt: 'सरकारी योजना',
    },
    emptyMsg: 'इस श्रेणी में अभी कोई खबर नहीं है।',
    readTipsCta: 'फसल टिप्स देखें',
  },
  en: {
    sectionEyebrow: 'Daily Agri Bulletin',
    sectionTitle: 'Daily Agricultural News & Field Updates',
    sectionSubtitle:
      'Stay updated with today’s weather-linked bulletins, seasonal farming advisories, and add your own daily local agricultural updates.',
    refreshBtn: 'Refresh Daily News',
    refreshingBtn: 'Updating...',
    addNewsBtn: 'Add Daily Update',
    closeFormBtn: 'Close',
    formTitle: 'Publish Daily Agricultural News',
    titleLabel: 'Headline',
    titlePlaceholder: 'e.g. Irrigation & potash schedule for winter rice seedlings',
    categoryLabel: 'Category',
    sourceLabel: 'Area or Source',
    sourcePlaceholder: 'e.g. Local Agri Office / Field Desk',
    summaryLabel: 'News Details',
    summaryPlaceholder: 'Write practical updates on crops, fertilizer, irrigation, or schemes...',
    publishBtn: 'Publish Update',
    publishedMsg: 'Daily agricultural update added to today’s bulletin.',
    listenBtn: 'Listen',
    deleteBtn: 'Remove',
    customBadge: 'User Update',
    autoBadge: 'Daily Bulletin',
    lastUpdatedPrefix: 'Updated',
    categories: {
      all: 'All News',
      weather: 'Weather',
      crop: 'Crop Advisory',
      fertilizer: 'Seeds & Fertilizer',
      govt: 'Govt Schemes',
    },
    emptyMsg: 'No agricultural news items in this category yet.',
    readTipsCta: 'Open Crop Tips',
  },
};

function readCustomNews(): DailyAgriNewsItem[] {
  try {
    const raw = window.localStorage.getItem(DAILY_NEWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is DailyAgriNewsItem =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.summary === 'string'
    );
  } catch {
    return [];
  }
}

function writeCustomNews(items: DailyAgriNewsItem[]): void {
  try {
    window.localStorage.setItem(DAILY_NEWS_STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
  } catch {
    // Ignore storage errors
  }
}

export const DailyAgriNewsSection: React.FC<DailyAgriNewsSectionProps> = ({
  lang,
  isOnline,
  weather,
  lastAutoUpdateAt,
  isRefreshing,
  onRefreshNews,
  onOpenCropFeature,
}) => {
  const { playTrack } = useAudioPlayer();
  const c = COPY[lang];

  const [customNews, setCustomNews] = useState<DailyAgriNewsItem[]>(() => readCustomNews());
  const [categoryFilter, setCategoryFilter] = useState<NewsCategoryFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<DailyAgriNewsItem['category']>('crop');
  const [sourceInput, setSourceInput] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [publishedBanner, setPublishedBanner] = useState(false);

  useEffect(() => {
    writeCustomNews(customNews);
  }, [customNews]);

  const builtInDailyBulletins = useMemo<DailyAgriNewsItem[]>(() => {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const currentMonth = today.getMonth() + 1;
    const monthBrief = getMonthlyAgroBrief(currentMonth);
    const district =
      weather?.location.districtName ??
      (lang === 'bn' ? 'আপনার এলাকা' : lang === 'hi' ? 'आपका क्षेत्र' : 'Your Area');
    const tempText = weather ? `${weather.temperature}°C` : '—';
    const rainProb = weather?.forecast[0]?.rainProb ?? 0;

    return [
      {
        id: `auto-weather-${todayIso}`,
        category: 'weather',
        publishedDate: todayIso,
        source: `${district} · ${lang === 'bn' ? 'লাইভ আবহাওয়া ডেস্ক' : lang === 'hi' ? 'मौसम डेस्क' : 'Weather Desk'}`,
        title:
          lang === 'bn'
            ? `${district} আবহাওয়া বার্তা: তাপমাত্রা ${tempText}, বৃষ্টির সম্ভাবনা ${rainProb}%`
            : lang === 'hi'
            ? `${district} मौसम समाचार: तापमान ${tempText}, बारिश की संभावना ${rainProb}%`
            : `${district} Weather Bulletin: ${tempText} with ${rainProb}% rain probability`,
        summary:
          weather?.alerts[0]?.advice[lang] ??
          (lang === 'bn'
            ? `আজ সকাল বা বিকালের শান্ত আবহাওয়ায় ফসল পরিদর্শন করুন। বৃষ্টির সম্ভাবনা ${rainProb}% থাকায় সেচ ও স্প্রে সময়সূচি আগে থেকেই পরিকল্পনা করুন।`
            : lang === 'hi'
            ? `सुबह या शाम के शांत मौसम में खेत का निरीक्षण करें। बारिश की संभावना ${rainProb}% को देखते हुए सिंचाई व छिड़काव की योजना बनाएं।`
            : `Inspect crops during calm morning or late-afternoon hours. Plan irrigation and spraying around today's ${rainProb}% rain forecast.`),
      },
      {
        id: `auto-season-${todayIso}`,
        category: 'crop',
        publishedDate: todayIso,
        source: monthBrief.banglaSeason[lang],
        title: monthBrief.headline[lang],
        summary: `${monthBrief.keyCropsFocus[lang]} — ${monthBrief.actionItems[lang][0] ?? ''}`,
      },
      {
        id: `auto-fertilizer-${todayIso}`,
        category: 'fertilizer',
        publishedDate: todayIso,
        source:
          lang === 'bn'
            ? 'সুষম সার ও বীজ পরামর্শ'
            : lang === 'hi'
            ? 'खाद एवं बीज बुलेटिन'
            : 'Soil & Fertilizer Advisory',
        title:
          lang === 'bn'
            ? 'মাটির আর্দ্রতা দেখে ইউরিয়া ও পটাশ সার উপরি প্রয়োগের নির্দেশনা'
            : lang === 'hi'
            ? 'खेत की नमी के अनुसार यूरिया और पोटाश टॉप-ड्रेसिंग निर्देश'
            : 'Balanced top-dressing guidance for urea and potash application',
        summary:
          lang === 'bn'
            ? 'খালি শুকনো জমিতে রাসায়নিক সার দেবেন না—হালকা জো থাকা অবস্থায় অথবা সেচের পর সার প্রয়োগ করলে অপচয় কম হয় ও ফলন বাড়ে।'
            : lang === 'hi'
            ? 'पूरी तरह सूखी मिट्टी में खाद न डालें—हल्की नमी या सिंचाई के बाद छिड़काव करने से पोषक तत्व बेहतर मिलते हैं।'
            : 'Avoid applying fertilizer on bone-dry soil; apply after light irrigation or when soil holds gentle moisture to cut nutrient loss.',
      },
      {
        id: `auto-govt-${todayIso}`,
        category: 'govt',
        publishedDate: todayIso,
        source:
          lang === 'bn'
            ? 'কৃষি তথ্য সেবা (১৬১২৩)'
            : lang === 'hi'
            ? 'किसान कॉल सेंटर (1800-180-1551)'
            : 'Agri Extension Desk',
        title:
          lang === 'bn'
            ? 'মাঠ পর্যায়ের কৃষি পরামর্শ ও বীজ সহায়তা পেতে উপজেলা কৃষি অফিসে যোগাযোগ'
            : lang === 'hi'
            ? 'सरकारी बीज अनुदान व तकनीकी सलाह के लिए निकटतम कृषि केंद्र से जुड़ें'
            : 'Seasonal seed & technical support active at local agricultural offices',
        summary:
          lang === 'bn'
            ? 'ফসলের যেকোনো জরুরি রোগবালাই, প্রণোদনা বীজ বা সার সংক্রান্ত তথ্যের জন্য কৃষি কল সেন্টার ১৬১২৩-তে কল করতে পারেন।'
            : lang === 'hi'
            ? 'फसल रोग, सरकारी बीज सहायता या मौसम परामर्श के लिए निःशुल्क किसान हेल्पलाइन पर संपर्क करें।'
            : 'Farmers can contact the agricultural extension helpline for urgent pest alerts, seed support, and seasonal advisories.',
      },
    ];
  }, [lang, weather]);

  const allNews = useMemo(
    () => [...customNews, ...builtInDailyBulletins],
    [customNews, builtInDailyBulletins]
  );

  const visibleNews = useMemo(
    () =>
      categoryFilter === 'all'
        ? allNews
        : allNews.filter((item) => item.category === categoryFilter),
    [allNews, categoryFilter]
  );

  const handlePublishCustomNews = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = titleInput.trim();
    const trimmedSummary = summaryInput.trim();
    if (!trimmedTitle || !trimmedSummary) return;

    const newItem: DailyAgriNewsItem = {
      id: `custom-news-${Date.now()}`,
      title: trimmedTitle,
      summary: trimmedSummary,
      category: categoryInput,
      source:
        sourceInput.trim() ||
        weather?.location.districtName ||
        (lang === 'bn' ? 'নিজস্ব আপডেট' : lang === 'hi' ? 'स्थानीय अपडेट' : 'Field Update'),
      publishedDate: new Date().toISOString().slice(0, 10),
      isCustom: true,
    };

    setCustomNews((prev) => [newItem, ...prev]);
    setTitleInput('');
    setSummaryInput('');
    setSourceInput('');
    setShowAddForm(false);
    setPublishedBanner(true);
    window.setTimeout(() => setPublishedBanner(false), 4000);
  };

  const handleDeleteCustom = (id: string) => {
    setCustomNews((prev) => prev.filter((item) => item.id !== id));
  };

  const handleListenItem = (item: DailyAgriNewsItem) => {
    playTrack({
      id: item.id,
      title: item.title,
      subtitle: `${c.categories[item.category]} · ${item.source}`,
      text: `${item.title}। ${item.summary}`,
      language: lang,
    });
  };

  const localeCode = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-GB';
  const lastUpdateDisplay = lastAutoUpdateAt
    ? new Date(lastAutoUpdateAt).toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' });

  return (
    <section
      id="agri-news"
      aria-label={c.sectionTitle}
      className="scroll-mt-20 border-b border-zinc-200 bg-white py-8 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Row + Action Buttons */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-wide text-[#4D6A1F]">
              {c.sectionEyebrow} ·{' '}
              <span className="font-mono-tabular text-zinc-500 font-medium">
                {c.lastUpdatedPrefix}: {lastUpdateDisplay}
              </span>
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl text-balance">
              {c.sectionTitle}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-600">{c.sectionSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onRefreshNews()}
              disabled={!isOnline || isRefreshing}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-zinc-300 bg-[#F8F9F7] px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 disabled:opacity-55 whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 text-[#2E7D32] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? c.refreshingBtn : c.refreshBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#2E7D32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#256628] whitespace-nowrap"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4" />
                  <span>{c.closeFormBtn}</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>{c.addNewsBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {publishedBanner && (
          <div className="flex items-center gap-2 rounded-xl border border-[#2E7D32]/30 bg-[#EEF4EA] px-4 py-3 text-xs sm:text-sm font-medium text-[#1F4E23]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
            <span>{c.publishedMsg}</span>
          </div>
        )}

        {/* Collapsible Daily News Add / Update Form */}
        {showAddForm && (
          <form
            onSubmit={handlePublishCustomNews}
            className="rounded-2xl border border-zinc-200 bg-[#F8F9F7] p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
              <Newspaper className="h-4 w-4 text-[#2E7D32]" />
              <h3 className="text-base font-bold text-zinc-900">{c.formTitle}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  {c.titleLabel}
                </label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder={c.titlePlaceholder}
                  className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  {c.categoryLabel}
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value as DailyAgriNewsItem['category'])}
                  className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                >
                  <option value="crop">{c.categories.crop}</option>
                  <option value="weather">{c.categories.weather}</option>
                  <option value="fertilizer">{c.categories.fertilizer}</option>
                  <option value="govt">{c.categories.govt}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  {c.sourceLabel}
                </label>
                <input
                  type="text"
                  value={sourceInput}
                  onChange={(e) => setSourceInput(e.target.value)}
                  placeholder={c.sourcePlaceholder}
                  className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  {c.summaryLabel}
                </label>
                <textarea
                  required
                  rows={2}
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  placeholder={c.summaryPlaceholder}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="min-h-[42px] rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                {c.closeFormBtn}
              </button>
              <button
                type="submit"
                className="min-h-[42px] rounded-xl bg-[#2E7D32] px-5 py-2 text-xs font-semibold text-white hover:bg-[#256628]"
              >
                {c.publishBtn}
              </button>
            </div>
          </form>
        )}

        {/* Interactive Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-zinc-100 p-1 w-fit">
          {(['all', 'weather', 'crop', 'fertilizer', 'govt'] as const).map((catKey) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setCategoryFilter(catKey)}
              className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                categoryFilter === catKey
                  ? 'bg-white text-[#255D28] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {c.categories[catKey]}
            </button>
          ))}
        </div>

        {/* News Feed Cards */}
        {visibleNews.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-[#F8F9F7] p-6 text-center text-sm text-zinc-600">
            {c.emptyMsg}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleNews.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-[#F8F9F7] p-5 transition-colors hover:border-[#2E7D32]/50 hover:bg-white"
              >
                <div>
                  {/* Zero-Pill Unboxed Metadata Line */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600">
                    <span className="font-bold text-[#2E7D32]">
                      {c.categories[item.category]}
                    </span>
                    <span aria-hidden="true" className="text-zinc-300">
                      ·
                    </span>
                    <span className="font-mono-tabular">
                      {new Date(item.publishedDate).toLocaleDateString(localeCode, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span aria-hidden="true" className="text-zinc-300">
                      ·
                    </span>
                    <span className="text-zinc-700 font-medium">{item.source}</span>
                    {item.isCustom && (
                      <>
                        <span aria-hidden="true" className="text-zinc-300">
                          ·
                        </span>
                        <span className="font-semibold text-[#4D6A1F]">{c.customBadge}</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-2 text-base sm:text-lg font-bold leading-snug text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-zinc-600">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/80 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleListenItem(item)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#2E7D32]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#255D28] hover:bg-[#EEF4EA]"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-[#2E7D32]" />
                      <span>{c.listenBtn}</span>
                    </button>

                    {onOpenCropFeature && item.category !== 'weather' && (
                      <button
                        type="button"
                        onClick={() => onOpenCropFeature('tips')}
                        className="inline-flex min-h-[38px] items-center rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#4D6A1F] hover:underline"
                      >
                        {c.readTipsCta}
                      </button>
                    )}
                  </div>

                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustom(item.id)}
                      aria-label={c.deleteBtn}
                      className="inline-flex min-h-[38px] items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{c.deleteBtn}</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
