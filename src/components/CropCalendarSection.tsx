import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Layers,
  Sprout,
  Volume2,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  BANGLA_MONTH_HINTS,
  CROP_CALENDAR_DATA,
  MONTH_LABELS,
} from '../catalog/cropCalendarData';
import { Translations } from '../catalog/i18n';
import { SEED_CROP_TIPS } from '../catalog/seedData';
import { AppLanguage, CropCalendarItem, CropTip } from '../types/agri';

interface CropCalendarSectionProps {
  t: Translations;
  lang: AppLanguage;
  selectedCropId?: string;
  onSelectCropId?: (id: string) => void;
  plantingDate?: string;
  onPlantingDateChange?: (date: string) => void;
  viewMode?: 'directory' | 'crop-page';
  onViewModeChange?: (mode: 'directory' | 'crop-page') => void;
  completedStageKeys?: Record<string, boolean>;
  onToggleStageComplete?: (cropId: string, dayOffset: number) => void;
  onBackToHome?: () => void;
  onOpenTool?: (tool: 'scanner' | 'yield-radar') => void;
}

const CROP_TIP_KEY_BY_CALENDAR_ID: Record<string, CropTip['cropKey']> = {
  'cal-boro-rice': 'rice',
  'cal-aman-rice': 'rice',
  'cal-aus-rice': 'rice',
  'cal-potato': 'potato',
  'cal-wheat': 'wheat',
  'cal-mustard': 'mustard',
  'cal-tomato': 'tomato',
  'cal-onion': 'onion',
  'cal-jute': 'jute',
  'cal-chili': 'chili',
};

const EXTRA_CROP_CARE_BY_CALENDAR_ID: Record<
  string,
  Pick<CropTip, 'id' | 'title' | 'seasonLabel' | 'steps' | 'fertilizerNote' | 'audioScript'>
