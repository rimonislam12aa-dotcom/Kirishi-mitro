import { AppLanguage, DiseaseDiagnosis, WeatherCacheRecord } from '../types/agri';

interface MatchDiagnosisInput {
  lang: AppLanguage;
  imageDataUrl: string;
  cropHint: string;
  affectedPart: string;
  growthStage: string;
  symptomTags: string[];
  weather?: WeatherCacheRecord | null;
}

interface AgronomyProfile {
  key: string;
  keywords: string[];
  cropName: Record<AppLanguage, string>;
  diseaseName: Record<AppLanguage, string>;
  scientificName: string;
  pathogenType: DiseaseDiagnosis['pathogenType'];
  severity: DiseaseDiagnosis['severity'];
  diseaseStage: Record<AppLanguage, string>;
  spreadRisk: DiseaseDiagnosis['spreadRisk'];
  rootCause: Record<AppLanguage, string>;
  immediateAction: Record<AppLanguage, string>;
  symptoms: Record<AppLanguage, string[]>;
  organicTreatment: Record<AppLanguage, string[]>;
  chemicalTreatment: Record<AppLanguage, string[]>;
  dosageAndSprayGuide: Record<AppLanguage, string>;
  harvestWaitDays: Record<AppLanguage, string>;
  differentialDiagnosis: Record<AppLanguage, string>;
  prevention: Record<AppLanguage, string[]>;
}

