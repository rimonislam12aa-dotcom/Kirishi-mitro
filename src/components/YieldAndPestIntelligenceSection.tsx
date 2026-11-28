import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Camera,
  CheckCircle2,
  MapPin,
  Radar,
  ShieldAlert,
  Sparkles,
  Sprout,
  Trash2,
  TrendingUp,
  Upload,
  Volume2,
  WifiOff,
  X,
} from 'lucide-react';
import { DISTRICT_PRESETS } from '../catalog/seedData';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  deleteYieldPrediction,
  getCachedPestRadar,
  getYieldPredictions,
  saveCachedPestRadar,
  saveYieldPrediction,
} from '../lib/offlineDb';
import {
  AppLanguage,
  DiseaseDiagnosis,
  RegionalPestObservation,
  RegionalPestRadarResult,
  WeatherCacheRecord,
  YieldGrowthStageKey,
  YieldPredictionRecord,
  YieldStagePhotoInput,
} from '../types/agri';

interface YieldAndPestIntelligenceSectionProps {
  lang: AppLanguage;
  isOnline: boolean;
  weather: WeatherCacheRecord | null;
  savedDiagnoses: DiseaseDiagnosis[];
  onDataChange: () => void;
}

const STAGE_ORDER: YieldGrowthStageKey[] = ['seedling', 'vegetative', 'flowering', 'grain_fill'];

const COPY: Record<
  AppLanguage,
  {
    eyebrow: string;
    sectionTitle: string;
    sectionSubtitle: string;
    tabYield: string;
    tabRadar: string;
    // Yield tab
    stagePhotosHeading: string;
    stagePhotosHint: string;
    stages: Record<YieldGrowthStageKey, { title: string; subtitle: string; notePlaceholder: string }>;
    uploadBtn: string;
    removeBtn: string;
    cropLabel: string;
    cropPlaceholder: string;
    varietyLabel: string;
    varietyPlaceholder: string;
    areaLabel: string;
    unitLabel: string;
    units: { bigha: string; decimal: string; acre: string; hectare: string };
    soilLabel: string;
    soils: { loam: string; clay: string; sandy_loam: string; alluvial: string };
    irrigationLabel: string;
    irrigations: { adequate: string; rainfed: string; deficit: string; excess: string };
    fertilizerLabel: string;
    fertilizers: { balanced: string; organic_heavy: string; urea_heavy: string; minimal: string };
    sowingDateLabel: string;
    predictBtn: string;
    predictingBtn: string;
    offlineYieldNotice: string;
    needOnePhotoError: string;
    projectedTotalLabel: string;
    perBighaLabel: string;
    rangeLabel: string;
    confidenceLabel: string;
    harvestWindowLabel: string;
    maundSuffix: string;
    kgUnit: string;
    gradeLabels: Record<YieldPredictionRecord['yieldGrade'], string>;
    vigorLabels: Record<'excellent' | 'good' | 'moderate' | 'stressed', string>;
    stageTimelineTitle: string;
    driversTitle: string;
    bottlenecksTitle: string;
    boosterPlanTitle: string;
    weatherImpactTitle: string;
    listenYieldBtn: string;
    savedForecastsTitle: string;
    noSavedForecasts: string;
    deleteBtn: string;
    // Radar tab
    radarHeading: string;
    radarSubtitle: string;
    districtLabel: string;
    cropFocusLabel: string;
    cropFocusPlaceholder: string;
    fieldStageLabel: string;
    fieldStages: { seedling: string; vegetative: string; flowering: string; mature: string };
    soilMoistureLabel: string;
    soilMoistures: { dry: string; moist: string; waterlogged: string };
    canopyLabel: string;
    canopies: { sparse: string; moderate: string; dense: string };
    fieldSignalsLabel: string;
    fieldSignalsList: string[];
    deviceScansIncluded: string;
    runRadarBtn: string;
    runningRadarBtn: string;
    offlineRadarNotice: string;
    overallRiskLabel: string;
    outbreakWindowLabel: string;
    daysLabel: string;
    signalsUsedLabel: string;
    riskLevelLabels: Record<'low' | 'moderate' | 'high' | 'critical', string>;
    weatherTriggerTitle: string;
    scoutingSummaryTitle: string;
    threatsListTitle: string;
    earlySignsLabel: string;
    preventiveShieldLabel: string;
    listenRadarBtn: string;
    // Community sighting reporter
    reportCardTitle: string;
    reportCardHint: string;
    reportPestLabel: string;
    reportPestPlaceholder: string;
    reportCropLabel: string;
    reportSeverityLabel: string;
    severities: { early: string; moderate: string; severe: string };
    reportNoteLabel: string;
    reportNotePlaceholder: string;
    submitReportBtn: string;
    submittingReportBtn: string;
    reportSavedMsg: string;
    recentCommunityTitle: string;
    noCommunityReports: string;
  }
