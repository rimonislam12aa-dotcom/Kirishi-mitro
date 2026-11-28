import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BellOff,
  Bookmark,
  Camera,
  CheckCircle2,
  Database,
  Edit3,
  Globe,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Sprout,
  User,
} from 'lucide-react';
import { CROP_CALENDAR_DATA } from '../catalog/cropCalendarData';
import { LANGUAGE_OPTIONS, Translations } from '../catalog/i18n';
import {
  AppLanguage,
  AutoSyncIntervalMinutes,
  CropTip,
  DiseaseDiagnosis,
  FarmerProfileData,
  OfflineDbStats,
  OfflinePendingScan,
  VisitorStats,
  WeatherCacheRecord,
} from '../types/agri';
import { PWAInstallButton } from './PWAInstallButton';
import { QrCodeDisplay } from './QrCodeDisplay';

const FARMER_PROFILE_STORAGE_KEY = 'krishi_mitra_farmer_profile_v1';

interface FarmerProfileSectionProps {
  t: Translations;
  lang: AppLanguage;
  isOnline: boolean;
  isSyncing: boolean;
  weather: WeatherCacheRecord | null;
  dbStats: OfflineDbStats;
  tips: CropTip[];
  diagnoses: DiseaseDiagnosis[];
  pendingScans: OfflinePendingScan[];
  pushEnabled: boolean;
  autoSyncIntervalMinutes: AutoSyncIntervalMinutes;
  activeCropId: string;
  activeCropSowDate: string;
  visitorStats: VisitorStats | null;
  onChangeLanguage: (lang: AppLanguage) => Promise<void>;
  onTogglePush: (enable: boolean) => Promise<{ osGranted: boolean }>;
  onChangeAutoSyncInterval: (minutes: AutoSyncIntervalMinutes) => Promise<void>;
  onSyncNow: (processScans?: boolean) => Promise<void>;
  onOpenOfflineDrawer: () => void;
  onSelectActiveCrop: (id: string) => void;
  onChangeActiveSowDate: (date: string) => void;
  onOpenCropFeature: (sectionId: 'calendar' | 'tips' | 'scanner' | 'yield-radar') => void;
  onOpenActiveCropPage: () => void;
}

const DEFAULT_PROFILE: Record<AppLanguage, FarmerProfileData> = {
  bn: {
    farmerName: 'কৃষক বন্ধু',
    phone: '',
    villageOrUnion: 'আদর্শ কৃষি খামার',
    farmArea: '৫',
    farmUnit: 'bigha',
  },
  hi: {
    farmerName: 'किसान मित्र',
    phone: '',
    villageOrUnion: 'आदर्श कृषि फार्म',
    farmArea: '5',
    farmUnit: 'bigha',
  },
  en: {
    farmerName: 'Farmer Friend',
    phone: '',
    villageOrUnion: 'Smart Family Farm',
    farmArea: '5',
    farmUnit: 'bigha',
  },
};

