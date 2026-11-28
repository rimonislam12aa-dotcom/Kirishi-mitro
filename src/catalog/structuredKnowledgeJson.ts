import { IRRIGATION_CRITICAL_STAGES } from './agroAdvisoryData';
import { CROP_CALENDAR_DATA } from './cropCalendarData';
import { SEED_CROP_TIPS, SEED_MARKET_PRICES } from './seedData';
import {
  AgroCropGroupKey,
  AppLanguage,
  CropTip,
  IrrigationCriticalStage,
  KnowledgeSectionKey,
  KrishiKnowledgeBaseJson,
  MarketPrice,
  StructuredCareTipRecord,
  StructuredCropRecord,
  StructuredGrowthStageRecord,
  StructuredMarketPriceRecord,
  StructuredWeatherAlertRecord,
  WeatherCacheRecord,
} from '../types/agri';

function normalizeCropGroup(calendarId: string): AgroCropGroupKey {
  switch (calendarId) {
    case 'cal-boro-rice':
    case 'cal-aman-rice':
    case 'cal-aus-rice':
    case 'cal-wheat':
    case 'cal-maize':
      return 'grain';
    case 'cal-potato':
    case 'cal-tomato':
      return 'vegetable';
    case 'cal-onion':
    case 'cal-chili':
      return 'spice';
    case 'cal-mustard':
    case 'cal-jute':
    case 'cal-lentil':
      return 'pulse_oil_fiber';
    default:
      return 'grain';
  }
}

function mapTipKeyToCropInfo(cropKey: CropTip['cropKey']): {
  cropId: string;
  category: AgroCropGroupKey;
} {
  switch (cropKey) {
    case 'rice':
      return { cropId: 'cal-boro-rice', category: 'grain' };
    case 'wheat':
      return { cropId: 'cal-wheat', category: 'grain' };
    case 'potato':
      return { cropId: 'cal-potato', category: 'vegetable' };
    case 'tomato':
      return { cropId: 'cal-tomato', category: 'vegetable' };
    case 'onion':
      return { cropId: 'cal-onion', category: 'spice' };
    case 'chili':
      return { cropId: 'cal-chili', category: 'spice' };
    case 'mustard':
      return { cropId: 'cal-mustard', category: 'pulse_oil_fiber' };
    case 'jute':
      return { cropId: 'cal-jute', category: 'pulse_oil_fiber' };
    case 'mango':
      return { cropId: 'cal-mango', category: 'fruit' };
  }
}

function findIrrigationNote(calendarId: string): IrrigationCriticalStage | undefined {
  if (calendarId.includes('rice')) {
    return IRRIGATION_CRITICAL_STAGES.find((s) => s.id === 'irr-rice');
  }
  if (calendarId === 'cal-wheat') {
    return IRRIGATION_CRITICAL_STAGES.find((s) => s.id === 'irr-wheat');
  }
  if (calendarId === 'cal-potato') {
    return IRRIGATION_CRITICAL_STAGES.find((s) => s.id === 'irr-potato');
  }
  if (calendarId === 'cal-tomato' || calendarId === 'cal-chili') {
    return IRRIGATION_CRITICAL_STAGES.find((s) => s.id === 'irr-tomato');
  }
  if (calendarId === 'cal-mustard') {
    return IRRIGATION_CRITICAL_STAGES.find((s) => s.id === 'irr-mustard');
  }
  return undefined;
}