const AGRONOMY_PROFILES: AgronomyProfile[] = [
  {
    key: 'rice-blast',
    keywords: ['ধান', 'rice', 'paddy', 'ধানের', 'ধানগাছ', 'ব্লাস্ট', 'চোখ', 'দাগ'],
    cropName: { bn: 'ধান', hi: 'धान', en: 'Rice (Paddy)' },
    diseaseName: {
      bn: 'ধানের পাতা ও গিট ব্লাস্ট (চোখ-আকৃতির দাগ)',
      hi: 'धान का ब्लास्ट रोग (पत्ती व गर्दन झुलसा)',
      en: 'Rice Leaf & Neck Blast (Magnaporthe)',
    },
    scientificName: 'Pyricularia oryzae (Magnaporthe oryzae)',
    pathogenType: 'fungal',
    severity: 'moderate',
    diseaseStage: {
      bn: 'মাঝারি সংক্রমণ পর্যায় (শীষ বের হওয়ার আগে দ্রুত দমনযোগ্য)',
      hi: 'मध्यम संक्रमण अवस्था',
      en: 'Active Vegetative / Pre-Heading Stage',
    },
    spreadRisk: 'high',
    rootCause: {
      bn: 'রাতের ঠান্ডা ও ভোরের ঘন কুয়াশা/উচ্চ আর্দ্রতা (৮৫%+) এবং জমিতে অতিরিক্ত ইউরিয়া সার প্রয়োগের ফলে এই ছত্রাক দ্রুত ছড়ায়।',
      hi: 'उच्च नमी (85%+), रात की ठंडक और खेत में अधिक यूरिया डालने से यह फफूंद तेजी से फैलती है।',
      en: 'High humidity (85%+), cool dewy nights, and excess nitrogen/urea top-dressing trigger rapid spore spread.',
    },
    immediateAction: {
      bn: 'জমিতে ইউরিয়া উপরি সার দেওয়া অবিলম্বে বন্ধ করুন; বিঘাপ্রতি ৫–৭ কেজি পটাশ (MoP) ছিটিয়ে ২–৩ ইঞ্চি পানি ধরে রাখুন এবং বিকেলে প্রতিরোধক ছত্রাকনাশক স্প্রে করুন।',
      hi: 'खेत में यूरिया डालना तुरंत रोकें; प्रति बीघा 5-7 किलो पोटाश डालें और शाम को फफूंदनाशी का छिड़काव करें।',
      en: 'Stop urea top-dressing immediately, maintain 2–3 inches of standing water, broadcast ~5 kg/bigha potash, and spray late afternoon.',
    },
    symptoms: {
      bn: [
        'পাতায় মাঝখানে ধূসর-সাদা ও চারপাশে বাদামি বা গাঢ় প্রান্তযুক্ত ডিম্বাকার বা চোখের মতো দাগ।',
        'একাধিক দাগ মিশে পুরো পাতা ঝলসে যাওয়া ও শুকিয়ে পড়া।',
        'আক্রান্ত শীষের গোড়া কালো হয়ে ভেঙে পড়া ও ধান চিটা হওয়া।',
      ],
      hi: [
        'पत्तियों पर बीच में भूरे-सफेद और किनारों पर गहरे भूरे रंग के आंख जैसे धब्बे।',
        'धब्बों के आपस में मिलने से पूरी पत्ती झुलस कर सूखना।',
        'बाली की गर्दन काली पड़कर टूट जाना और दाने खाली रहना।',
      ],
      en: [
        'Spindle or eye-shaped lesions with greyish centers and dark brown margins on leaves.',
        'Coalescing lesions causing early leaf scorching and drying.',
        'Darkening of panicle nodes/necks leading to empty chaffy grains.',
      ],
    },
    organicTreatment: {
      bn: [
        'প্রতি লিটার পানিতে ৫ মিলি খাঁটি নিম তেল + ২ গ্রাম গুঁড়া সাবান মিশিয়ে বিকেলে স্প্রে করুন।',
        'জমির গোড়ায় ট্রাইকোডার্মা ভিরিডি সমৃদ্ধ জৈব সার প্রয়োগ করে রোগ প্রতিরোধ ক্ষমতা বাড়ান।',
        'আক্রান্ত খড় ও আগাছা জমি থেকে সরিয়ে পরিষ্কার রাখুন।',
      ],
      hi: [
        'प्रति लीटर पानी में 5 मिली नीम तेल मिलाकर शाम को छिड़काव करें।',
        'ट्राइकोडर्मा युक्त जैविक खाद से पौधों की प्रतिरोधक क्षमता बढ़ाएं।',
        'खेत से रोगग्रस्त पत्ते और खरपतवार निकालकर नष्ट करें।',
      ],
      en: [
        'Spray 5 ml cold-pressed neem oil + 2 g mild soap per liter of water in late afternoon.',
        'Boost root immunity using Trichoderma-enriched organic compost.',
        'Remove heavily infected stubble and field weeds around bunds.',
      ],
    },
    chemicalTreatment: {
      bn: [
        'ট্রাইসাইক্লাজোল ৭৫% ডব্লিউপি (Tricyclazole) অথবা অ্যাজোক্সিস্ট্রোবিন + ডাইফেনোকোনাজোল।',
        'প্রথম ধাপে কার্বেন্ডাজিম ৫০% ডব্লিউপি ব্যবহার করা যায় (১০–১২ দিন পরপর সর্বোচ্চ ২ বার)।',
      ],
      hi: [
        'ट्राइसाइक्लाज़ोल 75% WP या एज़ोक्सीस्ट्रोबिन + डाइफेनोकोनाज़ोल।',
        'कार्बेन्डाजिम 50% WP का छिड़काव 10-12 दिन के अंतर पर करें।',
      ],
      en: [
        'Tricyclazole 75% WP or Azoxystrobin + Difenoconazole fungicide.',
        'Alternate with Carbendazim 50% WP at 10–12 day intervals (max 2 sprays).',
      ],
    },
    dosageAndSprayGuide: {
      bn: 'প্রতি ১ লিটার পানিতে ১ গ্রাম ট্রাইসাইক্লাজোল (১৬ লিটার ঢোলে ১৬ গ্রাম) অথবা ১ মিলি অ্যাজোক্সিস্ট্রোবিন+ডাইফেনোকোনাজোল মিশিয়ে বিকেল ৩:৩০–৫:৩০টায় স্প্রে করুন। মুখে মাস্ক ও গ্লাভস পরুন।',
      hi: 'प्रति लीटर पानी में 1 ग्राम ट्राइसाइक्लाज़ोल (16 लीटर टंकी में 16 ग्राम) घोलकर शाम 3:30-5:30 बजे छिड़काव करें। मास्क व दस्ताने जरूर पहनें।',
      en: 'Mix 1 g Tricyclazole per 1 L water (16 g per 16L knapsack tank). Spray between 3:30–5:30 PM wearing mask & gloves.',
    },
    harvestWaitDays: {
      bn: 'স্প্রে করার পর অন্তত ১৪–২১ দিন অপেক্ষা করে ধান কাটুন।',
      hi: 'छिड़काव के कम से कम 14-21 दिन बाद ही कटाई करें।',
      en: 'Wait at least 14–21 days after spraying before harvesting paddy.',
    },
    differentialDiagnosis: {
      bn: 'বাদামি দাগ (Brown Spot)-এ দাগগুলো গোল ও তিলের মতো ছোট হয়; আর ব্লাস্টে দাগ মাকু বা চোখের মতো দুই দিক সুচালো থাকে।',
      hi: 'भूरा धब्बा रोग में दाग छोटे व गोल होते हैं, जबकि ब्लास्ट में दाग दोनों सिरों पर नुकीले (आंख जैसे) होते हैं।',
      en: 'Unlike tiny round Brown Spot lesions, Rice Blast spots are diamond/spindle-shaped with pointed ends.',
    },
    prevention: {
      bn: [
        'সবুজ পাতা চার্ট (LCC) দেখে সুষম মাত্রায় ইউরিয়া ও পটাশ সার প্রয়োগ করুন।',
        'আগাম বপন ও ব্লাস্ট-প্রতিরোধী জাত (যেমন ব্রি ধান-২৮ এর পরিবর্তে ব্রি ধান-৮৮/৮৯/১০৪) চাষ করুন।',
        'জমিতে পর্যাপ্ত আলো-বাতাস চলাচলের জন্য সঠিক দূরত্ব (২০×১৫ সে.মি.) বজায় রাখুন।',
      ],
      hi: [
        'पत्ती रंग चार्ट (LCC) के अनुसार संतुलित यूरिया और पोटाश का उपयोग करें।',
        'रोग प्रतिरोधी किस्मों का चयन करें और समय पर बुवाई करें।',
        'रोपाई में सही दूरी (20×15 सेमी) रखें ताकि हवा का प्रवाह बना रहे।',
      ],
      en: [
        'Use Leaf Color Chart (LCC) to avoid excess nitrogen.',
        'Prefer blast-tolerant rice varieties and treat seeds prior to sowing.',
        'Maintain proper hill spacing (20×15 cm) for field airflow.',
      ],
    },
  },
  {
    key: 'potato-blight',
    keywords: ['আলু', 'potato', 'টমেটো', 'tomato', 'মড়ক', 'লেট ব্লাইট', 'ধ্বসা', 'pacha'],
    cropName: { bn: 'আলু / টমেটো', hi: 'आलू / टमाटर', en: 'Potato / Tomato' },
    diseaseName: {
      bn: 'লেট ব্লাইট বা নাবি ধ্বসা (মড়ক রোগ)',
      hi: 'पिछेती झुलसा रोग (लेट ब्लाइट)',
      en: 'Late Blight (Phytophthora infestans)',
    },
    scientificName: 'Phytophthora infestans',
    pathogenType: 'fungal',
    severity: 'high',
    diseaseStage: {
      bn: 'দ্রুত সংক্রমণশীল পর্যায় — ২৪ ঘণ্টার মধ্যে ব্যবস্থা জরুরি',
      hi: 'तेजी से फैलने वाली अवस्था — 24 घंटे में उपचार आवश्यक',
      en: 'Rapid Epidemic Phase — Act Within 24 Hours',
    },
    spreadRisk: 'high',
    rootCause: {
      bn: 'ঘন কুয়াশা, গুঁড়ি গুঁড়ি বৃষ্টি ও ৮০%+ আর্দ্রতায় ১৫–২২°সে. তাপমাত্রায় মাত্র ৪–৫ দিনে পুরো ক্ষেত পচে যেতে পারে।',
      hi: 'घने कोहरे, हल्की बारिश और 80%+ नमी में 15-22°C तापमान पर यह रोग 4-5 दिन में पूरी फसल नष्ट कर सकता है।',
      en: 'Cool foggy weather (15–22°C) with 80%+ relative humidity spreads water-soaked lesions across an entire plot in days.',
    },
    immediateAction: {
      bn: 'ক্ষেতে সেচ দেওয়া সম্পূর্ণ বন্ধ করুন, মারাত্মক আক্রান্ত গাছ তুলে মাটিতে পুঁতে দিন এবং আজই বিকেলে অনুমোদিত ছত্রাকনাশক স্প্রে করুন।',
      hi: 'खेत में सिंचाई तुरंत बंद करें, अधिक संक्रमित पौधे उखाड़कर दबा दें और आज शाम फफूंदनाशी का छिड़काव करें।',
      en: 'Stop irrigation immediately, carefully bag and bury badly infected foliage, and apply targeted fungicide late afternoon.',
    },
    symptoms: {
      bn: [
        'পাতার কিনারা বা ডগায় পানি-ভেজা কালচে-সবুজ বা ফ্যাকাশে সবুজ দাগ।',
        'সকালে আক্রান্ত দাগের নিচের পিঠে সাদা তুলার মতো ছত্রাকের আস্তরণ।',
        'কাণ্ড ও পাতায় কালচে পচন ও ক্ষেত থেকে পচা গন্ধ বের হওয়া।',
      ],
      hi: [
        'पत्तों के किनारों पर पानी से भीगे गहरे हरे-काले धब्बे।',
        'सुबह के समय पत्ती की निचली सतह पर सफेद फफूंद की परत।',
        'तने का काला पड़कर सड़ना और खेत से दुर्गंध आना।',
      ],
      en: [
        'Water-soaked dark green to purplish-black blotches on leaf tips and margins.',
        'White cottony mold ring on the underside of lesions during humid mornings.',
        'Stem blackening and rapid rot odor in dense canopies.',
      ],
    },
    organicTreatment: {
      bn: [
        'প্রাথমিক অবস্থায় প্রতি লিটার পানিতে ৪–৫ গ্রাম ট্রাইকোডার্মা বা ১ গ্রাম পটাশিয়াম ফসফাইট স্প্রে করুন।',
        'রোগ ছড়ানো ঠেকাতে আক্রান্ত নিচের পাতা সাবধানে কেটে জমি থেকে সরান।',
        'প্রতি লিটার পানিতে ১০ গ্রাম শুকনো নিমপাতা ও রসুনের নির্যাস মিশিয়ে প্রতিরোধমূলক স্প্রে করতে পারেন।',
      ],
      hi: [
        'शुरुआती अवस्था में ट्राइकोडर्मा 4-5 ग्राम प्रति लीटर पानी का छिड़काव करें।',
        'नीचे की संक्रमित पत्तियों को सावधानी से तोड़कर खेत से दूर नष्ट करें।',
        'नीम और लहसुन के अर्क का बचाव हेतु छिड़काव करें।',
      ],
      en: [
        'Apply Trichoderma foliar spray (4–5 g/L) at very early preventive stage.',
        'Prune heavily blighted lower leaves carefully without shaking spores.',
        'Ensure deep raised ridges so spores do not wash down onto tubers.',
      ],
    },
    chemicalTreatment: {
      bn: [
        'ম্যানকোজেব + মেটালাক্সিল (যেমন রিডোমিল গোল্ড) অথবা সাইমোক্সানিল + ম্যানকোজেব।',
        'তীব্র মড়কে ডাইমেথোমরফ + ম্যানকোজেব অথবা ফেনামিডন + ম্যানকোজেব পর্যায়ক্রমে স্প্রে করুন।',
      ],
      hi: [
        'मैनकोज़ेब + मेटालैक्सिल (Ridomil Gold) या साइमोक्सानिल + मैनकोज़ेब।',
        'तेज प्रकोप में डाइमेथोमॉर्फ + मैनकोज़ेब का बारी-बारी से छिड़काव करें।',
      ],
      en: [
        'Metalaxyl + Mancozeb (e.g., Ridomil Gold) or Cymoxanil + Mancozeb.',
        'Rotate with Dimethomorph + Mancozeb during severe fog.',
      ],
    },
    dosageAndSprayGuide: {
      bn: 'প্রতি ১ লিটার পানিতে ২ গ্রাম ম্যানকোজেব+মেটালাক্সিল (১৬ লিটার ট্যাংকে ৩২ গ্রাম) ও সামান্য স্টিকার মিশিয়ে পাতার উপর ও নিচে ভালোভাবে ভিজিয়ে বিকেলে স্প্রে করুন। ৭ দিন পর আবার প্রয়োজন অনুযায়ী দিন।',
      hi: 'प्रति लीटर पानी में 2 ग्राम मैनकोज़ेब+मेटालैक्सिल (16 लीटर टंकी में 32 ग्राम) मिलाकर पत्तियों के दोनों ओर शाम को छिड़कें। 7 दिन बाद दोहराएं।',
      en: 'Dissolve 2 g/L Metalaxyl+Mancozeb (32 g per 16L tank) with spreader; coat both top and underside of leaves cleanly in late afternoon.',
    },
    harvestWaitDays: {
      bn: 'স্প্রে করার পর ১০–১৪ দিন অপেক্ষা করে আলু বা টমেটো তুলুন।',
      hi: 'छिड़काव के 10-14 दिन बाद ही खुदाई या तुड़ाई करें।',
      en: 'Observe a 10–14 day Pre-Harvest Interval before digging tubers or picking tomatoes.',
    },
    differentialDiagnosis: {
      bn: 'আর্লি ব্লাইটে শুকনো গোলাকার চাকতির মতো বলয় থাকে; কিন্তু লেট ব্লাইটে দাগ পানি-ভেজা ও নিচে সাদা ছাতা পড়ে।',
      hi: 'अगेती झुलसा में सूखे गोल छल्ले दिखते हैं, जबकि पिछेती झुलसा में पत्ते पानी से भीगे व नीचे सफेद फफूंद होती है।',
      en: 'Early blight forms dry bullseye rings; Late blight causes greasy water-soaked patches with pale white underside fuzz.',
    },
    prevention: {
      bn: [
        'রোগমুক্ত প্রত্যয়িত বীজ আলু ব্যবহার ও রোপণের আগে গোড়ায় উঁচু করে মাটি তুলে দিন।',
        'শীতের মেঘলা বা কুয়াশাচ্ছন্ন আবহাওয়া শুরু হতেই প্রতিরোধমূলক ম্যানকোজেব ২ গ্রাম/লিটার স্প্রে করুন।',
        'ফসল তোলার ৭–১০ দিন আগে গাছের ডাঁটা কেটে মাটির নিচে কন্দ পাকা ও জীবাণুমুক্ত রাখুন।',
      ],
      hi: [
        'स्वस्थ प्रमाणित बीज का प्रयोग करें और मेड़ों पर अच्छी तरह मिट्टी चढ़ाएं।',
        'कोहरा शुरू होते ही बचाव के लिए मैनकोज़ेब (2 ग्राम/लीटर) का छिड़काव करें।',
        'खुदाई से 7-10 दिन पहले ऊपर की लता काट दें ताकि कंद सड़न से बचें।',
      ],
      en: [
        'Plant certified disease-free seed tubers on well-earthed ridges.',
        'Start preventive Mancozeb (2 g/L) sprays ahead of misty/foggy spells.',
        'Cut potato haulms cleanly 7–10 days before digging to protect tubers.',
      ],
    },
  },
  {
    key: 'onion-blotch',
    keywords: ['পেঁয়াজ', 'onion', 'রসুন', 'garlic', 'পাতা পোড়া', 'ডগা'],
    cropName: { bn: 'পেঁয়াজ / রসুন', hi: 'प्याज / लहसुन', en: 'Onion / Garlic' },
    diseaseName: {
      bn: 'পার্পল ব্লচ ও আগামরা রোগ',
      hi: 'प्याज का बैंगनी धब्बा रोग (Purple Blotch)',
      en: 'Purple Blotch (Alternaria porri)',
    },
    scientificName: 'Alternaria porri & Stemphylium vesicarium',
    pathogenType: 'fungal',
    severity: 'moderate',
    diseaseStage: {
      bn: 'কন্দ গঠনের আগে জরুরি সুরক্ষা পর্যায়',
      hi: 'कंद बनने की अवस्था — समय पर नियंत्रण जरूरी',
      en: 'Active Leaf Infection / Bulb Development Phase',
    },
    spreadRisk: 'moderate',
    rootCause: {
      bn: 'শিশির জমা, উচ্চ আর্দ্রতা ও থ্রিপস পোকার ক্ষতস্থান দিয়ে এই ছত্রাক সহজে পেঁয়াজ ও রসুনের নলাকার পাতায় প্রবেশ করে।',
      hi: 'ओस, नमी और थ्रिप्स कीट के डंक से बने घावों के माध्यम से यह रोग पत्तों में प्रवेश करता है।',
      en: 'Heavy morning dew plus micro-wounds chewed by onion thrips allow Alternaria fungi to colonize leaf blades.',
    },
    immediateAction: {
      bn: 'শুকনো ও মরে যাওয়া পাতার ডগা ছেঁটে দিন; সাথে থ্রিপস দমন ও ছত্রাকনাশক স্টিকারসহ স্প্রে করুন।',
      hi: 'सूखे पत्तों की नोक सावधानी से हटाएं और थ्रिप्स नियंत्रण के साथ स्टिकर मिलाकर छिड़काव करें।',
      en: 'Pair fungicide spray with thrips control and always add a wetting/sticker agent on waxy onion leaves.',
    },
    symptoms: {
      bn: [
        'নলাকার পাতায় প্রথমে ছোট সাদাটে দাগ ও পরে মাঝখানে বেগুনি-বাদামি ও চারপাশে হলুদ বলয়।',
        'পাতার ডগা উপর থেকে শুকিয়ে ভেঙে পড়া ও বাল্ব ছোট হয়ে যাওয়া।',
      ],
      hi: [
        'पत्तियों पर पहले छोटे सफेद और बाद में बीच में बैंगनी-भूरे व किनारों पर पीले धब्बे।',
        'ऊपर से पत्तियों का सूखकर झुकना और कंद का छोटा रह जाना।',
      ],
      en: [
        'Sunken oval lesions turning purplish-brown at the center with yellow halos.',
        'Dieback of leaf tips causing premature lodging and small bulbs.',
      ],
    },
    organicTreatment: {
      bn: [
        'প্রতি লিটার পানিতে ৫ মিলি নিম তেল ও ২ গ্রাম আঠালো সাবান গুলে বিকেলে স্প্রে করুন (থ্রিপস কমবে)।',
        'ক্ষেতের মাটিতে পর্যাপ্ত পটাশ ও সালফার রাখুন এবং জলাবদ্ধতা দূর করুন।',
      ],
      hi: [
        'प्रति लीटर पानी में 5 मिली नीम तेल + 2 ग्राम साबुन मिलाकर शाम को छिड़कें।',
        'खेत में उचित पोटाश व गंधक रखें और अतिरिक्त पानी की निकासी करें।',
      ],
      en: [
        'Spray 5 ml/L neem oil + wetting soap to curb thrips entry points.',
        'Ensure balanced potash and sulphur nutrition with crisp drainage.',
      ],
    },
    chemicalTreatment: {
      bn: [
        'ইপ্রোডিওন (রোভরাল) অথবা টেবুকোনাজোল + ট্রাইফ্লক্সিস্ট্রোবিন / ম্যানকোজেব।',
        'থ্রিপসের জন্য সাথে ইমিডাক্লোপ্রিড (০.৫ মিলি/লি.) আলাদাভাবে বা নির্দেশমতো প্রয়োগ করুন।',
      ],
      hi: [
        'इप्रोडियोन या टेबुकोनाज़ोल + मैनकोज़ेब का प्रयोग करें।',
        'थ्रिप्स दिखने पर इमिडाक्लोप्रिड 0.5 मिली/लीटर का छिड़काव करें।',
      ],
      en: [
        'Iprodione 50% WP (2 g/L) or Tebuconazole + Trifloxystrobin with non-ionic sticker.',
        'Control co-infesting thrips with Imidacloprid 0.5 ml/L.',
      ],
    },
    dosageAndSprayGuide: {
      bn: 'পেঁয়াজের পাতা মোমের মতো পিচ্ছিল বলে প্রতি ১৬ লিটার পানিতে ৩২ গ্রাম রোভরাল/ম্যানকোজেব-এর সাথে অবশ্যই ৫–৮ মিলি স্টিকার বা শ্যাম্পু মিশিয়ে বিকেলে স্প্রে করুন।',
      hi: 'प्याज की पत्ती चिकनी होती है—इसलिए 16 लीटर टंकी में 32 ग्राम दवा के साथ स्टिकर मिलाकर शाम को छिड़काव करें।',
      en: 'Add 0.5 ml/L non-ionic sticker to every spray (2 g/L Iprodione or Mancozeb) so droplets adhere to waxy vertical leaves.',
    },
    harvestWaitDays: {
      bn: 'স্প্রে করার পর কমপক্ষে ১০–১৪ দিন পর পেঁয়াজ তুলুন।',
      hi: 'छिड़काव के कम से कम 10-14 दिन बाद कटाई करें।',
      en: 'Wait 10–14 days after spraying before pulling bulbs.',
    },
    differentialDiagnosis: {
      bn: 'হালকা সাদা আঁচড়ের মতো দাগ শুধু থ্রিপসের আক্রমণ; মাঝখানে গাঢ় বেগুনি রং ও হলুদ কিনারা থাকলে তা পার্পল ব্লচ ছত্রাক।',
      hi: 'चमकीली सफेद धारियां सिर्फ थ्रिप्स के कारण होती हैं, जबकि बीच में बैंगनी धब्बा पर्पल ब्लॉच रोग है।',
      en: 'Silvery streaks without dark purple centers indicate Thrips injury alone rather than Alternaria Purple Blotch.',
    },
    prevention: {
      bn: [
        'জমিতে একই স্থানে বারবার পেঁয়াজ না লাগিয়ে শস্যপর্যায় মেনে চলুন।',
        'সুষম সেচ দিয়ে পরিমিত পানি নিষ্কাশন রাখুন ও বপনের আগে বীজ শোধন করুন।',
      ],
      hi: [
        'हर साल एक ही खेत में प्याज न लगाएं—फसल चक्र अपनाएं।',
        'बुवाई से पहले बीज उपचार करें और खेत में जल निकासी साफ रखें।',
      ],
      en: [
        'Rotate Allium plots out for 2+ seasons.',
        'Treat onion sets/seeds cleanly and avoid overhead sprinkler irrigation late evening.',
      ],
    },
  },
  {
    key: 'chili-thrips-mite',
    keywords: ['মরিচ', 'chili', 'কুঁকড়ানো', 'curl', 'সাদামাছি', 'থ্রিপস', 'পোকা', 'চোষক'],
    cropName: { bn: 'মরিচ / সবজি', hi: 'मिर्च / सब्जी', en: 'Chili / Vegetables' },
    diseaseName: {
      bn: 'মরিচের থ্রিপস, মাকড় ও পাতা কুঁকড়ানো সমস্যা',
      hi: 'मिर्च में थ्रिप्स, माइट व पत्ता मरोड़ रोग',
      en: 'Chili Thrips, Yellow Mites & Leaf Curl Complex',
    },
    scientificName: 'Scirtothrips dorsalis / Polyphagotarsonemus latus',
    pathogenType: 'pest',
    severity: 'moderate',
    diseaseStage: {
      bn: 'পোকা ও রস-চোষা সক্রিয় পর্যায়',
      hi: 'रस चूसने वाले कीट की सक्रिय अवस्था',
      en: 'Active Sap-Sucking Infestation Stage',
    },
    spreadRisk: 'high',
    rootCause: {
      bn: 'শুকনো ও গরম আবহাওয়ায় থ্রিপস ও সাদামাছি কচি পাতার রস চুষে খায়—এছাড়া সাদামাছি ভাইরাসও বহন করে।',
      hi: 'गर्म व शुष्क मौसम में थ्रिप्स और सफेद मक्खी कोमल पत्तियों का रस चूसकर वायरस फैलाती हैं।',
      en: 'Warm dry weather favors rapid multiplication of sap-sucking thrips (upward curl), yellow mites (downward curl), and whiteflies.',
    },
    immediateAction: {
      bn: 'ভাইরাস-কুঁকড়ানো মারাত্মক গাছ তুলে ফেলুন; বাকি গাছে বিকেলে মাকড়-থ্রিপস দমন ও হলুদ আঠালো ফাঁদ বসান।',
      hi: 'गंभीर वायरस ग्रस्त पौधे हटाएं; खेत में पीले चिपचिपे ट्रैप लगाएं और शाम को नियंत्रण स्प्रे करें।',
      en: 'Rogue out severely stunted mosaic plants, hang yellow/blue sticky traps, and spray underside of young leaves.',
    },
    symptoms: {
      bn: [
        'কচি পাতা নৌকার মতো উপরের দিকে কুঁকড়ে যাওয়া (থ্রিপস) অথবা নিচের দিকে মুড়ে যাওয়া (মাকড়)।',
        'পাতার নিচে বাদামি-কালচে আঁচড় ও ফুল-কুঁড়ি ঝরে যাওয়া।',
      ],
      hi: [
        'नई पत्तियों का नाव की तरह ऊपर की ओर मुड़ना (थ्रिप्स) या नीचे की ओर मुड़ना (माइट)।',
        'पत्तियों के नीचे भूरे निशान पड़ना व फूल झड़ना।',
      ],
      en: [
        'Upward boat-shaped curling of young leaves (thrips) or downward cupping (broad mites).',
        'Bronze scarring beneath leaves and premature flower drop.',
      ],
    },
    organicTreatment: {
      bn: [
        'বিঘাপ্রতি ৮–১০টি হলুদ ও নীল আঠালো ফাঁদ (Sticky Trap) গাছের ডগার উচ্চতায় টাঙিয়ে দিন।',
        'প্রতি লিটার পানিতে ৫ মিলি নিম তেল বা ৪ গ্রাম সাবান মিশিয়ে পাতার নিচের পিঠে স্প্রে করুন।',
      ],
      hi: [
        'प्रति बीघा 8-10 पीले व नीले चिपचिपे ट्रैप लगाएं।',
        '5 मिली नीम तेल प्रति लीटर पानी की दर से पत्तियों के निचले हिस्से पर छिड़कें।',
      ],
      en: [
        'Install 8–10 yellow & blue sticky cards per bigha at canopy height.',
        'Spray cold-pressed neem oil (5 ml/L) aiming upward beneath leaf undersides.',
      ],
    },
    chemicalTreatment: {
      bn: [
        'মাকড়ের জন্য: ভার্টিমেক / অ্যাবামেকটিন ১.৮ ইসি অথবা সালফার ৮০%।',
        'থ্রিপস ও সাদামাছির জন্য: স্পাইনোসাড অথবা ইমিডাক্লোপ্রিড/অ্যাসিটামিপ্রিড পর্যায়ক্রমে।',
      ],
      hi: [
        'माइट के लिए एबामेक्टिन 1.8 EC या घुलनशील गंधक।',
        'थ्रिप्स/सफेद मक्खी के लिए इमिडाक्लोप्रिड या स्पिनोसैड।',
      ],
      en: [
        'Abamectin 1.8% EC (1 ml/L) for downward-curl mites; Imidacloprid 0.5 ml/L or Spinosad for upward-curl thrips.',
      ],
    },
    dosageAndSprayGuide: {
      bn: 'প্রতি ১ লিটার পানিতে ১ মিলি অ্যাবামেকটিন (১৬ লিটারে ১৬ মিলি) অথবা ০.৫ মিলি ইমিডাক্লোপ্রিড মিশিয়ে বিকেল ৪টার পর স্প্রে করুন; অবশ্যই পাতার নিচে ভিজিয়ে দিন।',
      hi: 'प्रति लीटर पानी में 1 मिली एबामेक्टिन या 0.5 मिली इमिडाक्लोप्रिड मिलाकर शाम 4 बजे के बाद पत्तियों की निचली सतह पर छिड़कें।',
      en: 'Spray 1 ml/L Abamectin (16 ml/16L tank) or 0.5 ml/L Imidacloprid after 4 PM directed beneath leaf undersides.',
    },
    harvestWaitDays: {
      bn: 'স্প্রে করার পর ৭–১০ দিন কাঁচা মরিচ তোলা বন্ধ রাখুন।',
      hi: 'छिड़काव के 7-10 दिन बाद ही मिर्च की तुड़ाई करें।',
      en: 'Wait 7–10 days after spraying before harvesting green chilies.',
    },
    differentialDiagnosis: {
      bn: 'পাতা ওপরের দিকে মুড়ে গেলে থ্রিপস, নিচের দিকে কুঁকড়ে ও শক্ত হলে মাকড় (Mite), আর হলুদ-সবুজ ছোপ থাকলে সাদামাছিবাহিত ভাইরাস।',
      hi: 'पत्ती ऊपर मुड़े तो थ्रिप्स, नीचे मुड़े तो माइट, और पीला-हरा मोजेक दिखे तो सफेद मक्खी जनित वायरस है।',
      en: 'Upward curl = Thrips; downward glossy curl = Broad Mites; bright yellow mottling = Whitefly Leaf Curl Virus.',
    },
    prevention: {
      bn: [
        'চারা অবস্থায় ৬০-মেশ নেট হাউসে রাখুন এবং জমিতে ভুট্টার বর্ডার সারি দিন।',
        'অতিরিক্ত ইউরিয়া সার পরিহার করে পর্যাপ্ত পটাশ দিন।',
      ],
      hi: [
        'नर्सरी को मच्छरदानी (60-मेष नेट) में तैयार करें।',
        'अधिक यूरिया के बजाय संतुलित पोटाश और सूक्ष्म पोषक तत्व दें।',
      ],
      en: [
        'Raise seedlings inside 60-mesh insect-proof net beds.',
        'Maintain balanced potash and avoid excessive nitrogen.',
      ],
    },
  },
  {
    key: 'general-deficiency-blight',
    keywords: [],
    cropName: { bn: 'ফসল / গাছপালা', hi: 'फसल / पौधा', en: 'Field / Garden Crop' },
    diseaseName: {
      bn: 'পাতার দাগ / পুষ্টি ঘাটতি বা ছত্রাকজনিত প্রাথমিক সমস্যা',
      hi: 'पत्ती धब्बा / पोषक तत्व कमी या शुरुआती फफूंद लक्षण',
      en: 'Early Leaf Spot / Fungal & Nutrient Stress Assessment',
    },
    scientificName: 'BARI / BRRI Symptom Guide Match',
    pathogenType: 'fungal',
    severity: 'moderate',
    diseaseStage: {
      bn: 'প্রাথমিক শনাক্তকরণ ও সতর্কতা পর্যায়',
      hi: 'प्रारंभिक जांच और बचाव अवस्था',
      en: 'Early Field Detection & Care Phase',
    },
    spreadRisk: 'moderate',
    rootCause: {
      bn: 'উচ্চ আর্দ্রতা, অতিরিক্ত রোদ/জলাবদ্ধতা বা পটাশ-জিংক-নাইট্রোজেন ঘাটতির কারণে পাতায় হলুদ ভাব বা দাগ দেখা দিতে পারে।',
      hi: 'अधिक नमी, जलभराव या पोटाश-जिंक की कमी से पत्तियों में पीलापन और धब्बे दिखाई देते हैं।',
      en: 'Leaf spots or yellowing commonly arise from fungal spore moisture combined with potash, zinc, or nitrogen imbalance.',
    },
    immediateAction: {
      bn: 'আক্রান্ত ২–৩টি নিচের পাতা সরিয়ে ফেলুন, জমিতে জলাবদ্ধতা থাকলে নালা পরিষ্কার করুন এবং বিকেলে নিম তেল বা প্রতিরোধক স্প্রে পরীক্ষা করুন।',
      hi: 'खेत में जलभराव न होने दें, रोगग्रस्त निचली पत्तियां हटाएं और शाम को नीम तेल या बचाव स्प्रे करें।',
      en: 'Clear standing water/drainage furrows, remove badly spotted lower leaves, and apply late-afternoon neem/preventive spray.',
    },
    symptoms: {
      bn: [
        'পাতার কিনারা বা মাঝখানে হলদে, বাদামি বা কালচে দাগ দেখা যাওয়া।',
        'নতুন পাতার তুলনায় পুরনো পাতা আগে ঝরে পড়া বা বিবর্ণ হওয়া।',
      ],
      hi: [
        'पत्तियों के किनारे या बीच में पीले, भूरे या काले धब्बे।',
        'पुरानी पत्तियों का समय से पहले पीला पड़कर झड़ना।',
      ],
      en: [
        'Yellow, brown, or necrotic spotting along leaf margins or lamina.',
        'Early yellowing or thinning of lower foliage.',
      ],
    },
    organicTreatment: {
      bn: [
        'প্রতি লিটার পানিতে ৫ মিলি নিম তেল ও ২ গ্রাম ডিটারজেন্ট/সাবান মিশিয়ে বিকেলে পাতার নিচে স্প্রে করুন।',
        'গোড়ায় পচা গোবর সার বা ভার্মিকম্পোস্টের সাথে ট্রাইকোডার্মা প্রয়োগ করুন।',
      ],
      hi: [
        'प्रति लीटर पानी में 5 मिली नीम तेल मिलाकर शाम को पत्तियों पर छिड़काव करें।',
        'जड़ों के पास सड़ी गोबर की खाद या केंचुआ खाद डालें।',
      ],
      en: [
        'Spray 5 ml/L neem oil solution in late afternoon as a safe first defense.',
        'Side-dress well-rotted compost + Trichoderma around root zones.',
      ],
    },
    chemicalTreatment: {
      bn: [
        'প্রতিরোধক হিসেবে ম্যানকোজেব ২ গ্রাম/লিটার অথবা কপার অক্সিক্লোরাইড ব্যবহার করা যায় (রোগ ছড়াতে থাকলে)।',
        'হলুদ দাগ পুষ্টি ঘাটতিজনিত হলে এনপিকে (১৯:১৯:১৯) বা চিলেটেড জিংক-বোরন ফলিয়ার স্প্রে দিন।',
      ],
      hi: [
        'फफूंद बढ़ने पर मैनकोज़ेब (2 ग्राम/लीटर) का छिड़काव करें।',
        'पोषक कमी होने पर घुलनशील NPK 19:19:19 या जिंक-बोरॉन छिड़कें।',
      ],
      en: [
        'Preventive Mancozeb 75% WP (2 g/L) if spots actively spread.',
        'Water-soluble NPK 19:19:19 + Zinc/Boron foliar feed if yellowing is uniform between veins.',
      ],
    },
    dosageAndSprayGuide: {
      bn: 'প্রতি ১ লিটার পানিতে ২ গ্রাম ম্যানকোজেব বা ২ গ্রাম এনপিকে/মাইক্রোনিউট্রিয়েন্ট মিশিয়ে বিকেল ৩:৩০–৫:৩০টার মধ্যে স্প্রে করুন।',
      hi: 'प्रति लीटर पानी में 2 ग्राम मैनकोज़ेब घोलकर शाम 3:30-5:30 के बीच छिड़काव करें।',
      en: 'Mix 2 g per 1 L water (32 g per 16L tank) and spray strictly between 3:30–5:30 PM on calm air.',
    },
    harvestWaitDays: {
      bn: 'রাসায়নিক ছত্রাকনাশক দিলে ৭–১০ দিন পর সবজি বা ফল তুলুন।',
      hi: 'रासायनिक छिड़काव के 7-10 दिन बाद ही तुड़ाई करें।',
      en: 'Wait 7–10 days after synthetic sprays before harvesting.',
    },
    differentialDiagnosis: {
      bn: 'দাগে কিনারা আঁকাবাঁকা বা গোল হলে ছত্রাক, আর শিরার ফাঁকে সমান হলুদ হলে জিংক/ম্যাগনেসিয়াম অভাব হতে পারে। পূর্ণ এআই বিশ্লেষণের জন্য সার্ভার মোডে ফসলটির নাম লিখে স্ক্যান করুন।',
      hi: 'धब्बे गोल या भूरे हों तो फफूंद, और शिराओं के बीच पीलापन पोषक कमी है। स्पष्ट क्लोज-अप फोटो व फसल का नाम लिखकर स्कैन करें।',
      en: 'Distinct concentric spots suggest fungi; symmetric interveinal yellowing signals Zinc/Magnesium deficiency. Specify crop name for tailored guidance.',
    },
    prevention: {
      bn: [
        'মাটির পিএইচ ও সুষম সার (ইউরিয়া, টিএসপি, পটাশ, জিপসাম, বোরন) বজায় রাখুন।',
        'সকালে ক্ষেতে হেঁটে আক্রান্ত পাতা দেখা মাত্রই আলাদা করে ফেলুন।',
      ],
      hi: [
        'मिट्टी की जांच व संतुलित उर्वरक का प्रयोग करें।',
        'सुबह खेत का निरीक्षण कर शुरुआती रोगी पत्तियां हटा दें।',
      ],
      en: [
        'Balance NPK + micronutrients at basal application.',
        'Inspect fields each morning and clear damp weeds around crop rows.',
      ],
    },
  },
];