> = {
  'cal-maize': {
    id: 'extra-maize-care',
    title: {
      bn: 'ভুট্টার ধাপভিত্তিক পরিচর্যা ও সার ব্যবস্থাপনা',
      hi: 'मक्का की चरणबद्ध देखभाल व खाद प्रबंधन',
      en: 'Step-by-Step Maize Care & Fertilizer Management',
    },
    seasonLabel: {
      bn: 'রবি ও খরিফ ভুট্টা',
      hi: 'रबी व खरीफ मक्का',
      en: 'Rabi & Kharif Maize',
    },
    steps: {
      bn: [
        'বপনের সময় লাইন থেকে লাইন ৬০–৭৫ সেমি ও গাছ থেকে গাছ ২০–২৫ সেমি দূরত্বে বীজ বপন করুন।',
        'বপনের ২০–২৫ দিন পর আগাছা পরিষ্কার করে প্রথম উপরি ইউরিয়া সার দিয়ে হালকা সেচ দিন।',
        '৪০–৪৫ দিনে হাঁটু সমান উঁচু হলে দ্বিতীয় উপরি ইউরিয়া দিয়ে গোড়ায় মাটি তুলে দিন।',
        'মোচা বের হওয়া ও দানা বাঁধার সময় ক্ষেতে পর্যাপ্ত আর্দ্রতা ধরে রাখুন এবং ফল আর্মিওয়ার্ম পোকা নিয়মিত পরীক্ষা করুন।',
      ],
      hi: [
        'बुवाई में कतार से कतार 60–75 सेमी और पौधे से पौधे 20–25 सेमी दूरी रखें।',
        '20–25 दिन बाद निराई करके यूरिया की पहली टॉप-ड्रेसिंग व हल्की सिंचाई दें।',
        '40–45 दिन पर घुटने तक ऊंचाई होने पर दूसरी यूरिया देकर मिट्टी चढ़ाएं।',
        'भुट्टा बनते समय नमी बनाए रखें और फॉल आर्मीवर्म कीट की निगरानी करें।',
      ],
      en: [
        'Sow seeds with 60–75 cm row spacing and 20–25 cm plant spacing for strong cob development.',
        'Weed at 20–25 days after sowing, apply first urea top-dressing, and irrigate lightly.',
        'At knee-high stage (40–45 days), apply second urea dose and earth up soil around stems.',
        'Maintain steady moisture during silking and grain fill while scouting weekly for fall armyworm.',
      ],
    },
    fertilizerNote: {
      bn: 'বিঘা প্রতি: শেষ চাষে ইউরিয়া ১৫ কেজি, টিএসপি ৩০–৩৫ কেজি, এমওপি ২০–২৫ কেজি ও জিপসাম ১৫ কেজি দিন। বপনের ২৫ ও ৪৫ দিনে বাকি ১৫ কেজি করে ইউরিয়া উপরি প্রয়োগ করুন।',
      hi: 'प्रति बीघा: बुवाई में यूरिया 15 किग्रा, DAP/TSP 30–35 किग्रा, MOP 20–25 किग्रा व जिप्सम 15 किग्रा दें। 25 और 45 दिन पर 15–15 किग्रा यूरिया टॉप-ड्रेसिंग करें।',
      en: 'Per bigha: basal 15 kg urea, 30–35 kg TSP, 20–25 kg MOP, 15 kg gypsum. Top-dress 15 kg urea each at Day 25 and Day 45.',
    },
    audioScript: {
      bn: 'ভুট্টা চাষে ৬০ থেকে ৭৫ সেন্টিমিটার সারিতে বীজ বপন করুন। বপনের ২৫ ও ৪৫ দিনে ইউরিয়া সার দিয়ে গোড়ায় মাটি তুলে সেচ দিন এবং মোচা আসার সময় নিয়মিত পোকা পর্যবেক্ষণ করুন।',
      hi: 'मक्का की खेती में कतार में बुवाई करें, 25 और 45 दिन पर यूरिया खाद देकर सिंचाई करें तथा भुट्टा बनते समय कीट निगरानी करें।',
      en: 'Sow maize in rows, top-dress urea at Day 25 and Day 45 with irrigation, and keep soil moist during silking.',
    },
  },
  'cal-lentil': {
    id: 'extra-lentil-care',
    title: {
      bn: 'মসুর ডালের ধাপভিত্তিক পরিচর্যা ও সার ব্যবস্থাপনা',
      hi: 'मसूर की चरणबद्ध देखभाल व खाद प्रबंधन',
      en: 'Step-by-Step Lentil Care & Nutrient Management',
    },
    seasonLabel: {
      bn: 'রবি মৌসুম (ডাল ফসল)',
      hi: 'रबी मौसम (दलहन)',
      en: 'Rabi Season (Pulse)',
    },
    steps: {
      bn: [
        'বপনের আগে প্রতি কেজি বীজে জীবাণু সার (রাইজোবিয়াম) ৪০–৫০ গ্রাম ও কার্বেন্ডাজিম মিশিয়ে শোধন করুন।',
        'জমিতে হালকা জো অবস্থায় ২৫–৩০ সেমি সারিতে বীজ বুনুন এবং জলাবদ্ধতা সম্পূর্ণ এড়িয়ে চলুন।',
        'বপনের ২০–২৫ দিন পর একটি আগাছা দমন নিড়ানি দিন। প্রয়োজন হলে ৩৫ দিনে হালকা সেচ দিন।',
        'ফুল ও শুঁটি গঠনের সময় পাতার ব্লাইট বা জাবপোকা দেখা দিলে দ্রুত অনুমোদিত ব্যবস্থা নিন এবং ৮০% শুঁটি বাদামি হলে কেটে নিন।',
      ],
      hi: [
        'बुवाई से पहले प्रति किग्रा बीज में 40–50 ग्राम राइजोबियम और फफूंदनाशी मिलाकर उपचार करें।',
        'हल्की नमी में 25–30 सेमी कतार में बुवाई करें और जलभराव से बचाव रखें।',
        '20–25 दिन बाद निराई करें; बहुत सूखा होने पर 35 दिन में एक हल्की सिंचाई दें।',
        'फूल व फली बनते समय झुलसा और माहू की निगरानी करें तथा 80% फलियां भूरे होने पर कटाई करें।',
      ],
      en: [
        'Treat seed before sowing with 40–50 g/kg Rhizobium inoculant and protective fungicide.',
        'Sow in 25–30 cm rows under moist soil conditions and ensure zero waterlogging.',
        'Weed at 20–25 days after sowing and give at most one light irrigation at Day 35 if soil cracks.',
        'Monitor for Stemphylium blight and aphids during flowering; harvest when 80% pods turn brown.',
      ],
    },
    fertilizerNote: {
      bn: 'বিঘা প্রতি: শেষ চাষে ইউরিয়া ৫–৬ কেজি, টিএসপি ১২–১৫ কেজি, এমওপি ৬–৮ কেজি ও বোরিক এসিড ১ কেজি একসাথে প্রয়োগ করুন। ডাল ফসলে অতিরিক্ত ইউরিয়ার দরকার হয় না।',
      hi: 'प्रति बीघा: अंतिम जुताई में यूरिया 5–6 किग्रा, TSP 12–15 किग्रा, MOP 6–8 किग्रा व बोरॉन 1 किग्रा दें। दलहन में अधिक यूरिया न डालें।',
      en: 'Per bigha: basal 5–6 kg urea, 12–15 kg TSP, 6–8 kg MOP, and 1 kg boron at land prep. Avoid excess nitrogen.',
    },
    audioScript: {
      bn: 'মসুর ডাল বপনের আগে বীজ শোধন ও রাইজোবিয়াম জীবাণু সার মেশান। ক্ষেতে জলাবদ্ধতা হতে দেবেন না এবং ৮০ শতাংশ শুঁটি পেকে বাদামি হলে সকালে ফসল কাটুন।',
      hi: 'मसूर बुवाई से पहले बीज उपचार और राइजोबियम मिलाएं, जलभराव न होने दें तथा 80% फलियां पकने पर कटाई करें।',
      en: 'Inoculate lentil seed with Rhizobium before sowing, prevent waterlogging, and harvest at 80% pod browning.',
    },
  },
};