const STANDARD_WEATHER_ALERTS: Array<Omit<StructuredWeatherAlertRecord, 'isActiveNow' | 'triggeredAt'>> = [
  {
    alertId: 'alert-cyclone-squall',
    level: 'danger',
    category: 'storm',
    triggerCondition: {
      bn: 'বাতাস >= ২৮ কি.মি./ঘণ্টা অথবা দমকা >= ৪২ কি.মি./ঘণ্টা অথবা বজ্রঝড়',
      hi: 'हवा >= 28 किमी/घंटा या झोंके >= 42 किमी/घंटा या बिजली तूफान',
      en: 'Wind >= 28 km/h or gusts >= 42 km/h or thunderstorm code >= 95',
    },
    title: {
      bn: 'দুর্যোগ সতর্কতা: কালবৈশাখী / ঘূর্ণিঝড়ো হাওয়া ও বজ্রপাত',
      hi: 'आपदा चेतावनी: आंधी-तूफान व बिजली गिरने का खतरा',
      en: 'Disaster Alert: Severe Squall, Kalboishakhi & Lightning',
    },
    message: {
      bn: 'তীব্র ঝড়ো হাওয়া ও বজ্রপাতের সময় ফসলের জমি ঝুঁকিপূর্ণ থাকে।',
      hi: 'तेज आंधी व बिजली गिरने के समय खेत में काम करना असुरक्षित है।',
      en: 'Severe gusts and lightning threaten standing crops and open-field workers.',
    },
    advice: {
      bn: 'খোলা মাঠে কাজ ও কীটনাশক স্প্রে বন্ধ রাখুন। পাকা ধান দ্রুত কাটুন এবং কলা/সবজি গাছে শক্ত খুঁটি দিন।',
      hi: 'खुले खेत में काम व छिड़काव रोकें। पकी फसल सुरक्षित स्थान पर रखें और पौधों को सहारा दें।',
      en: 'Suspend open-field work and spraying; harvest ripe paddy immediately and reinforce crop stakes.',
    },
    affectedCrops: {
      bn: ['বোরো ধান', 'আমন ধান', 'টমেটো', 'কাঁচা মরিচ', 'ভুট্টা'],
      hi: ['बोरो धान', 'टमाटर', 'मिर्च', 'मक्का'],
      en: ['Boro Rice', 'Aman Rice', 'Tomato', 'Chili', 'Maize'],
    },
  },
  {
    alertId: 'alert-heavy-rain',
    level: 'danger',
    category: 'rain_flood',
    triggerCondition: {
      bn: 'বৃষ্টি >= ৮ মি.মি. অথবা ৪৮ ঘণ্টায় >= ২৫ মি.মি. (সম্ভাব্যতা >= ৮০%)',
      hi: 'बारिश >= 8 मिमी या 48 घंटे में >= 25 मिमी (संभावना >= 80%)',
      en: 'Precipitation >= 8 mm or 48h total >= 25 mm (probability >= 80%)',
    },
    title: {
      bn: 'ভারী বর্ষণ, আকস্মিক বন্যা ও জলাবদ্ধতা সতর্কতা',
      hi: 'भारी बारिश और जलभराव चेतावनी',
      en: 'Heavy Rainfall & Flash-Flood Alert',
    },
    message: {
      bn: 'অতিবৃষ্টিতে নিচু জমি ও হাওরে জলাবদ্ধতা এবং ফসলের শিকড় পচার ঝুঁকি তৈরি হয়।',
      hi: 'अधिक बारिश से खेत में जलभराव व जड़ सड़न का खतरा बढ़ता है।',
      en: 'Heavy downpour increases waterlogging in low fields and root-rot pressure.',
    },
    advice: {
      bn: 'হাওর ও নিচু জমির বাঁধ/আইল পরীক্ষা করুন, সেচ ও সার প্রয়োগ স্থগিত রাখুন এবং পানি নিষ্কাশনের নালা পরিষ্কার রাখুন।',
      hi: 'खेत की मेड़ें मजबूत रखें, खाद व सिंचाई रोकें और जल निकासी नाली साफ रखें।',
      en: 'Inspect low-land bunds, clear drainage channels, pause irrigation/fertilizer, and protect harvested grain.',
    },
    affectedCrops: {
      bn: ['আমন ধান', 'বোরো ধান', 'পাট', 'মসুর ডাল', 'আলু'],
      hi: ['धान', 'जूट', 'मसूर', 'आलू'],
      en: ['Rice', 'Jute', 'Lentil', 'Potato'],
    },
  },
  {
    alertId: 'alert-fungal-blight',
    level: 'warning',
    category: 'disease_humidity',
    triggerCondition: {
      bn: 'আর্দ্রতা >= ৮০% এবং তাপমাত্রা ১৪°–২৮° সেলসিয়াস',
      hi: 'नमी >= 80% और तापमान 14°–28°C',
      en: 'Relative humidity >= 80% at 14°C–28°C ambient temperature',
    },
    title: {
      bn: 'উচ্চ আর্দ্রতা — ছত্রাক ও নাবি ধ্বসা (ব্লাইট) রোগের ঝুঁকি',
      hi: 'अधिक नमी — झुलसा व फफूंद रोग का खतरा',
      en: 'High Humidity — Fungal & Late Blight Risk',
    },
    message: {
      bn: 'উচ্চ আর্দ্রতা ও মাঝারি তাপমাত্রায় আলু-টমেটোর লেট ব্লাইট এবং ধানের ব্লাস্ট দ্রুত ছড়ায়।',
      hi: 'उच्च नमी व मध्यम तापमान में आलू-टमाटर में झुलसा और धान में ब्लास्ट तेजी से फैलता है।',
      en: 'Humid cool weather accelerates late blight in potato/tomato and blast in paddy.',
    },
    advice: {
      bn: 'সকালে গাছের পাতা পরীক্ষা করুন, অতিরিক্ত ইউরিয়া সার দেবেন না এবং প্রতিরোধক ছত্রাকনাশক প্রস্তুত রাখুন।',
      hi: 'सुबह पत्तों की जांच करें, अतिरिक्त यूरिया न डालें और बचाव के लिए फफूंदनाशी तैयार रखें।',
      en: 'Inspect lower leaves in the morning, pause excess urea, and keep preventive fungicides ready.',
    },
    affectedCrops: {
      bn: ['গোল আলু', 'টমেটো', 'বোরো ধান', 'পেঁয়াজ'],
      hi: ['आलू', 'टमाटर', 'धान', 'प्याज'],
      en: ['Potato', 'Tomato', 'Boro Rice', 'Onion'],
    },
  },
  {
    alertId: 'alert-heat-stress',
    level: 'warning',
    category: 'heat_stress',
    triggerCondition: {
      bn: 'দিনের সর্বোচ্চ তাপমাত্রা >= ৩৫° সেলসিয়াস',
      hi: 'दिन का अधिकतम तापमान >= 35°C',
      en: 'Forecast daytime high >= 35°C',
    },
    title: {
      bn: 'তীব্র তাপদাহ ও পরাগায়ন ঝুঁকি — সেচ সতর্কতা',
      hi: 'तेज गर्मी व परागण जोखिम — सिंचाई चेतावनी',
      en: 'Heat & Pollination Stress Advisory',
    },
    message: {
      bn: '৩৫°সে.-এর বেশি তাপে ধান ও গমের পরাগায়ন ব্যাহত হয়ে চিটা হওয়ার আশঙ্কা বাড়ে।',
      hi: '35°C से ऊपर तापमान होने पर धान और गेहूं में दाने खाली रहने की समस्या बढ़ सकती है।',
      en: 'Temperatures above 35°C risk pollen sterility in flowering paddy and wheat.',
    },
    advice: {
      bn: 'ধান/সবজিতে বিকেলের পর হালকা সেচ দিয়ে ২–৩ ইঞ্চি পানি রাখুন এবং গোড়ায় খড় দিয়ে মালচিং করুন।',
      hi: 'शाम को हल्की सिंचाई कर 2–3 इंच नमी रखें और पौधों के पास पुआल से मल्चिंग करें।',
      en: 'Maintain shallow afternoon moisture in flowering paddy and mulch vegetable soil basins.',
    },
    affectedCrops: {
      bn: ['বোরো ধান', 'গম', 'ভুট্টা', 'টমেটো'],
      hi: ['बोरो धान', 'गेहूं', 'मक्का', 'टमाटर'],
      en: ['Boro Rice', 'Wheat', 'Maize', 'Tomato'],
    },
  },
  {
    alertId: 'alert-cold-wave',
    level: 'warning',
    category: 'cold_fog',
    triggerCondition: {
      bn: 'রাতের সর্বনিম্ন তাপমাত্রা <= ১২° সেলসিয়াস',
      hi: 'न्यूनतम तापमान <= 12°C',
      en: 'Minimum forecast temperature <= 12°C',
    },
    title: {
      bn: 'শৈত্যপ্রবাহ ও ঘন কুয়াশা সতর্কতা',
      hi: 'शीतलहर और घने कोहरे की सलाह',
      en: 'Cold Wave & Dense Fog Advisory',
    },
    message: {
      bn: 'তীব্র ঠান্ডায় বোরো বীজতলার চারা হলুদ হয়ে কোল্ড ইনজুরি হতে পারে।',
      hi: 'कड़ाके की ठंड से धान की नर्सरी के पत्ते पीले पड़ सकते हैं।',
      en: 'Cold snaps cause seedling yellowing and stunt early Boro nursery growth.',
    },
    advice: {
      bn: 'বীজতলা রাতে স্বচ্ছ পলিথিন দিয়ে ঢেকে রাখুন (সকাল ১০টায় খুলে দিন) এবং সকালে পানি পরিবর্তন করুন।',
      hi: 'रात में नर्सरी को पारदर्शी पॉलिथीन से ढकें और सुबह ताजा पानी बदलें।',
      en: 'Cover paddy nurseries with clear polythene overnight and refresh standing water in morning.',
    },
    affectedCrops: {
      bn: ['বোরো ধান বীজতলা', 'গোল আলু', 'সরিষা', 'টমেটো'],
      hi: ['बोरो नर्सरी', 'आलू', 'सरसों', 'टमाटर'],
      en: ['Boro Seedbed', 'Potato', 'Mustard', 'Tomato'],
    },
  },
  {
    alertId: 'alert-high-wind',
    level: 'warning',
    category: 'wind_spray',
    triggerCondition: {
      bn: 'বাতাসের গতি ২০–২৭ কি.মি./ঘণ্টা',
      hi: 'हवा की गति 20–27 किमी/घंटा',
      en: 'Sustained wind speed 20–27 km/h',
    },
    title: {
      bn: 'দমকা বাতাস সতর্কতা — বালাইনাশক স্প্রে স্থগিত রাখুন',
      hi: 'तेज हवा चेतावनी — छिड़काव रोकें',
      en: 'High Wind — Delay Foliar Spraying',
    },
    message: {
      bn: 'তীব্র বাতাসে স্প্রে করলে ওষুধ উড়ে যায় এবং আশপাশের জমিতে ক্ষতি হতে পারে।',
      hi: 'तेज हवा में छिड़काव करने से दवा उड़ जाती है और असर कम होता है।',
      en: 'Spraying in brisk winds causes chemical drift and uneven leaf coverage.',
    },
    advice: {
      bn: 'বাতাস না কমা পর্যন্ত স্প্রে বন্ধ রাখুন; সবজি ও কলা গাছে শক্ত খুঁটি দিন।',
      hi: 'हवा शांत होने तक छिड़काव टालें और सब्जियों को सहारा दें।',
      en: 'Postpone spraying until calm hours and reinforce stakes on tall vegetable crops.',
    },
    affectedCrops: {
      bn: ['কাঁচা মরিচ', 'টমেটো', 'আম', 'পাট'],
      hi: ['मिर्च', 'टमाटर', 'आम'],
      en: ['Chili', 'Tomato', 'Mango', 'Jute'],
    },
  },
  {
    alertId: 'alert-poor-aqi',
    level: 'info',
    category: 'air_quality',
    triggerCondition: {
      bn: 'বায়ু মান সূচক (US AQI) >= ১৫১',
      hi: 'वायु गुणवत्ता सूचकांक (US AQI) >= 151',
      en: 'US Air Quality Index (AQI) >= 151',
    },
    title: {
      bn: 'দূষিত বায়ু (AQI) ও ধূলিকণা স্বাস্থ্য সতর্কতা',
      hi: 'खराब वायु गुणवत्ता (AQI) स्वास्थ्य सलाह',
      en: 'Unhealthy Air Quality (AQI) Worker Advisory',
    },
    message: {
      bn: 'বাতাসে অতিরিক্ত ধূলিকণা থাকলে পাতার সালোকসংশ্লেষণ ও মাঠকর্মীর শ্বাসকষ্টের ঝুঁকি বাড়ে।',
      hi: 'हवा में अधिक धूल होने पर खेत में काम करने वाले किसानों को सांस संबंधी समस्या हो सकती है।',
      en: 'Elevated particulates reduce field worker respiratory safety during dry harvests.',
    },
    advice: {
      bn: 'মাড়াই ও স্প্রে করার সময় মাস্ক বা গামছা ব্যবহার করুন এবং গাছের ধুলা পরিষ্কার রাখতে হালকা সেচ দিন।',
      hi: 'कटाई व थ्रेसिंग के समय मास्क या साफ कपड़ा पहनें।',
      en: 'Wear protective masks during threshing or spraying and mist dusty nursery foliage.',
    },
    affectedCrops: {
      bn: ['সকল মাঠ ফসল ও শস্য মাড়াই কর্মী'],
      hi: ['सभी खेत फसलें और किसान'],
      en: ['All field crops & harvest workers'],
    },
  },
];

