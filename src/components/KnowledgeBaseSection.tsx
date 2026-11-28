import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Braces,
  Check,
  CloudRain,
  Copy,
  Download,
  Leaf,
  Search,
  Sprout,
  Store,
  TrendingDown,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import {
  buildStructuredKnowledgeBase,
  getCropGroupLabel,
} from '../catalog/structuredKnowledgeJson';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  AgroCropGroupKey,
  AppLanguage,
  CropTip,
  KnowledgeSectionKey,
  MarketPrice,
  WeatherCacheRecord,
} from '../types/agri';

interface KnowledgeBaseSectionProps {
  lang: AppLanguage;
  tips: CropTip[];
  prices: MarketPrice[];
  weather: WeatherCacheRecord | null;
}

const UI_COPY: Record<
  AppLanguage,
  {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    jsonToggleShow: string;
    jsonToggleHide: string;
    copyJson: string;
    copiedJson: string;
    downloadJson: string;
    listenSummary: string;
    viewStagesBtn: string;
    allCropsOpt: string;
    dayPrefix: string;
    stageWord: string;
    durationLabel: string;
    seedRateLabel: string;
    soilLabel: string;
    plantingLabel: string;
    harvestLabel: string;
    fertilizerLabel: string;
    irrigationLabel: string;
    triggerLabel: string;
    adviceLabel: string;
    affectedCropsLabel: string;
    activeNowLabel: string;
    standbyRuleLabel: string;
    perKgUnit: string;
    perMaundUnit: string;
    emptyState: string;
    jsonScopeLabel: string;
    scopeSection: string;
    scopeFull: string;
  }