export function matchOfflineAgronomyDiagnosis({
  lang,
  imageDataUrl,
  cropHint,
  affectedPart,
  growthStage,
  symptomTags,
  weather,
}: MatchDiagnosisInput): DiseaseDiagnosis {
  const haystack = `${cropHint} ${affectedPart} ${symptomTags.join(' ')}`.toLowerCase();

  let matched: AgronomyProfile | undefined;
  let maxScore = 0;

  for (const profile of AGRONOMY_PROFILES) {
    if (profile.keywords.length === 0) continue;
    let score = 0;
    for (const kw of profile.keywords) {
      if (haystack.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      matched = profile;
    }
  }

  const chosen = matched ?? AGRONOMY_PROFILES[AGRONOMY_PROFILES.length - 1];
  const resolvedCropName = cropHint.trim() || chosen.cropName[lang];

  // Adjust weather awareness into root cause if humidity/rain high
  let weatherAddon = '';
  if (weather) {
    if (weather.humidity >= 80) {
      weatherAddon =
        lang === 'bn'
          ? ` (${weather.location.districtName}-এ বাতাসের আর্দ্রতা ${weather.humidity}% থাকায় ছত্রাকজনিত ছড়ানোর ঝুঁকি বেশি)`
          : lang === 'hi'
          ? ` (${weather.location.districtName} में नमी ${weather.humidity}% होने से संक्रमण फैलने का खतरा अधिक है)`
          : ` (Current ${weather.humidity}% humidity in ${weather.location.districtName} accelerates spread)`;
    } else if (weather.temperature >= 33) {
      weatherAddon =
        lang === 'bn'
          ? ` (${weather.location.districtName}-এ তাপমাত্রা ${weather.temperature}°সে. — পোকামাকড় ও তাপ-চাপ বাড়তে পারে)`
          : lang === 'hi'
          ? ` (${weather.location.districtName} में तापमान ${weather.temperature}°C — कीट व गर्मी का तनाव संभव)`
          : ` (Warm ${weather.temperature}°C in ${weather.location.districtName} favors pests/moisture stress)`;
    }
  }

  const modeNote =
    lang === 'bn'
      ? ' [স্থানীয় BARI/BRRI লক্ষণভিত্তিক গাইড]'
      : lang === 'hi'
      ? ' [स्थानीय कृषि लक्षण आधारित गाइड]'
      : ' [Local BARI/BRRI Field Guide Match]';

  const summary =
    lang === 'bn'
      ? `${resolvedCropName}-এ সম্ভাব্য সমস্যা: ${chosen.diseaseName.bn}। জরুরি করণীয়: ${chosen.immediateAction.bn}`
      : lang === 'hi'
      ? `${resolvedCropName} में संभावित समस्या: ${chosen.diseaseName.hi}। तुरंत उपाय: ${chosen.immediateAction.hi}`
      : `Likely issue on ${resolvedCropName}: ${chosen.diseaseName.en}. Immediate step: ${chosen.immediateAction.en}`;

  return {
    id: `diag_${Date.now()}_local`,
    createdAt: new Date().toISOString(),
    language: lang,
    imageDataUrl,
    cropName: resolvedCropName,
    diseaseName: chosen.diseaseName[lang],
    scientificName: chosen.scientificName,
    pathogenType: chosen.pathogenType,
    severity: chosen.severity,
    diseaseStage: chosen.diseaseStage[lang],
    spreadRisk: chosen.spreadRisk,
    confidence: maxScore >= 2 ? 78 : maxScore === 1 ? 70 : 62,
    affectedPart,
    growthStage,
    rootCause: `${chosen.rootCause[lang]}${weatherAddon}${modeNote}`,
    immediateAction: chosen.immediateAction[lang],
    symptoms: chosen.symptoms[lang],
    organicTreatment: chosen.organicTreatment[lang],
    chemicalTreatment: chosen.chemicalTreatment[lang],
    dosageAndSprayGuide: chosen.dosageAndSprayGuide[lang],
    harvestWaitDays: chosen.harvestWaitDays[lang],
    differentialDiagnosis: chosen.differentialDiagnosis[lang],
    prevention: chosen.prevention[lang],
    audioSummary: summary,
  };
}