export const KNOWLEDGE_SECTION_CATEGORIES: KrishiKnowledgeBaseJson['categories'] = [
  {
    key: 'crops',
    label: {
      bn: 'ফসলের তালিকা',
      hi: 'फसलों की सूची',
      en: 'Crops Directory',
    },
    description: {
      bn: 'বোরো-আমন ধান, গম, আলু, ভুট্টা, সরিষা, টমেটো, পেঁয়াজ, পাট, মসুর ও মরিচের জাত, মাটি ও রোপণ তথ্য।',
      hi: 'प्रमुख फसलों की किस्में, बुवाई का समय, मिट्टी का pH और बीज दर की श्रेणीबद्ध जानकारी।',
      en: 'BARI/BRRI crop profiles covering varieties, soil pH, seed rates, and planting windows.',
    },
    itemCount: 0,
  },
  {
    key: 'growthStages',
    label: {
      bn: 'বৃদ্ধির পর্যায়',
      hi: 'विकास के चरण',
      en: 'Growth Stages',
    },
    description: {
      bn: 'বপনের দিন অনুযায়ী চারা, কুশি, ফুল, দানা গঠন ও ফসল সংগ্রহের ধাপ এবং সেচের সংকটকাল।',
      hi: 'बुवाई के दिनों के अनुसार पौध, कल्ले, फूल, दाना भराव और कटाई की क्रमिक अवस्थाएं।',
      en: 'Day-offset agronomic milestones, top-dress timing, and critical irrigation stages.',
    },
    itemCount: 0,
  },
  {
    key: 'careTips',
    label: {
      bn: 'পরিচর্যা টিপস',
      hi: 'देखभाल सुझाव',
      en: 'Care Tips',
    },
    description: {
      bn: 'রোগ প্রতিরোধ, বিঘাপ্রতি সুষম সার ব্যবস্থাপনা ও ধাপে ধাপে মাঠ পরিচর্যা নির্দেশিকা।',
      hi: 'रोग नियंत्रण, प्रति बीघा संतुलित खाद मात्रा और चरणबद्ध फसल देखभाल उपाय।',
      en: 'Disease prevention playbooks, per-Bigha fertilizer dosages, and field best practices.',
    },
    itemCount: 0,
  },
  {
    key: 'marketPrices',
    label: {
      bn: 'বাজার দর',
      hi: 'मंडी भाव',
      en: 'Market Prices',
    },
    description: {
      bn: 'দানাশস্য, সবজি ও মসলার প্রতি কেজি ও প্রতি মণ (৪০ কেজি) বর্তমান পাইকারি-খুচরা বাজার দর।',
      hi: 'अनाज, सब्जी और मसालों का प्रति किलो व प्रति मन वर्तमान स्थानीय बाजार भाव।',
      en: 'Current per-kg and per-maund district mandi prices with daily trend indicators.',
    },
    itemCount: 0,
  },
  {
    key: 'weatherAlerts',
    label: {
      bn: 'আবহাওয়া সতর্কতা',
      hi: 'मौसम चेतावनी',
      en: 'Weather Alerts',
    },
    description: {
      bn: 'ঝড়, ভারী বৃষ্টি, ব্লাইট আর্দ্রতা, তাপদাহ, শৈত্যপ্রবাহ, দমকা বাতাস ও বায়ু মান (AQI) সতর্কতা।',
      hi: 'आंधी, भारी बारिश, नमी झुलसा, लू, शीतलहर और वायु गुणवत्ता के नियम व बचाव उपाय।',
      en: 'Actionable agricultural weather thresholds synced with live district conditions.',
    },
    itemCount: 0,
  },
];