> = {
  bn: {
    eyebrow: 'AI ফলন পূর্বাভাস ও আগাম বালাই সতর্কতা',
    sectionTitle: 'বহু-ধাপ ফলন পূর্বাভাস এআই ও আঞ্চলিক বালাই রাডার',
    sectionSubtitle:
      'ফসলের বৃদ্ধির প্রতিটি ধাপের ছবি বিশ্লেষণ করে বিঘা প্রতি ও মোট ফলনের নিখুঁত পূর্বাভাস নিন এবং স্থানীয় জমির তথ্য দিয়ে ৫–১৪ দিন আগেই বালাইয়ের প্রাদুর্ভাব শনাক্ত করুন।',
    tabYield: 'ধাপভিত্তিক ফলন এআই',
    tabRadar: 'আঞ্চলিক বালাই রাডার',
    stagePhotosHeading: '১. ফসলের বৃদ্ধির ধাপের ছবি যোগ করুন (১–৪টি ধাপ)',
    stagePhotosHint:
      'যত বেশি ধাপের ছবি দেবেন, ফলনের পূর্বাভাস তত বেশি নিখুঁত হবে। ছবি ফোনে সংকুচিত হয়ে দ্রুত আপলোড হয়।',
    stages: {
      seedling: {
        title: 'ধাপ ১: চারা / অঙ্কুরোদগম',
        subtitle: 'বপনের ৭–২০ দিন',
        notePlaceholder: 'চারা গজানোর হার বা নোট (ঐচ্ছিক)',
      },
      vegetative: {
        title: 'ধাপ ২: বাড়ন্ত / কুঁশি পর্যায়',
        subtitle: 'বপনের ২৫–৫০ দিন',
        notePlaceholder: 'পাতার রঙ বা কুঁশির নোট (ঐচ্ছিক)',
      },
      flowering: {
        title: 'ধাপ ৩: ফুল ও শীষ বের হওয়া',
        subtitle: 'বপনের ৫৫–৮০ দিন',
        notePlaceholder: 'শীষ বা ফুলের ঘনত্ব নোট (ঐচ্ছিক)',
      },
      grain_fill: {
        title: 'ধাপ ৪: দানা পুষ্ট ও পাকা ধাপ',
        subtitle: 'কাটার ১০–২৫ দিন আগে',
        notePlaceholder: 'দানা বা ফলের আকার নোট (ঐচ্ছিক)',
      },
    },
    uploadBtn: 'ছবি দিন / ক্যামেরা',
    removeBtn: 'মুছুন',
    cropLabel: 'ফসলের নাম',
    cropPlaceholder: 'যেমন: বোরো ধান, আলু, গম, টমেটো',
    varietyLabel: 'জাত (ঐচ্ছিক)',
    varietyPlaceholder: 'যেমন: ব্রি ধান-২৮, ডায়মন্ড',
    areaLabel: 'জমির পরিমাণ',
    unitLabel: 'একক',
    units: { bigha: 'বিঘা (৩৩ শতক)', decimal: 'শতক / ডেসিম্যাল', acre: 'একর', hectare: 'হেক্টর' },
    soilLabel: 'মাটির ধরন',
    soils: { loam: 'দোআঁশ', clay: 'এঁটেল / কাদা', sandy_loam: 'বেলে-দোআঁশ', alluvial: 'পলি মাটি' },
    irrigationLabel: 'সেচ অবস্থা',
    irrigations: {
      adequate: 'নিয়মিত পর্যাপ্ত সেচ',
      rainfed: 'বৃষ্টি নির্ভর',
      deficit: 'সেচ ঘাটতি / শুষ্ক',
      excess: 'জলাবদ্ধতা / অতিরিক্ত পানি',
    },
    fertilizerLabel: 'সার প্রয়োগ',
    fertilizers: {
      balanced: 'সুষম সার (NPK + জৈব)',
      organic_heavy: 'জৈব সার বেশি',
      urea_heavy: 'মূলত ইউরিয়া বেশি',
      minimal: 'অল্প সার প্রয়োগ',
    },
    sowingDateLabel: 'রোপণ / বপনের তারিখ (ঐচ্ছিক)',
    predictBtn: 'এআই দিয়ে ফলন পূর্বাভাস দেখুন',
    predictingBtn: 'ধাপভিত্তিক ছবি ও জমির ডেটা বিশ্লেষণ হচ্ছে...',
    offlineYieldNotice:
      'নতুন এআই ফলন বিশ্লেষণের জন্য ইন্টারনেট প্রয়োজন; তবে ফোনে সংরক্ষিত আগের পূর্বাভাস নিচে অফলাইনেও দেখতে ও শুনতে পারবেন।',
    needOnePhotoError: 'অনুগ্রহ করে অন্তত ১টি বৃদ্ধির ধাপের ছবি যোগ করুন।',
    projectedTotalLabel: 'সম্ভাব্য মোট ফলন',
    perBighaLabel: 'প্রতি বিঘা (৩৩ শতক)',
    rangeLabel: 'সম্ভাব্য পরিসীমা',
    confidenceLabel: 'নির্ভুলতার হার',
    harvestWindowLabel: 'কাটার সম্ভাব্য সময়',
    maundSuffix: 'মণ',
    kgUnit: 'কেজি',
    gradeLabels: {
      bumper: 'বাম্পার ফলনের সম্ভাবনা',
      above_average: 'গড়ের চেয়ে ভালো ফলন',
      average: 'স্বাভাবিক ফলন',
      below_average: 'গড়ের চেয়ে কিছুটা কম',
      at_risk: 'ফলন ঝুঁকিপূর্ণ — দ্রুত পরিচর্যা দরকার',
    },
    vigorLabels: {
      excellent: 'চমৎকার সতেজতা',
      good: 'ভালো অবস্থা',
      moderate: 'মাঝারি চাপ',
      stressed: 'চাপ বা ঘাটতি রয়েছে',
    },
    stageTimelineTitle: 'ধাপ অনুযায়ী গাছের স্বাস্থ্য ও করণীয়',
    driversTitle: 'ফলন বৃদ্ধির সহায়ক কারণ',
    bottlenecksTitle: 'ফলন কমার ঝুঁকি / সীমাবদ্ধতা',
    boosterPlanTitle: 'ফলন সুরক্ষা ও বাড়ানোর পরবর্তী করণীয়',
    weatherImpactTitle: 'আবহাওয়ার প্রভাব বিশ্লেষণ',
    listenYieldBtn: 'ফলন পূর্বাভাস শুনুন',
    savedForecastsTitle: 'অফলাইনে সংরক্ষিত ফলন পূর্বাভাস',
    noSavedForecasts: 'এখনো কোনো ফলন পূর্বাভাস সংরক্ষণ করা হয়নি।',
    deleteBtn: 'মুছুন',
    radarHeading: 'আঞ্চলিক বালাই প্রাদুর্ভাব আগাম সতর্কতা রাডার',
    radarSubtitle:
      'স্থানীয় আবহাওয়া, ৫ দিনের পূর্বাভাস, মাটির আর্দ্রতা, গাছের ঘনত্ব ও মাঠের প্রাথমিক সংকেত বিশ্লেষণ করে ৫–১৪ দিন আগেই বালাইয়ের ঝুঁকি শনাক্ত করে।',
    districtLabel: 'জেলা / এলাকা',
    cropFocusLabel: 'প্রধান ফসলসমূহ',
    cropFocusPlaceholder: 'যেমন: বোরো ধান, আলু, টমেটো, ভুট্টা',
    fieldStageLabel: 'এলাকার ফসলের বর্তমান পর্যায়',
    fieldStages: { seedling: 'চারা পর্যায়', vegetative: 'বাড়ন্ত পর্যায়', flowering: 'ফুল / শীষ', mature: 'দানা পাকা' },
    soilMoistureLabel: 'মাটির আর্দ্রতা',
    soilMoistures: { dry: 'শুষ্ক', moist: 'আর্দ্র / ভেজা', waterlogged: 'জলাবদ্ধ' },
    canopyLabel: 'গাছের ঘনত্ব (ক্যানোপি)',
    canopies: { sparse: 'পাতলা', moderate: 'মাঝারি', dense: 'খুব ঘন ঝোপালো' },
    fieldSignalsLabel: 'মাঠে দেখা প্রাথমিক সংকেত (ঐচ্ছিক)',
    fieldSignalsList: [
      'ভোরের ঘন কুয়াশা ও শিশির',
      'সন্ধ্যায় আলোতে মথ / পোকা উড়া',
      'জমিতে অতিরিক্ত ইউরিয়া ও ঘন চারা',
      'টানা মেঘলা ও ভ্যাপসা গরম',
      'জমির গোড়ায় পানি জমে থাকা',
      'পাতার নিচে ডিম বা সাদা পোকা',
    ],
    deviceScansIncluded: 'ফোনে স্ক্যান করা সাম্প্রতিক রোগের ডেটা স্বয়ংক্রিয়ভাবে যুক্ত হবে',
    runRadarBtn: '৫–১৪ দিনের বালাই রাডার বিশ্লেষণ চালান',
    runningRadarBtn: 'স্থানীয় জমির ডেটা ও আবহাওয়া বিশ্লেষণ হচ্ছে...',
    offlineRadarNotice:
      'ইন্টারনেট নেই — আপনার ফোনে সংরক্ষিত সর্বশেষ আঞ্চলিক বালাই রাডার রিপোর্ট নিচে দেখানো হচ্ছে।',
    overallRiskLabel: 'আঞ্চলিক ঝুঁকি সূচক',
    outbreakWindowLabel: 'আগাম সতর্কতা জানালা',
    daysLabel: 'দিন',
    signalsUsedLabel: 'বিশ্লেষিত স্থানীয় সংকেত',
    riskLevelLabels: {
      low: 'কম ঝুঁকি',
      moderate: 'মাঝারি সতর্কতা',
      high: 'উচ্চ ঝুঁকি — আগাম প্রস্তুতি নিন',
      critical: 'তীব্র প্রাদুর্ভাবের আশঙ্কা',
    },
    weatherTriggerTitle: 'আবহাওয়া ও অনুকূল পরিবেশ বিশ্লেষণ',
    scoutingSummaryTitle: 'আঞ্চলিক পর্যবেক্ষণ সারসংক্ষেপ',
    threatsListTitle: 'সম্ভাব্য বালাই ও রোগের পূর্বাভাস (ঝুঁকি অনুযায়ী)',
    earlySignsLabel: 'মাঠে যে লক্ষণগুলো আগে খুঁজবেন',
    preventiveShieldLabel: 'প্রাদুর্ভাবের আগেই প্রতিরোধ ব্যবস্থা',
    listenRadarBtn: 'বালাই সতর্কবার্তা শুনুন',
    reportCardTitle: 'স্থানীয় মাঠ পর্যবেক্ষণ যোগ করুন (কমিউনিটি সিগন্যাল)',
    reportCardHint:
      'আপনার এলাকায় কোনো পোকা বা রোগের প্রাথমিক লক্ষণ দেখলে এখানে জানান—এটি আঞ্চলিক রাডার মডেলকে আরও নিখুঁত করে।',
    reportPestLabel: 'পোকা বা রোগের নাম',
    reportPestPlaceholder: 'যেমন: কারেন্ট পোকা, ব্লাস্ট, লেট ব্লাইট',
    reportCropLabel: 'ফসল',
    reportSeverityLabel: 'আক্রমণের মাত্রা',
    severities: { early: 'প্রাথমিক (অল্প)', moderate: 'মাঝারি', severe: 'বেশি' },
    reportNoteLabel: 'সংক্ষিপ্ত তথ্য (ঐচ্ছিক)',
    reportNotePlaceholder: 'যেমন: বিলের নিচু জমিতে দেখা গেছে',
    submitReportBtn: 'মাঠ তথ্য জমা দিন',
    submittingReportBtn: 'জমা হচ্ছে...',
    reportSavedMsg: 'মাঠ পর্যবেক্ষণ যুক্ত হয়েছে! রাডার আবার চালালে নতুন সংকেত যোগ হবে।',
    recentCommunityTitle: 'সাম্প্রতিক আঞ্চলিক মাঠ পর্যবেক্ষণ',
    noCommunityReports: 'এখনো কোনো কমিউনিটি পর্যবেক্ষণ জমা হয়নি।',
  },
  hi: {
    eyebrow: 'AI उपज पूर्वानुमान व क्षेत्रीय कीट रडार',
    sectionTitle: 'बहु-चरण फसल उपज AI और क्षेत्रीय कीट प्रकोप रडार',
    sectionSubtitle:
      'फसल की वृद्धि के प्रत्येक चरण की फोटो का विश्लेषण कर बीघा और कुल उपज का सटीक अनुमान पाएं, और स्थानीय खेत डेटा से 5–14 दिन पहले कीट प्रकोप की पहचान करें।',
    tabYield: 'चरणवार उपज AI',
    tabRadar: 'क्षेत्रीय कीट रडार',
    stagePhotosHeading: '1. फसल वृद्धि चरणों की फोटो जोड़ें (1–4 चरण)',
    stagePhotosHint: 'जितने अधिक चरणों की फोटो होंगी, उपज पूर्वानुमान उतना ही सटीक होगा।',
    stages: {
      seedling: { title: 'चरण 1: पौध / अंकुरण', subtitle: 'बुवाई के 7–20 दिन', notePlaceholder: 'जमाव नोट (वैकल्पिक)' },
      vegetative: { title: 'चरण 2: बढ़वार / कल्ले', subtitle: 'बुवाई के 25–50 दिन', notePlaceholder: 'पत्ती रंग या कल्ले नोट' },
      flowering: { title: 'चरण 3: फूल व बाली निकलना', subtitle: 'बुवाई के 55–80 दिन', notePlaceholder: 'बाली / फूल घनत्व नोट' },
      grain_fill: { title: 'चरण 4: दाना भराव व पकना', subtitle: 'कटाई से 10–25 दिन पहले', notePlaceholder: 'दाने का आकार नोट' },
    },
    uploadBtn: 'फोटो चुनें / कैमरा',
    removeBtn: 'हटाएं',
    cropLabel: 'फसल का नाम',
    cropPlaceholder: 'जैसे: धान, आलू, गेहूं, टमाटर',
    varietyLabel: 'किस्म (वैकल्पिक)',
    varietyPlaceholder: 'जैसे: पूसा बासमती, कुफरी',
    areaLabel: 'खेत का क्षेत्रफल',
    unitLabel: 'इकाई',
    units: { bigha: 'बीघा (33 डेसिमल)', decimal: 'डेसिमल / कट्ठा', acre: 'एकड़', hectare: 'हेक्टेयर' },
    soilLabel: 'मिट्टी का प्रकार',
    soils: { loam: 'दोमट', clay: 'चिकनी मिट्टी', sandy_loam: 'बलुई दोमट', alluvial: 'जलोढ़ मिट्टी' },
    irrigationLabel: 'सिंचाई स्थिति',
    irrigations: { adequate: 'पर्याप्त सिंचाई', rainfed: 'वर्षा आधारित', deficit: 'पानी की कमी', excess: 'जलभराव' },
    fertilizerLabel: 'उर्वरक उपयोग',
    fertilizers: { balanced: 'संतुलित NPK + जैविक', organic_heavy: 'अधिक जैविक खाद', urea_heavy: 'अधिक यूरिया', minimal: 'न्यूनतम खाद' },
    sowingDateLabel: 'बुवाई तिथि (वैकल्पिक)',
    predictBtn: 'AI से उपज पूर्वानुमान निकालें',
    predictingBtn: 'चरणवार फोटो व खेत डेटा का विश्लेषण हो रहा है...',
    offlineYieldNotice: 'नए AI उपज अनुमान के लिए इंटरनेट जरूरी है; फोन में सहेजे गए पिछले अनुमान नीचे ऑफलाइन देखे जा सकते हैं।',
    needOnePhotoError: 'कृपया कम से कम 1 वृद्धि चरण की फोटो जोड़ें।',
    projectedTotalLabel: 'अनुमानित कुल उपज',
    perBighaLabel: 'प्रति बीघा',
    rangeLabel: 'संभावित सीमा',
    confidenceLabel: 'विश्वसनीयता',
    harvestWindowLabel: 'अनुमानित कटाई समय',
    maundSuffix: 'मन',
    kgUnit: 'किग्रा',
    gradeLabels: {
      bumper: 'बंपर पैदावार का संकेत',
      above_average: 'औसत से बेहतर उपज',
      average: 'सामान्य संभावित उपज',
      below_average: 'औसत से कुछ कम',
      at_risk: 'उपज जोखिम में — तुरंत देखभाल जरूरी',
    },
    vigorLabels: { excellent: 'उत्कृष्ट स्वास्थ्य', good: 'अच्छी स्थिति', moderate: 'मध्यम दबाव', stressed: 'तनाव या कमी' },
    stageTimelineTitle: 'चरणवार फसल स्वास्थ्य और सलाह',
    driversTitle: 'उपज बढ़ाने वाले कारक',
    bottlenecksTitle: 'संभावित बाधाएं / जोखिम',
    boosterPlanTitle: 'कटाई तक उपज सुरक्षा कार्य योजना',
    weatherImpactTitle: 'मौसम प्रभाव विश्लेषण',
    listenYieldBtn: 'उपज अनुमान सुनें',
    savedForecastsTitle: 'ऑफलाइन सुरक्षित उपज अनुमान',
    noSavedForecasts: 'अभी तक कोई उपज अनुमान सुरक्षित नहीं है।',
    deleteBtn: 'हटाएं',
    radarHeading: 'क्षेत्रीय कीट प्रकोप पूर्वानुमान रडार',
    radarSubtitle: 'स्थानीय मौसम, 5-दिवसीय पूर्वानुमान, मिट्टी की नमी और क्षेत्रीय संकेतों से 5–14 दिन पहले कीट खतरे की पहचान करें।',
    districtLabel: 'जिला / क्षेत्र',
    cropFocusLabel: 'प्रमुख फसलें',
    cropFocusPlaceholder: 'जैसे: धान, आलू, टमाटर, मक्का',
    fieldStageLabel: 'क्षेत्र की फसल अवस्था',
    fieldStages: { seedling: 'पौध अवस्था', vegetative: 'बढ़वार अवस्था', flowering: 'फूल / बाली', mature: 'दाना पकना' },
    soilMoistureLabel: 'मिट्टी की नमी',
    soilMoistures: { dry: 'सूखी', moist: 'नम', waterlogged: 'जलभराव' },
    canopyLabel: 'फसल घनत्व (कैनोपी)',
    canopies: { sparse: 'विरल', moderate: 'मध्यम', dense: 'अत्यधिक घनी' },
    fieldSignalsLabel: 'खेत में देखे गए शुरुआती संकेत (वैकल्पिक)',
    fieldSignalsList: [
      'सुबह घना कोहरा और ओस',
      'शाम को रोशनी के पास पतंगे उड़ना',
      'अधिक यूरिया व घनी रोपाई',
      'लगातार बादल और उमस',
      'खेत की जड़ों में पानी जमाव',
      'पत्ती के नीचे अंडे या सफेद मक्खी',
    ],
    deviceScansIncluded: 'आपके फोन के हालिया रोग स्कैन स्वतः विश्लेषण में शामिल होंगे',
    runRadarBtn: '5–14 दिन का कीट रडार विश्लेषण चलाएं',
    runningRadarBtn: 'स्थानीय खेत व मौसम डेटा का विश्लेषण हो रहा है...',
    offlineRadarNotice: 'इंटरनेट नहीं है — फोन में सुरक्षित अंतिम कीट रडार रिपोर्ट नीचे दिखाई जा रही है।',
    overallRiskLabel: 'क्षेत्रीय जोखिम स्कोर',
    outbreakWindowLabel: 'प्रकोप पूर्व चेतावनी विंडो',
    daysLabel: 'दिन',
    signalsUsedLabel: 'विश्लेषित स्थानीय संकेत',
    riskLevelLabels: { low: 'कम जोखिम', moderate: 'मध्यम चेतावनी', high: 'उच्च जोखिम', critical: 'गंभीर प्रकोप चेतावनी' },
    weatherTriggerTitle: 'मौसम व अनुकूल परिस्थितियां',
    scoutingSummaryTitle: 'क्षेत्रीय निगरानी सारांश',
    threatsListTitle: 'संभावित कीट व रोग पूर्वानुमान',
    earlySignsLabel: 'खेत में पहले दिखने वाले लक्षण',
    preventiveShieldLabel: 'प्रकोप से पहले बचाव उपाय',
    listenRadarBtn: 'कीट चेतावनी सुनें',
    reportCardTitle: 'स्थानीय खेत अवलोकन जोड़ें (कम्युनिटी सिग्नल)',
    reportCardHint: 'अपने क्षेत्र में किसी कीट या रोग के शुरुआती संकेत दिखें तो यहां दर्ज करें।',
    reportPestLabel: 'कीट या रोग का नाम',
    reportPestPlaceholder: 'जैसे: भूरा फुदका, झुलसा रोग',
    reportCropLabel: 'फसल',
    reportSeverityLabel: 'तीव्रता',
    severities: { early: 'शुरुआती', moderate: 'मध्यम', severe: 'गंभीर' },
    reportNoteLabel: 'संक्षिप्त विवरण (वैकल्पिक)',
    reportNotePlaceholder: 'जैसे: निचले खेतों में दिखना शुरू हुआ',
    submitReportBtn: 'खेत रिपोर्ट दर्ज करें',
    submittingReportBtn: 'सहेजा जा रहा है...',
    reportSavedMsg: 'रिपोर्ट जुड़ गई! रडार दोबारा चलाने पर यह डेटा शामिल होगा।',
    recentCommunityTitle: 'हालिया क्षेत्रीय खेत रिपोर्ट',
    noCommunityReports: 'अभी कोई कम्युनिटी रिपोर्ट दर्ज नहीं है।',
  },
  en: {
    eyebrow: 'AI Yield Forecasting & Early Pest Radar',
    sectionTitle: 'Multi-Stage Crop Yield AI & Regional Pest Outbreak Radar',
    sectionSubtitle:
      'Upload photos across crop growth stages to project exact per-Bigha and total harvest yield, and analyze local field telemetry to detect regional pest outbreaks 5–14 days early.',
    tabYield: 'Multi-Stage Yield AI',
    tabRadar: 'Regional Pest Radar',
    stagePhotosHeading: '1. Upload Growth-Stage Photos (1 to 4 Stages)',
    stagePhotosHint:
      'Uploading multiple stages boosts forecast accuracy. Photos are compressed on-device for fast serverless upload.',
    stages: {
      seedling: { title: 'Stage 1: Seedling / Emergence', subtitle: 'Days 7–20', notePlaceholder: 'Stand density or germination note' },
      vegetative: { title: 'Stage 2: Vegetative / Tillering', subtitle: 'Days 25–50', notePlaceholder: 'Leaf vigor or tiller count note' },
      flowering: { title: 'Stage 3: Flowering / Heading', subtitle: 'Days 55–80', notePlaceholder: 'Panicle or bloom density note' },
      grain_fill: { title: 'Stage 4: Grain / Fruit Fill', subtitle: '10–25 days pre-harvest', notePlaceholder: 'Grain filling or fruit size note' },
    },
    uploadBtn: 'Add Photo / Camera',
    removeBtn: 'Remove',
    cropLabel: 'Crop Name',
    cropPlaceholder: 'e.g. Boro Rice, Potato, Wheat, Tomato',
    varietyLabel: 'Variety (Optional)',
    varietyPlaceholder: 'e.g. BRRI dhan28, Diamant',
    areaLabel: 'Plot Size',
    unitLabel: 'Unit',
    units: { bigha: 'Bigha (33 dec)', decimal: 'Decimal', acre: 'Acre', hectare: 'Hectare' },
    soilLabel: 'Soil Type',
    soils: { loam: 'Loam', clay: 'Clay', sandy_loam: 'Sandy Loam', alluvial: 'Alluvial' },
    irrigationLabel: 'Irrigation',
    irrigations: { adequate: 'Adequate Irrigation', rainfed: 'Rainfed', deficit: 'Water Deficit', excess: 'Waterlogged' },
    fertilizerLabel: 'Fertilizer Practice',
    fertilizers: { balanced: 'Balanced NPK + Organic', organic_heavy: 'Organic Heavy', urea_heavy: 'Urea Heavy', minimal: 'Minimal Input' },
    sowingDateLabel: 'Sowing / Transplant Date (Optional)',
    predictBtn: 'Predict Harvest Yield with AI',
    predictingBtn: 'Analyzing multi-stage crop photos & farm telemetry...',
    offlineYieldNotice:
      'Live AI yield modeling needs internet access; previously saved predictions below remain available offline.',
    needOnePhotoError: 'Please add at least 1 growth-stage photo first.',
    projectedTotalLabel: 'Projected Total Harvest',
    perBighaLabel: 'Per Bigha (33 decimals)',
    rangeLabel: 'Expected Range',
    confidenceLabel: 'Model Confidence',
    harvestWindowLabel: 'Est. Harvest Window',
    maundSuffix: 'Maund',
    kgUnit: 'kg',
    gradeLabels: {
      bumper: 'Bumper Harvest Outlook',
      above_average: 'Above-Average Yield',
      average: 'On-Target Average Yield',
      below_average: 'Below Average Potential',
      at_risk: 'Yield At Risk — Intervene Now',
    },
    vigorLabels: { excellent: 'Excellent Vigor', good: 'Healthy', moderate: 'Moderate Stress', stressed: 'Stressed' },
    stageTimelineTitle: 'Stage-by-Stage Vigor & Agronomic Advice',
    driversTitle: 'Positive Yield Drivers',
    bottlenecksTitle: 'Detected Yield Bottlenecks',
    boosterPlanTitle: 'Pre-Harvest Yield Booster Plan',
    weatherImpactTitle: 'Local Weather Impact',
    listenYieldBtn: 'Listen to Yield Forecast',
    savedForecastsTitle: 'Offline Saved Yield Forecasts',
    noSavedForecasts: 'No saved yield predictions yet.',
    deleteBtn: 'Delete',
    radarHeading: 'Predictive Regional Pest Outbreak Radar',
    radarSubtitle:
      'Synthesizes local weather, 5-day forecast, soil moisture, canopy density, recent device scans, and regional reports to warn 5–14 days ahead of pest epidemics.',
    districtLabel: 'District / Zone',
    cropFocusLabel: 'Primary Crops Monitored',
    cropFocusPlaceholder: 'e.g. Rice, Potato, Tomato, Maize',
    fieldStageLabel: 'Dominant Field Stage',
    fieldStages: { seedling: 'Seedling', vegetative: 'Vegetative', flowering: 'Flowering / Panicle', mature: 'Grain / Maturity' },
    soilMoistureLabel: 'Soil Moisture',
    soilMoistures: { dry: 'Dry', moist: 'Moist', waterlogged: 'Waterlogged' },
    canopyLabel: 'Canopy Density',
    canopies: { sparse: 'Sparse', moderate: 'Moderate', dense: 'Dense / Lush' },
    fieldSignalsLabel: 'Early Field Signals Observed (Optional)',
    fieldSignalsList: [
      'Heavy morning fog & dew',
      'Moths circling lights at dusk',
      'High urea + dense planting',
      'Continuous humid & cloudy weather',
      'Standing water at stem base',
      'Eggs or whiteflies under leaves',
    ],
    deviceScansIncluded: 'Recent leaf disease scans on this device are automatically factored in',
    runRadarBtn: 'Run 5–14 Day Pest Outbreak Radar',
    runningRadarBtn: 'Modeling regional weather & pest telemetry...',
    offlineRadarNotice: 'Offline mode — displaying the latest regional pest radar snapshot saved on your phone.',
    overallRiskLabel: 'Regional Risk Score',
    outbreakWindowLabel: 'Early Warning Lead',
    daysLabel: 'days',
    signalsUsedLabel: 'Local Signals Fused',
    riskLevelLabels: { low: 'Low Risk', moderate: 'Moderate Watch', high: 'High Outbreak Risk', critical: 'Critical Outbreak Alert' },
    weatherTriggerTitle: 'Meteorological Trigger Analysis',
    scoutingSummaryTitle: 'Regional Surveillance Summary',
    threatsListTitle: 'Ranked Pest & Pathogen Forecast',
    earlySignsLabel: 'Early Scouting Checkpoints',
    preventiveShieldLabel: 'Preventive Shield Before Outbreak',
    listenRadarBtn: 'Listen to Pest Radar Alert',
    reportCardTitle: 'Log Local Field Sighting (Community Signal)',
    reportCardHint: 'Spot early pests or lesions nearby? Submit a quick sighting to sharpen regional outbreak forecasting.',
    reportPestLabel: 'Pest or Disease Name',
    reportPestPlaceholder: 'e.g. Brown Planthopper, Rice Blast, Late Blight',
    reportCropLabel: 'Affected Crop',
    reportSeverityLabel: 'Severity',
    severities: { early: 'Early Spot', moderate: 'Moderate', severe: 'Severe' },
    reportNoteLabel: 'Location / Plot Note (Optional)',
    reportNotePlaceholder: 'e.g. Low-lying paddy blocks near canal',
    submitReportBtn: 'Submit Sighting',
    submittingReportBtn: 'Submitting...',
    reportSavedMsg: 'Field sighting saved! Re-run the radar to fuse this signal.',
    recentCommunityTitle: 'Recent Regional Scouting Sightings',
    noCommunityReports: 'No community sightings logged yet.',
  },
};