> = {
  bn: {
    title: 'সুশৃঙ্খল কৃষি তথ্যভাণ্ডার (ক্যাটাগরি ও JSON কাঠামো)',
    subtitle:
      'ফসলের তালিকা, বৃদ্ধির পর্যায়, পরিচর্যা টিপস, বাজার দর ও আবহাওয়া সতর্কতা—এই ৫টি সুবিন্যস্ত বিভাগে খুঁজে নিন এবং প্রয়োজনে JSON আকারে এক্সপোর্ট করুন।',
    searchPlaceholder: 'ফসল, পর্যায়, টিপস, বাজার বা সতর্কতা খুঁজুন...',
    jsonToggleShow: 'JSON কাঠামো দেখুন',
    jsonToggleHide: 'JSON বন্ধ করুন',
    copyJson: 'JSON কপি',
    copiedJson: 'কপি হয়েছে',
    downloadJson: 'JSON ডাউনলোড',
    listenSummary: 'সারসংক্ষেপ শুনুন',
    viewStagesBtn: 'বৃদ্ধির পর্যায় দেখুন',
    allCropsOpt: 'সব ফসল',
    dayPrefix: 'দিন',
    stageWord: 'পর্যায়',
    durationLabel: 'মেয়াদ',
    seedRateLabel: 'বীজ ও দূরত্ব',
    soilLabel: 'মাটি ও pH',
    plantingLabel: 'রোপণ সময়',
    harvestLabel: 'সংগ্রহ',
    fertilizerLabel: 'সারের মাত্রা',
    irrigationLabel: 'সেচের সংকটকাল',
    triggerLabel: 'সতর্কতা শর্ত',
    adviceLabel: 'করণীয় ব্যবস্থা',
    affectedCropsLabel: 'ঝুঁকিপূর্ণ ফসল',
    activeNowLabel: 'এখন সক্রিয় সতর্কতা',
    standbyRuleLabel: 'প্রস্তুত সতর্কতা বিধি',
    perKgUnit: 'প্রতি কেজি',
    perMaundUnit: 'প্রতি মণ (৪০ কেজি)',
    emptyState: 'এই ফিল্টারে কোনো তথ্য পাওয়া যায়নি। অন্য শব্দ বা বিভাগ নির্বাচন করুন।',
    jsonScopeLabel: 'JSON পরিসর',
    scopeSection: 'শুধু বর্তমান বিভাগ',
    scopeFull: 'সম্পূর্ণ ৫-বিভাগ ডাটাবেজ',
  },
  hi: {
    title: 'सुव्यवस्थित कृषि ज्ञान भंडार (श्रेणियां व JSON संरचना)',
    subtitle:
      'फसलों की सूची, विकास के चरण, देखभाल सुझाव, मंडी भाव और मौसम चेतावनी को 5 स्पष्ट श्रेणियों में खोजें या JSON के रूप में डाउनलोड करें।',
    searchPlaceholder: 'फसल, चरण, सुझाव, मंडी या चेतावनी खोजें...',
    jsonToggleShow: 'JSON संरचना देखें',
    jsonToggleHide: 'JSON बंद करें',
    copyJson: 'JSON कॉपी',
    copiedJson: 'कॉपी हुआ',
    downloadJson: 'JSON डाउनलोड',
    listenSummary: 'सारांश सुनें',
    viewStagesBtn: 'विकास चरण देखें',
    allCropsOpt: 'सभी फसलें',
    dayPrefix: 'दिन',
    stageWord: 'चरण',
    durationLabel: 'अवधि',
    seedRateLabel: 'बीज व दूरी',
    soilLabel: 'मिट्टी व pH',
    plantingLabel: 'बुवाई समय',
    harvestLabel: 'कटाई',
    fertilizerLabel: 'खाद मात्रा',
    irrigationLabel: 'सिंचाई नाजुक चरण',
    triggerLabel: 'चेतावनी शर्त',
    adviceLabel: 'कृषि सलाह',
    affectedCropsLabel: 'प्रभावित फसलें',
    activeNowLabel: 'अभी सक्रिय चेतावनी',
    standbyRuleLabel: 'मानक चेतावनी नियम',
    perKgUnit: 'प्रति किलो',
    perMaundUnit: 'प्रति मन (40 किग्रा)',
    emptyState: 'इस खोज के लिए कोई डेटा नहीं मिला।',
    jsonScopeLabel: 'JSON दायरा',
    scopeSection: 'वर्तमान श्रेणी',
    scopeFull: 'पूर्ण 5-श्रेणी डेटाबेस',
  },
  en: {
    title: 'Structured Agro Knowledge Directory & JSON Schema',
    subtitle:
      'Browse organized records across Crops, Growth Stages, Care Tips, Market Prices, and Weather Alerts — or inspect and export the normalized JSON dataset.',
    searchPlaceholder: 'Search crop, stage, tip, market, or weather rule...',
    jsonToggleShow: 'Inspect JSON',
    jsonToggleHide: 'Hide JSON',
    copyJson: 'Copy JSON',
    copiedJson: 'Copied',
    downloadJson: 'Download JSON',
    listenSummary: 'Listen Overview',
    viewStagesBtn: 'View Growth Stages',
    allCropsOpt: 'All Crops',
    dayPrefix: 'Day',
    stageWord: 'Stage',
    durationLabel: 'Duration',
    seedRateLabel: 'Seed & Spacing',
    soilLabel: 'Soil & pH',
    plantingLabel: 'Planting Window',
    harvestLabel: 'Harvest Window',
    fertilizerLabel: 'Fertilizer Dose',
    irrigationLabel: 'Critical Irrigation',
    triggerLabel: 'Trigger Condition',
    adviceLabel: 'Recommended Action',
    affectedCropsLabel: 'Affected Crops',
    activeNowLabel: 'Active Now',
    standbyRuleLabel: 'Monitored Rule',
    perKgUnit: 'Per kg',
    perMaundUnit: 'Per maund (40 kg)',
    emptyState: 'No matching entries found for the selected category or search query.',
    jsonScopeLabel: 'JSON Scope',
    scopeSection: 'Current Category',
    scopeFull: 'Full 5-Section Schema',
  },
};

const GROUP_FILTERS: Array<AgroCropGroupKey | 'all'> = [
  'all',
  'grain',
  'vegetable',
  'spice',
  'pulse_oil_fiber',
  'fruit',
];