function addDays(dateStr: string, days: number): Date {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2] + days);
  }
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateLocal(date: Date, lang: AppLanguage): string {
  const locale = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-GB';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const COPY: Record<
  AppLanguage,
  {
    step1Label: string;
    step2Label: string;
    allSeasons: string;
    seasonFilterLabel: string;
    monthSpotlightTitle: string;
    openCropPageBtn: string;
    backToDirectoryBtn: string;
    prevCropBtn: string;
    nextCropBtn: string;
    stagesCountSuffix: string;
    stageStepperHeading: string;
    stageFocusMode: string;
    stageAllMode: string;
    stepPrefix: string;
    prevStageBtn: string;
    nextStageBtn: string;
    markDoneBtn: string;
    markedDoneBtn: string;
    statusDone: string;
    statusActive: string;
    statusUpcoming: string;
    linkedCareTitle: string;
    dayLabel: string;
  }
> = {
  bn: {
    step1Label: '১. ফসল নির্বাচন (সব কার্ড)',
    step2Label: '২. ফসলের নির্দিষ্ট সময়সূচি ও ধাপ পেজ',
    allSeasons: 'সব মৌসুম',
    seasonFilterLabel: 'মৌসুম অনুযায়ী ফিল্টার',
    monthSpotlightTitle: 'মাসভিত্তিক তাৎক্ষণিক পরামর্শ',
    openCropPageBtn: 'সময়সূচি ও ধাপ দেখুন',
    backToDirectoryBtn: 'সব ফসলের তালিকায় ফিরুন',
    prevCropBtn: 'আগের ফসল',
    nextCropBtn: 'পরবর্তী ফসল',
    stagesCountSuffix: 'টি ধাপ',
    stageStepperHeading: 'ধাপভিত্তিক পরিচর্যা ও কাজের নেভিগেশন',
    stageFocusMode: 'ধাপ অনুযায়ী দেখুন',
    stageAllMode: 'সব ধাপ একসাথে',
    stepPrefix: 'ধাপ',
    prevStageBtn: 'আগের ধাপ',
    nextStageBtn: 'পরবর্তী ধাপ',
    markDoneBtn: 'কাজ সম্পন্ন চিহ্নিত করুন',
    markedDoneBtn: 'সম্পন্ন হয়েছে',
    statusDone: 'সম্পন্ন',
    statusActive: 'চলমান ধাপ',
    statusUpcoming: 'আসন্ন ধাপ',
    linkedCareTitle: 'এই ফসলের সার ও পরিচর্যা নির্দেশিকা',
    dayLabel: 'দিন',
  },
  hi: {
    step1Label: '1. फसल चुनें (सभी कार्ड)',
    step2Label: '2. फसल का अलग शेड्यूल व चरण पेज',
    allSeasons: 'सभी मौसम',
    seasonFilterLabel: 'मौसम के अनुसार चुनें',
    monthSpotlightTitle: 'महीने के अनुसार त्वरित सलाह',
    openCropPageBtn: 'शेड्यूल व चरण देखें',
    backToDirectoryBtn: 'सभी फसलों की सूची पर लौटें',
    prevCropBtn: 'पिछली फसल',
    nextCropBtn: 'अगली फसल',
    stagesCountSuffix: 'चरण',
    stageStepperHeading: 'चरणवार देखभाल व कार्य नेविगेशन',
    stageFocusMode: 'एक-एक चरण देखें',
    stageAllMode: 'सभी चरण एक साथ',
    stepPrefix: 'चरण',
    prevStageBtn: 'पिछला चरण',
    nextStageBtn: 'अगला चरण',
    markDoneBtn: 'कार्य पूर्ण चिह्नित करें',
    markedDoneBtn: 'पूर्ण हो गया',
    statusDone: 'पूर्ण',
    statusActive: 'चालू चरण',
    statusUpcoming: 'आगामी चरण',
    linkedCareTitle: 'इस फसल के लिए खाद व देखभाल सलाह',
    dayLabel: 'दिन',
  },
  en: {
    step1Label: '1. Choose Crop (Directory)',
    step2Label: '2. Dedicated Crop Schedule & Stage Page',
    allSeasons: 'All Seasons',
    seasonFilterLabel: 'Filter by Season',
    monthSpotlightTitle: 'This Month Spotlight',
    openCropPageBtn: 'Open Crop Schedule',
    backToDirectoryBtn: 'Back to All Crops',
    prevCropBtn: 'Prev Crop',
    nextCropBtn: 'Next Crop',
    stagesCountSuffix: 'stages',
    stageStepperHeading: 'Sequential Stage-by-Stage Task Navigator',
    stageFocusMode: 'Step-by-Step View',
    stageAllMode: 'Full Timeline',
    stepPrefix: 'Stage',
    prevStageBtn: 'Previous Stage',
    nextStageBtn: 'Next Stage',
    markDoneBtn: 'Mark Stage Complete',
    markedDoneBtn: 'Completed',
    statusDone: 'Done',
    statusActive: 'Current Stage',
    statusUpcoming: 'Upcoming',
    linkedCareTitle: 'Fertilizer & Field Care Guide for This Crop',
    dayLabel: 'Day',
  },
};

export const CropCalendarSection: React.FC<CropCalendarSectionProps> = ({
  t,
  lang,
  selectedCropId: controlledCropId,
  onSelectCropId,
  plantingDate: controlledPlantingDate,
  onPlantingDateChange,
  viewMode: controlledViewMode,
  onViewModeChange,
  completedStageKeys: controlledCompletedMap,
  onToggleStageComplete,
  onBackToHome,
  onOpenTool,
}) => {
  const { playTrack } = useAudioPlayer();
  const c = COPY[lang];

  const currentMonthIndex = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);
  const [seasonFilter, setSeasonFilter] = useState<'all' | 'rabi' | 'kharif1' | 'kharif2'>('all');
  const [internalCropId, setInternalCropId] = useState<string>(CROP_CALENDAR_DATA[0].id);
  const [internalPlantingDate, setInternalPlantingDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [internalViewMode, setInternalViewMode] = useState<'directory' | 'crop-page'>('directory');
  const [internalCompletedMap, setInternalCompletedMap] = useState<Record<string, boolean>>({});

  const selectedCropId = controlledCropId ?? internalCropId;
  const plantingDate = controlledPlantingDate ?? internalPlantingDate;
  const viewMode = controlledViewMode ?? internalViewMode;
  const completedMap = controlledCompletedMap ?? internalCompletedMap;

  const setSelectedCropId = (id: string) => {
    if (onSelectCropId) onSelectCropId(id);
    else setInternalCropId(id);
  };

  const setPlantingDate = (date: string) => {
    if (onPlantingDateChange) onPlantingDateChange(date);
    else setInternalPlantingDate(date);
  };

  const setViewMode = (mode: 'directory' | 'crop-page') => {
    if (onViewModeChange) onViewModeChange(mode);
    else setInternalViewMode(mode);
  };

  const toggleStageDone = (cropId: string, dayOffset: number) => {
    if (onToggleStageComplete) {
      onToggleStageComplete(cropId, dayOffset);
      return;
    }
    const key = `${cropId}:${dayOffset}`;
    setInternalCompletedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [stageLayout, setStageLayout] = useState<'stepper' | 'all'>('stepper');
  const [showFullMatrix, setShowFullMatrix] = useState(false);

  const selectedCropIndex = useMemo(
    () => Math.max(0, CROP_CALENDAR_DATA.findIndex((item) => item.id === selectedCropId)),
    [selectedCropId]
  );

  const selectedCrop: CropCalendarItem = useMemo(
    () => CROP_CALENDAR_DATA[selectedCropIndex] ?? CROP_CALENDAR_DATA[0],
    [selectedCropIndex]
  );

  const linkedCropTip = useMemo(() => {
    const key = CROP_TIP_KEY_BY_CALENDAR_ID[selectedCrop.id];
    if (key) {
      return SEED_CROP_TIPS.find((tip) => tip.cropKey === key) ?? null;
    }
    return EXTRA_CROP_CARE_BY_CALENDAR_ID[selectedCrop.id] ?? null;
  }, [selectedCrop.id]);

  const plantThisMonth = useMemo(
    () => CROP_CALENDAR_DATA.filter((item) => item.plantingMonths.includes(selectedMonth)),
    [selectedMonth]
  );

  const harvestThisMonth = useMemo(
    () => CROP_CALENDAR_DATA.filter((item) => item.harvestMonths.includes(selectedMonth)),
    [selectedMonth]
  );

  const directoryCrops = useMemo(() => {
    if (seasonFilter === 'all') return CROP_CALENDAR_DATA;
    return CROP_CALENDAR_DATA.filter(
      (item) => item.seasonKey === seasonFilter || item.seasonKey === 'all'
    );
  }, [seasonFilter]);

  const scheduleCalculation = useMemo(() => {
    const harvestStart = addDays(plantingDate, selectedCrop.durationDaysMin);
    const harvestEnd = addDays(plantingDate, selectedCrop.durationDaysMax);

    const sowDateObj = addDays(plantingDate, 0);
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const sowMidnight = new Date(
      sowDateObj.getFullYear(),
      sowDateObj.getMonth(),
      sowDateObj.getDate()
    );
    const diffDays = Math.round(
      (todayMidnight.getTime() - sowMidnight.getTime()) / (1000 * 60 * 60 * 24)
    );

    const milestones = selectedCrop.milestones.map((m) => {
      const targetDate = addDays(plantingDate, m.dayOffset);
      const manualDone = Boolean(completedMap[`${selectedCrop.id}:${m.dayOffset}`]);
      return {
        ...m,
        targetDate,
        elapsedReached: diffDays >= m.dayOffset,
        completed: manualDone || diffDays >= m.dayOffset,
        manualDone,
      };
    });

    return {
      harvestStart,
      harvestEnd,
      diffDays,
      milestones,
    };
  }, [plantingDate, selectedCrop, completedMap]);

  // When switching crops, pick the current active/next stage automatically
  useEffect(() => {
    const nextIdx = scheduleCalculation.milestones.findIndex((m) => !m.completed);
    setActiveStageIdx(nextIdx >= 0 ? nextIdx : 0);
  }, [selectedCrop.id]);

  const openCropDedicatedPage = (cropId: string) => {
    setSelectedCropId(cropId);
    setViewMode('crop-page');
    document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrevCrop = () => {
    const prevIdx =
      (selectedCropIndex - 1 + CROP_CALENDAR_DATA.length) % CROP_CALENDAR_DATA.length;
    setSelectedCropId(CROP_CALENDAR_DATA[prevIdx].id);
  };

  const handleNextCrop = () => {
    const nextIdx = (selectedCropIndex + 1) % CROP_CALENDAR_DATA.length;
    setSelectedCropId(CROP_CALENDAR_DATA[nextIdx].id);
  };

  const handleListenSchedule = () => {
    const startText = formatDateLocal(scheduleCalculation.harvestStart, lang);
    const endText = formatDateLocal(scheduleCalculation.harvestEnd, lang);
    const sowText = formatDateLocal(addDays(plantingDate, 0), lang);
    const currentStep =
      scheduleCalculation.milestones[activeStageIdx] ?? scheduleCalculation.milestones[0];

    const script =
      lang === 'bn'
        ? `${selectedCrop.cropName.bn} ফসলের রোপণ ও কর্তন পরিকল্পনা। আপনি যদি ${sowText} তারিখে রোপণ করেন, তবে ${selectedCrop.durationDaysMin} থেকে ${selectedCrop.durationDaysMax} দিনের মধ্যে অর্থাৎ ${startText} থেকে ${endText} তারিখের মধ্যে ফসল তোলার উপযুক্ত হবে। নির্বাচিত ধাপ (${currentStep.dayOffset} দিনে): ${currentStep.title.bn}। ${currentStep.action.bn}`
        : lang === 'hi'
        ? `${selectedCrop.cropName.hi} फसल योजना। यदि आप ${sowText} को बुवाई करते हैं, तो ${selectedCrop.durationDaysMin} से ${selectedCrop.durationDaysMax} दिनों में यानी ${startText} से ${endText} के बीच कटाई के लिए तैयार होगी। चयनित चरण (${currentStep.dayOffset} दिन): ${currentStep.title.hi}। ${currentStep.action.hi}`
        : `${selectedCrop.cropName.en} planting and harvest plan. If sown on ${sowText}, expect harvest in ${selectedCrop.durationDaysMin} to ${selectedCrop.durationDaysMax} days, between ${startText} and ${endText}. Current step at day ${currentStep.dayOffset}: ${currentStep.title.en}. ${currentStep.action.en}`;

    playTrack({
      id: `calendar-${selectedCrop.id}-${plantingDate}-${lang}`,
      title: `${selectedCrop.cropName[lang]} · ${t.calendar.plannerTitle}`,
      subtitle: `${startText} – ${endText}`,
      text: script,
      language: lang,
    });
  };

  const months = MONTH_LABELS[lang];
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round((Math.max(0, scheduleCalculation.diffDays) / selectedCrop.durationDaysMax) * 100)
    )
  );

  const focusedStage =
    scheduleCalculation.milestones[activeStageIdx] ?? scheduleCalculation.milestones[0];

  return (
    <section
      id="calendar"
      className="scroll-mt-20 border-b border-zinc-200 bg-[#F4F5F2] py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title + Sequential 2-Step Breadcrumb Bar */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-wide text-[#4D6A1F] uppercase">
              {t.nav.calendar}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl text-balance">
              {t.calendar.sectionTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600">
              {t.calendar.sectionSubtitle}
            </p>
          </div>

          {/* Step-by-step Navigation Breadcrumb Pills */}
          <div
            role="tablist"
            aria-label={t.calendar.sectionTitle}
            className="inline-flex w-full lg:w-auto flex-wrap sm:flex-nowrap items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'directory'}
              onClick={() => setViewMode('directory')}
              className={`min-h-[42px] flex-1 lg:flex-initial rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                viewMode === 'directory'
                  ? 'bg-[#2E7D32] text-white'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {c.step1Label}
            </button>
            <ChevronRight className="hidden sm:block h-4 w-4 text-zinc-400 shrink-0" />
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'crop-page'}
              onClick={() => setViewMode('crop-page')}
              className={`min-h-[42px] flex-1 lg:flex-initial rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                viewMode === 'crop-page'
                  ? 'bg-[#4D6A1F] text-white'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {viewMode === 'crop-page'
                ? `${selectedCrop.cropName[lang]} · ${c.stepPrefix}`
                : c.step2Label}
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* STEP 1: CROP ADVISORY DIRECTORY CARDS + MONTHLY SPOTLIGHT        */}
        {/* ================================================================ */}
        {viewMode === 'directory' && (
          <div className="mt-7 space-y-6">
            {/* Monthly Advisor Quick Cards */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{c.monthSpotlightTitle}</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {months[selectedMonth - 1]} ({BANGLA_MONTH_HINTS[selectedMonth - 1]})
                  </p>
                </div>

                <div className="sm:hidden">
                  <label htmlFor="calendar-month-select" className="sr-only">
                    {t.calendar.advisorMonthLabel}
                  </label>
                  <select
                    id="calendar-month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 text-sm font-semibold text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                  >
                    {months.map((label, idx) => (
                      <option key={label} value={idx + 1}>
                        {label} ({BANGLA_MONTH_HINTS[idx]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden sm:flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1">
                  {months.map((label, idx) => {
                    const monthNum = idx + 1;
                    const active = selectedMonth === monthNum;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedMonth(monthNum)}
                        className={`min-h-[32px] rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#2E7D32] text-white shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-[#F8F9F7] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#255D28]">
                    <Sprout className="h-4 w-4 text-[#2E7D32] shrink-0" />
                    <span>{t.calendar.plantNowTitle}</span>
                    <span className="ml-auto font-mono-tabular text-xs text-zinc-500">
                      {plantThisMonth.length}
                    </span>
                  </div>
                  {plantThisMonth.length === 0 ? (
                    <p className="mt-3 text-xs text-zinc-600">{t.calendar.noPlantMonth}</p>
                  ) : (
                    <div className="mt-3 divide-y divide-zinc-200">
                      {plantThisMonth.map((crop) => (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => openCropDedicatedPage(crop.id)}
                          className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:text-[#2E7D32]"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-zinc-900">
                              {crop.cropName[lang]}
                            </div>
                            <div className="mt-0.5 text-xs text-zinc-600">
                              {crop.plantingWindowText[lang]}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-[#2E7D32]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-200 bg-[#F8F9F7] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    <Calendar className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>{t.calendar.harvestNowTitle}</span>
                    <span className="ml-auto font-mono-tabular text-xs text-zinc-500">
                      {harvestThisMonth.length}
                    </span>
                  </div>
                  {harvestThisMonth.length === 0 ? (
                    <p className="mt-3 text-xs text-zinc-600">{t.calendar.noHarvestMonth}</p>
                  ) : (
                    <div className="mt-3 divide-y divide-zinc-200">
                      {harvestThisMonth.map((crop) => (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => openCropDedicatedPage(crop.id)}
                          className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:text-[#2E7D32]"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-zinc-900">
                              {crop.cropName[lang]}
                            </div>
                            <div className="mt-0.5 text-xs text-zinc-600">
                              {crop.harvestWindowText[lang]}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-amber-700" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Season Filter + Per-Crop Directory Grid */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-zinc-900">{c.seasonFilterLabel}</p>
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-1">
                {(
                  [
                    { key: 'all', label: c.allSeasons },
                    { key: 'rabi', label: t.tips.seasons.rabi },
                    { key: 'kharif1', label: t.tips.seasons.zaid },
                    { key: 'kharif2', label: t.tips.seasons.kharif },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSeasonFilter(tab.key)}
                    className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      seasonFilter === tab.key
                        ? 'bg-[#2E7D32] text-white'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {directoryCrops.map((crop) => {
                const isPinned = crop.id === selectedCropId;
                return (
                  <article
                    key={crop.id}
                    className={`flex flex-col justify-between rounded-2xl border bg-white p-5 transition-colors shadow-xs ${
                      isPinned
                        ? 'border-[#2E7D32] ring-1 ring-[#2E7D32]/20'
                        : 'border-zinc-200 hover:border-[#4D6A1F]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                        <span className="font-semibold text-[#4D6A1F]">{crop.seasonLabel[lang]}</span>
                        <span className="font-mono-tabular font-semibold text-zinc-700">
                          {crop.durationDaysMin}–{crop.durationDaysMax} {c.dayLabel}
                        </span>
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-zinc-900">
                        {crop.cropName[lang]}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-zinc-600">
                        {crop.variety[lang]}
                      </p>

                      <dl className="mt-4 space-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                        <div>
                          <dt className="font-semibold text-zinc-800">{t.calendar.plantingCol}</dt>
                          <dd className="mt-0.5 leading-relaxed">{crop.plantingWindowText[lang]}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-zinc-800">{t.calendar.harvestCol}</dt>
                          <dd className="mt-0.5 leading-relaxed">{crop.harvestWindowText[lang]}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3.5">
                      <span className="font-mono-tabular text-xs font-semibold text-zinc-600">
                        {crop.milestones.length} {c.stagesCountSuffix}
                      </span>
                      <button
                        type="button"
                        onClick={() => openCropDedicatedPage(crop.id)}
                        className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#2E7D32] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#256628] whitespace-nowrap"
                      >
                        <span>{c.openCropPageBtn}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 2: DEDICATED PER-CROP SCHEDULE & SEQUENTIAL STAGE PAGE      */}
        {/* ================================================================ */}
        {viewMode === 'crop-page' && (
          <div className="mt-7 space-y-6">
            {/* Dedicated Crop Page Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                {onBackToHome && (
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#2E7D32]/30 bg-[#EEF4EA] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#255D28] hover:bg-[#E1ECDA]"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span>{t.home.backToHome}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewMode('directory')}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-zinc-300 bg-[#F8F9F7] px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  {!onBackToHome && <ArrowLeft className="h-4 w-4 shrink-0" />}
                  <span>{c.backToDirectoryBtn}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevCrop}
                  className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{c.prevCropBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextCrop}
                  className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <span>{c.nextCropBtn}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleListenSchedule}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#2E7D32] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#256628]"
                >
                  <Volume2 className="h-4 w-4 shrink-0" />
                  <span>{t.calendar.listenPlanBtn}</span>
                </button>
              </div>
            </div>

            {/* Crop Overview + Sowing Date Calculator Card & Stage Navigator Grid */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left 5 Cols: Dedicated Crop Metadata & Sowing Schedule */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-5 shadow-xs space-y-5">
                <div className="border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#4D6A1F]">
                    <span>{selectedCrop.seasonLabel[lang]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">
                      {selectedCrop.durationDaysMin}–{selectedCrop.durationDaysMax} {c.dayLabel}
                    </span>
                  </div>
                  <h3 className="mt-1 text-2xl font-bold text-zinc-900">
                    {selectedCrop.cropName[lang]}
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-zinc-600">
                    {selectedCrop.variety[lang]}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="calendar-sow-date"
                    className="block text-xs font-semibold text-zinc-700"
                  >
                    {t.calendar.plantingDateLabel}
                  </label>
                  <input
                    id="calendar-sow-date"
                    type="date"
                    value={plantingDate}
                    onChange={(e) => {
                      if (e.target.value) setPlantingDate(e.target.value);
                    }}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 font-mono-tabular text-sm text-zinc-900 focus:border-[#2E7D32] focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-[#2E7D32]/25 bg-[#EEF4EA] p-4">
                  <div className="text-xs font-semibold text-[#255D28]">
                    {t.calendar.expectedHarvestLabel}
                  </div>
                  <div className="mt-1 font-mono-tabular text-base sm:text-lg font-bold text-[#1B431E]">
                    {formatDateLocal(scheduleCalculation.harvestStart, lang)} –{' '}
                    {formatDateLocal(scheduleCalculation.harvestEnd, lang)}
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#2E7D32] transition-all"
                      style={{ width: `${Math.max(4, progressPercent)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-zinc-700">
                    {scheduleCalculation.diffDays < 0
                      ? t.calendar.notPlantedYetMsg
                      : scheduleCalculation.diffDays >= selectedCrop.durationDaysMin
                      ? t.calendar.readyToHarvestMsg
                      : `${t.calendar.currentProgressLabel}: ${scheduleCalculation.diffDays} ${t.calendar.daysElapsedSuffix}`}
                  </p>
                </div>

                <dl className="divide-y divide-zinc-200 border-t border-zinc-200 text-xs">
                  <div className="py-2.5">
                    <dt className="font-semibold text-zinc-500">{t.calendar.soilLabel}</dt>
                    <dd className="mt-0.5 text-zinc-900">{selectedCrop.soilAndPh[lang]}</dd>
                  </div>
                  <div className="py-2.5">
                    <dt className="font-semibold text-zinc-500">{t.calendar.spacingLabel}</dt>
                    <dd className="mt-0.5 text-zinc-900">{selectedCrop.spacingAndSeedRate[lang]}</dd>
                  </div>
                  <div className="py-2.5 pb-0">
                    <dt className="font-semibold text-zinc-500">{t.calendar.plantingCol}</dt>
                    <dd className="mt-0.5 text-zinc-700">{selectedCrop.plantingWindowText[lang]}</dd>
                  </div>
                </dl>
              </div>

              {/* Right 7 Cols: Step-by-Step Sequential Growth Stage Navigator */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-7 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">{c.stageStepperHeading}</h3>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {selectedCrop.cropName[lang]} · {scheduleCalculation.milestones.length}{' '}
                        {c.stagesCountSuffix}
                      </p>
                    </div>

                    <div className="inline-flex rounded-xl bg-zinc-100 p-1">
                      <button
                        type="button"
                        onClick={() => setStageLayout('stepper')}
                        className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                          stageLayout === 'stepper'
                            ? 'bg-white text-zinc-900 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {c.stageFocusMode}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStageLayout('all')}
                        className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                          stageLayout === 'all'
                            ? 'bg-white text-zinc-900 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {c.stageAllMode}
                      </button>
                    </div>
                  </div>

                  {stageLayout === 'stepper' ? (
                    <div className="mt-5 space-y-5">
                      {/* Horizontal Sequential Stage Pills */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {scheduleCalculation.milestones.map((step, idx) => {
                          const isCurrent = idx === activeStageIdx;
                          return (
                            <button
                              key={step.dayOffset}
                              type="button"
                              onClick={() => setActiveStageIdx(idx)}
                              className={`flex min-h-[54px] flex-col items-start justify-center rounded-xl border p-2.5 text-left transition-colors ${
                                isCurrent
                                  ? 'border-[#2E7D32] bg-[#EEF4EA] text-[#1B431E]'
                                  : step.completed
                                  ? 'border-zinc-200 bg-[#F8F9F7] text-zinc-800 hover:border-[#4D6A1F]'
                                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                              }`}
                            >
                              <div className="flex w-full items-center justify-between gap-1 text-[11px] font-bold">
                                <span>
                                  {c.stepPrefix} {idx + 1}
                                </span>
                                {step.completed ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D32] shrink-0" />
                                ) : (
                                  <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                )}
                              </div>
                              <span className="mt-0.5 font-mono-tabular text-[11px] font-semibold">
                                +{step.dayOffset} {c.dayLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Focused Stage Detail Card */}
                      {focusedStage && (
                        <div className="rounded-2xl border border-zinc-200 bg-[#F8F9F7] p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-mono-tabular font-bold text-[#4D6A1F]">
                              {c.stepPrefix} {activeStageIdx + 1} /{' '}
                              {scheduleCalculation.milestones.length} ·{' '}
                              {formatDateLocal(focusedStage.targetDate, lang)} (
                              {c.dayLabel} +{focusedStage.dayOffset})
                            </span>
                            <span
                              className={`font-semibold ${
                                focusedStage.completed ? 'text-[#2E7D32]' : 'text-amber-800'
                              }`}
                            >
                              {focusedStage.completed ? c.statusDone : c.statusUpcoming}
                            </span>
                          </div>

                          <h4 className="mt-2 text-lg font-bold text-zinc-900">
                            {focusedStage.title[lang]}
                          </h4>
                          <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                            {focusedStage.action[lang]}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                            <button
                              type="button"
                              onClick={() =>
                                toggleStageDone(selectedCrop.id, focusedStage.dayOffset)
                              }
                              className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
                                focusedStage.manualDone
                                  ? 'border-[#2E7D32] bg-[#2E7D32] text-white'
                                  : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
                              }`}
                            >
                              {focusedStage.manualDone ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                              <span>
                                {focusedStage.manualDone ? c.markedDoneBtn : c.markDoneBtn}
                              </span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={activeStageIdx === 0}
                                onClick={() => setActiveStageIdx((i) => Math.max(0, i - 1))}
                                className="inline-flex min-h-[42px] items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-45"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span>{c.prevStageBtn}</span>
                              </button>
                              <button
                                type="button"
                                disabled={
                                  activeStageIdx >= scheduleCalculation.milestones.length - 1
                                }
                                onClick={() =>
                                  setActiveStageIdx((i) =>
                                    Math.min(scheduleCalculation.milestones.length - 1, i + 1)
                                  )
                                }
                                className="inline-flex min-h-[42px] items-center gap-1 rounded-xl bg-[#4D6A1F] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3E5618] disabled:opacity-45"
                              >
                                <span>{c.nextStageBtn}</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Full Sequential Timeline View */
                    <div className="mt-4 divide-y divide-zinc-200">
                      {scheduleCalculation.milestones.map((step, idx) => (
                        <div
                          key={step.dayOffset}
                          className="flex flex-col gap-2 py-4 first:pt-1 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => toggleStageDone(selectedCrop.id, step.dayOffset)}
                              aria-label={step.title[lang]}
                              className="mt-0.5 shrink-0"
                            >
                              {step.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-[#2E7D32]" />
                              ) : (
                                <Clock className="h-5 w-5 text-zinc-400" />
                              )}
                            </button>
                            <div>
                              <div className="text-xs font-semibold text-[#4D6A1F]">
                                {c.stepPrefix} {idx + 1}
                              </div>
                              <div className="text-sm font-bold text-zinc-900">
                                {step.title[lang]}
                              </div>
                              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-600">
                                {step.action[lang]}
                              </p>
                            </div>
                          </div>

                          <div className="pl-8 sm:pl-0 shrink-0 sm:text-right">
                            <div className="font-mono-tabular text-xs font-bold text-[#1B431E]">
                              {formatDateLocal(step.targetDate, lang)}
                            </div>
                            <div className="mt-0.5 font-mono-tabular text-xs text-zinc-500">
                              {c.dayLabel} +{step.dayOffset}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Linked Fertilizer & Field Care Advisory for this Specific Crop */}
            {linkedCropTip && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-[#2E7D32]" />
                    <h3 className="text-base font-bold text-zinc-900">{c.linkedCareTitle}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      playTrack({
                        id: `linked-tip-${linkedCropTip.id}`,
                        title: `${selectedCrop.cropName[lang]} · ${linkedCropTip.title[lang]}`,
                        subtitle: linkedCropTip.seasonLabel[lang],
                        text: linkedCropTip.audioScript[lang],
                        language: lang,
                      })
                    }
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#2E7D32]/30 bg-[#EEF4EA] px-3.5 py-1.5 text-xs font-semibold text-[#1F4E23] hover:bg-[#E2ECD9]"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{t.tips.listenTip}</span>
                  </button>
                </div>

                <div className="mt-4 grid gap-5 md:grid-cols-12">
                  <div className="md:col-span-7">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                      {t.tips.stepsTitle}
                    </h4>
                    <ol className="mt-2 space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-700">
                      {linkedCropTip.steps[lang].map((stepText, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="font-mono-tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#EEF4EA] text-xs font-bold text-[#255D28]">
                            {idx + 1}
                          </span>
                          <span>{stepText}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="md:col-span-5 rounded-xl border border-[#4D6A1F]/20 bg-[#F8F9F7] p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-[#4D6A1F]">
                      {t.tips.fertilizerTitle}
                    </h4>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-800">
                      {linkedCropTip.fertilizerNote[lang]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Shortcuts for This Crop: Disease Scan & Yield Forecast */}
            {onOpenTool && (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onOpenTool('scanner')}
                  className="flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-left shadow-xs transition-colors hover:border-[#2E7D32] hover:bg-[#F9FBF8]"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{t.home.scanTitle}</p>
                    <p className="text-xs text-zinc-600">{selectedCrop.cropName[lang]}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#2E7D32]" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenTool('yield-radar')}
                  className="flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-left shadow-xs transition-colors hover:border-[#4D6A1F] hover:bg-[#F9FBF8]"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{t.home.yieldRadarTitle}</p>
                    <p className="text-xs text-zinc-600">{selectedCrop.cropName[lang]}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#4D6A1F]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Collapsible 12-Month Visual Crop Matrix */}
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900">{t.calendar.matrixTitle}</h3>
              {showFullMatrix && (
                <div className="mt-1.5 flex items-center gap-4 text-xs text-zinc-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-xs bg-[#2E7D32] inline-block" />
                    {t.calendar.matrixPlantLegend}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-xs bg-amber-500 inline-block" />
                    {t.calendar.matrixHarvestLegend}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFullMatrix((prev) => !prev)}
              aria-expanded={showFullMatrix}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-zinc-300 bg-[#F8F9F7] px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 whitespace-nowrap shrink-0"
            >
              <span>{showFullMatrix ? t.calendar.hideMatrixBtn : t.calendar.showMatrixBtn}</span>
              {showFullMatrix ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showFullMatrix && (
            <div className="mt-4 overflow-x-auto border-t border-zinc-200 pt-4">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="sticky left-0 z-10 bg-white py-2.5 pr-4 font-semibold shadow-[2px_0_0_0_rgba(228,228,231,0.7)]">
                      {t.calendar.cropCol}
                    </th>
                    {months.map((m, i) => (
                      <th
                        key={m}
                        className={`px-1 py-2.5 text-center font-semibold ${
                          i + 1 === currentMonthIndex ? 'text-[#2E7D32] underline underline-offset-4' : ''
                        }`}
                      >
                        {m}
                      </th>
                    ))}
                    <th className="py-2.5 pl-4 font-semibold">{t.calendar.harvestCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {CROP_CALENDAR_DATA.map((crop) => {
                    const isSelected = crop.id === selectedCropId;
                    return (
                      <tr
                        key={crop.id}
                        onClick={() => openCropDedicatedPage(crop.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EEF4EA]' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <td
                          className={`sticky left-0 z-10 py-3 pr-4 shadow-[2px_0_0_0_rgba(228,228,231,0.7)] ${
                            isSelected ? 'bg-[#EEF4EA]' : 'bg-white'
                          }`}
                        >
                          <div className="font-semibold text-zinc-900">{crop.cropName[lang]}</div>
                          <div className="text-xs text-zinc-500">{crop.seasonLabel[lang]}</div>
                        </td>
                        {months.map((m, idx) => {
                          const mNum = idx + 1;
                          const isPlant = crop.plantingMonths.includes(mNum);
                          const isHarvest = crop.harvestMonths.includes(mNum);
                          return (
                            <td key={`${crop.id}-${m}`} className="px-1 py-3 text-center">
                              {isPlant && isHarvest ? (
                                <span
                                  title={`${t.calendar.matrixPlantLegend} & ${t.calendar.matrixHarvestLegend}`}
                                  className="mx-auto block h-4 w-5 rounded-xs bg-gradient-to-r from-[#2E7D32] to-amber-500"
                                />
                              ) : isPlant ? (
                                <span
                                  title={t.calendar.matrixPlantLegend}
                                  className="mx-auto block h-4 w-5 rounded-xs bg-[#2E7D32]"
                                />
                              ) : isHarvest ? (
                                <span
                                  title={t.calendar.matrixHarvestLegend}
                                  className="mx-auto block h-4 w-5 rounded-xs bg-amber-500"
                                />
                              ) : (
                                <span className="mx-auto block h-1.5 w-3 rounded-xs bg-zinc-200" />
                              )}
                            </td>
                          );
                        })}
                        <td className="py-3 pl-4 text-zinc-700">
                          {crop.harvestWindowText[lang]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