async function compressStageImage(file: File): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode image file.'));
      el.src = objectUrl;
    });

    const maxDim = 720;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D unavailable.');
    }
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
    const base64 = dataUrl.split(',')[1] ?? '';
    return { dataUrl, base64, mimeType: 'image/jpeg' };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function formatMaund(kg: number): string {
  return (kg / 40).toFixed(1);
}

export const YieldAndPestIntelligenceSection: React.FC<YieldAndPestIntelligenceSectionProps> = ({
  lang,
  isOnline,
  weather,
  savedDiagnoses,
  onDataChange,
}) => {
  const c = COPY[lang];
  const { playTrack } = useAudioPlayer();

  const [activeTab, setActiveTab] = useState<'yield' | 'radar'>('yield');

  // --- Tab 1: Multi-Stage Yield AI State ---
  const [stagePhotos, setStagePhotos] = useState<Partial<Record<YieldGrowthStageKey, YieldStagePhotoInput>>>({});
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [landArea, setLandArea] = useState('1');
  const [landUnit, setLandUnit] = useState<'bigha' | 'decimal' | 'acre' | 'hectare'>('bigha');
  const [soilType, setSoilType] = useState<'loam' | 'clay' | 'sandy_loam' | 'alluvial'>('loam');
  const [irrigationLevel, setIrrigationLevel] = useState<'adequate' | 'rainfed' | 'deficit' | 'excess'>('adequate');
  const [fertilizerRegime, setFertilizerRegime] = useState<'balanced' | 'organic_heavy' | 'urea_heavy' | 'minimal'>('balanced');
  const [sowingDate, setSowingDate] = useState('');
  const [isPredictingYield, setIsPredictingYield] = useState(false);
  const [yieldError, setYieldError] = useState<string | null>(null);
  const [savedYields, setSavedYields] = useState<YieldPredictionRecord[]>([]);
  const [activeYield, setActiveYield] = useState<YieldPredictionRecord | null>(null);

  const fileInputRefs = useRef<Partial<Record<YieldGrowthStageKey, HTMLInputElement | null>>>({});

  // --- Tab 2: Predictive Regional Pest Radar State ---
  const defaultDistrict = weather?.location.districtName ?? DISTRICT_PRESETS[0].name[lang];
  const [radarDistrict, setRadarDistrict] = useState(defaultDistrict);
  const [cropFocus, setCropFocus] = useState(
    lang === 'bn'
      ? 'বোরো ধান, আলু, টমেটো'
      : lang === 'hi'
      ? 'धान, आलू, टमाटर'
      : 'Rice, Potato, Tomato'
  );
  const [fieldStage, setFieldStage] = useState<'seedling' | 'vegetative' | 'flowering' | 'mature'>('vegetative');
  const [soilMoisture, setSoilMoisture] = useState<'dry' | 'moist' | 'waterlogged'>('moist');
  const [canopyDensity, setCanopyDensity] = useState<'sparse' | 'moderate' | 'dense'>('dense');
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [isRunningRadar, setIsRunningRadar] = useState(false);
  const [radarError, setRadarError] = useState<string | null>(null);
  const [radarResult, setRadarResult] = useState<RegionalPestRadarResult | null>(null);
  const [communityReports, setCommunityReports] = useState<RegionalPestObservation[]>([]);

  // Sighting form
  const [reportPest, setReportPest] = useState('');
  const [reportCrop, setReportCrop] = useState('');
  const [reportSeverity, setReportSeverity] = useState<'early' | 'moderate' | 'severe'>('early');
  const [reportNote, setReportNote] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (weather?.location.districtName) {
      setRadarDistrict((prev) => prev || weather.location.districtName);
    }
  }, [weather?.location.districtName]);

  useEffect(() => {
    Promise.all([getYieldPredictions(), getCachedPestRadar()])
      .then(([yields, cachedRadar]) => {
        setSavedYields(yields);
        if (yields.length > 0) {
          setActiveYield((curr) => curr ?? yields[0]);
        }
        if (cachedRadar) {
          setRadarResult((curr) => curr ?? cachedRadar);
          if (Array.isArray(cachedRadar.recentReports)) {
            setCommunityReports(cachedRadar.recentReports);
          }
        }
      })
      .catch(() => {});
  }, []);

  const loadCommunityReports = useCallback(async () => {
    if (!isOnline) return;
    try {
      const res = await fetch('/api/pest-radar', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { reports?: RegionalPestObservation[] };
        if (Array.isArray(data.reports)) {
          setCommunityReports(data.reports);
        }
      }
    } catch {
      // Offline / unreachable
    }
  }, [isOnline]);

  useEffect(() => {
    loadCommunityReports();
  }, [loadCommunityReports]);

  const uploadedStageCount = useMemo(
    () => STAGE_ORDER.filter((key) => Boolean(stagePhotos[key]?.imageDataUrl)).length,
    [stagePhotos]
  );

  const handleStageFileSelected = async (stageKey: YieldGrowthStageKey, file: File | undefined) => {
    if (!file) return;
    setYieldError(null);
    try {
      const compressed = await compressStageImage(file);
      setStagePhotos((prev) => ({
        ...prev,
        [stageKey]: {
          stageKey,
          imageDataUrl: compressed.dataUrl,
          mimeType: compressed.mimeType,
          note: prev[stageKey]?.note ?? '',
        },
      }));
    } catch (err) {
      setYieldError(err instanceof Error ? err.message : 'Failed to process photo.');
    }
  };

  const handleStageNoteChange = (stageKey: YieldGrowthStageKey, note: string) => {
    setStagePhotos((prev) => {
      const existing = prev[stageKey];
      if (!existing) return prev;
      return {
        ...prev,
        [stageKey]: { ...existing, note },
      };
    });
  };

  const handleRemoveStagePhoto = (stageKey: YieldGrowthStageKey) => {
    setStagePhotos((prev) => {
      const next = { ...prev };
      delete next[stageKey];
      return next;
    });
  };

  const handleRunYieldPrediction = async () => {
    setYieldError(null);
    const orderedInputs = STAGE_ORDER.map((key) => stagePhotos[key]).filter(
      (item): item is YieldStagePhotoInput => Boolean(item && item.imageDataUrl)
    );

    if (orderedInputs.length === 0) {
      setYieldError(c.needOnePhotoError);
      return;
    }

    if (!isOnline) {
      setYieldError(c.offlineYieldNotice);
      return;
    }

    setIsPredictingYield(true);
    try {
      const stagesPayload = orderedInputs.map((st) => ({
        stageKey: st.stageKey,
        imageBase64: st.imageDataUrl.split(',')[1] ?? '',
        mimeType: st.mimeType || 'image/jpeg',
        note: st.note || '',
      }));

      const res = await fetch('/api/yield-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stages: stagesPayload,
          language: lang,
          cropName: cropName.trim(),
          variety: variety.trim(),
          landArea: Number(landArea) || 1,
          landUnit,
          soilType,
          irrigationLevel,
          fertilizerRegime,
          sowingDate,
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
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const record: YieldPredictionRecord = {
        id: `yield_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
        language: lang,
        cropName: String(data.cropName || cropName || 'Crop'),
        variety: variety.trim(),
        landArea: Number(landArea) || 1,
        landUnit,
        soilType,
        irrigationLevel,
        fertilizerRegime,
        sowingDate,
        districtName: weather?.location.districtName,
        stagesUploaded: orderedInputs.map((s) => s.stageKey),
        stageThumbnails: orderedInputs.map((s) => ({
          stageKey: s.stageKey,
          imageDataUrl: s.imageDataUrl,
        })),
        stagesAnalyzed: Array.isArray(data.stagesAnalyzed) ? data.stagesAnalyzed : [],
        projectedYieldPerBighaKg: Number(data.projectedYieldPerBighaKg) || 0,
        projectedTotalYieldKg: Number(data.projectedTotalYieldKg) || 0,
        projectedYieldMinKg: Number(data.projectedYieldMinKg) || 0,
        projectedYieldMaxKg: Number(data.projectedYieldMaxKg) || 0,
        yieldGrade: data.yieldGrade || 'average',
        confidencePercent: Number(data.confidencePercent) || 75,
        estimatedHarvestWindow: String(data.estimatedHarvestWindow || ''),
        weatherImpactSummary: String(data.weatherImpactSummary || ''),
        yieldDrivers: Array.isArray(data.yieldDrivers) ? data.yieldDrivers : [],
        yieldBottlenecks: Array.isArray(data.yieldBottlenecks) ? data.yieldBottlenecks : [],
        boosterActionPlan: Array.isArray(data.boosterActionPlan) ? data.boosterActionPlan : [],
        audioSummary: String(data.audioSummary || ''),
      };

      const nextList = await saveYieldPrediction(record);
      setSavedYields(nextList);
      setActiveYield(record);
      onDataChange();
    } catch (err) {
      setYieldError(err instanceof Error ? err.message : 'Yield prediction failed.');
    } finally {
      setIsPredictingYield(false);
    }
  };

  const handleDeleteYield = async (id: string) => {
    const nextList = await deleteYieldPrediction(id);
    setSavedYields(nextList);
    if (activeYield?.id === id) {
      setActiveYield(nextList[0] ?? null);
    }
    onDataChange();
  };

  const handleToggleSignal = (sig: string) => {
    setSelectedSignals((prev) =>
      prev.includes(sig) ? prev.filter((item) => item !== sig) : [...prev, sig]
    );
  };

  const handleRunPestRadar = async () => {
    setRadarError(null);
    if (!isOnline) {
      setRadarError(c.offlineRadarNotice);
      return;
    }

    setIsRunningRadar(true);
    try {
      const recentLocalDiagnoses = savedDiagnoses
        .slice(0, 5)
        .map((d) => `${d.cropName}: ${d.diseaseName} (${d.severity})`);

      const res = await fetch('/api/pest-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'predict',
          language: lang,
          districtName: radarDistrict.trim() || weather?.location.districtName || 'Dhaka',
          regionName: weather?.location.regionName || '',
          cropFocus: cropFocus.trim(),
          cropStage: fieldStage,
          soilMoisture,
          canopyDensity,
          fieldSignals: selectedSignals,
          recentLocalDiagnoses,
          weather: weather
            ? {
                temperature: weather.temperature,
                humidity: weather.humidity,
                windSpeed: weather.windSpeed,
                precipitation: weather.precipitation,
                forecast: weather.forecast,
              }
            : null,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : null;
      if (!res.ok || !data) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const result: RegionalPestRadarResult = {
        id: 'latest',
        createdAt: new Date().toISOString(),
        language: lang,
        districtName: String(data.districtName || radarDistrict),
        cropFocus: String(data.cropFocus || cropFocus),
        overallRiskLevel: data.overallRiskLevel || 'moderate',
        overallRiskScore: Number(data.overallRiskScore) || 55,
        outbreakWindowDays: Number(data.outbreakWindowDays) || 7,
        weatherTriggerSummary: String(data.weatherTriggerSummary || ''),
        regionalScoutingSummary: String(data.regionalScoutingSummary || ''),
        communitySignalCount: Number(data.communitySignalCount) || 0,
        predictedOutbreaks: Array.isArray(data.predictedOutbreaks) ? data.predictedOutbreaks : [],
        recentReports: Array.isArray(data.recentReports) ? data.recentReports : communityReports,
        audioSummary: String(data.audioSummary || ''),
      };

      setRadarResult(result);
      if (Array.isArray(data.recentReports)) {
        setCommunityReports(data.recentReports);
      }
      await saveCachedPestRadar(result);
    } catch (err) {
      setRadarError(err instanceof Error ? err.message : 'Pest radar analysis failed.');
    } finally {
      setIsRunningRadar(false);
    }
  };

  const handleSubmitSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    setRadarError(null);
    setReportSuccess(false);

    if (!isOnline) {
      setRadarError(c.offlineRadarNotice);
      return;
    }

    if (!reportPest.trim() || !reportCrop.trim()) {
      return;
    }

    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/pest-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report',
          language: lang,
          districtName: radarDistrict.trim() || weather?.location.districtName || 'Dhaka',
          cropName: reportCrop.trim(),
          pestName: reportPest.trim(),
          severity: reportSeverity,
          note: reportNote.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      if (Array.isArray(data.reports)) {
        setCommunityReports(data.reports);
      }
      setReportPest('');
      setReportCrop('');
      setReportNote('');
      setReportSuccess(true);
    } catch (err) {
      setRadarError(err instanceof Error ? err.message : 'Failed to log sighting.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const gradeBadgeStyle = (grade: YieldPredictionRecord['yieldGrade']) => {
    if (grade === 'bumper' || grade === 'above_average') {
      return 'border-emerald-300 bg-emerald-50 text-emerald-950';
    }
    if (grade === 'average') {
      return 'border-stone-300 bg-stone-100 text-stone-900';
    }
    return 'border-amber-300 bg-amber-50 text-amber-950';
  };

  const riskAccentClasses = (level: 'low' | 'moderate' | 'high' | 'critical') => {
    if (level === 'critical') return 'border-red-300 bg-red-50 text-red-950';
    if (level === 'high') return 'border-amber-400 bg-amber-50 text-amber-950';
    if (level === 'moderate') return 'border-amber-200 bg-amber-50/50 text-stone-900';
    return 'border-emerald-200 bg-emerald-50/70 text-emerald-950';
  };

  const riskBarColor = (score: number) => {
    if (score >= 75) return 'bg-red-700';
    if (score >= 55) return 'bg-amber-600';
    return 'bg-emerald-700';
  };

  return (
    <section
      id="yield-radar"
      className="border-b border-zinc-200 bg-[#F4F5F2] py-10 sm:py-14 scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header + Mode Switcher */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-wide text-[#2E7D32] uppercase">
              {c.eyebrow}
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-zinc-900 sm:text-3xl text-balance">
              {c.sectionTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{c.sectionSubtitle}</p>
          </div>

          <div
            role="tablist"
            aria-label={c.sectionTitle}
            className="inline-flex w-full md:w-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'yield'}
              onClick={() => setActiveTab('yield')}
              className={`flex min-h-[44px] flex-1 md:flex-initial items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'yield'
                  ? 'bg-[#2E7D32] text-white'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>{c.tabYield}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'radar'}
              onClick={() => setActiveTab('radar')}
              className={`flex min-h-[44px] flex-1 md:flex-initial items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'radar'
                  ? 'bg-[#2E7D32] text-white'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <Radar className="h-4 w-4 shrink-0" />
              <span>{c.tabRadar}</span>
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: MULTI-STAGE CROP PHOTO AI YIELD PREDICTION                 */}
        {/* ================================================================ */}
        {activeTab === 'yield' && (
          <div className="mt-7 space-y-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left 7 Cols: 4-Stage Photo Slots + Plot Form */}
              <div className="lg:col-span-7 space-y-5">
                <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-stone-900">{c.stagePhotosHeading}</h3>
                    <span className="font-mono-tabular text-xs font-semibold text-emerald-900">
                      {uploadedStageCount} / 4
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600">{c.stagePhotosHint}</p>

                  <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {STAGE_ORDER.map((stageKey) => {
                      const stageCopy = c.stages[stageKey];
                      const current = stagePhotos[stageKey];
                      return (
                        <div
                          key={stageKey}
                          className={`flex flex-col justify-between rounded-xl border p-3.5 transition-colors ${
                            current
                              ? 'border-emerald-700 bg-emerald-50/30'
                              : 'border-stone-200 bg-stone-50/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-stone-900">
                                  {stageCopy.title}
                                </p>
                                <p className="text-[11px] text-stone-500">{stageCopy.subtitle}</p>
                              </div>
                              {current && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStagePhoto(stageKey)}
                                  aria-label={`${c.removeBtn} ${stageCopy.title}`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            {current ? (
                              <div className="mt-2.5 space-y-2">
                                <img
                                  src={current.imageDataUrl}
                                  alt={stageCopy.title}
                                  className="h-32 w-full rounded-lg border border-stone-200 object-cover"
                                />
                                <input
                                  type="text"
                                  value={current.note ?? ''}
                                  onChange={(e) => handleStageNoteChange(stageKey, e.target.value)}
                                  placeholder={stageCopy.notePlaceholder}
                                  className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 focus:border-emerald-700 focus:outline-none"
                                />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[stageKey]?.click()}
                                className="mt-3 flex min-h-[96px] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-stone-300 bg-white px-3 py-4 text-xs font-semibold text-stone-700 transition-colors hover:border-emerald-700 hover:text-emerald-900"
                              >
                                <Camera className="h-5 w-5 text-emerald-900" />
                                <span>{c.uploadBtn}</span>
                              </button>
                            )}

                            <input
                              ref={(el) => {
                                fileInputRefs.current[stageKey] = el;
                              }}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => {
                                handleStageFileSelected(stageKey, e.target.files?.[0]);
                                e.target.value = '';
                              }}
                              className="hidden"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Farm Parameters */}
                <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.cropLabel}
                      </label>
                      <input
                        type="text"
                        value={cropName}
                        onChange={(e) => setCropName(e.target.value)}
                        placeholder={c.cropPlaceholder}
                        className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.varietyLabel}
                      </label>
                      <input
                        type="text"
                        value={variety}
                        onChange={(e) => setVariety(e.target.value)}
                        placeholder={c.varietyPlaceholder}
                        className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.areaLabel}
                      </label>
                      <input
                        type="number"
                        min="0.05"
                        max="5000"
                        step="0.1"
                        value={landArea}
                        onChange={(e) => setLandArea(e.target.value)}
                        className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 font-mono-tabular text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.unitLabel}
                      </label>
                      <select
                        value={landUnit}
                        onChange={(e) =>
                          setLandUnit(e.target.value as 'bigha' | 'decimal' | 'acre' | 'hectare')
                        }
                        className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      >
                        {Object.entries(c.units).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.soilLabel}
                      </label>
                      <select
                        value={soilType}
                        onChange={(e) =>
                          setSoilType(
                            e.target.value as 'loam' | 'clay' | 'sandy_loam' | 'alluvial'
                          )
                        }
                        className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      >
                        {Object.entries(c.soils).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.irrigationLabel}
                      </label>
                      <select
                        value={irrigationLevel}
                        onChange={(e) =>
                          setIrrigationLevel(
                            e.target.value as 'adequate' | 'rainfed' | 'deficit' | 'excess'
                          )
                        }
                        className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      >
                        {Object.entries(c.irrigations).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.fertilizerLabel}
                      </label>
                      <select
                        value={fertilizerRegime}
                        onChange={(e) =>
                          setFertilizerRegime(
                            e.target.value as
                              | 'balanced'
                              | 'organic_heavy'
                              | 'urea_heavy'
                              | 'minimal'
                          )
                        }
                        className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      >
                        {Object.entries(c.fertilizers).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.sowingDateLabel}
                      </label>
                      <input
                        type="date"
                        value={sowingDate}
                        onChange={(e) => setSowingDate(e.target.value)}
                        className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {!isOnline && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{c.offlineYieldNotice}</span>
                    </div>
                  )}

                  {yieldError && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{yieldError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRunYieldPrediction}
                    disabled={isPredictingYield}
                    className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#256628] disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>{isPredictingYield ? c.predictingBtn : c.predictBtn}</span>
                  </button>
                </div>
              </div>

              {/* Right 5 Cols: Active Yield Forecast Output */}
              <div className="lg:col-span-5">
                {activeYield ? (
                  <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
                      <div>
                        <p className="text-xs font-semibold text-stone-500">
                          {activeYield.cropName}
                          {activeYield.variety ? ` · ${activeYield.variety}` : ''}
                        </p>
                        <h3 className="mt-0.5 text-lg font-bold text-stone-900">
                          {c.projectedTotalLabel}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          playTrack({
                            id: `yield-${activeYield.id}`,
                            title: `${activeYield.cropName} · ${c.projectedTotalLabel}`,
                            subtitle: `${activeYield.projectedTotalYieldKg} ${c.kgUnit}`,
                            text: activeYield.audioSummary,
                            language: lang,
                          })
                        }
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-800 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-100"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span>{c.listenYieldBtn}</span>
                      </button>
                    </div>

                    {/* Hero Yield Projection Metric */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="font-mono-tabular text-3xl font-bold tracking-tight text-emerald-950">
                            {activeYield.projectedTotalYieldKg.toLocaleString()} {c.kgUnit}
                          </p>
                          <p className="mt-0.5 font-mono-tabular text-sm font-semibold text-emerald-900">
                            ≈ {formatMaund(activeYield.projectedTotalYieldKg)} {c.maundSuffix}
                          </p>
                        </div>

                        <span
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${gradeBadgeStyle(
                            activeYield.yieldGrade
                          )}`}
                        >
                          {c.gradeLabels[activeYield.yieldGrade]}
                        </span>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-emerald-200/80 pt-3 text-xs">
                        <div>
                          <dt className="text-stone-600">{c.perBighaLabel}</dt>
                          <dd className="mt-0.5 font-mono-tabular text-sm font-bold text-stone-900">
                            {activeYield.projectedYieldPerBighaKg} {c.kgUnit} (
                            {formatMaund(activeYield.projectedYieldPerBighaKg)} {c.maundSuffix})
                          </dd>
                        </div>
                        <div>
                          <dt className="text-stone-600">{c.rangeLabel}</dt>
                          <dd className="mt-0.5 font-mono-tabular text-sm font-bold text-stone-900">
                            {activeYield.projectedYieldMinKg}–{activeYield.projectedYieldMaxKg}{' '}
                            {c.kgUnit}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-stone-600">{c.confidenceLabel}</dt>
                          <dd className="mt-0.5 font-mono-tabular text-sm font-bold text-emerald-900">
                            {activeYield.confidencePercent}%
                          </dd>
                        </div>
                        <div>
                          <dt className="text-stone-600">{c.harvestWindowLabel}</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-stone-900">
                            {activeYield.estimatedHarvestWindow}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Stage-by-Stage Health Timeline */}
                    <div>
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-700">
                        <BarChart3 className="h-4 w-4 text-emerald-900" />
                        <span>{c.stageTimelineTitle}</span>
                      </h4>
                      <div className="mt-2.5 space-y-2.5">
                        {activeYield.stagesAnalyzed.map((st) => (
                          <div
                            key={st.stageKey}
                            className="rounded-xl border border-stone-200 bg-stone-50/70 p-3"
                          >
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-bold text-stone-900">{st.stageLabel}</span>
                              <span className="font-mono-tabular font-semibold text-emerald-900">
                                {st.healthScore}/100 · {c.vigorLabels[st.vigorStatus]}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                              <div
                                className="h-full rounded-full bg-emerald-800"
                                style={{ width: `${Math.max(10, Math.min(100, st.healthScore))}%` }}
                              />
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-stone-700">
                              {st.visualObservations}
                            </p>
                            <p className="mt-1 text-xs font-medium text-emerald-900">
                              {st.stageRecommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weather Impact */}
                    {activeYield.weatherImpactSummary && (
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
                        <p className="font-bold text-stone-900">{c.weatherImpactTitle}</p>
                        <p className="mt-1 leading-relaxed">{activeYield.weatherImpactSummary}</p>
                      </div>
                    )}

                    {/* Drivers & Bottlenecks */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                        <h4 className="text-xs font-bold text-emerald-950">{c.driversTitle}</h4>
                        <ul className="mt-1.5 space-y-1 text-xs text-stone-700">
                          {activeYield.yieldDrivers.map((d, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-800" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                        <h4 className="text-xs font-bold text-amber-950">{c.bottlenecksTitle}</h4>
                        <ul className="mt-1.5 space-y-1 text-xs text-stone-700">
                          {activeYield.yieldBottlenecks.map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pre-Harvest Booster Action Plan */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5">
                      <h4 className="text-xs font-bold text-stone-900">{c.boosterPlanTitle}</h4>
                      <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-stone-700">
                        {activeYield.boosterActionPlan.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
                    <Sprout className="h-10 w-10 text-emerald-900/70" />
                    <p className="mt-3 text-sm font-semibold text-stone-800">{c.tabYield}</p>
                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-stone-600">
                      {c.stagePhotosHint}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Yield Forecast History (Offline IndexedDB) */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
              <h3 className="text-sm font-bold text-stone-900">{c.savedForecastsTitle}</h3>
              {savedYields.length === 0 ? (
                <p className="mt-2 text-xs text-stone-500">{c.noSavedForecasts}</p>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {savedYields.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                        activeYield?.id === item.id
                          ? 'border-emerald-800 bg-emerald-50/40'
                          : 'border-stone-200 bg-stone-50/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveYield(item)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-bold text-stone-900">
                          {item.cropName}
                        </p>
                        <p className="mt-0.5 font-mono-tabular text-xs font-semibold text-emerald-900">
                          {item.projectedTotalYieldKg} {c.kgUnit} ({formatMaund(item.projectedTotalYieldKg)}{' '}
                          {c.maundSuffix})
                        </p>
                        <p className="mt-0.5 text-[11px] text-stone-500">
                          {new Date(item.createdAt).toLocaleDateString()} · {item.stagesUploaded.length}{' '}
                          stages
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteYield(item.id)}
                        aria-label={c.deleteBtn}
                        className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: PREDICTIVE REGIONAL PEST OUTBREAK RADAR                    */}
        {/* ================================================================ */}
        {activeTab === 'radar' && (
          <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 5 Cols: Local Telemetry Controls + 1-Tap Sighting Reporter */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
                <h3 className="flex items-center gap-2 text-base font-bold text-stone-900">
                  <Activity className="h-5 w-5 text-emerald-900" />
                  <span>{c.radarHeading}</span>
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-stone-600">{c.radarSubtitle}</p>

                <div className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      {c.districtLabel}
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-900" />
                      <input
                        type="text"
                        value={radarDistrict}
                        onChange={(e) => setRadarDistrict(e.target.value)}
                        className="min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      {c.cropFocusLabel}
                    </label>
                    <input
                      type="text"
                      value={cropFocus}
                      onChange={(e) => setCropFocus(e.target.value)}
                      placeholder={c.cropFocusPlaceholder}
                      className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.fieldStageLabel}
                      </label>
                      <select
                        value={fieldStage}
                        onChange={(e) =>
                          setFieldStage(
                            e.target.value as 'seedling' | 'vegetative' | 'flowering' | 'mature'
                          )
                        }
                        className="mt-1 min-h-[40px] w-full rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900 focus:border-emerald-800 focus:outline-none"
                      >
                        {Object.entries(c.fieldStages).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.soilMoistureLabel}
                      </label>
                      <select
                        value={soilMoisture}
                        onChange={(e) =>
                          setSoilMoisture(e.target.value as 'dry' | 'moist' | 'waterlogged')
                        }
                        className="mt-1 min-h-[40px] w-full rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900 focus:border-emerald-800 focus:outline-none"
                      >
                        {Object.entries(c.soilMoistures).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700">
                        {c.canopyLabel}
                      </label>
                      <select
                        value={canopyDensity}
                        onChange={(e) =>
                          setCanopyDensity(e.target.value as 'sparse' | 'moderate' | 'dense')
                        }
                        className="mt-1 min-h-[40px] w-full rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900 focus:border-emerald-800 focus:outline-none"
                      >
                        {Object.entries(c.canopies).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-stone-700">{c.fieldSignalsLabel}</p>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {c.fieldSignalsList.map((sig) => {
                        const active = selectedSignals.includes(sig);
                        return (
                          <button
                            key={sig}
                            type="button"
                            onClick={() => handleToggleSignal(sig)}
                            className={`flex min-h-[40px] items-center justify-start rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                              active
                                ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-semibold'
                                : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            {sig}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    {c.deviceScansIncluded} ({savedDiagnoses.length})
                  </p>

                  {!isOnline && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{c.offlineRadarNotice}</span>
                    </div>
                  )}

                  {radarError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{radarError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRunPestRadar}
                    disabled={isRunningRadar}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#256628] disabled:opacity-60"
                  >
                    <Radar className="h-4 w-4 shrink-0" />
                    <span>{isRunningRadar ? c.runningRadarBtn : c.runRadarBtn}</span>
                  </button>
                </div>
              </div>

              {/* 1-Tap Community Field Observation Reporter */}
              <form
                onSubmit={handleSubmitSighting}
                className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 space-y-3"
              >
                <h4 className="text-sm font-bold text-stone-900">{c.reportCardTitle}</h4>
                <p className="text-xs text-stone-600">{c.reportCardHint}</p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      {c.reportCropLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={reportCrop}
                      onChange={(e) => setReportCrop(e.target.value)}
                      placeholder={c.cropPlaceholder}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-stone-300 bg-white px-3 text-xs text-stone-900 focus:border-emerald-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      {c.reportPestLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={reportPest}
                      onChange={(e) => setReportPest(e.target.value)}
                      placeholder={c.reportPestPlaceholder}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-stone-300 bg-white px-3 text-xs text-stone-900 focus:border-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      {c.reportSeverityLabel}
                    </label>
                    <select
                      value={reportSeverity}
                      onChange={(e) =>
                        setReportSeverity(e.target.value as 'early' | 'moderate' | 'severe')
                      }
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-stone-300 bg-white px-3 text-xs text-stone-900 focus:border-emerald-800 focus:outline-none"
                    >
                      {Object.entries(c.severities).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      {c.reportNoteLabel}
                    </label>
                    <input
                      type="text"
                      value={reportNote}
                      onChange={(e) => setReportNote(e.target.value)}
                      placeholder={c.reportNotePlaceholder}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-stone-300 bg-white px-3 text-xs text-stone-900 focus:border-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                {reportSuccess && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{c.reportSavedMsg}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-[#2E7D32] bg-white px-4 py-2 text-xs font-semibold text-[#2E7D32] hover:bg-[#EEF4EA] disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  <span>{isSubmittingReport ? c.submittingReportBtn : c.submitReportBtn}</span>
                </button>
              </form>
            </div>

            {/* Right 7 Cols: Outbreak Forecast Cards & Community Stream */}
            <div className="lg:col-span-7 space-y-5">
              {radarResult ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
                    <div>
                      <p className="text-xs font-semibold text-stone-500">
                        {radarResult.districtName} · {radarResult.cropFocus}
                      </p>
                      <h3 className="mt-0.5 text-lg font-bold text-stone-900">
                        {c.riskLevelLabels[radarResult.overallRiskLevel]}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        playTrack({
                          id: `radar-${radarResult.districtName}`,
                          title: `${radarResult.districtName} · ${c.tabRadar}`,
                          subtitle: `${radarResult.overallRiskScore}/100`,
                          text: radarResult.audioSummary,
                          language: lang,
                        })
                      }
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-800 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-100"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>{c.listenRadarBtn}</span>
                    </button>
                  </div>

                  {/* Risk Score Meter */}
                  <div
                    className={`rounded-xl border p-4 ${riskAccentClasses(
                      radarResult.overallRiskLevel
                    )}`}
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs opacity-80">{c.overallRiskLabel}</p>
                        <p className="mt-1 font-mono-tabular text-3xl font-bold">
                          {radarResult.overallRiskScore}
                          <span className="text-sm font-medium opacity-70">/100</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-80">{c.outbreakWindowLabel}</p>
                        <p className="mt-1 font-mono-tabular text-2xl font-bold">
                          {radarResult.outbreakWindowDays} {c.daysLabel}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-80">{c.signalsUsedLabel}</p>
                        <p className="mt-1 font-mono-tabular text-2xl font-bold">
                          {radarResult.communitySignalCount}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/80">
                      <div
                        className={`h-full rounded-full ${riskBarColor(radarResult.overallRiskScore)}`}
                        style={{
                          width: `${Math.max(8, Math.min(100, radarResult.overallRiskScore))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Weather & Scouting Context */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs">
                      <p className="font-bold text-stone-900">{c.weatherTriggerTitle}</p>
                      <p className="mt-1 leading-relaxed text-stone-700">
                        {radarResult.weatherTriggerSummary}
                      </p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs">
                      <p className="font-bold text-stone-900">{c.scoutingSummaryTitle}</p>
                      <p className="mt-1 leading-relaxed text-stone-700">
                        {radarResult.regionalScoutingSummary}
                      </p>
                    </div>
                  </div>

                  {/* Ranked Outbreak Threats */}
                  <div>
                    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-700">
                      <ShieldAlert className="h-4 w-4 text-emerald-900" />
                      <span>{c.threatsListTitle}</span>
                    </h4>
                    <div className="mt-3 space-y-3">
                      {radarResult.predictedOutbreaks.map((threat, idx) => (
                        <div
                          key={`${threat.pestName}-${idx}`}
                          className="rounded-xl border border-stone-200 bg-stone-50/70 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h5 className="text-sm font-bold text-stone-900">
                                {threat.pestName}
                              </h5>
                              <p className="text-xs text-stone-500">
                                {threat.scientificName} · {threat.targetCrops.join(', ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block rounded-lg border px-2.5 py-1 font-mono-tabular text-xs font-bold ${riskAccentClasses(
                                  threat.riskLevel
                                )}`}
                              >
                                {threat.riskPercent}% · {c.riskLevelLabels[threat.riskLevel]}
                              </span>
                              <p className="mt-1 text-[11px] font-medium text-stone-600">
                                {threat.onsetWindow}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                            <div className="rounded-lg border border-stone-200 bg-white p-2.5">
                              <p className="font-bold text-stone-900">{c.earlySignsLabel}</p>
                              <ul className="mt-1 list-disc space-y-1 pl-4 text-stone-700">
                                {threat.earlyWarningSignals.map((sig, i) => (
                                  <li key={i}>{sig}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5">
                              <p className="font-bold text-emerald-950">{c.preventiveShieldLabel}</p>
                              <p className="mt-1 leading-relaxed text-stone-800">
                                {threat.preventiveShield}
                              </p>
                              {threat.affectedRadiusNote && (
                                <p className="mt-1.5 text-[11px] text-stone-600">
                                  {threat.affectedRadiusNote}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
                  <Radar className="h-10 w-10 text-emerald-900/70" />
                  <p className="mt-3 text-sm font-semibold text-stone-800">{c.radarHeading}</p>
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-stone-600">
                    {c.radarSubtitle}
                  </p>
                </div>
              )}

              {/* Recent Community Sightings Feed */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
                <h4 className="text-sm font-bold text-stone-900">{c.recentCommunityTitle}</h4>
                {communityReports.length === 0 ? (
                  <p className="mt-2 text-xs text-stone-500">{c.noCommunityReports}</p>
                ) : (
                  <div className="mt-3 divide-y divide-stone-100">
                    {communityReports.slice(0, 6).map((rep) => (
                      <div key={rep.id} className="flex items-start justify-between gap-3 py-2.5 text-xs">
                        <div>
                          <p className="font-bold text-stone-900">
                            {rep.cropName} · {rep.pestName}
                          </p>
                          <p className="text-stone-600">
                            {rep.districtName}
                            {rep.note ? ` · ${rep.note}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-semibold text-amber-900">
                            {c.severities[rep.severity]}
                          </span>
                          <p className="text-[11px] text-stone-400">
                            {new Date(rep.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