export const KnowledgeBaseSection: React.FC<KnowledgeBaseSectionProps> = ({
  lang,
  tips,
  prices,
  weather,
}) => {
  const { playTrack } = useAudioPlayer();
  const c = UI_COPY[lang];

  const [activeSection, setActiveSection] = useState<KnowledgeSectionKey>('crops');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<AgroCropGroupKey | 'all'>('all');
  const [selectedCropId, setSelectedCropId] = useState<string>('all');
  const [showJsonPanel, setShowJsonPanel] = useState(false);
  const [jsonScope, setJsonScope] = useState<'section' | 'full'>('section');
  const [copiedJson, setCopiedJson] = useState(false);

  const knowledgeBase = useMemo(
    () => buildStructuredKnowledgeBase({ tips, prices, weather }),
    [tips, prices, weather]
  );

  const queryLower = searchQuery.trim().toLowerCase();

  const filteredCrops = useMemo(() => {
    return knowledgeBase.crops.filter((crop) => {
      if (groupFilter !== 'all' && crop.category !== groupFilter) return false;
      if (!queryLower) return true;
      return (
        crop.cropName[lang].toLowerCase().includes(queryLower) ||
        crop.cropName.en.toLowerCase().includes(queryLower) ||
        crop.variety[lang].toLowerCase().includes(queryLower) ||
        crop.soilAndPh[lang].toLowerCase().includes(queryLower)
      );
    });
  }, [knowledgeBase.crops, groupFilter, queryLower, lang]);

  const filteredStages = useMemo(() => {
    return knowledgeBase.growthStages.filter((stage) => {
      if (selectedCropId !== 'all' && stage.cropId !== selectedCropId) return false;
      if (!queryLower) return true;
      return (
        stage.cropName[lang].toLowerCase().includes(queryLower) ||
        stage.title[lang].toLowerCase().includes(queryLower) ||
        stage.action[lang].toLowerCase().includes(queryLower)
      );
    });
  }, [knowledgeBase.growthStages, selectedCropId, queryLower, lang]);

  const filteredTips = useMemo(() => {
    return knowledgeBase.careTips.filter((tip) => {
      if (groupFilter !== 'all' && tip.category !== groupFilter) return false;
      if (!queryLower) return true;
      return (
        tip.cropName[lang].toLowerCase().includes(queryLower) ||
        tip.title[lang].toLowerCase().includes(queryLower) ||
        tip.summary[lang].toLowerCase().includes(queryLower) ||
        tip.fertilizerNote[lang].toLowerCase().includes(queryLower)
      );
    });
  }, [knowledgeBase.careTips, groupFilter, queryLower, lang]);

  const filteredPrices = useMemo(() => {
    return knowledgeBase.marketPrices.filter((price) => {
      if (groupFilter !== 'all' && price.category !== groupFilter) return false;
      if (!queryLower) return true;
      return (
        price.cropName[lang].toLowerCase().includes(queryLower) ||
        price.cropName.en.toLowerCase().includes(queryLower) ||
        price.marketName.toLowerCase().includes(queryLower) ||
        price.district.toLowerCase().includes(queryLower)
      );
    });
  }, [knowledgeBase.marketPrices, groupFilter, queryLower, lang]);

  const filteredAlerts = useMemo(() => {
    return knowledgeBase.weatherAlerts.filter((alert) => {
      if (!queryLower) return true;
      return (
        alert.title[lang].toLowerCase().includes(queryLower) ||
        alert.message[lang].toLowerCase().includes(queryLower) ||
        alert.advice[lang].toLowerCase().includes(queryLower) ||
        alert.affectedCrops[lang].some((crop) => crop.toLowerCase().includes(queryLower))
      );
    });
  }, [knowledgeBase.weatherAlerts, queryLower, lang]);

  const activeCategoryMeta =
    knowledgeBase.categories.find((cat) => cat.key === activeSection) ?? knowledgeBase.categories[0];

  const jsonPayload = useMemo(() => {
    if (jsonScope === 'full') {
      return knowledgeBase;
    }
    return {
      schemaVersion: knowledgeBase.schemaVersion,
      generatedAt: knowledgeBase.generatedAt,
      category: activeCategoryMeta,
      items:
        activeSection === 'crops'
          ? filteredCrops
          : activeSection === 'growthStages'
          ? filteredStages
          : activeSection === 'careTips'
          ? filteredTips
          : activeSection === 'marketPrices'
          ? filteredPrices
          : filteredAlerts,
    };
  }, [
    jsonScope,
    knowledgeBase,
    activeCategoryMeta,
    activeSection,
    filteredCrops,
    filteredStages,
    filteredTips,
    filteredPrices,
    filteredAlerts,
  ]);

  const serializedJson = useMemo(() => JSON.stringify(jsonPayload, null, 2), [jsonPayload]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(serializedJson);
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 2200);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(knowledgeBase, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'krishi-mitra-knowledge-base.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleListenOverview = () => {
    const countsText = knowledgeBase.categories
      .map((cat) => `${cat.label[lang]} ${cat.itemCount}`)
      .join(', ');
    playTrack({
      id: `knowledge-overview-${lang}-${activeSection}`,
      title: activeCategoryMeta.label[lang],
      subtitle: c.title,
      text: `${c.title}। ${activeCategoryMeta.description[lang]} ${countsText}।`,
      language: lang,
    });
  };

  const getTabIcon = (key: KnowledgeSectionKey) => {
    switch (key) {
      case 'crops':
        return <Sprout className="h-4 w-4 shrink-0" />;
      case 'growthStages':
        return <Leaf className="h-4 w-4 shrink-0" />;
      case 'careTips':
        return <Check className="h-4 w-4 shrink-0" />;
      case 'marketPrices':
        return <Store className="h-4 w-4 shrink-0" />;
      case 'weatherAlerts':
        return <CloudRain className="h-4 w-4 shrink-0" />;
    }
  };

  return (
    <section
      id="knowledge-base"
      aria-label={c.title}
      className="scroll-mt-20 border-b border-stone-200 bg-[#F7F8F5] py-9 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading & Actions */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl text-balance">
              {c.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600">{c.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleListenOverview}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 whitespace-nowrap"
            >
              <Volume2 className="h-4 w-4 shrink-0 text-emerald-900" />
              <span>{c.listenSummary}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowJsonPanel((prev) => !prev)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                showJsonPanel
                  ? 'border-emerald-900 bg-emerald-50 text-emerald-950'
                  : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Braces className="h-4 w-4 shrink-0 text-emerald-900" />
              <span>{showJsonPanel ? c.jsonToggleHide : c.jsonToggleShow}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-emerald-800 whitespace-nowrap"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>{c.downloadJson}</span>
            </button>
          </div>
        </div>

        {/* 5 Structured JSON Section Tabs */}
        <div
          role="tablist"
          aria-label={c.title}
          className="mt-6 flex gap-2 overflow-x-auto rounded-xl border border-stone-200 bg-white p-1.5"
        >
          {knowledgeBase.categories.map((cat) => {
            const isActive = activeSection === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSection(cat.key)}
                className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-900 text-white'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                }`}
              >
                {getTabIcon(cat.key)}
                <span>{cat.label[lang]}</span>
                <span
                  className={`font-mono-tabular text-xs ${
                    isActive ? 'text-emerald-200' : 'text-stone-500'
                  }`}
                >
                  {cat.itemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Description + Search + Contextual Filter */}
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {activeCategoryMeta.description[lang]}
            </p>

            <div className="relative w-full md:w-80 shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={c.searchPlaceholder}
                aria-label={c.searchPlaceholder}
                className="min-h-[42px] w-full rounded-lg border border-stone-300 bg-[#F7F8F5] py-2 pl-9 pr-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-500 focus:border-emerald-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Group filter for Crops / Care Tips / Market Prices */}
          {(activeSection === 'crops' ||
            activeSection === 'careTips' ||
            activeSection === 'marketPrices') && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-3">
              {GROUP_FILTERS.filter(
                (g) =>
                  activeSection !== 'marketPrices' ||
                  g === 'all' ||
                  g === 'grain' ||
                  g === 'vegetable' ||
                  g === 'spice' ||
                  g === 'fruit'
              ).map((group) => {
                const active = groupFilter === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setGroupFilter(group)}
                    className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-emerald-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {getCropGroupLabel(group, lang)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Crop selector for Growth Stages */}
          {activeSection === 'growthStages' && (
            <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
              <label
                htmlFor="kb-stage-crop-select"
                className="text-xs font-semibold text-stone-700 whitespace-nowrap"
              >
                {knowledgeBase.categories[0].label[lang]}:
              </label>
              <select
                id="kb-stage-crop-select"
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="min-h-[40px] rounded-lg border border-stone-300 bg-[#F7F8F5] px-3 py-1.5 text-xs sm:text-sm font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none"
              >
                <option value="all">{c.allCropsOpt}</option>
                {knowledgeBase.crops.map((crop) => (
                  <option key={crop.cropId} value={crop.cropId}>
                    {crop.cropName[lang]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Collapsible Structured JSON Preview Drawer */}
        {showJsonPanel && (
          <div className="mt-4 overflow-hidden rounded-xl border border-stone-300 bg-stone-950 text-stone-100">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-300">{c.jsonScopeLabel}:</span>
                <button
                  type="button"
                  onClick={() => setJsonScope('section')}
                  className={`min-h-[36px] rounded-md px-2.5 py-1 font-medium transition-colors ${
                    jsonScope === 'section'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  {c.scopeSection}
                </button>
                <button
                  type="button"
                  onClick={() => setJsonScope('full')}
                  className={`min-h-[36px] rounded-md px-2.5 py-1 font-medium transition-colors ${
                    jsonScope === 'full'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  {c.scopeFull}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-stone-700 bg-stone-900 px-3 py-1 text-xs font-semibold text-stone-100 transition-colors hover:bg-stone-800"
              >
                {copiedJson ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{c.copiedJson}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-stone-300" />
                    <span>{c.copyJson}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-100">
              <code>{serializedJson}</code>
            </pre>
          </div>
        )}

        {/* Section Content Grid */}
        <div className="mt-5">
          {/* 1. Crops Directory */}
          {activeSection === 'crops' && (
            filteredCrops.length === 0 ? (
              <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600">
                {c.emptyState}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCrops.map((crop) => (
                  <article
                    key={crop.cropId}
                    className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                        <span>{getCropGroupLabel(crop.category, lang)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{crop.seasonLabel[lang]}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular font-semibold text-emerald-900">
                          {crop.durationDaysMin}–{crop.durationDaysMax}d
                        </span>
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-stone-900">
                        {crop.cropName[lang]}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-stone-600">
                        {crop.variety[lang]}
                      </p>

                      <dl className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-xs leading-relaxed">
                        <div>
                          <dt className="font-semibold text-stone-700">{c.plantingLabel}:</dt>
                          <dd className="text-stone-600">{crop.plantingWindowText[lang]}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-stone-700">{c.harvestLabel}:</dt>
                          <dd className="text-stone-600">{crop.harvestWindowText[lang]}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-stone-700">{c.soilLabel}:</dt>
                          <dd className="text-stone-600">{crop.soilAndPh[lang]}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-stone-700">{c.seedRateLabel}:</dt>
                          <dd className="text-stone-600">{crop.spacingAndSeedRate[lang]}</dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCropId(crop.cropId);
                        setActiveSection('growthStages');
                      }}
                      className="mt-4 inline-flex min-h-[40px] w-full items-center justify-between rounded-lg border border-stone-200 bg-[#F7F8F5] px-3.5 py-2 text-xs font-semibold text-emerald-950 transition-colors hover:border-emerald-700 hover:bg-emerald-50"
                    >
                      <span>{c.viewStagesBtn}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </button>
                  </article>
                ))}
              </div>
            )
          )}

          {/* 2. Growth Stages */}
          {activeSection === 'growthStages' && (
            filteredStages.length === 0 ? (
              <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600">
                {c.emptyState}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {filteredStages.map((stage) => (
                  <article
                    key={stage.stageId}
                    className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-emerald-900">{stage.cropName[lang]}</span>
                      <span className="font-mono-tabular font-semibold text-stone-700">
                        {c.stageWord} {stage.stageOrder} · {c.dayPrefix} {stage.dayOffset}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-bold text-stone-900">
                      {stage.title[lang]}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-stone-700">
                      {stage.action[lang]}
                    </p>
                    {stage.criticalIrrigationNote && (
                      <p className="mt-2.5 border-t border-stone-100 pt-2 text-xs text-stone-600 leading-relaxed">
                        <strong className="font-semibold text-emerald-900">
                          {c.irrigationLabel}:
                        </strong>{' '}
                        {stage.criticalIrrigationNote[lang]}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )
          )}

          {/* 3. Specific Care Tips */}
          {activeSection === 'careTips' && (
            filteredTips.length === 0 ? (
              <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600">
                {c.emptyState}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredTips.map((tip) => (
                  <article
                    key={tip.tipId}
                    className="rounded-xl border border-stone-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-emerald-900">{tip.cropName[lang]}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getCropGroupLabel(tip.category, lang)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tip.seasonLabel[lang]}</span>
                    </div>
                    <h3 className="mt-1.5 text-base sm:text-lg font-bold text-stone-900">
                      {tip.title[lang]}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-stone-600">
                      {tip.summary[lang]}
                    </p>
                    <ol className="mt-3.5 space-y-2 border-t border-stone-100 pt-3">
                      {tip.steps[lang].map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800">
                          <span className="font-mono-tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#F7F8F5] text-xs font-bold text-emerald-900">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-3.5 border-t border-stone-100 pt-2.5 text-xs leading-relaxed text-stone-700">
                      <strong className="font-semibold text-emerald-900">
                        {c.fertilizerLabel}:
                      </strong>{' '}
                      {tip.fertilizerNote[lang]}
                    </p>
                  </article>
                ))}
              </div>
            )
          )}

          {/* 4. Market Prices */}
          {activeSection === 'marketPrices' && (
            filteredPrices.length === 0 ? (
              <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600">
                {c.emptyState}
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-xs sm:text-sm">
                    <thead className="bg-[#F7F8F5] text-xs font-semibold text-stone-700">
                      <tr>
                        <th className="px-4 py-3">{knowledgeBase.categories[0].label[lang]}</th>
                        <th className="px-4 py-3">District / Bazar</th>
                        <th className="px-4 py-3 text-right">{c.perKgUnit}</th>
                        <th className="px-4 py-3 text-right">{c.perMaundUnit}</th>
                        <th className="px-4 py-3 text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredPrices.map((p) => {
                        const unit = p.currency === 'BDT' ? '৳' : '₹';
                        return (
                          <tr key={p.priceId} className="hover:bg-stone-50/70">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-stone-900">{p.cropName[lang]}</div>
                              <div className="text-xs text-stone-500">
                                {getCropGroupLabel(p.category, lang)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-stone-700">
                              <div>{p.marketName}</div>
                              <div className="text-xs text-stone-500">{p.district}</div>
                            </td>
                            <td className="font-mono-tabular px-4 py-3 text-right font-bold text-stone-900">
                              {unit}
                              {p.pricePerKg}
                            </td>
                            <td className="font-mono-tabular px-4 py-3 text-right font-semibold text-emerald-900">
                              {unit}
                              {p.pricePerMaund}
                            </td>
                            <td className="font-mono-tabular px-4 py-3 text-right">
                              {p.trend === 'up' ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                                  <TrendingUp className="h-3.5 w-3.5" />
                                  +{Math.max(0, p.pricePerKg - p.previousPricePerKg)}
                                </span>
                              ) : p.trend === 'down' ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                                  <TrendingDown className="h-3.5 w-3.5" />
                                  -{Math.max(0, p.previousPricePerKg - p.pricePerKg)}
                                </span>
                              ) : (
                                <span className="font-medium text-stone-500">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* 5. Weather Alerts */}
          {activeSection === 'weatherAlerts' && (
            filteredAlerts.length === 0 ? (
              <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600">
                {c.emptyState}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredAlerts.map((alert) => {
                  const tone = alert.isActiveNow
                    ? 'border-amber-300 bg-amber-50/60'
                    : 'border-stone-200 bg-white';
                  return (
                    <article key={alert.alertId} className={`rounded-xl border p-5 ${tone}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold ${
                            alert.isActiveNow ? 'text-amber-900' : 'text-stone-600'
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{alert.isActiveNow ? c.activeNowLabel : c.standbyRuleLabel}</span>
                        </span>
                        <span className="font-mono-tabular text-stone-500 uppercase">
                          {alert.level}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base sm:text-lg font-bold text-stone-900">
                        {alert.title[lang]}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-stone-700">
                        {alert.message[lang]}
                      </p>

                      <dl className="mt-3.5 space-y-2 border-t border-stone-200/70 pt-3 text-xs leading-relaxed">
                        <div>
                          <dt className="font-semibold text-stone-800">{c.triggerLabel}:</dt>
                          <dd className="font-mono-tabular text-stone-600">
                            {alert.triggerCondition[lang]}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-stone-800">{c.adviceLabel}:</dt>
                          <dd className="text-stone-700">{alert.advice[lang]}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-stone-800">{c.affectedCropsLabel}:</dt>
                          <dd className="text-stone-600">
                            {alert.affectedCrops[lang].join(' · ')}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};