function readStoredProfile(lang: AppLanguage): FarmerProfileData {
  try {
    const raw = window.localStorage.getItem(FARMER_PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE[lang];
    const parsed = JSON.parse(raw) as Partial<FarmerProfileData>;
    return {
      farmerName: parsed.farmerName?.trim() || DEFAULT_PROFILE[lang].farmerName,
      phone: parsed.phone ?? '',
      villageOrUnion: parsed.villageOrUnion?.trim() || DEFAULT_PROFILE[lang].villageOrUnion,
      farmArea: parsed.farmArea?.trim() || DEFAULT_PROFILE[lang].farmArea,
      farmUnit:
        parsed.farmUnit === 'decimal' || parsed.farmUnit === 'acre' ? parsed.farmUnit : 'bigha',
    };
  } catch {
    return DEFAULT_PROFILE[lang];
  }
}

export const FarmerProfileSection: React.FC<FarmerProfileSectionProps> = ({
  t,
  lang,
  isOnline,
  isSyncing,
  weather,
  dbStats,
  tips,
  diagnoses,
  pendingScans,
  pushEnabled,
  autoSyncIntervalMinutes,
  activeCropId,
  activeCropSowDate,
  visitorStats,
  onChangeLanguage,
  onTogglePush,
  onChangeAutoSyncInterval,
  onSyncNow,
  onOpenOfflineDrawer,
  onSelectActiveCrop,
  onChangeActiveSowDate,
  onOpenCropFeature,
  onOpenActiveCropPage,
}) => {
  const [profile, setProfile] = useState<FarmerProfileData>(() => readStoredProfile(lang));
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<FarmerProfileData>(profile);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(FARMER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage error
    }
  }, [profile]);

  const activeCrop =
    CROP_CALENDAR_DATA.find((c) => c.id === activeCropId) ?? CROP_CALENDAR_DATA[0];
  const bookmarkedTips = tips.filter((item) => item.bookmarked);
  const recentScans = diagnoses.slice(0, 3);

  const unitLabels: Record<FarmerProfileData['farmUnit'], string> =
    lang === 'bn'
      ? { bigha: 'বিঘা', decimal: 'শতাংশ', acre: 'একর' }
      : lang === 'hi'
      ? { bigha: 'बीघा', decimal: 'डिसमिल', acre: 'एकड़' }
      : { bigha: 'Bigha', decimal: 'Decimal', acre: 'Acre' };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      farmerName: draft.farmerName.trim() || DEFAULT_PROFILE[lang].farmerName,
      phone: draft.phone.trim(),
      villageOrUnion: draft.villageOrUnion.trim() || DEFAULT_PROFILE[lang].villageOrUnion,
      farmArea: draft.farmArea.trim() || '1',
      farmUnit: draft.farmUnit,
    });
    setIsEditing(false);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <section
      id="profile"
      aria-label={lang === 'bn' ? 'কৃষক প্রোফাইল' : lang === 'hi' ? 'किसान प्रोफ़ाइल' : 'Farmer Profile'}
      className="bg-[#F4F5F2] py-6 sm:py-9"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Profile Identity Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
          <div className="bg-gradient-to-r from-[#2E7D32] to-[#4D6A1F] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white">
                  <User className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-lime-100">
                    {lang === 'bn'
                      ? 'আমার কৃষি প্রোফাইল'
                      : lang === 'hi'
                      ? 'मेरा किसान प्रोफ़ाइल'
                      : 'My Farmer Profile'}
                  </p>
                  <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight sm:text-2xl">
                    {profile.farmerName}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-lime-50">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {profile.villageOrUnion}
                        {weather?.location.districtName ? ` · ${weather.location.districtName}` : ''}
                      </span>
                    </span>
                    {profile.phone && (
                      <span className="inline-flex items-center gap-1 font-mono-tabular">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{profile.phone}</span>
                      </span>
                    )}
                    <span className="font-mono-tabular">
                      {profile.farmArea} {unitLabels[profile.farmUnit]}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDraft(profile);
                  setIsEditing((prev) => !prev);
                }}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/40 bg-black/20 px-4 py-2 text-xs font-semibold text-white hover:bg-black/35 whitespace-nowrap shrink-0"
              >
                <Edit3 className="h-4 w-4" />
                <span>
                  {isEditing
                    ? lang === 'bn'
                      ? 'সম্পাদনা বাতিল'
                      : lang === 'hi'
                      ? 'रद्द करें'
                      : 'Cancel Edit'
                    : lang === 'bn'
                    ? 'প্রোফাইল সম্পাদনা'
                    : lang === 'hi'
                    ? 'प्रोफ़ाइल संपादित करें'
                    : 'Edit Profile'}
                </span>
              </button>
            </div>
          </div>

          {savedNotice && (
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-[#EEF4EA] px-5 py-3 text-xs font-semibold text-[#1F4E23] sm:px-7">
              <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
              <span>
                {lang === 'bn'
                  ? 'আপনার খামারের প্রোফাইল তথ্য সংরক্ষিত হয়েছে।'
                  : lang === 'hi'
                  ? 'आपकी प्रोफ़ाइल जानकारी सहेज ली गई है।'
                  : 'Your farmer profile details have been saved.'}
              </span>
            </div>
          )}

          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="border-b border-zinc-200 bg-[#F8F9F7] p-5 sm:p-7 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t.feedback.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.farmerName}
                    onChange={(e) => setDraft((p) => ({ ...p, farmerName: e.target.value }))}
                    className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t.feedback.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm font-mono-tabular text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t.feedback.villageLabel}
                  </label>
                  <input
                    type="text"
                    value={draft.villageOrUnion}
                    onChange={(e) => setDraft((p) => ({ ...p, villageOrUnion: e.target.value }))}
                    className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {lang === 'bn'
                      ? 'জমির পরিমাণ'
                      : lang === 'hi'
                      ? 'खेत का क्षेत्रफल'
                      : 'Farm Land Area'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={draft.farmArea}
                      onChange={(e) => setDraft((p) => ({ ...p, farmArea: e.target.value }))}
                      className="min-h-[44px] w-24 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-mono-tabular text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                    />
                    <select
                      value={draft.farmUnit}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          farmUnit: e.target.value as FarmerProfileData['farmUnit'],
                        }))
                      }
                      className="min-h-[44px] flex-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                    >
                      <option value="bigha">{unitLabels.bigha}</option>
                      <option value="decimal">{unitLabels.decimal}</option>
                      <option value="acre">{unitLabels.acre}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-2 text-xs font-semibold text-white hover:bg-[#256628]"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {lang === 'bn'
                      ? 'প্রোফাইল সংরক্ষণ করুন'
                      : lang === 'hi'
                      ? 'प्रोफ़ाइल सहेजें'
                      : 'Save Profile'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* 4-Column Farm & Offline Metrics */}
          <div className="grid grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 sm:grid-cols-4">
            <div className="p-4 sm:p-5">
              <p className="text-xs font-medium text-zinc-600">{t.tips.bookmarkedOnly}</p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-[#2E7D32]">
                {bookmarkedTips.length}
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-xs font-medium text-zinc-600">{t.offlineDrawer.diagnosesCount}</p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-zinc-900">
                {diagnoses.length}
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-xs font-medium text-zinc-600">
                {t.offlineDrawer.yieldPredictionsCount}
              </p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-[#4D6A1F]">
                {dbStats.yieldPredictionsCount}
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-xs font-medium text-zinc-600">
                {t.offlineDrawer.pendingScansCount}
              </p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-zinc-900">
                {pendingScans.length}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Profile Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Active Crop Settings & Saved Items */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Primary Crop & Sowing Date Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-[#2E7D32]" />
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                    {lang === 'bn'
                      ? 'আমার প্রধান ফসল ও রোপণের তারিখ'
                      : lang === 'hi'
                      ? 'मेरी मुख्य फसल और बुवाई तिथि'
                      : 'My Primary Crop & Sowing Date'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onOpenActiveCropPage}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#EEF4EA] px-3 py-1.5 text-xs font-semibold text-[#1F4E23] hover:bg-[#E2ECD9]"
                >
                  <span>
                    {lang === 'bn'
                      ? 'ধাপভিত্তিক পেজ খুলুন'
                      : lang === 'hi'
                      ? 'फसल चरण पेज खोलें'
                      : 'Open Stage Page'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t.calendar.selectCropLabel}
                  </label>
                  <select
                    value={activeCropId}
                    onChange={(e) => onSelectActiveCrop(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-[#F8F9F7] px-3 text-sm font-medium text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                  >
                    {CROP_CALENDAR_DATA.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.cropName[lang]} ({crop.variety[lang]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t.calendar.plantingDateLabel}
                  </label>
                  <input
                    type="date"
                    value={activeCropSowDate}
                    onChange={(e) => onChangeActiveSowDate(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-[#F8F9F7] px-3 text-sm font-mono-tabular text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-xs text-zinc-600">
                {activeCrop.seasonLabel[lang]} · {activeCrop.durationDaysMin}–
                {activeCrop.durationDaysMax}{' '}
                {lang === 'bn' ? 'দিন' : lang === 'hi' ? 'दिन' : 'days'} · {activeCrop.soilAndPh[lang]}
              </p>
            </div>

            {/* Bookmarked Tips & Recent Disease Scans */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-[#4D6A1F]" />
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                    {lang === 'bn'
                      ? 'সংরক্ষিত ফসলের টিপস ও সাম্প্রতিক স্ক্যান'
                      : lang === 'hi'
                      ? 'सहेजे गए टिप्स व हालिया स्कैन'
                      : 'Saved Crop Tips & Recent Scans'}
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                  <span>{t.tips.bookmarkedOnly}</span>
                  <button
                    type="button"
                    onClick={() => onOpenCropFeature('tips')}
                    className="text-[#2E7D32] hover:underline"
                  >
                    {t.nav.tips} →
                  </button>
                </div>

                {bookmarkedTips.length === 0 ? (
                  <p className="rounded-xl border border-zinc-200 bg-[#F8F9F7] px-4 py-3 text-xs text-zinc-600">
                    {lang === 'bn'
                      ? 'এখনো কোনো ফসলের টিপস বুকমার্ক করা হয়নি। ফসলের টিপস পেজ থেকে পছন্দের টিপস সংরক্ষণ করুন।'
                      : lang === 'hi'
                      ? 'अभी कोई फसल टिप्स बुकमार्क नहीं है। फसल व टिप्स पेज से उपयोगी टिप्स सहेजें।'
                      : 'No bookmarked crop tips yet. Save tips from the Crop Tips page for quick access.'}
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-[#F8F9F7]">
                    {bookmarkedTips.slice(0, 4).map((tip) => (
                      <button
                        key={tip.id}
                        type="button"
                        onClick={() => onOpenCropFeature('tips')}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs sm:text-sm hover:bg-white transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">{tip.title[lang]}</p>
                          <p className="text-xs text-zinc-500">
                            {tip.cropName[lang]} · {tip.seasonLabel[lang]}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                  <span>{t.scanner.savedHistoryTitle}</span>
                  <button
                    type="button"
                    onClick={() => onOpenCropFeature('scanner')}
                    className="text-[#2E7D32] hover:underline"
                  >
                    {t.nav.scanner} →
                  </button>
                </div>

                {recentScans.length === 0 ? (
                  <p className="rounded-xl border border-zinc-200 bg-[#F8F9F7] px-4 py-3 text-xs text-zinc-600">
                    {t.scanner.noSavedHistory}
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-[#F8F9F7]">
                    {recentScans.map((scan) => (
                      <button
                        key={scan.id}
                        type="button"
                        onClick={() => onOpenCropFeature('scanner')}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs sm:text-sm hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Camera className="h-4 w-4 shrink-0 text-[#2E7D32]" />
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 truncate">
                              {scan.cropName} · {scan.diseaseName}
                            </p>
                            <p className="text-xs font-mono-tabular text-zinc-500">
                              {new Date(scan.createdAt).toLocaleDateString()} · {scan.confidence}%
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Settings, Sync, Install & QR */}
          <div className="lg:col-span-5 space-y-6">
            {/* App Preferences: Language, Push Alerts, Auto-Sync */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              <h2 className="border-b border-zinc-100 pb-3 text-base sm:text-lg font-bold text-zinc-900">
                {lang === 'bn'
                  ? 'অ্যাপ সেটিংস ও অফলাইন সিঙ্ক'
                  : lang === 'hi'
                  ? 'ऐप सेटिंग्स और ऑफलाइन सिंक'
                  : 'App Settings & Offline Sync'}
              </h2>

              {/* Language */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 mb-2">
                  <Globe className="h-4 w-4 text-[#2E7D32]" />
                  <span>{t.status.languageLabel}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-zinc-100 p-1">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => onChangeLanguage(opt.code)}
                      className={`min-h-[40px] rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                        lang === opt.code
                          ? 'bg-white text-[#255D28] shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {opt.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Push Notification Toggle */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-[#F8F9F7] p-3.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900">
                    {lang === 'bn'
                      ? 'আবহাওয়া পুশ নোটিফিকেশন'
                      : lang === 'hi'
                      ? 'मौसम पुश नोटिफिकेशन'
                      : 'Weather Push Alerts'}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {pushEnabled ? t.weather.pushInAppActive : t.weather.enablePush}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePush(!pushEnabled)}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 ${
                    pushEnabled
                      ? 'bg-[#2E7D32] text-white hover:bg-[#256628]'
                      : 'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
                  }`}
                >
                  {pushEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  <span>{pushEnabled ? t.weather.disablePush : t.weather.enablePush}</span>
                </button>
              </div>

              {/* Auto Sync Interval */}
              <div>
                <p className="text-xs font-semibold text-zinc-700 mb-2">
                  {lang === 'bn'
                    ? 'স্বয়ংক্রিয় আপডেট সময়'
                    : lang === 'hi'
                    ? 'ऑटो-अपडेट अंतराल'
                    : 'Auto-Update Interval'}
                </p>
                <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-zinc-100 p-1">
                  {([15, 30, 60, 180] as AutoSyncIntervalMinutes[]).map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onChangeAutoSyncInterval(mins)}
                      className={`min-h-[38px] rounded-lg px-2 py-1 text-xs font-mono-tabular font-semibold transition-colors ${
                        autoSyncIntervalMinutes === mins
                          ? 'bg-white text-[#255D28] shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sync Now & Open Offline Storage Drawer */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onSyncNow(true)}
                  disabled={!isOnline || isSyncing}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#256628] disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? t.status.syncing : t.status.syncNow}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenOfflineDrawer}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-[#F8F9F7] px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  <Database className="h-4 w-4 text-[#2E7D32]" />
                  <span>{t.status.offlineDbButton}</span>
                </button>
              </div>

              {visitorStats && (
                <p className="border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                  {t.visitors.totalVisits}:{' '}
                  <strong className="font-mono-tabular text-zinc-800">
                    {visitorStats.totalVisits.toLocaleString()}
                  </strong>{' '}
                  · {t.visitors.uniqueVisitors}:{' '}
                  <strong className="font-mono-tabular text-zinc-800">
                    {visitorStats.uniqueVisitors.toLocaleString()}
                  </strong>
                </p>
              )}
            </div>

            {/* Install App & QR Share Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <PWAInstallButton t={t} variant="drawer" />
              <QrCodeDisplay t={t} variant="compact" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
