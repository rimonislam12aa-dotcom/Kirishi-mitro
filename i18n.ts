// বাংলা, হিন্দি ও ইংরেজি ভাষার সব লেখা ও অনুবাদ
import { AppLanguage } from '../types/agri';

export const LANGUAGE_OPTIONS: { code: AppLanguage; nativeName: string }[] = [
  {
    "code": "bn",
    "nativeName": "বাংলা"
  },
  {
    "code": "hi",
    "nativeName": "हिन्दी"
  },
  {
    "code": "en",
    "nativeName": "English"
  }
];

export type Translations = {
  brandName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  nav: {
    home: string;
    weather: string;
    calendar: string;
    scanner: string;
    tips: string;
    market: string;
    feedback: string;
  };
  home: {
    greeting: string;
    subGreeting: string;
    menuHeading: string;
    menuSubheading: string;
    backToHome: string;
    openFeature: string;
    todayAtGlance: string;
    rainChanceLabel: string;
    airQualityLabel: string;
    scanTitle: string;
    scanDesc: string;
    weatherTitle: string;
    weatherDesc: string;
    calendarTitle: string;
    calendarDesc: string;
    marketTitle: string;
    marketDesc: string;
    tipsTitle: string;
    tipsDesc: string;
    feedbackTitle: string;
    feedbackDesc: string;
  };
  status: {
    online: string;
    offline: string;
    offlineBanner: string;
    offlineDbButton: string;
    languageLabel: string;
    listenLabel: string;
    stopLabel: string;
    syncNow: string;
    syncing: string;
    lastUpdated: string;
    cachedOffline: string;
  };
  weather: {
    sectionTitle: string;
    sectionSubtitle: string;
    detectGps: string;
    detectingGps: string;
    selectDistrict: string;
    humidity: string;
    wind: string;
    rain: string;
    uv: string;
    aqi: string;
    pm25Label: string;
    forecastTitle: string;
    alertsTitle: string;
    noAlerts: string;
    enablePush: string;
    disablePush: string;
    pushEnabled: string;
    pushInAppActive: string;
    pushBlocked: string;
    testPush: string;
    listenWeather: string;
    gpsCoords: string;
    gpsError: string;
    recentAlertsLog: string;
    dismissAlert: string;
  };
  scanner: {
    sectionTitle: string;
    sectionSubtitle: string;
    photoQualityTip: string;
    startCamera: string;
    stopCamera: string;
    capturePhoto: string;
    uploadPhoto: string;
    trySampleLeaf: string;
    cropHintLabel: string;
    cropHintPlaceholder: string;
    affectedPartLabel: string;
    affectedParts: {
      leaf: string;
      stem: string;
      fruit: string;
      root: string;
    };
    growthStageLabel: string;
    growthStages: {
      seedling: string;
      vegetative: string;
      flowering: string;
      mature: string;
    };
    symptomTagsLabel: string;
    symptomTags: string[];
    analyzeButton: string;
    analyzing: string;
    offlineScanNotice: string;
    retryScanBtn: string;
    retakePhotoBtn: string;
    saveOfflineQueueBtn: string;
    queuedScansTitle: string;
    queuedScanNowBtn: string;
    queuedSavedMsg: string;
    deleteDiagnosisBtn: string;
    cameraInitializing: string;
    urgentActionTitle: string;
    rootCauseTitle: string;
    symptomsTitle: string;
    organicTitle: string;
    chemicalTitle: string;
    dosageGuideTitle: string;
    harvestWaitLabel: string;
    lookalikeTitle: string;
    preventionTitle: string;
    listenDiagnosis: string;
    savedHistoryTitle: string;
    noSavedHistory: string;
    confidenceLabel: string;
    diseaseStageLabel: string;
    spreadRiskLabel: string;
    pathogenTypes: {
      fungal: string;
      bacterial: string;
      viral: string;
      pest: string;
      deficiency: string;
      healthy: string;
      unclear: string;
    };
    spreadRiskLabels: {
      low: string;
      moderate: string;
      high: string;
    };
    severityLabels: {
      healthy: string;
      low: string;
      moderate: string;
      high: string;
    };
  };
  tips: {
    sectionTitle: string;
    sectionSubtitle: string;
    searchPlaceholder: string;
    allCrops: string;
    allSeasons: string;
    bookmarkedOnly: string;
    seasons: {
      all: string;
      kharif: string;
      rabi: string;
      zaid: string;
    };
    stepsTitle: string;
    fertilizerTitle: string;
    listenTip: string;
    bookmarkAdd: string;
    bookmarkSaved: string;
    noTipsMatch: string;
  };
  market: {
    sectionTitle: string;
    sectionSubtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    categories: {
      all: string;
      grain: string;
      vegetable: string;
      spice: string;
      fruit: string;
    };
    perKg: string;
    perMaund: string;
    trendUp: string;
    trendDown: string;
    trendStable: string;
    listenMarket: string;
    refreshLiveBtn: string;
    refreshingLive: string;
    lastMarketSyncLabel: string;
    autoSyncNote: string;
    verifiedLiveBadge: string;
    farmerReportBadge: string;
    sourcesTitle: string;
    quickUpdateBtn: string;
    editingPriceTitle: string;
    addNewPriceTitle: string;
    reportPriceBtn: string;
    closeForm: string;
    cropNameLabel: string;
    marketNameLabel: string;
    priceKgLabel: string;
    currencyLabel: string;
    trendLabel: string;
    submitPrice: string;
    pendingSyncTag: string;
    syncedTag: string;
    updateSuccessMsg: string;
    refreshSuccessMsg: string;
    refreshErrorMsg: string;
  };
  feedback: {
    sectionTitle: string;
    sectionSubtitle: string;
    nameLabel: string;
    phoneLabel: string;
    villageLabel: string;
    cropLabel: string;
    categoryLabel: string;
    messageLabel: string;
    attachGpsLabel: string;
    submitBtn: string;
    submitting: string;
    savedOfflineMsg: string;
    sentOnlineMsg: string;
    historyTitle: string;
    emptyHistory: string;
    categories: {
      disease: string;
      weather: string;
      market: string;
      suggestion: string;
    };
  };
  audio: {
    playerTitle: string;
    playingNow: string;
    paused: string;
    loadingVoice: string;
    aiVoiceBadge: string;
    offlineVoiceBadge: string;
    speedLabel: string;
    emptyState: string;
  };
  offlineDrawer: {
    title: string;
    subtitle: string;
    storageOverviewTitle: string;
    storageUsedLabel: string;
    tipsCount: string;
    marketCount: string;
    diagnosesCount: string;
    pendingScansCount: string;
    pendingPricesCount: string;
    pendingCount: string;
    weatherCached: string;
    audioCached: string;
    lastSyncLabel: string;
    neverSynced: string;
    yes: string;
    no: string;
    syncAndQueueTitle: string;
    processQueueBtn: string;
    dataBackupTitle: string;
    exportJson: string;
    importJsonBtn: string;
    importSuccessMsg: string;
    importErrorMsg: string;
    clearAudioBtn: string;
    clearAudioDoneMsg: string;
    clearWeatherBtn: string;
    clearWeatherDoneMsg: string;
    installSectionTitle: string;
    installApp: string;
    iosInstallTitle: string;
    iosInstallSteps: string;
    close: string;
  };
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    firstVisitBadge: string;
    firstVisitMessage: string;
    returningMessage: string;
    visitOrdinalPrefix: string;
    visitOrdinalSuffix: string;
    listenGreeting: string;
    dismissLabel: string;
    regionReadyPrefix: string;
  };
  visitors: {
    sectionTitle: string;
    sectionSubtitle: string;
    totalVisits: string;
    totalVisitsHint: string;
    todayVisits: string;
    uniqueVisitors: string;
    uniqueVisitorsHint: string;
    todayUnique: string;
    returningVisits: string;
    avgViewsLabel: string;
    activeNow: string;
    liveRealtimeLabel: string;
    offlineCacheLabel: string;
    ratioUniqueLabel: string;
    ratioReturnLabel: string;
    refreshCount: string;
    lastUpdated: string;
  };
  qr: {
    sectionTitle: string;
    sectionSubtitle: string;
    fastScanBadge: string;
    shortLinkMode: string;
    installLinkMode: string;
    scanHint: string;
    zoomBtn: string;
    downloadPngBtn: string;
    copyUrlBtn: string;
    copiedMsg: string;
    shareBtn: string;
    fullscreenTitle: string;
    fullscreenHint: string;
    closeBtn: string;
  };
  pwaInstall: {
    buttonLabel: string;
    buttonDirectLabel: string;
    installedLabel: string;
    bannerTitle: string;
    bannerSubtitle: string;
    modalTitle: string;
    modalSubtitle: string;
    directInstallNow: string;
    iframeNotice: string;
    openStandaloneTab: string;
    inAppBrowserNotice: string;
    openInChromeBtn: string;
    androidTitle: string;
    androidSteps: string[];
    iosTitle: string;
    iosSteps: string[];
    desktopTitle: string;
    desktopSteps: string[];
    phoneShareTitle: string;
    phoneShareDesc: string;
    copyLinkBtn: string;
    copiedMsg: string;
    shareLinkBtn: string;
    offlineReadyNote: string;
    closeBtn: string;
  };
  calendar: {
    sectionTitle: string;
    sectionSubtitle: string;
    advisorMonthLabel: string;
    plantNowTitle: string;
    harvestNowTitle: string;
    noPlantMonth: string;
    noHarvestMonth: string;
    plannerTitle: string;
    selectCropLabel: string;
    plantingDateLabel: string;
    expectedHarvestLabel: string;
    durationLabel: string;
    soilLabel: string;
    spacingLabel: string;
    currentProgressLabel: string;
    daysElapsedSuffix: string;
    readyToHarvestMsg: string;
    notPlantedYetMsg: string;
    milestonesTitle: string;
    listenPlanBtn: string;
    matrixTitle: string;
    showMatrixBtn: string;
    hideMatrixBtn: string;
    matrixPlantLegend: string;
    matrixHarvestLegend: string;
    cropCol: string;
    plantingCol: string;
    harvestCol: string;
  };
};

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  "bn": {
    "brandName": "কৃষি মিত্র",
    "heroEyebrow": "আপনার সহজ কৃষি সহায়ক",
    "heroTitle": "আসসালামু আলাইকুম! আজকের আবহাওয়া ও ফসলের সমাধান",
    "heroSubtitle": "আবহাওয়া, ফসলের রোগ পরীক্ষা, কখন লাগাবেন-তুলবেন ও বাজার দর—সব কিছু সহজ বাংলায় শুনুন ও দেখুন।",
    "heroPrimaryCta": "ছবি তুলে রোগ দেখুন",
    "heroSecondaryCta": "আজকের খবর শুনুন",
    "nav": {
      "home": "হোম",
      "weather": "আবহাওয়া",
      "calendar": "ফসল সময়",
      "scanner": "রোগ স্ক্যান",
      "tips": "চাষের টিপস",
      "market": "বাজার দর",
      "feedback": "যোগাযোগ"
    },
    "home": {
      "greeting": "আসসালামু আলাইকুম",
      "subGreeting": "আজ আপনার জমির জন্য দরকারি সব তথ্য এক জায়গায়",
      "menuHeading": "আপনি কী দেখতে চান? নিচে চাপ দিন",
      "menuSubheading": "যেকোনো একটি সেবা বেছে নিলেই সহজভাবে বিস্তারিত দেখতে পাবেন।",
      "backToHome": "মূল পাতায় ফিরুন",
      "openFeature": "দেখুন",
      "todayAtGlance": "আজকের আবহাওয়া",
      "rainChanceLabel": "বৃষ্টির সম্ভাবনা",
      "airQualityLabel": "বাতাসের মান",
      "scanTitle": "পাতার রোগ পরীক্ষা",
      "scanDesc": "আক্রান্ত পাতার ছবি দিন—রোগ ও ওষুধ জানুন",
      "weatherTitle": "আবহাওয়া ও ঝড়-বৃষ্টি",
      "weatherDesc": "আজ ও ৫ দিনের বৃষ্টি, তাপমাত্রা ও সতর্কতা",
      "calendarTitle": "কখন লাগাবেন ও তুলবেন",
      "calendarDesc": "মাস অনুযায়ী ফসল রোপণ ও কাটার তারিখ জানুন",
      "marketTitle": "আজকের বাজার দর",
      "marketDesc": "ধান, আলু, পেঁয়াজ ও সবজির কেজি ও মণ দাম",
      "tipsTitle": "চাষ ও সারের নিয়ম",
      "tipsDesc": "বিঘা প্রতি সার, বীজ ও সেচের সহজ নির্দেশনা",
      "feedbackTitle": "প্রশ্ন ও যোগাযোগ",
      "feedbackDesc": "ফসলের সমস্যা লিখে পাঠান, পরামর্শ নিন"
    },
    "status": {
      "online": "ইন্টারনেট চালু",
      "offline": "ইন্টারনেট নেই (অফলাইন)",
      "offlineBanner": "ইন্টারনেট সংযোগ নেই — আপনার ফোনে আগে থেকে জমা থাকা তথ্য দেখানো হচ্ছে।",
      "offlineDbButton": "ফোনে জমা তথ্য",
      "languageLabel": "ভাষা",
      "listenLabel": "শুনুন",
      "stopLabel": "থামান",
      "syncNow": "আপডেট করুন",
      "syncing": "আপডেট হচ্ছে...",
      "lastUpdated": "সময়",
      "cachedOffline": "ফোনে জমা আছে"
    },
    "weather": {
      "sectionTitle": "জিপিএস অবস্থান ও দুর্যোগ আবহাওয়া সতর্কতা",
      "sectionSubtitle": "আপনার খামারের অবস্থান অনুযায়ী রিয়েল-টাইম তাপমাত্রা, বায়ুর মান (AQI), ৫ দিনের পূর্বাভাস ও তাৎক্ষণিক পুশ নোটিফিকেশন।",
      "detectGps": "জিপিএস দিয়ে অবস্থান খুঁজুন",
      "detectingGps": "অবস্থান নির্ণয় হচ্ছে...",
      "selectDistrict": "অথবা জেলা নির্বাচন করুন",
      "humidity": "আর্দ্রতা",
      "wind": "বাতাসের গতি",
      "rain": "বৃষ্টিপাত",
      "uv": "রোদ (UV)",
      "aqi": "বায়ুর মান (AQI)",
      "pm25Label": "PM2.5",
      "forecastTitle": "আগামী ৫ দিনের কৃষি ও বৃষ্টির পূর্বাভাস",
      "alertsTitle": "দুর্যোগ ও কৃষি আবহাওয়া অ্যালার্ট",
      "noAlerts": "এই মুহূর্তে গুরুতর আবহাওয়া দুর্যোগের আশঙ্কা নেই। স্বাভাবিক ফসল পরিচর্যা চালিয়ে যান।",
      "enablePush": "নোটিফিকেশন চালু করুন",
      "disablePush": "নোটিফিকেশন বন্ধ করুন",
      "pushEnabled": "ডিভাইস ও ইন-অ্যাপ পুশ নোটিফিকেশন চালু হয়েছে",
      "pushInAppActive": "সক্রিয় আবহাওয়া অ্যালার্ট চালু আছে",
      "pushBlocked": "ব্রাউজার পপ-আপ ব্লক থাকায় অ্যাপের ভেতরের অ্যালার্ট চালু রাখা হয়েছে",
      "testPush": "টেস্ট অ্যালার্ট পাঠান",
      "listenWeather": "আবহাওয়া শুনুন",
      "gpsCoords": "অক্ষাংশ ও দ্রাঘিমাংশ",
      "gpsError": "জিপিএস পাওয়া যায়নি; নিকটস্থ জেলার আবহাওয়া দেখানো হচ্ছে।",
      "recentAlertsLog": "সর্বশেষ পাঠানো সতর্কবার্তা",
      "dismissAlert": "বন্ধ করুন"
    },
    "scanner": {
      "sectionTitle": "ক্যামেরা দিয়ে নিখুঁত রোগ শনাক্তকরণ ও পরামর্শ",
      "sectionSubtitle": "আক্রান্ত পাতা বা গাছের স্পষ্ট ছবি তুলুন—রোগের কারণ, ডোজ-মাপ, জৈবিক ও রাসায়নিক প্রতিকার বিস্তারিত জানুন।",
      "photoQualityTip": "পরামর্শ: রোদের আলোয় আক্রান্ত অংশটির কাছ থেকে পরিষ্কার ছবি তুলুন",
      "startCamera": "ক্যামেরা চালু করুন",
      "stopCamera": "ক্যামেরা বন্ধ করুন",
      "capturePhoto": "ছবি তুলুন",
      "uploadPhoto": "গ্যালারি থেকে দিন",
      "trySampleLeaf": "নমুনা ধানের পাতা দেখুন",
      "cropHintLabel": "ফসলের নাম (ঐচ্ছিক)",
      "cropHintPlaceholder": "যেমন: ধান, আলু, টমেটো, বেগুন",
      "affectedPartLabel": "কোন অংশে সমস্যা",
      "affectedParts": {
        "leaf": "পাতা",
        "stem": "কাণ্ড / ডগা",
        "fruit": "ফল / শীষ",
        "root": "গোড়া / শিকড়"
      },
      "growthStageLabel": "গাছের বয়স",
      "growthStages": {
        "seedling": "চারা অবস্থা",
        "vegetative": "বাড়ন্ত গাছ",
        "flowering": "ফুল পর্যায়",
        "mature": "ফল / পাকা পর্যায়"
      },
      "symptomTagsLabel": "বাড়তি লক্ষণ বেছে নিতে পারেন (নিখুঁত ফলাফলের জন্য)",
      "symptomTags": [
        "হলুদ দাগ",
        "বাদামী বা কালো ছোপ",
        "পাতা মোড়ানো",
        "সাদা পাউডার/ছত্রাক",
        "পোকামাকড় বা ছিদ্র",
        "গোড়া পচা/দুর্গন্ধ"
      ],
      "analyzeButton": "বিস্তারিত রোগ পরীক্ষা করুন",
      "analyzing": "গভীরভাবে পাতা বিশ্লেষণ হচ্ছে...",
      "offlineScanNotice": "নতুন ছবির এআই পরীক্ষার জন্য ইন্টারনেট প্রয়োজন; তবে ছবি এখনই অফলাইন কিউতে জমা রাখতে পারবেন এবং আগের রিপোর্ট সবসময় দেখা ও শোনা যাবে।",
      "retryScanBtn": "আবার স্ক্যান চেষ্টা করুন",
      "retakePhotoBtn": "নতুন ছবি দিন",
      "saveOfflineQueueBtn": "অফলাইনে জমা রাখুন (পরে স্ক্যান হবে)",
      "queuedScansTitle": "অফলাইনে জমা থাকা স্ক্যান ছবি",
      "queuedScanNowBtn": "এখন স্ক্যান করুন",
      "queuedSavedMsg": "ছবি অফলাইন সারিতে জমা হয়েছে—ইন্টারনেট এলে সহজেই স্ক্যান করা যাবে।",
      "deleteDiagnosisBtn": "রিপোর্ট মুছুন",
      "cameraInitializing": "ক্যামেরা প্রস্তুত হচ্ছে...",
      "urgentActionTitle": "আজকের জরুরি করণীয় (প্রথম ২৪ ঘণ্টা)",
      "rootCauseTitle": "রোগের মূল কারণ ও আবহাওয়ার প্রভাব",
      "symptomsTitle": "দৃশ্যমান লক্ষণ",
      "organicTitle": "জৈবিক ও ঘরোয়া প্রতিকার",
      "chemicalTitle": "সুপারিশকৃত ওষুধ ও রাসায়নিক ব্যবস্থাপনা",
      "dosageGuideTitle": "সঠিক মিশ্রণের মাপ ও স্প্রে নিয়ম",
      "harvestWaitLabel": "স্প্রের পর ফসল তোলার অপেক্ষা",
      "lookalikeTitle": "অনুরূপ রোগের সাথে পার্থক্য যাচাই",
      "preventionTitle": "ভবিষ্যৎ প্রতিরোধ ও মাঠ পরিচর্যা",
      "listenDiagnosis": "বিস্তারিত পরামর্শ শুনুন",
      "savedHistoryTitle": "অফলাইনে সংরক্ষিত পরীক্ষার ইতিহাস",
      "noSavedHistory": "এখনো কোনো ফসল পরীক্ষা সংরক্ষণ করা হয়নি।",
      "confidenceLabel": "নির্ভুলতা",
      "diseaseStageLabel": "আক্রমণের পর্যায়",
      "spreadRiskLabel": "ছড়িয়ে পড়ার ঝুঁকি",
      "pathogenTypes": {
        "fungal": "ছত্রাকজনিত রোগ",
        "bacterial": "ব্যাকটেরিয়াজনিত রোগ",
        "viral": "ভাইরাসজনিত রোগ",
        "pest": "পোকামাকড়ের আক্রমণ",
        "deficiency": "পুষ্টি উপাদানের ঘাটতি",
        "healthy": "সুস্থ ও স্বাভাবিক",
        "unclear": "স্পষ্ট ছবি প্রয়োজন"
      },
      "spreadRiskLabels": {
        "low": "কম ঝুঁকি",
        "moderate": "মাঝারি ঝুঁকি",
        "high": "দ্রুত ছড়াতে পারে"
      },
      "severityLabels": {
        "healthy": "সুস্থ ফসল",
        "low": "প্রাথমিক পর্যায়",
        "moderate": "মাঝারি ঝুঁকি",
        "high": "জরুরি পদক্ষেপ প্রয়োজন"
      }
    },
    "tips": {
      "sectionTitle": "মৌসুমভিত্তিক ফসল পরিচর্যা টিপস",
      "sectionSubtitle": "সব টিপস আপনার ফোনের অফলাইন ডাটাবেজে সংরক্ষিত থাকে—মাঠে নেটওয়ার্ক ছাড়াও পড়তে ও শুনতে পারবেন।",
      "searchPlaceholder": "ফসল বা সমস্যা লিখে খুঁজুন...",
      "allCrops": "সব ফসল",
      "allSeasons": "সব মৌসুম",
      "bookmarkedOnly": "সংরক্ষিত টিপস",
      "seasons": {
        "all": "সারা বছর",
        "kharif": "খরিফ / বর্ষা",
        "rabi": "রবি / শীত",
        "zaid": "গ্রীষ্ম / খরিফ-১"
      },
      "stepsTitle": "পরিচর্যার ধাপসমূহ",
      "fertilizerTitle": "সুষম সার ও সেচ পরামর্শ",
      "listenTip": "টিপস শুনুন",
      "bookmarkAdd": "সংরক্ষণ করুন",
      "bookmarkSaved": "সংরক্ষিত",
      "noTipsMatch": "আপনার খোঁজের সাথে কোনো টিপস মেলেনি।"
    },
    "market": {
      "sectionTitle": "নিয়মিত লাইভ বাজার দর ও আপডেট",
      "sectionSubtitle": "আঞ্চলিক হাট ও বাজারের প্রতি কেজি ও প্রতি মণ (৪০ কেজি) হালনাগাদ দর। এক ক্লিকে আজকের লাইভ দর আনুন বা স্থানীয় দর আপডেট করুন।",
      "searchPlaceholder": "ফসল বা বাজারের নাম লিখুন...",
      "allCategories": "সব পণ্য",
      "categories": {
        "all": "সব",
        "grain": "শস্য ও ডাল",
        "vegetable": "সবজি",
        "spice": "মসলা",
        "fruit": "ফল"
      },
      "perKg": "প্রতি কেজি",
      "perMaund": "প্রতি মণ (৪০ কেজি)",
      "trendUp": "দাম বেড়েছে",
      "trendDown": "দাম কমেছে",
      "trendStable": "স্থিতিশীল",
      "listenMarket": "বাজার দর শুনুন",
      "refreshLiveBtn": "আজকের লাইভ দর আপডেট",
      "refreshingLive": "লাইভ দর আনা হচ্ছে...",
      "lastMarketSyncLabel": "সর্বশেষ বাজার আপডেট",
      "autoSyncNote": "নিয়মিত স্বয়ংক্রিয় দর সিঙ্ক চালু আছে",
      "verifiedLiveBadge": "লাইভ যাচাইকৃত",
      "farmerReportBadge": "স্থানীয় রিপোর্ট",
      "sourcesTitle": "তথ্যসূত্র",
      "quickUpdateBtn": "দর বদলান",
      "editingPriceTitle": "এই ফসলের আজকের দর আপডেট করুন",
      "addNewPriceTitle": "নতুন ফসল বা বাজারের দর যোগ করুন",
      "reportPriceBtn": "নতুন দর যোগ করুন",
      "closeForm": "ফর্ম বন্ধ করুন",
      "cropNameLabel": "ফসলের নাম",
      "marketNameLabel": "বাজার / হাটের নাম",
      "priceKgLabel": "দাম (প্রতি কেজি)",
      "currencyLabel": "মুদ্রা",
      "trendLabel": "বাজার প্রবণতা",
      "submitPrice": "দর আপডেট সংরক্ষণ করুন",
      "pendingSyncTag": "সিঙ্কের অপেক্ষায় (অফলাইন)",
      "syncedTag": "সিঙ্ক সম্পন্ন",
      "updateSuccessMsg": "আজকের বাজার দর সফলভাবে আপডেট হয়েছে।",
      "refreshSuccessMsg": "আজকের সর্বশেষ বাজার দর আপডেট করা হয়েছে।",
      "refreshErrorMsg": "এই মুহূর্তে লাইভ বাজার দর আনা যায়নি; ফোনে সংরক্ষিত সর্বশেষ দর দেখানো হচ্ছে।"
    },
    "feedback": {
      "sectionTitle": "কৃষক যোগাযোগ ও পরামর্শ ফর্ম",
      "sectionSubtitle": "ফসলের সমস্যা, প্রশ্ন বা মতামত পাঠান। অফলাইনে জমা দিলে নেট পাওয়া মাত্র স্বয়ংক্রিয়ভাবে পৌঁছে যাবে।",
      "nameLabel": "কৃষকের নাম",
      "phoneLabel": "মোবাইল নম্বর",
      "villageLabel": "গ্রাম / উপজেলা / জেলা",
      "cropLabel": "ফসলের নাম",
      "categoryLabel": "বিষয়",
      "messageLabel": "আপনার সমস্যা বা মতামত লিখুন",
      "attachGpsLabel": "বর্তমান জিপিএস অবস্থান যুক্ত করুন",
      "submitBtn": "বার্তা পাঠান",
      "submitting": "সংরক্ষণ হচ্ছে...",
      "savedOfflineMsg": "অফলাইন ডাটাবেজে সংরক্ষিত হয়েছে। নেট এলেই স্বয়ংক্রিয়ভাবে পাঠানো হবে।",
      "sentOnlineMsg": "আপনার বার্তা সফলভাবে কৃষি মিত্র ডেস্কে পৌঁছেছে।",
      "historyTitle": "পাঠানো বার্তার তালিকা",
      "emptyHistory": "এখনো কোনো বার্তা পাঠানো হয়নি।",
      "categories": {
        "disease": "রোগ ও পোকামাকড়",
        "weather": "আবহাওয়া ও সেচ",
        "market": "বাজার দর",
        "suggestion": "অ্যাপ পরামর্শ"
      }
    },
    "audio": {
      "playerTitle": "কৃষি অডিও প্লেয়ার",
      "playingNow": "চলছে",
      "paused": "বিরতি",
      "loadingVoice": "কণ্ঠ প্রস্তুত হচ্ছে...",
      "aiVoiceBadge": "প্রাকৃতিক কণ্ঠ",
      "offlineVoiceBadge": "অফলাইন ভয়েস",
      "speedLabel": "গতি",
      "emptyState": "যেখানে \"শুনুন\" বোতাম দেখবেন, চাপ দিলে এখানে পরিষ্কার ভাষায় পড়ে শোনাবে।"
    },
    "offlineDrawer": {
      "title": "অফলাইন ডাটা ম্যানেজমেন্ট ও সিঙ্ক",
      "subtitle": "ইন্টারনেট ছাড়াও আপনার সব ফসল তথ্য, স্ক্যান ও বাজার দর সহজ ৩টি ধাপে পরিচালনা করুন।",
      "storageOverviewTitle": "১. ফোনের স্টোরেজ ও জমার হিসাব",
      "storageUsedLabel": "ব্যবহৃত জায়গা",
      "tipsCount": "চাষের টিপস",
      "marketCount": "বাজার দরের তালিকা",
      "diagnosesCount": "রোগ পরীক্ষার রিপোর্ট",
      "pendingScansCount": "অপেক্ষমান অফলাইন স্ক্যান",
      "pendingPricesCount": "সিঙ্ক বাকি বাজার দর",
      "pendingCount": "মোট সিঙ্কের অপেক্ষায়",
      "weatherCached": "আবহাওয়ার তথ্য",
      "audioCached": "সংরক্ষিত অডিও",
      "lastSyncLabel": "সর্বশেষ সিঙ্ক",
      "neverSynced": "এখনো সিঙ্ক হয়নি",
      "yes": "আছে",
      "no": "নেই",
      "syncAndQueueTitle": "২. দ্রুত সিঙ্ক ও অফলাইন কিউ",
      "processQueueBtn": "জমা থাকা ছবি স্ক্যান ও সিঙ্ক করুন",
      "dataBackupTitle": "৩. ব্যাকআপ, পুনরুদ্ধার ও জায়গা খালি",
      "exportJson": "ব্যাকআপ ফাইল নামান (JSON)",
      "importJsonBtn": "ব্যাকআপ থেকে ফিরিয়ে আনুন",
      "importSuccessMsg": "ব্যাকআপ তথ্য সফলভাবে আপনার ফোনে যুক্ত হয়েছে।",
      "importErrorMsg": "সঠিক JSON ব্যাকআপ ফাইল নির্বাচন করুন।",
      "clearAudioBtn": "অডিও ক্যাশ খালি করুন",
      "clearAudioDoneMsg": "সংরক্ষিত অডিও ক্যাশ পরিষ্কার করা হয়েছে।",
      "clearWeatherBtn": "পুরোনো আবহাওয়া ক্যাশ মুছুন",
      "clearWeatherDoneMsg": "আবহাওয়া ক্যাশ পরিষ্কার হয়েছে।",
      "installSectionTitle": "অ্যাপ ইনস্টলেশন",
      "installApp": "ফোনে অ্যাপ ইনস্টল করুন",
      "iosInstallTitle": "iPhone / iPad-এ ইনস্টল করতে",
      "iosInstallSteps": "Safari-র নিচে Share বোতামে চাপ দিয়ে \"Add to Home Screen\" নির্বাচন করুন।",
      "close": "বন্ধ করুন"
    },
    "greeting": {
      "morning": "সুপ্রভাত, প্রিয় কৃষক ভাই! আসসালামু আলাইকুম",
      "afternoon": "শুভ দুপুর! আসসালামু আলাইকুম",
      "evening": "শুভ সন্ধ্যা! আসসালামু আলাইকুম",
      "night": "শুভ রাত্রি! আসসালামু আলাইকুম",
      "firstVisitBadge": "প্রথম আগমনে স্বাগতম",
      "firstVisitMessage": "কৃষি মিত্রে আপনাকে আন্তরিক স্বাগতম! আজকের আবহাওয়া, ফসলের রোগ পরীক্ষা, রোপণ সময় ও বাজার দর এক জায়গায় দেখে নিন।",
      "returningMessage": "কৃষি মিত্রে আবারও স্বাগতম! আপনার খামারের জন্য আজকের আবহাওয়া ও ফসলের হালনাগাদ তথ্য প্রস্তুত আছে।",
      "visitOrdinalPrefix": "আপনার",
      "visitOrdinalSuffix": "-তম ভিজিট",
      "listenGreeting": "স্বাগত বার্তা শুনুন",
      "dismissLabel": "স্বাগত বার্তা বন্ধ করুন",
      "regionReadyPrefix": "এলাকা"
    },
    "visitors": {
      "sectionTitle": "রিয়েল-টাইম দর্শক ও ভিউ পরিসংখ্যান",
      "sectionSubtitle": "প্রতিটি পেজ ভিজিট (মোট ভিউ) এবং স্বতন্ত্র ব্যবহারকারী (ইউনিক ভিজিটর) আলাদাভাবে সরাসরি হিসাব করা হয়।",
      "totalVisits": "মোট ভিউ",
      "totalVisitsHint": "সকল পেজ ভিজিট সংখ্যা",
      "todayVisits": "আজকের ভিউ",
      "uniqueVisitors": "ইউনিক ভিজিটর",
      "uniqueVisitorsHint": "স্বতন্ত্র ডিভাইস / কৃষক",
      "todayUnique": "আজকের ইউনিক",
      "returningVisits": "পুনরায় ভিজিট",
      "avgViewsLabel": "গড় ভিউ/দর্শক",
      "activeNow": "এখন লাইভ দেখছেন",
      "liveRealtimeLabel": "রিয়েল-টাইম লাইভ",
      "offlineCacheLabel": "ক্যাশ তথ্য",
      "ratioUniqueLabel": "নতুন ইউনিক",
      "ratioReturnLabel": "পুনরায় ভিউ",
      "refreshCount": "আপডেট",
      "lastUpdated": "সর্বশেষ ভিজিট"
    },
    "qr": {
      "sectionTitle": "দ্রুত স্ক্যান কিউআর কোড",
      "sectionSubtitle": "উচ্চ কনট্রাস্ট ও সঠিক মার্জিনসহ সাজানো—যেকোনো ফোনের ক্যামেরায় মুহূর্তেই স্ক্যান হয়।",
      "fastScanBadge": "হাই-কনট্রাস্ট · দ্রুত স্ক্যান",
      "shortLinkMode": "সরাসরি অ্যাপ লিংক",
      "installLinkMode": "অ্যাপ ইনস্টল লিংক",
      "scanHint": "ফোনের ক্যামেরা বা Google Lens ধরে সরাসরি খুলুন",
      "zoomBtn": "বড় করে দেখুন",
      "downloadPngBtn": "QR ছবি সেভ",
      "copyUrlBtn": "লিংক কপি",
      "copiedMsg": "কপি হয়েছে!",
      "shareBtn": "শেয়ার",
      "fullscreenTitle": "দ্রুত স্ক্যানের জন্য বড় কিউআর কোড",
      "fullscreenHint": "উজ্জ্বল সাদা পটভূমিতে পরিষ্কার কালো কোড—মোবাইল ক্যামেরা ১৫–২০ সেমি দূরে ধরে রাখুন।",
      "closeBtn": "বন্ধ করুন"
    },
    "pwaInstall": {
      "buttonLabel": "অ্যাপ ইনস্টল করুন",
      "buttonDirectLabel": "এখনই ইনস্টল করুন (অ্যান্ড্রয়েড অ্যাপ)",
      "installedLabel": "অ্যাপ ইনস্টল সম্পন্ন হয়েছে!",
      "bannerTitle": "মোবাইলের হোম স্ক্রিনে কৃষি মিত্র অ্যাপ ইনস্টল করুন",
      "bannerSubtitle": "হোম স্ক্রিন আইকন থেকে সরাসরি খুলবে এবং ইন্টারনেট ছাড়াও চলবে",
      "modalTitle": "অ্যান্ড্রয়েড ফোন বা কম্পিউটারে অ্যাপ ইনস্টল করুন",
      "modalSubtitle": "হোম স্ক্রিনে ইনস্টল করলে সাধারণ অ্যান্ড্রয়েড অ্যাপের মতোই আইকন তৈরি হবে, পূর্ণ স্ক্রিনে চলবে এবং ইন্টারনেট ছাড়াও কাজ করবে।",
      "directInstallNow": "এক ক্লিকে অ্যাপ ইনস্টল করুন",
      "iframeNotice": "আপনি প্রিভিউ ফ্রেমের ভেতর থাকায় সরাসরি অ্যান্ড্রয়েড ইনস্টল পপ-আপ আসছে না। নিচের বোতামে চাপ দিয়ে পূর্ণ ট্যাবে খুললেই সাথে সাথে ১-ক্লিক ইনস্টল চালু হবে।",
      "openStandaloneTab": "পূর্ণ ব্রাউজার ট্যাবে খুলে ইনস্টল করুন",
      "inAppBrowserNotice": "আপনি Facebook, Messenger বা WhatsApp-এর ভেতরের ব্রাউজারে আছেন—এই ব্রাউজার অ্যাপ ইনস্টল করতে দেয় না। নিচের বোতামে চাপ দিয়ে Google Chrome-এ খুলুন।",
      "openInChromeBtn": "Google Chrome-এ খুলে ইনস্টল করুন",
      "androidTitle": "Android ফোন (Chrome / Edge)",
      "androidSteps": [
        "উপরের ডানদিকের ৩টি ডট (⋮) মেনুতে চাপ দিন।",
        "\"Install app\" অথবা \"Add to Home screen\" লেখাটিতে চাপ দিন।",
        "\"Install\" নিশ্চিত করলেই ফোনের অ্যাপ তালিকা ও হোম স্ক্রিনে কৃষি মিত্র যুক্ত হবে।"
      ],
      "iosTitle": "iPhone / iPad (Safari)",
      "iosSteps": [
        "Safari ব্রাউজারের নিচে Share (বক্স ও তীর) বোতামে চাপ দিন।",
        "নিচে স্ক্রল করে \"Add to Home Screen\" নির্বাচন করুন।",
        "উপরের ডানদিকে \"Add\" চাপুন।"
      ],
      "desktopTitle": "কম্পিউটার (Chrome / Edge)",
      "desktopSteps": [
        "অ্যাড্রেস বারের ডানদিকে থাকা Install (⊕ বা মনিটর-তীর) আইকনে ক্লিক করুন।",
        "\"Install\" নিশ্চিত করলেই ডেস্কটপ অ্যাপ হিসেবে চালু হবে।"
      ],
      "phoneShareTitle": "অন্য ফোনে পাঠাতে বা Chrome-এ খুলতে",
      "phoneShareDesc": "ফোনের Google Chrome বা Safari ব্রাউজারে সরাসরি নিচের লিংকটি খুললে অ্যান্ড্রয়েড অ্যাপ হিসেবে ইনস্টল করা যাবে।",
      "copyLinkBtn": "অ্যাপ লিংক কপি করুন",
      "copiedMsg": "লিংক কপি হয়েছে!",
      "shareLinkBtn": "ফোনে শেয়ার করুন",
      "offlineReadyNote": "সার্ভিস ওয়ার্কার ও অফলাইন অ্যাপ সিস্টেম সক্রিয় আছে।",
      "closeBtn": "বন্ধ করুন"
    },
    "calendar": {
      "sectionTitle": "কখন ফসল লাগাবেন ও কবে তুলবেন",
      "sectionSubtitle": "মাস নির্বাচন করে দেখুন কোন ফসল লাগানোর সময় এখন, আর রোপণের তারিখ বসিয়ে জেনে নিন ফসল কবে উঠবে।",
      "advisorMonthLabel": "মাস নির্বাচন করুন",
      "plantNowTitle": "এই মাসে লাগানোর উপযুক্ত ফসল",
      "harvestNowTitle": "এই মাসে ফসল তোলার সময়",
      "noPlantMonth": "এই মাসে প্রধান রোপণ কম; চলমান ফসলের যত্ন নিন।",
      "noHarvestMonth": "এই মাসে প্রধান ফসল কাটার সময় নয়।",
      "plannerTitle": "ফসল কবে উঠবে? (তারিখ হিসাব)",
      "selectCropLabel": "১. ফসল বেছে নিন",
      "plantingDateLabel": "২. কবে লাগিয়েছেন / লাগাবেন",
      "expectedHarvestLabel": "সম্ভাব্য ফসল তোলার তারিখ",
      "durationLabel": "সময় লাগবে",
      "soilLabel": "উপযুক্ত মাটি",
      "spacingLabel": "দূরত্ব ও বীজের পরিমাণ",
      "currentProgressLabel": "এখন পর্যন্ত",
      "daysElapsedSuffix": "দিন পার হয়েছে",
      "readyToHarvestMsg": "ফসল তোলার সময় হয়ে গেছে!",
      "notPlantedYetMsg": "আগামী রোপণের তারিখ ঠিক করা আছে।",
      "milestonesTitle": "কবে কী করবেন (সার ও পরিচর্যা সময়)",
      "listenPlanBtn": "সময়সূচি শুনুন",
      "matrixTitle": "পুরো ১২ মাসের ফসল তালিকা",
      "showMatrixBtn": "পুরো ১২ মাসের চার্ট দেখুন",
      "hideMatrixBtn": "চার্ট বন্ধ করুন",
      "matrixPlantLegend": "লাগানোর সময়",
      "matrixHarvestLegend": "তোলার সময়",
      "cropCol": "ফসল ও জাত",
      "plantingCol": "লাগানোর সময়",
      "harvestCol": "তোলার সময়"
    }
  },
  "hi": {
    "brandName": "कृषि मित्र",
    "heroEyebrow": "आपका आसान कृषि सहायक",
    "heroTitle": "अस्सलामु अलैकुम! आज का मौसम और फसल समाधान",
    "heroSubtitle": "मौसम, पत्ती रोग जांच, बुवाई-कटाई का सही समय और मंडी भाव—सब कुछ सरल भाषा में देखें और सुनें।",
    "heroPrimaryCta": "फोटो से रोग जांचें",
    "heroSecondaryCta": "आज की जानकारी सुनें",
    "nav": {
      "home": "होम",
      "weather": "मौसम",
      "calendar": "फसल समय",
      "scanner": "रोग स्कैन",
      "tips": "फसल टिप्स",
      "market": "मंडी भाव",
      "feedback": "संपर्क"
    },
    "home": {
      "greeting": "अस्सलामु अलैकुम",
      "subGreeting": "आपके खेत के लिए जरूरी सारी जानकारी एक जगह",
      "menuHeading": "आप क्या देखना चाहते हैं? नीचे चुनें",
      "menuSubheading": "किसी भी विकल्प पर टैप करें और आसानी से पूरी जानकारी पाएं।",
      "backToHome": "मुख्य पेज पर लौटें",
      "openFeature": "देखें",
      "todayAtGlance": "आज का मौसम",
      "rainChanceLabel": "बारिश की संभावना",
      "airQualityLabel": "हवा की गुणवत्ता",
      "scanTitle": "पत्ती से रोग पहचान",
      "scanDesc": "पत्ती की फोटो दें—रोग और दवा तुरंत जानें",
      "weatherTitle": "मौसम व बारिश अलर्ट",
      "weatherDesc": "आज व 5 दिन का तापमान, बारिश और चेतावनी",
      "calendarTitle": "बुवाई व कटाई का समय",
      "calendarDesc": "किस महीने कौन सी फसल लगाएं और कब काटें",
      "marketTitle": "आज के मंडी भाव",
      "marketDesc": "धान, आलू, प्याज और सब्जियों का ताजा भाव",
      "tipsTitle": "खेती और खाद सलाह",
      "tipsDesc": "खाद, बीज और सिंचाई के आसान चरण",
      "feedbackTitle": "सवाल और संपर्क",
      "feedbackDesc": "अपनी फसल की समस्या लिखकर भेजें"
    },
    "status": {
      "online": "ऑनलाइन",
      "offline": "ऑफलाइन मोड",
      "offlineBanner": "इंटरनेट उपलब्ध नहीं है — फोन में सुरक्षित जानकारी दिखाई जा रही है।",
      "offlineDbButton": "फोन में जमा डेटा",
      "languageLabel": "भाषा",
      "listenLabel": "सुनें",
      "stopLabel": "रोकें",
      "syncNow": "अपडेट करें",
      "syncing": "अपडेट हो रहा है...",
      "lastUpdated": "समय",
      "cachedOffline": "ऑफलाइन सुरक्षित"
    },
    "weather": {
      "sectionTitle": "जीपीएस लोकेशन और मौसम अलर्ट",
      "sectionSubtitle": "आपके खेत की लोकेशन के अनुसार लाइव मौसम, 5 दिन का पूर्वानुमान और पुश नोटिफिकेशन चेतावनी।",
      "detectGps": "जीपीएस से लोकेशन खोजें",
      "detectingGps": "लोकेशन खोजी जा रही है...",
      "selectDistrict": "या जिला चुनें",
      "humidity": "नमी",
      "wind": "हवा की गति",
      "rain": "वर्षा",
      "uv": "धूप (UV)",
      "aqi": "वायु गुणवत्ता (AQI)",
      "pm25Label": "PM2.5",
      "forecastTitle": "अगले 5 दिनों का कृषि व वर्षा पूर्वानुमान",
      "alertsTitle": "आपदा और फसल मौसम चेतावनी",
      "noAlerts": "अभी कोई गंभीर मौसम खतरा नहीं है। सामान्य देखभाल जारी रखें।",
      "enablePush": "नोटिफिकेशन चालू करें",
      "disablePush": "नोटिफिकेशन बंद करें",
      "pushEnabled": "पुश नोटिफिकेशन चालू हो गया है",
      "pushInAppActive": "ऐप और डिवाइस अलर्ट सक्रिय हैं",
      "pushBlocked": "ब्राउज़र पॉप-अप बंद होने के कारण इन-ऐप पुश अलर्ट सक्रिय रखा गया है",
      "testPush": "टेस्ट अलर्ट भेजें",
      "listenWeather": "मौसम जानकारी सुनें",
      "gpsCoords": "अक्षांश व देशांतर",
      "gpsError": "जीपीएस नहीं मिला; नजदीकी जिले का मौसम दिखाया जा रहा है।",
      "recentAlertsLog": "हाल ही में भेजे गए अलर्ट",
      "dismissAlert": "बंद करें"
    },
    "scanner": {
      "sectionTitle": "कैमरे से सटीक फसल रोग जांच व विस्तृत सलाह",
      "sectionSubtitle": "प्रभावित पत्ती या पौधे की साफ फोटो लें—रोग का कारण, दवा की सही मात्रा, और जैविक-रासायनिक उपाय विस्तार से जानें।",
      "photoQualityTip": "सुझाव: रोशनी में प्रभावित हिस्से की पास से स्पष्ट फोटो लें",
      "startCamera": "कैमरा चालू करें",
      "stopCamera": "कैमरा बंद करें",
      "capturePhoto": "फोटो खींचें",
      "uploadPhoto": "फोटो अपलोड करें",
      "trySampleLeaf": "नमूना धान पत्ती जांचें",
      "cropHintLabel": "फसल का नाम (वैकल्पिक)",
      "cropHintPlaceholder": "जैसे: धान, आलू, टमाटर, बैंगन",
      "affectedPartLabel": "पौधे का प्रभावित भाग",
      "affectedParts": {
        "leaf": "पत्ती",
        "stem": "तना / डंठल",
        "fruit": "फल / बाली",
        "root": "जड़ / तना निचला भाग"
      },
      "growthStageLabel": "फसल की अवस्था",
      "growthStages": {
        "seedling": "पौध / नर्सरी",
        "vegetative": "बढ़वार अवस्था",
        "flowering": "फूल अवस्था",
        "mature": "फल / पकने की अवस्था"
      },
      "symptomTagsLabel": "अतिरिक्त लक्षण चुनें (अधिक सटीक जांच के लिए)",
      "symptomTags": [
        "पीले धब्बे",
        "भूरे या काले धब्बे",
        "पत्ती मुड़ना",
        "सफेद पाउडर",
        "कीड़े या छेद",
        "जड़ सड़न/बदबू"
      ],
      "analyzeButton": "विस्तृत रोग जांच शुरू करें",
      "analyzing": "गहराई से पत्ती की जांच हो रही है...",
      "offlineScanNotice": "नई फोटो की एआई जांच के लिए इंटरनेट चाहिए; पर फोटो अभी ऑफलाइन कतार में सेव कर सकते हैं और पुरानी रिपोर्ट कभी भी देख सकते हैं।",
      "retryScanBtn": "फिर से स्कैन करें",
      "retakePhotoBtn": "नई फोटो लें",
      "saveOfflineQueueBtn": "ऑफलाइन कतार में सहेजें",
      "queuedScansTitle": "ऑफलाइन कतार में सेव फोटो",
      "queuedScanNowBtn": "अभी स्कैन करें",
      "queuedSavedMsg": "फोटो ऑफलाइन कतार में सहेजी गई—इंटरनेट आने पर तुरंत स्कैन करें।",
      "deleteDiagnosisBtn": "रिपोर्ट हटाएं",
      "cameraInitializing": "कैमरा तैयार हो रहा है...",
      "urgentActionTitle": "आज का जरूरी कदम (अगले 24 घंटे)",
      "rootCauseTitle": "रोग का कारण व मौसम का प्रभाव",
      "symptomsTitle": "दिखने वाले लक्षण",
      "organicTitle": "जैविक व घरेलू उपचार",
      "chemicalTitle": "संतुलित दवा प्रबंधन",
      "dosageGuideTitle": "दवा की मात्रा और छिड़काव का सही तरीका",
      "harvestWaitLabel": "छिड़काव के बाद कटाई प्रतीक्षा",
      "lookalikeTitle": "मिलते-जुलते रोग से अंतर",
      "preventionTitle": "भविष्य में बचाव और खेत प्रबंधन",
      "listenDiagnosis": "विस्तृत सलाह सुनें",
      "savedHistoryTitle": "ऑफलाइन सुरक्षित जांच इतिहास",
      "noSavedHistory": "अभी कोई फसल जांच सुरक्षित नहीं है।",
      "confidenceLabel": "सटीकता",
      "diseaseStageLabel": "संक्रमण स्तर",
      "spreadRiskLabel": "फैलाव जोखिम",
      "pathogenTypes": {
        "fungal": "फफूंद जनित रोग",
        "bacterial": "जीवाणु जनित रोग",
        "viral": "विषाणु (वायरस) रोग",
        "pest": "कीट प्रकोप",
        "deficiency": "पोषक तत्व की कमी",
        "healthy": "स्वस्थ फसल",
        "unclear": "स्पष्ट फोटो आवश्यक"
      },
      "spreadRiskLabels": {
        "low": "कम जोखिम",
        "moderate": "मध्यम जोखिम",
        "high": "तेजी से फैल सकता है"
      },
      "severityLabels": {
        "healthy": "स्वस्थ फसल",
        "low": "प्रारंभिक स्तर",
        "moderate": "मध्यम जोखिम",
        "high": "तत्काल सावधानी"
      }
    },
    "tips": {
      "sectionTitle": "फसल देखभाल और मौसमी टिप्स",
      "sectionSubtitle": "सभी टिप्स आपके फोन के ऑफलाइन डेटाबेस में सुरक्षित हैं—खेत में बिना नेटवर्क के पढ़ें और सुनें।",
      "searchPlaceholder": "फसल या समस्या खोजें...",
      "allCrops": "सभी फसलें",
      "allSeasons": "सभी मौसम",
      "bookmarkedOnly": "सहेजे गए टिप्स",
      "seasons": {
        "all": "सारा साल",
        "kharif": "खरीफ / वर्षा",
        "rabi": "रबी / सर्दी",
        "zaid": "जायद / गर्मी"
      },
      "stepsTitle": "देखभाल के चरण",
      "fertilizerTitle": "खाद और सिंचाई सलाह",
      "listenTip": "टिप सुनें",
      "bookmarkAdd": "सहेजें",
      "bookmarkSaved": "सहेजा गया",
      "noTipsMatch": "कोई टिप नहीं मिली। दूसरा शब्द आज़माएं।"
    },
    "market": {
      "sectionTitle": "नियमित लाइव मंडी फसल भाव अपडेट",
      "sectionSubtitle": "क्षेत्रीय हाट और मंडी में प्रति किलो व प्रति मन (40 किलो) ताजा भाव। एक क्लिक में आज के लाइव भाव लाएं या स्थानीय भाव अपडेट करें।",
      "searchPlaceholder": "फसल या मंडी का नाम लिखें...",
      "allCategories": "सभी उत्पाद",
      "categories": {
        "all": "सभी",
        "grain": "अनाज व दालें",
        "vegetable": "सब्जियां",
        "spice": "मसाले",
        "fruit": "फल"
      },
      "perKg": "प्रति किलो",
      "perMaund": "प्रति मन (40 किग्रा)",
      "trendUp": "भाव बढ़ा",
      "trendDown": "भाव घटा",
      "trendStable": "स्थिर",
      "listenMarket": "मंडी भाव सुनें",
      "refreshLiveBtn": "आज का लाइव भाव अपडेट",
      "refreshingLive": "लाइव भाव लाया जा रहा है...",
      "lastMarketSyncLabel": "अंतिम मंडी अपडेट",
      "autoSyncNote": "नियमित स्वचालित भाव सिंक सक्रिय है",
      "verifiedLiveBadge": "लाइव सत्यापित",
      "farmerReportBadge": "स्थानीय रिपोर्ट",
      "sourcesTitle": "स्रोत",
      "quickUpdateBtn": "भाव बदलें",
      "editingPriceTitle": "इस फसल का आज का भाव अपडेट करें",
      "addNewPriceTitle": "नया मंडी भाव जोड़ें",
      "reportPriceBtn": "नया भाव जोड़ें",
      "closeForm": "फॉर्म बंद करें",
      "cropNameLabel": "फसल का नाम",
      "marketNameLabel": "मंडी / हाट का नाम",
      "priceKgLabel": "भाव (प्रति किलो)",
      "currencyLabel": "मुद्रा",
      "trendLabel": "बाजार स्थिति",
      "submitPrice": "भाव अपडेट सहेजें",
      "pendingSyncTag": "सिंक की प्रतीक्षा (ऑफलाइन)",
      "syncedTag": "सिंक पूर्ण",
      "updateSuccessMsg": "आज का मंडी भाव सफलतापूर्वक अपडेट हो गया।",
      "refreshSuccessMsg": "आज के ताजा मंडी भाव अपडेट कर दिए गए हैं।",
      "refreshErrorMsg": "अभी लाइव मंडी भाव नहीं मिल सका; डिवाइस में सेव नवीनतम भाव दिखाए जा रहे हैं।"
    },
    "feedback": {
      "sectionTitle": "किसान संपर्क और सुझाव फॉर्म",
      "sectionSubtitle": "फसल से जुड़ा सवाल या समस्या भेजें। ऑफलाइन रहने पर डेटा सेव रहता है और इंटरनेट आते ही सिंक हो जाता है।",
      "nameLabel": "किसान का नाम",
      "phoneLabel": "मोबाइल नंबर",
      "villageLabel": "गांव / जिला",
      "cropLabel": "फसल का नाम",
      "categoryLabel": "विषय",
      "messageLabel": "अपनी समस्या या सुझाव लिखें",
      "attachGpsLabel": "वर्तमान जीपीएस लोकेशन जोड़ें",
      "submitBtn": "संदेश भेजें",
      "submitting": "सहेजा जा रहा है...",
      "savedOfflineMsg": "ऑफलाइन डेटाबेस में सुरक्षित। ऑनलाइन होते ही अपने आप भेज दिया जाएगा।",
      "sentOnlineMsg": "आपका संदेश सफलतापूर्वक कृषि मित्र डेस्क पर पहुंच गया है।",
      "historyTitle": "भेजे गए संदेश",
      "emptyHistory": "अभी तक कोई संदेश नहीं भेजा गया है।",
      "categories": {
        "disease": "फसल रोग व कीट",
        "weather": "मौसम व सिंचाई",
        "market": "मंडी भाव",
        "suggestion": "ऐप सुझाव"
      }
    },
    "audio": {
      "playerTitle": "कृषि ऑडियो प्लेयर",
      "playingNow": "चल रहा है",
      "paused": "रुका हुआ",
      "loadingVoice": "आवाज़ तैयार हो रही है...",
      "aiVoiceBadge": "प्राकृतिक आवाज़",
      "offlineVoiceBadge": "ऑफलाइन आवाज़",
      "speedLabel": "गति",
      "emptyState": "जहां भी \"सुनें\" बटन दिखे, दबाने पर यहां साफ भाषा में सुन सकते हैं।"
    },
    "offlineDrawer": {
      "title": "ऑफलाइन डेटा प्रबंधन व सिंक केंद्र",
      "subtitle": "बिना इंटरनेट के भी सारा कृषि डेटा, फोटो कतार और मंडी भाव 3 आसान चरणों में प्रबंधित करें।",
      "storageOverviewTitle": "1. डिवाइस स्टोरेज और डेटा स्थिति",
      "storageUsedLabel": "उपयोग किया गया स्थान",
      "tipsCount": "फसल देखभाल टिप्स",
      "marketCount": "मंडी भाव रिकॉर्ड",
      "diagnosesCount": "रोग जांच रिपोर्ट",
      "pendingScansCount": "प्रतीक्षारत ऑफलाइन स्कैन",
      "pendingPricesCount": "सिंक बाकी मंडी भाव",
      "pendingCount": "कुल सिंक शेष",
      "weatherCached": "मौसम ऑफलाइन कैश",
      "audioCached": "सहेजे गए ऑडियो क्लिप",
      "lastSyncLabel": "अंतिम सिंक",
      "neverSynced": "अभी सिंक नहीं हुआ",
      "yes": "तैयार",
      "no": "नहीं",
      "syncAndQueueTitle": "2. त्वरित सिंक और ऑफलाइन कतार",
      "processQueueBtn": "सेव फोटो स्कैन और डेटा सिंक करें",
      "dataBackupTitle": "3. बैकअप, पुनर्स्थापना और सफाई",
      "exportJson": "बैकअप डाउनलोड करें (JSON)",
      "importJsonBtn": "बैकअप फाइल से वापस लाएं",
      "importSuccessMsg": "बैकअप डेटा सफलतापूर्वक पुनर्स्थापित हो गया।",
      "importErrorMsg": "कृपया मान्य JSON बैकअप फाइल चुनें।",
      "clearAudioBtn": "ऑडियो कैश खाली करें",
      "clearAudioDoneMsg": "सहेजे गए ऑडियो क्लिप साफ किए गए।",
      "clearWeatherBtn": "मौसम कैश साफ करें",
      "clearWeatherDoneMsg": "मौसम कैश साफ किया गया।",
      "installSectionTitle": "ऐप इंस्टॉलेशन",
      "installApp": "फोन में ऐप इंस्टॉल करें",
      "iosInstallTitle": "iPhone / iPad में इंस्टॉल",
      "iosInstallSteps": "Safari में नीचे Share बटन दबाकर \"Add to Home Screen\" चुनें।",
      "close": "बंद करें"
    },
    "greeting": {
      "morning": "सुप्रभात, किसान भाई! अस्सलामु अलैकुम",
      "afternoon": "शुभ दोपहर! अस्सलामु अलैकुम",
      "evening": "शुभ संध्या! अस्सलामु अलैकुम",
      "night": "शुभ रात्रि! अस्सलामु अलैकुम",
      "firstVisitBadge": "पहली बार आने पर स्वागत है",
      "firstVisitMessage": "कृषि मित्र में आपका हार्दिक स्वागत है! आज का मौसम, फसल रोग जांच, बुवाई समय और मंडी भाव एक जगह देखें।",
      "returningMessage": "कृषि मित्र में फिर से स्वागत है! आपके खेत के लिए आज का मौसम और ताज़ा कृषि सलाह तैयार है।",
      "visitOrdinalPrefix": "आपकी",
      "visitOrdinalSuffix": "वीं विज़िट",
      "listenGreeting": "स्वागत संदेश सुनें",
      "dismissLabel": "स्वागत संदेश बंद करें",
      "regionReadyPrefix": "क्षेत्र"
    },
    "visitors": {
      "sectionTitle": "रियल-टाइम दर्शक और व्यू आंकड़े",
      "sectionSubtitle": "हर पेज विज़िट (कुल व्यू) और अलग-अलग उपयोगकर्ता (यूनिक विज़िटर) का हिसाब लाइव अलग दिखाया जाता है।",
      "totalVisits": "कुल व्यू",
      "totalVisitsHint": "सभी पेज विज़िट की संख्या",
      "todayVisits": "आज के व्यू",
      "uniqueVisitors": "यूनिक विज़िटर",
      "uniqueVisitorsHint": "अलग-अलग डिवाइस / किसान",
      "todayUnique": "आज के यूनिक",
      "returningVisits": "दोबारा विज़िट",
      "avgViewsLabel": "औसत व्यू/दर्शक",
      "activeNow": "अभी लाइव सक्रिय",
      "liveRealtimeLabel": "रियल-टाइम लाइव",
      "offlineCacheLabel": "कैश डेटा",
      "ratioUniqueLabel": "नए यूनिक",
      "ratioReturnLabel": "दोबारा व्यू",
      "refreshCount": "अपडेट",
      "lastUpdated": "अंतिम विजिट"
    },
    "qr": {
      "sectionTitle": "त्वरित स्कैन QR कोड",
      "sectionSubtitle": "उच्च कॉन्ट्रास्ट और स्पष्ट क्वाइट-ज़ोन के साथ—किसी भी मोबाइल कैमरे से तुरंत स्कैन करें।",
      "fastScanBadge": "हाई-कॉन्ट्रास्ट · तेज़ स्कैन",
      "shortLinkMode": "सीधा ऐप लिंक",
      "installLinkMode": "ऐप इंस्टॉल लिंक",
      "scanHint": "फोन का कैमरा या Google Lens सामने लाकर सीधे खोलें",
      "zoomBtn": "बड़ा देखें",
      "downloadPngBtn": "QR इमेज सेव",
      "copyUrlBtn": "लिंक कॉपी",
      "copiedMsg": "कॉपी हो गया!",
      "shareBtn": "शेयर",
      "fullscreenTitle": "तेज़ स्कैनिंग के लिए बड़ा QR कोड",
      "fullscreenHint": "साफ़ सफेद पृष्ठभूमि पर उच्च कॉन्ट्रास्ट कोड—कैमरा 15–20 सेमी दूर रखें।",
      "closeBtn": "बंद करें"
    },
    "pwaInstall": {
      "buttonLabel": "ऐप इंस्टॉल करें",
      "buttonDirectLabel": "अभी इंस्टॉल करें (Android ऐप)",
      "installedLabel": "ऐप सफलतापूर्वक इंस्टॉल हो गया!",
      "bannerTitle": "मोबाइल होम स्क्रीन पर कृषि मित्र ऐप इंस्टॉल करें",
      "bannerSubtitle": "होम स्क्रीन आइकन से सीधे खुलेगा और बिना इंटरनेट भी चलेगा",
      "modalTitle": "फोन या कंप्यूटर पर कृषि मित्र इंस्टॉल करें",
      "modalSubtitle": "होम स्क्रीन पर इंस्टॉल करने से ऐप तेज़ी से खुलेगा, फुल स्क्रीन में चलेगा और बिना इंटरनेट ऑफलाइन काम करेगा।",
      "directInstallNow": "एक क्लिक में इंस्टॉल करें",
      "iframeNotice": "आप अभी प्रीव्यू फ्रेम के अंदर हैं—ब्राउज़र सुरक्षा के कारण फ्रेम के अंदर सीधा इंस्टॉल प्रॉम्प्ट नहीं खुलता। नीचे दिए बटन से नए टैब में खोलें, वहां 1-क्लिक इंस्टॉल तुरंत मिल जाएगा।",
      "openStandaloneTab": "नए टैब में खोलकर इंस्टॉल करें",
      "inAppBrowserNotice": "आप Facebook, Messenger या WhatsApp के अंदरूनी ब्राउज़र में हैं—यहां ऐप इंस्टॉल विकल्प छिपा रहता है। नीचे दबाकर Google Chrome में खोलें।",
      "openInChromeBtn": "Google Chrome में खोलकर इंस्टॉल करें",
      "androidTitle": "Android फोन (Chrome / Edge)",
      "androidSteps": [
        "ऊपर दाईं ओर 3 डॉट (⋮) मेनू पर टैप करें।",
        "\"Install app\" या \"Add to Home screen\" चुनें।",
        "\"Install\" दबाएं और होम स्क्रीन से ऐप चलाएं।"
      ],
      "iosTitle": "iPhone / iPad (Safari)",
      "iosSteps": [
        "Safari में नीचे Share आइकन पर टैप करें।",
        "नीचे स्क्रॉल करके \"Add to Home Screen\" चुनें।",
        "ऊपर दाईं ओर \"Add\" पर टैप करें।"
      ],
      "desktopTitle": "कंप्यूटर (Chrome / Edge)",
      "desktopSteps": [
        "एड्रेस बार के दाईं ओर Install आइकन पर क्लिक करें।",
        "पुष्टि करने के लिए \"Install\" चुनें।"
      ],
      "phoneShareTitle": "फोन पर लिंक भेजें या खोलें",
      "phoneShareDesc": "फोन के Chrome या Safari ब्राउज़र में यह लिंक सीधे खोलने पर इंस्टॉल विकल्प तुरंत दिखता है।",
      "copyLinkBtn": "ऐप लिंक कॉपी करें",
      "copiedMsg": "लिंक कॉपी हो गया!",
      "shareLinkBtn": "फोन पर शेयर करें",
      "offlineReadyNote": "सर्विस वर्कर और ऑफलाइन कैश सक्रिय है।",
      "closeBtn": "बंद करें"
    },
    "calendar": {
      "sectionTitle": "स्मार्ट फसल बुवाई व कटाई कैलेंडर",
      "sectionSubtitle": "कृषि अनुसंधान दिशानिर्देशों के अनुसार जानें कि किस महीने कौन-सी फसल लगाएं, कब कटेगी और अपनी बुवाई तारीख से पूरा शेड्यूल निकालें।",
      "advisorMonthLabel": "महीना चुनें",
      "plantNowTitle": "इस महीने बुवाई / रोपाई की मुख्य फसलें",
      "harvestNowTitle": "इस महीने कटाई के लिए तैयार फसलें",
      "noPlantMonth": "इस महीने मुख्य बुवाई कम है; खड़ी फसल की देखभाल करें।",
      "noHarvestMonth": "इस महीने प्रमुख कटाई निर्धारित नहीं है।",
      "plannerTitle": "बुवाई से कटाई तिथि कैलकुलेटर",
      "selectCropLabel": "फसल चुनें",
      "plantingDateLabel": "बुवाई / रोपाई की तारीख",
      "expectedHarvestLabel": "अनुमानित कटाई अवधि",
      "durationLabel": "फसल अवधि",
      "soilLabel": "उपयुक्त मिट्टी",
      "spacingLabel": "दूरी व बीज दर",
      "currentProgressLabel": "वर्तमान प्रगति",
      "daysElapsedSuffix": "दिन पूरे हुए",
      "readyToHarvestMsg": "फसल कटाई के चरण में पहुंच चुकी है!",
      "notPlantedYetMsg": "आगामी बुवाई तारीख निर्धारित है।",
      "milestonesTitle": "चरणबद्ध देखभाल व खाद समय-सारणी",
      "listenPlanBtn": "शेड्यूल ऑडियो में सुनें",
      "matrixTitle": "12 महीनों का वार्षिक फसल कैलेंडर",
      "showMatrixBtn": "पूरा 12 महीने का चार्ट देखें",
      "hideMatrixBtn": "चार्ट बंद करें",
      "matrixPlantLegend": "बुवाई / रोपाई समय",
      "matrixHarvestLegend": "कटाई समय",
      "cropCol": "फसल व किस्म",
      "plantingCol": "बुवाई समय",
      "harvestCol": "कटाई समय"
    }
  },
  "en": {
    "brandName": "Krishi Mitra",
    "heroEyebrow": "Simple Smart Farming Assistant",
    "heroTitle": "Assalamu Alaikum! Daily Weather & Crop Care",
    "heroSubtitle": "Check live weather, scan leaf diseases, see when to plant & harvest, and check local mandi prices—simple and available offline.",
    "heroPrimaryCta": "Scan Crop Leaf",
    "heroSecondaryCta": "Listen to Daily Summary",
    "nav": {
      "home": "Home",
      "weather": "Weather",
      "calendar": "Calendar",
      "scanner": "Scan Leaf",
      "tips": "Crop Tips",
      "market": "Market",
      "feedback": "Help"
    },
    "home": {
      "greeting": "Assalamu Alaikum",
      "subGreeting": "Everything you need for your farm in one simple place",
      "menuHeading": "What would you like to check?",
      "menuSubheading": "Tap any option below for clear, step-by-step farming help.",
      "backToHome": "Back to Home",
      "openFeature": "Open",
      "todayAtGlance": "Today’s Weather",
      "rainChanceLabel": "Rain chance",
      "airQualityLabel": "Air Quality",
      "scanTitle": "Scan Leaf Disease",
      "scanDesc": "Take or upload a leaf photo for instant cure",
      "weatherTitle": "Weather & Alerts",
      "weatherDesc": "Live temperature, 5-day rain forecast & storm alerts",
      "calendarTitle": "Planting & Harvest",
      "calendarDesc": "Check what to plant now and calculate harvest dates",
      "marketTitle": "Market Prices",
      "marketDesc": "Today’s crop prices per kg and per maund",
      "tipsTitle": "Farming & Fertilizer",
      "tipsDesc": "Easy fertilizer, seed, and irrigation guides",
      "feedbackTitle": "Ask & Contact",
      "feedbackDesc": "Send your crop questions or field notes"
    },
    "status": {
      "online": "Online",
      "offline": "Offline Mode",
      "offlineBanner": "No internet — showing information saved on your phone.",
      "offlineDbButton": "Saved on Phone",
      "languageLabel": "Language",
      "listenLabel": "Listen",
      "stopLabel": "Stop",
      "syncNow": "Sync Now",
      "syncing": "Syncing...",
      "lastUpdated": "Updated",
      "cachedOffline": "Saved Offline"
    },
    "weather": {
      "sectionTitle": "GPS Location & Weather Push Alerts",
      "sectionSubtitle": "Hyper-local field weather using device GPS, 5-day agronomic forecast, and instant push notifications.",
      "detectGps": "Use Current GPS",
      "detectingGps": "Locating GPS...",
      "selectDistrict": "Or select district",
      "humidity": "Humidity",
      "wind": "Wind Speed",
      "rain": "Rainfall",
      "uv": "UV Index",
      "aqi": "Air Quality (AQI)",
      "pm25Label": "PM2.5",
      "forecastTitle": "5-Day Rain & Field Forecast",
      "alertsTitle": "Disaster & Agricultural Weather Alerts",
      "noAlerts": "No severe weather hazards detected right now. Continue standard crop care.",
      "enablePush": "Enable Notifications",
      "disablePush": "Mute Alerts",
      "pushEnabled": "Push alerts enabled",
      "pushInAppActive": "In-app & device weather alerts active",
      "pushBlocked": "Browser notifications blocked; in-app push alerts remain active",
      "testPush": "Send Test Push Alert",
      "listenWeather": "Listen to Weather",
      "gpsCoords": "Coordinates",
      "gpsError": "GPS unavailable; showing nearest regional weather.",
      "recentAlertsLog": "Recent Delivered Alerts",
      "dismissAlert": "Dismiss"
    },
    "scanner": {
      "sectionTitle": "Precision Crop Disease Scanner & Advisory",
      "sectionSubtitle": "Capture or upload a clear photo of the affected plant part for root-cause analysis, exact spray dosage, organic remedies, and prevention.",
      "photoQualityTip": "Tip: Take a sharp, well-lit close-up of the affected area",
      "startCamera": "Open Camera",
      "stopCamera": "Close Camera",
      "capturePhoto": "Capture Photo",
      "uploadPhoto": "Upload Photo",
      "trySampleLeaf": "Test Sample Rice Leaf",
      "cropHintLabel": "Crop Name (Optional)",
      "cropHintPlaceholder": "e.g. Rice, Potato, Tomato, Brinjal",
      "affectedPartLabel": "Affected Plant Part",
      "affectedParts": {
        "leaf": "Leaf",
        "stem": "Stem / Shoot",
        "fruit": "Fruit / Panicle",
        "root": "Base / Root"
      },
      "growthStageLabel": "Growth Stage",
      "growthStages": {
        "seedling": "Seedling",
        "vegetative": "Vegetative",
        "flowering": "Flowering",
        "mature": "Fruiting / Mature"
      },
      "symptomTagsLabel": "Optional quick symptom tags (improves accuracy)",
      "symptomTags": [
        "Yellow spots",
        "Brown/black lesions",
        "Leaf curling",
        "White powder/mold",
        "Insects or holes",
        "Root rot/odor"
      ],
      "analyzeButton": "Run Detailed Diagnosis",
      "analyzing": "Analyzing plant health in detail...",
      "offlineScanNotice": "Live AI scanning requires internet; you can save field photos into the offline scan queue now and view past reports anytime offline.",
      "retryScanBtn": "Retry Scan",
      "retakePhotoBtn": "Clear Photo",
      "saveOfflineQueueBtn": "Save to Offline Scan Queue",
      "queuedScansTitle": "Queued Offline Field Photos",
      "queuedScanNowBtn": "Scan Now",
      "queuedSavedMsg": "Saved photo to offline queue — ready to analyze when back online.",
      "deleteDiagnosisBtn": "Delete Report",
      "cameraInitializing": "Starting camera...",
      "urgentActionTitle": "Urgent Action Today (Next 24 Hours)",
      "rootCauseTitle": "Root Cause & Weather Impact",
      "symptomsTitle": "Observed Symptoms",
      "organicTitle": "Organic & Cultural Remedies",
      "chemicalTitle": "Targeted Chemical Management",
      "dosageGuideTitle": "Exact Mixing Ratio & Spray Timing",
      "harvestWaitLabel": "Pre-Harvest Waiting Period",
      "lookalikeTitle": "Lookalike Differential Check",
      "preventionTitle": "Preventive Practices & Field Care",
      "listenDiagnosis": "Listen to Full Advisory",
      "savedHistoryTitle": "Offline Saved Diagnoses",
      "noSavedHistory": "No saved crop scans yet.",
      "confidenceLabel": "Confidence",
      "diseaseStageLabel": "Infection Stage",
      "spreadRiskLabel": "Spread Risk",
      "pathogenTypes": {
        "fungal": "Fungal Infection",
        "bacterial": "Bacterial Infection",
        "viral": "Viral Infection",
        "pest": "Pest Damage",
        "deficiency": "Nutrient Deficiency",
        "healthy": "Healthy Crop",
        "unclear": "Clearer Photo Needed"
      },
      "spreadRiskLabels": {
        "low": "Low Spread",
        "moderate": "Moderate Spread",
        "high": "High Contagion Risk"
      },
      "severityLabels": {
        "healthy": "Healthy Crop",
        "low": "Early Stage",
        "moderate": "Moderate Risk",
        "high": "Urgent Action"
      }
    },
    "tips": {
      "sectionTitle": "Seasonal Crop Care Tips",
      "sectionSubtitle": "Stored in your offline database so you can browse, bookmark, and listen in the field without signal.",
      "searchPlaceholder": "Search crop or care topic...",
      "allCrops": "All Crops",
      "allSeasons": "All Seasons",
      "bookmarkedOnly": "Saved Only",
      "seasons": {
        "all": "Year-Round",
        "kharif": "Kharif / Monsoon",
        "rabi": "Rabi / Winter",
        "zaid": "Summer / Zaid"
      },
      "stepsTitle": "Care Steps",
      "fertilizerTitle": "Balanced Fertilizer & Irrigation",
      "listenTip": "Listen to Tip",
      "bookmarkAdd": "Save Tip",
      "bookmarkSaved": "Saved",
      "noTipsMatch": "No crop tips match your filter."
    },
    "market": {
      "sectionTitle": "Regular Live Market Crop Price Updates",
      "sectionSubtitle": "Regional mandi and haat prices per kg and per maund (40 kg). Refresh today's live market rates or update any local crop price directly.",
      "searchPlaceholder": "Search crop or market...",
      "allCategories": "All Produce",
      "categories": {
        "all": "All",
        "grain": "Grains & Pulses",
        "vegetable": "Vegetables",
        "spice": "Spices",
        "fruit": "Fruits"
      },
      "perKg": "Per Kg",
      "perMaund": "Per Maund (40 kg)",
      "trendUp": "Rising",
      "trendDown": "Falling",
      "trendStable": "Steady",
      "listenMarket": "Listen to Prices",
      "refreshLiveBtn": "Refresh Live Prices",
      "refreshingLive": "Fetching live prices...",
      "lastMarketSyncLabel": "Last market update",
      "autoSyncNote": "Regular automatic price sync active",
      "verifiedLiveBadge": "Live Verified",
      "farmerReportBadge": "Local Report",
      "sourcesTitle": "Sources",
      "quickUpdateBtn": "Update",
      "editingPriceTitle": "Update Today's Price for This Crop",
      "addNewPriceTitle": "Add New Crop or Market Price",
      "reportPriceBtn": "Add New Price",
      "closeForm": "Close Form",
      "cropNameLabel": "Crop Name",
      "marketNameLabel": "Market / Haat Name",
      "priceKgLabel": "Price (per Kg)",
      "currencyLabel": "Currency",
      "trendLabel": "Price Trend",
      "submitPrice": "Save Price Update",
      "pendingSyncTag": "Pending Sync (Offline)",
      "syncedTag": "Synced",
      "updateSuccessMsg": "Today's market price updated successfully.",
      "refreshSuccessMsg": "Latest market prices refreshed.",
      "refreshErrorMsg": "Could not reach live market feeds right now; showing latest cached prices."
    },
    "feedback": {
      "sectionTitle": "Farmer Contact & Feedback Form",
      "sectionSubtitle": "Submit crop questions, local issues, or feedback. Entries queue in IndexedDB offline and sync automatically online.",
      "nameLabel": "Farmer Name",
      "phoneLabel": "Phone Number",
      "villageLabel": "Village / District",
      "cropLabel": "Crop Name",
      "categoryLabel": "Inquiry Topic",
      "messageLabel": "Describe your question or feedback",
      "attachGpsLabel": "Attach current GPS coordinates",
      "submitBtn": "Submit Feedback",
      "submitting": "Saving...",
      "savedOfflineMsg": "Saved to offline database. It will sync automatically once online.",
      "sentOnlineMsg": "Your message has been delivered to the Krishi Mitra desk.",
      "historyTitle": "Submitted Messages",
      "emptyHistory": "No feedback submitted yet.",
      "categories": {
        "disease": "Crop Disease & Pests",
        "weather": "Weather & Irrigation",
        "market": "Market Prices",
        "suggestion": "App Suggestion"
      }
    },
    "audio": {
      "playerTitle": "Krishi Audio Player",
      "playingNow": "Playing",
      "paused": "Paused",
      "loadingVoice": "Preparing voice...",
      "aiVoiceBadge": "Natural Voice",
      "offlineVoiceBadge": "Offline Voice",
      "speedLabel": "Speed",
      "emptyState": "Tap any \"Listen\" button across weather, crop tips, market prices, or diagnosis to hear it read aloud."
    },
    "offlineDrawer": {
      "title": "Offline Data Management & Sync Hub",
      "subtitle": "Easily manage stored crop guides, market prices, offline scan queue, backups, and storage space.",
      "storageOverviewTitle": "1. Storage Overview & Quota",
      "storageUsedLabel": "Storage Used",
      "tipsCount": "Cached Crop Tips",
      "marketCount": "Market Price Records",
      "diagnosesCount": "Saved Disease Reports",
      "pendingScansCount": "Queued Offline Scans",
      "pendingPricesCount": "Pending Price Edits",
      "pendingCount": "Total Pending Sync",
      "weatherCached": "Weather Cache",
      "audioCached": "Cached Audio Clips",
      "lastSyncLabel": "Last Synced",
      "neverSynced": "Not synced yet",
      "yes": "Ready",
      "no": "Empty",
      "syncAndQueueTitle": "2. Quick Sync & Offline Queue",
      "processQueueBtn": "Sync Data & Scan Queue",
      "dataBackupTitle": "3. Backup, Restore & Cleanup",
      "exportJson": "Export Backup (JSON)",
      "importJsonBtn": "Restore from Backup",
      "importSuccessMsg": "Offline backup restored cleanly.",
      "importErrorMsg": "Please choose a valid Krishi Mitra JSON backup file.",
      "clearAudioBtn": "Clear Audio Cache",
      "clearAudioDoneMsg": "Audio clip cache cleared to free space.",
      "clearWeatherBtn": "Clear Weather Cache",
      "clearWeatherDoneMsg": "Weather cache cleared.",
      "installSectionTitle": "App Installation",
      "installApp": "Install App on Device",
      "iosInstallTitle": "Install on iPhone / iPad",
      "iosInstallSteps": "Tap the Share button in Safari and select \"Add to Home Screen\".",
      "close": "Close"
    },
    "greeting": {
      "morning": "Good Morning! Assalamu Alaikum",
      "afternoon": "Good Afternoon! Assalamu Alaikum",
      "evening": "Good Evening! Assalamu Alaikum",
      "night": "Good Night! Assalamu Alaikum",
      "firstVisitBadge": "Welcome on Your First Visit",
      "firstVisitMessage": "Warm welcome to Krishi Mitra! Check today's local weather, crop disease scan, planting dates, and live market prices in one place.",
      "returningMessage": "Welcome back to Krishi Mitra! Today's weather forecast and fresh farming guidance are ready for your field.",
      "visitOrdinalPrefix": "Visit #",
      "visitOrdinalSuffix": "",
      "listenGreeting": "Listen to Greeting",
      "dismissLabel": "Dismiss welcome banner",
      "regionReadyPrefix": "Area"
    },
    "visitors": {
      "sectionTitle": "Real-Time Visitor & View Analytics",
      "sectionSubtitle": "Live server-synced telemetry separating total page views from distinct unique visitors.",
      "totalVisits": "Total Views",
      "totalVisitsHint": "All recorded page views",
      "todayVisits": "Today Views",
      "uniqueVisitors": "Unique Visitors",
      "uniqueVisitorsHint": "Distinct devices / farmers",
      "todayUnique": "Today Unique",
      "returningVisits": "Returning Views",
      "avgViewsLabel": "Avg Views / Visitor",
      "activeNow": "Live Active Now",
      "liveRealtimeLabel": "Real-Time Live",
      "offlineCacheLabel": "Cached",
      "ratioUniqueLabel": "Unique Visitors",
      "ratioReturnLabel": "Returning Views",
      "refreshCount": "Refresh",
      "lastUpdated": "Last visit"
    },
    "qr": {
      "sectionTitle": "Fast-Scan QR Code",
      "sectionSubtitle": "High-contrast matte matrix with 4-module quiet zone for instant mobile camera lock.",
      "fastScanBadge": "High Contrast · Fast Scan",
      "shortLinkMode": "Direct App Link",
      "installLinkMode": "Install App Link",
      "scanHint": "Point any phone camera or Google Lens to open immediately",
      "zoomBtn": "Enlarge QR",
      "downloadPngBtn": "Save PNG",
      "copyUrlBtn": "Copy Link",
      "copiedMsg": "Copied!",
      "shareBtn": "Share",
      "fullscreenTitle": "High-Contrast Enlarged QR Code",
      "fullscreenHint": "Pure black modules on matte white with generous quiet zone for instant focus.",
      "closeBtn": "Close"
    },
    "pwaInstall": {
      "buttonLabel": "Install App",
      "buttonDirectLabel": "Install Now (Android App)",
      "installedLabel": "App installed successfully!",
      "bannerTitle": "Install Krishi Mitra on your mobile home screen",
      "bannerSubtitle": "Launches like a native app and keeps crop guides available offline",
      "modalTitle": "Install Krishi Mitra on Your Device",
      "modalSubtitle": "Installing adds Krishi Mitra to your home screen for full-screen Android app speed and reliable offline access in the field.",
      "directInstallNow": "One-Tap Install App Now",
      "iframeNotice": "You are viewing inside an embedded preview frame. Browsers block native install popups inside iframes—open in a dedicated browser tab below for immediate 1-tap install.",
      "openStandaloneTab": "Open in Full Tab to Install",
      "inAppBrowserNotice": "You are viewing inside an in-app browser (Facebook, Messenger, or WhatsApp), which hides app installation. Open in Google Chrome below to install as an Android app.",
      "openInChromeBtn": "Open in Google Chrome to Install",
      "androidTitle": "Android Phone (Chrome / Edge)",
      "androidSteps": [
        "Tap the three-dot (⋮) menu in the top-right corner.",
        "Select \"Install app\" or \"Add to Home screen\".",
        "Tap \"Install\" to add Krishi Mitra to your home screen and app drawer."
      ],
      "iosTitle": "iPhone / iPad (Safari)",
      "iosSteps": [
        "Tap the Share button at the bottom of Safari.",
        "Scroll down and choose \"Add to Home Screen\".",
        "Tap \"Add\" in the top-right corner."
      ],
      "desktopTitle": "Desktop (Chrome / Edge)",
      "desktopSteps": [
        "Click the Install icon in the right side of the browser address bar.",
        "Confirm by clicking \"Install\"."
      ],
      "phoneShareTitle": "Send or Open on Mobile Browser",
      "phoneShareDesc": "Opening this URL directly in mobile Chrome or Safari unlocks native home-screen installation.",
      "copyLinkBtn": "Copy App Link",
      "copiedMsg": "Link copied!",
      "shareLinkBtn": "Share to Phone",
      "offlineReadyNote": "Service Worker & offline app shell are active.",
      "closeBtn": "Close"
    },
    "calendar": {
      "sectionTitle": "Smart Crop Planting & Harvest Calendar",
      "sectionSubtitle": "BARI/BRRI agronomic calendar showing when to sow and harvest major crops, plus a sowing-date calculator for stage-by-stage field tasks.",
      "advisorMonthLabel": "Inspect Month",
      "plantNowTitle": "Recommended to Plant This Month",
      "harvestNowTitle": "Ready for Harvest This Month",
      "noPlantMonth": "Fewer major plantings this month; maintain standing crops.",
      "noHarvestMonth": "No major harvest peaks in this month.",
      "plannerTitle": "Sowing-to-Harvest Date Calculator",
      "selectCropLabel": "Select Crop",
      "plantingDateLabel": "Sowing / Transplant Date",
      "expectedHarvestLabel": "Expected Harvest Window",
      "durationLabel": "Crop Duration",
      "soilLabel": "Recommended Soil",
      "spacingLabel": "Spacing & Seed Rate",
      "currentProgressLabel": "Crop Progress",
      "daysElapsedSuffix": "days elapsed",
      "readyToHarvestMsg": "Crop is at harvest maturity stage!",
      "notPlantedYetMsg": "Upcoming sowing date scheduled.",
      "milestonesTitle": "Stage-by-Stage Care & Fertilizer Schedule",
      "listenPlanBtn": "Listen to Schedule",
      "matrixTitle": "12-Month Bangladesh Crop Calendar",
      "showMatrixBtn": "View 12-Month Chart",
      "hideMatrixBtn": "Hide Chart",
      "matrixPlantLegend": "Planting / Sowing",
      "matrixHarvestLegend": "Harvesting",
      "cropCol": "Crop & Varieties",
      "plantingCol": "Planting Window",
      "harvestCol": "Harvest Window"
    }
  }
};