export function buildStructuredKnowledgeBase(options?: {
  tips?: CropTip[];
  prices?: MarketPrice[];
  weather?: WeatherCacheRecord | null;
}): KrishiKnowledgeBaseJson {
  const tipsInput = options?.tips && options.tips.length > 0 ? options.tips : SEED_CROP_TIPS;
  const pricesInput = options?.prices && options.prices.length > 0 ? options.prices : SEED_MARKET_PRICES;
  const weather = options?.weather ?? null;

  const crops: StructuredCropRecord[] = CROP_CALENDAR_DATA.map((crop) => ({
    cropId: crop.id,
    category: normalizeCropGroup(crop.id),
    seasonKey: crop.seasonKey,
    cropName: crop.cropName,
    variety: crop.variety,
    seasonLabel: crop.seasonLabel,
    durationDaysMin: crop.durationDaysMin,
    durationDaysMax: crop.durationDaysMax,
    plantingMonths: crop.plantingMonths,
    harvestMonths: crop.harvestMonths,
    plantingWindowText: crop.plantingWindowText,
    harvestWindowText: crop.harvestWindowText,
    soilAndPh: crop.soilAndPh,
    spacingAndSeedRate: crop.spacingAndSeedRate,
  }));

  const growthStages: StructuredGrowthStageRecord[] = [];
  for (const crop of CROP_CALENDAR_DATA) {
    const irrigationNote = findIrrigationNote(crop.id);
    crop.milestones.forEach((m, idx) => {
      growthStages.push({
        stageId: `${crop.id}-stage-${idx + 1}`,
        cropId: crop.id,
        cropName: crop.cropName,
        stageOrder: idx + 1,
        dayOffset: m.dayOffset,
        title: m.title,
        action: m.action,
        ...(idx === 1 && irrigationNote ? { criticalIrrigationNote: irrigationNote.stages } : {}),
      });
    });
  }

  const careTips: StructuredCareTipRecord[] = tipsInput.map((tip) => {
    const mapped = mapTipKeyToCropInfo(tip.cropKey);
    return {
      tipId: tip.id,
      cropId: mapped.cropId,
      cropKey: tip.cropKey,
      category: mapped.category,
      seasonKey: tip.seasonKey,
      cropName: tip.cropName,
      seasonLabel: tip.seasonLabel,
      title: tip.title,
      summary: tip.summary,
      steps: tip.steps,
      fertilizerNote: tip.fertilizerNote,
    };
  });

  const marketPrices: StructuredMarketPriceRecord[] = pricesInput.map((price) => ({
    priceId: price.id,
    cropId: price.cropId,
    category: price.category,
    cropName: {
      bn: price.cropNameBn,
      hi: price.cropNameHi,
      en: price.cropNameEn,
    },
    marketName: price.marketName,
    district: price.district,
    pricePerKg: price.pricePerKg,
    pricePerMaund: price.pricePerMaund,
    previousPricePerKg: price.previousPricePerKg,
    trend: price.trend,
    currency: price.currency,
    updatedAt: price.updatedAt,
  }));

  const activeAlertsMap = new Map(
    (weather?.alerts ?? []).map((a) => [a.id, a])
  );

  const weatherAlerts: StructuredWeatherAlertRecord[] = STANDARD_WEATHER_ALERTS.map((baseAlert) => {
    const liveMatch = activeAlertsMap.get(baseAlert.alertId);
    return {
      ...baseAlert,
      level: liveMatch?.level ?? baseAlert.level,
      title: liveMatch?.title ?? baseAlert.title,
      message: liveMatch?.message ?? baseAlert.message,
      advice: liveMatch?.advice ?? baseAlert.advice,
      isActiveNow: Boolean(liveMatch),
      triggeredAt: liveMatch?.triggeredAt ?? null,
    };
  });

  const counts: Record<KnowledgeSectionKey, number> = {
    crops: crops.length,
    growthStages: growthStages.length,
    careTips: careTips.length,
    marketPrices: marketPrices.length,
    weatherAlerts: weatherAlerts.length,
  };

  const categories = KNOWLEDGE_SECTION_CATEGORIES.map((cat) => ({
    ...cat,
    itemCount: counts[cat.key],
  }));

  return {
    schemaVersion: '1.0.0',
    generatedAt: weather?.fetchedAt ?? new Date().toISOString(),
    metadata: {
      appName: 'কৃষি মিত্র (Krishi Mitra)',
      standards: ['BARI', 'BRRI', 'DAE', 'Open-Meteo'],
      languages: ['bn', 'hi', 'en'],
      counts,
    },
    categories,
    crops,
    growthStages,
    careTips,
    marketPrices,
    weatherAlerts,
  };
}

export function getCropGroupLabel(group: AgroCropGroupKey | 'all', lang: AppLanguage): string {
  const labels: Record<AgroCropGroupKey | 'all', Record<AppLanguage, string>> = {
    all: { bn: 'সব ফসল', hi: 'सभी फसलें', en: 'All Crops' },
    grain: { bn: 'দানাশস্য', hi: 'अनाज', en: 'Grains' },
    vegetable: { bn: 'সবজি', hi: 'सब्जियां', en: 'Vegetables' },
    spice: { bn: 'মসলা ও কন্দ', hi: 'मसाले', en: 'Spices & Bulbs' },
    pulse_oil_fiber: { bn: 'ডাল, তেল ও আঁশ', hi: 'दलहन, तिलहन व जूट', en: 'Oilseed, Pulse & Fiber' },
    fruit: { bn: 'ফল', hi: 'फल', en: 'Fruits' },
  };
  return labels[group][lang];
}
