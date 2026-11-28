import {
  AgroTimeAdvisory,
  AgroTimeSlotId,
  AppLanguage,
  FarmerHelplineItem,
  IrrigationCriticalStage,
  MonthlyAgroAdvisory,
  SoilAndSprayRule,
  WeatherCacheRecord,
} from '../types/agri';

export function getTimeSlotFieldAdvisory(
  hour: number,
  weather: WeatherCacheRecord | null
): AgroTimeAdvisory {
  let slotId: AgroTimeSlotId = 'early-morning';
  if (hour >= 5 && hour < 9) {
    slotId = 'early-morning';
  } else if (hour >= 9 && hour < 15) {
    slotId = 'midday';
  } else if (hour >= 15 && hour < 18) {
    slotId = 'afternoon';
  } else {
    slotId = 'night';
  }

  const wind = weather?.windSpeed ?? 8;
  const rainNow = weather?.precipitation ?? 0;
  const rainProb = weather?.forecast?.[0]?.rainProb ?? 15;
  const temp = weather?.temperature ?? 26;

  let spraySafety: AgroTimeAdvisory['spraySafety'];
  if (rainNow > 0.5 || rainProb >= 70 || wind >= 18) {
    spraySafety = {
      status: 'avoid',
      headline: {
        bn: 'এখন স্প্রে স্থগিত রাখুন',
        hi: 'अभी छिड़काव न करें',
        en: 'Pause Foliar Spraying Now',
      },
      reason: {
        bn:
          wind >= 18
            ? `বাতাসের গতি ${wind} কি.মি./ঘণ্টা — স্প্রের ওষুধ উড়ে যাবে।`
            : `বৃষ্টির সম্ভাবনা (${rainProb}%) বা বৃষ্টিপাতের কারণে ওষুধ ধুয়ে যাবে।`,
        hi:
          wind >= 18
            ? `हवा की गति ${wind} किमी/घंटा है — दवा उड़ जाएगी।`
            : `बारिश की संभावना (${rainProb}%) के कारण दवा धुल सकती है।`,
        en:
          wind >= 18
            ? `Wind at ${wind} km/h causes severe spray drift.`
            : `High rain chance (${rainProb}%) will wash off spray within 4 hours.`,
      },
    };
  } else if (slotId === 'midday' || temp >= 33) {
    spraySafety = {
      status: 'caution',
      headline: {
        bn: 'বেলার রোদে স্প্রে এড়িয়ে চলুন',
        hi: 'तेज धूप व दोपहर में छिड़काव टालें',
        en: 'Avoid Midday Sun & Bee Hours',
      },
      reason: {
        bn: `বর্তমানে তাপমাত্রা ${temp}°সে. ও মৌমাছি সক্রিয়—স্প্রে করার সেরা সময় বিকেল ৩:৩০টা – ৫:৩০টা।`,
        hi: `तापमान ${temp}°C और मधुमक्खियों के कारण छिड़काव का सही समय शाम 3:30 – 5:30 बजे है।`,
        en: `At ${temp}°C and peak bee foraging, wait until after 3:30 PM to prevent leaf scorch.`,
      },
    };
  } else if (slotId === 'afternoon') {
    spraySafety = {
      status: 'safe',
      headline: {
        bn: 'স্প্রে করার উপযুক্ত সময় এখন',
        hi: 'छिड़काव के लिए अभी उत्तम समय',
        en: 'Ideal Spraying Window Active',
      },
      reason: {
        bn: `তাপমাত্রা ${temp}°সে., বাতাস ${wind} কি.মি./ঘণ্টা ও বৃষ্টি কম—পাতার নিচে স্প্রে ও পটাশ/বোরন প্রয়োগ নিরাপদ।`,
        hi: `तापमान ${temp}°C, हल्की हवा (${wind} किमी/घंटा) — फफूंदनाशी या नीम तेल छिड़काव सुरक्षित है।`,
        en: `Calm wind (${wind} km/h), low rain risk, and fading sun reduce drift and evaporation.`,
      },
    };
  } else {
    spraySafety = {
      status: 'caution',
      headline: {
        bn: 'শিশির শুকানো ও আলো পরীক্ষা করুন',
        hi: 'ओस सूखने और रोशनी की जांच करें',
        en: 'Wait for Dew to Dry / Daylight',
      },
      reason: {
        bn: 'পাতায় ঘন শিশির থাকলে ওষুধ পাতলা হয়ে যায়; অথবা বিকেল ৩:৩০–৫:৩০টা সময় বেছে নিন।',
        hi: 'पत्तों पर ओस होने से दवा बह सकती है; ओस सूखने पर या शाम को छिड़काव करें।',
        en: 'Heavy morning dew dilutes foliar sprays; inspect field now and spray mid-morning or late afternoon.',
      },
    };
  }

  const slotCopy: Record<
    AgroTimeSlotId,
    Pick<AgroTimeAdvisory, 'timeRangeLabel' | 'slotTitle' | 'focusSummary' | 'tasks'>
  > = {
    'early-morning': {
      timeRangeLabel: {
        bn: 'ভোর ৫:০০ – সকাল ৯:০০',
        hi: 'सुबह 5:00 – 9:00 बजे',
        en: '5:00 AM – 9:00 AM',
      },
      slotTitle: {
        bn: 'ভোর ও সকালের মাঠ তদারকি সময়',
        hi: 'सुबह खेत निरीक्षण व सिंचाई का समय',
        en: 'Early Morning Field Inspection Window',
      },
      focusSummary: {
        bn: 'ফসলের পাতায় রোগ-পোকার প্রথম লক্ষণ দেখা, সবজি তোলা ও শীত-সকালে বীজতলার পলিথিন খোলার সময়।',
        hi: 'पत्तों पर रोग-कीट पहचानने, ताजी सब्जी तुड़ाई और नर्सरी से पन्नी हटाने का सही समय।',
        en: 'Best hours to spot leaf blight/insects, harvest crisp produce, and ventilate seedling beds.',
      },
      tasks: {
        bn: [
          'ধান, আলু ও টমেটো গাছের নিচের পাতায় ব্লাইট/ধ্বসার দাগ ও সাদামাছি পরীক্ষা করুন।',
          'শাকসবজি ও ফল ভোরের ঠান্ডায় সংগ্রহ করলে দীর্ঘক্ষণ সতেজ ও পুষ্টিগুণ অটুট থাকে।',
          'রোদ বাড়ার আগেই হালকা সেচ দেওয়া শেষ করুন এবং শীতে সকাল ৯–১০টায় বীজতলার ঢাকা খুলুন।',
        ],
        hi: [
          'धान, आलू और टमाटर की निचली पत्तियों पर झुलसा रोग या कीट की जांच करें।',
          'ताजी सब्जियों की तुड़ाई सुबह की ठंडक में करें ताकि वे लंबे समय तक ताज़ी बनी रहें।',
          'धूप तेज होने से पहले सिंचाई पूरी करें और सर्दियों में नर्सरी का कवर हटाएं।',
        ],
        en: [
          'Inspect lower leaves of rice, potato, and tomato for early blight spots or aphids.',
          'Harvest leafy greens and vegetables in cool morning air to preserve freshness longer.',
          'Finish morning irrigation before heat rises and uncover cold-protected paddy nurseries.',
        ],
      },
    },
    midday: {
      timeRangeLabel: {
        bn: 'সকাল ৯:০০ – দুপুর ৩:০০',
        hi: 'सुबह 9:00 – दोपहर 3:00 बजे',
        en: '9:00 AM – 3:00 PM',
      },
      slotTitle: {
        bn: 'বেলা ও দুপুরের পরিচর্যা ও পরিকল্পনা সময়',
        hi: 'दोपहर निराई, जुताई व परागण सुरक्षा समय',
        en: 'Midday Weeding, Drying & Crop Planning',
      },
      focusSummary: {
        bn: 'ফুলন্ত গাছে পরাগায়নকারী মৌমাছি কাজ করে—এই সময় স্প্রে বাদ দিয়ে রোদে শস্য শুকানো ও মাটি/নালার কাজ করুন।',
        hi: 'फूल आने के समय मधुमक्खियां परागण करती हैं—दोपहर में छिड़काव बंद रखकर अनाज सुखाएं व खेत सुधारें।',
        en: 'Protect foraging honeybees on flowering crops; prioritize sun-drying grains, weeding, and bund checks.',
      },
      tasks: {
        bn: [
          'সরিষা, আম, টমেটো ও কুমড়া ক্ষেতে দুপুর পর্যন্ত মৌমাছি সুরক্ষায় কোনো স্প্রে করবেন না।',
          'কাটা ধান, গম, সরিষা বা ডাল পরিষ্কার রোদে নেড়ে আর্দ্রতা ১২–১৪% এর নিচে নামান।',
          'আইল পরিষ্কার, আগাছা নিড়ানো এবং খড়/কচুরিপানা দিয়ে সবজি গাছের গোড়ায় মালচিং করুন।',
        ],
        hi: [
          'सरसों, आम व सब्जियों में परागण बचाने हेतु दोपहर में कोई कीटनाशक न छिड़कें।',
          'कटे हुए धान, गेहूं या सरसों को तेज धूप में सुखाकर सुरक्षित भंडारण योग्य बनाएं।',
          'खेत की मेड़ साफ करें, खरपतवार निकालें और सब्जियों की जड़ों के पास पुआल बिछाएं।',
        ],
        en: [
          'Protect honeybee pollinators—do not spray flowering mustard, mango, or cucurbits at midday.',
          'Sun-dry harvested paddy, wheat, or mustard seeds cleanly below 12–14% moisture.',
          'Weed furrows, clear field drainage bunds, and lay straw mulch around moisture-sensitive plants.',
        ],
      },
    },
    afternoon: {
      timeRangeLabel: {
        bn: 'বিকেল ৩:০০ – সন্ধ্যা ৬:০০',
        hi: 'दोपहर 3:00 – शाम 6:00 बजे',
        en: '3:00 PM – 6:00 PM',
      },
      slotTitle: {
        bn: 'বিকেলের নিরাপদ স্প্রে ও সেচ সময়',
        hi: 'शाम का सुरक्षित छिड़काव व सिंचाई समय',
        en: 'Optimal Late-Afternoon Spray & Irrigation Slot',
      },
      focusSummary: {
        bn: 'তাপমাত্রা কমে আসা ও মৌমাছি ফায়ারার পর এটিই বালাইনাশক, নিম তেল, বোরন ও পটাশ স্প্রের সবচেয়ে কার্যকর সময়।',
        hi: 'धूप कम होने और मधुमक्खियों के लौटने के बाद छिड़काव व हल्की सिंचाई का सबसे बेहतरीन समय।',
        en: 'Peak window for foliar nutrition (Boron/Potash/Zinc), neem oil, and targeted treatments once wind is calm.',
      },
      tasks: {
        bn: [
          'বাতাস শান্ত ও বৃষ্টির আশঙ্কা কম থাকলে বিকেল ৩:৩০–৫:৩০টার মধ্যে জরুরি স্প্রে শেষ করুন।',
          'ধানের শীর্ষ পর্যায়ে হালকা সেচ বা আলু-সবজির নালায় পরিমিত পানি দিন—রাতের ঠান্ডায় বাষ্পীভবন কম হয়।',
          'নতুন রোপণের জন্য বীজ শোধন বা সার মাপজোখ প্রস্তুত রাখুন।',
        ],
        hi: [
          'हवा शांत रहने पर शाम 3:30 से 5:30 के बीच आवश्यक छिड़काव पूरा कर लें।',
          'फसल में शाम की हल्की सिंचाई करने से पानी कम उड़ता है और जड़ों को अधिक नमी मिलती है।',
          'अगले दिन की बुवाई के लिए बीज उपचार व खाद की मात्रा तैयार रखें।',
        ],
        en: [
          'Complete essential foliar sprays between 3:30–5:30 PM once wind settles and bees return to hives.',
          'Apply afternoon furrow irrigation so moisture soaks deep overnight without midday evaporation.',
          'Prepare seed treatments and measured fertilizer mixes for the next morning.',
        ],
      },
    },
    night: {
      timeRangeLabel: {
        bn: 'সন্ধ্যা ৬:০০ – ভোর ৫:০০',
        hi: 'शाम 6:00 – सुबह 5:00 बजे',
        en: '6:00 PM – 5:00 AM',
      },
      slotTitle: {
        bn: 'সন্ধ্যা ও রাতের সুরক্ষা ও আগামীকালের প্রস্তুতি',
        hi: 'शाम व रात सुरक्षा और कल की तैयारी',
        en: 'Evening Pest Traps, Frost Cover & Next-Day Prep',
      },
      focusSummary: {
        bn: 'সন্ধ্যার পর মাজরা/ফল ছিদ্রকারী পোকার মথ সক্রিয় হয়—ফাঁদ পরীক্ষা করুন ও শীতে বীজতলা ঢেকে রাখুন।',
        hi: 'शाम के बाद कीट पतंगे सक्रिय होते हैं—फेरोमोन व प्रकाश जाल जांचें और नर्सरी ढकें।',
        en: 'Inspect pheromone/light traps at dusk, cover cold nurseries on chill nights, and review tomorrow’s weather forecast.',
      },
      tasks: {
        bn: [
          'বেগুন, টমেটো ও ধানের জমিতে ফেরোমন ফাঁদ ও আলোক ফাঁদ সক্রিয় আছে কি না দেখুন।',
          'রাতের তাপমাত্রা ১২°সে. এর নিচে নামলে বোরো ধানের বীজতলা স্বচ্ছ পলিথিন দিয়ে ঢেকে দিন।',
          'আগামী ৫ দিনের বৃষ্টির পূর্বাভাস দেখে ফসল কাটা ও সংরক্ষণের পরিকল্পনা করুন।',
        ],
        hi: [
          'खेत में लगे फेरोमोन ट्रैप और प्रकाश जाल की जांच करें।',
          'रात का तापमान 12°C से कम हो तो धान नर्सरी को पॉलिथीन से सुरक्षित ढकें।',
          'अगले 5 दिनों के मौसम का पूर्वानुमान देखकर कटाई व भंडारण की योजना बनाएं।',
        ],
        en: [
          'Check pheromone lures and light traps in brinjal, tomato, and paddy fields at dusk.',
          'Cover paddy nurseries with clear polythene if night lows drop near 12°C or below.',
          'Review tomorrow’s rain forecast before scheduling harvest and grain drying.',
        ],
      },
    },
  };

  const chosen = slotCopy[slotId];
  return {
    slotId,
    timeRangeLabel: chosen.timeRangeLabel,
    slotTitle: chosen.slotTitle,
    focusSummary: chosen.focusSummary,
    tasks: chosen.tasks,
    spraySafety,
  };
}

const MONTHLY_AGRO_BRIEFS: MonthlyAgroAdvisory[] = [
  {
    month: 1,
    banglaSeason: { bn: 'পৌষ–মাঘ (শীত)', hi: 'पौष-माघ (सर्दी)', en: 'Poush–Magh (Winter)' },
    headline: {
      bn: 'শৈত্যপ্রবাহ সুরক্ষা, বোরো রোপণ ও আলু-টমেটোয় মড়ক প্রতিরোধ',
      hi: 'शीतलहर से बचाव, बोरो रोपाई और आलू-टमाटर झुलसा नियंत्रण',
      en: 'Cold-Wave Nursery Care, Boro Transplanting & Blight Prevention',
    },
    keyCropsFocus: {
      bn: 'বোরো ধান · আলু · টমেটো · সরিষা · গম · পেঁয়াজ',
      hi: 'बोरो धान · आलू · टमाटर · सरसों · गेहूं · प्याज',
      en: 'Boro Rice · Potato · Tomato · Mustard · Wheat · Onion',
    },
    actionItems: {
      bn: [
        'বোরো চারা রোপণের আগে জমি সমতল করে প্রতি বিঘায় টিএসপি, পটাশ, জিপসাম ও জিংক প্রয়োগ করুন।',
        'ঘন কুয়াশায় আলু ও টমেটো গাছে সকালে সেচ দেবেন না; ৭–১০ দিন পরপর প্রতিরোধক স্প্রে প্রস্তুত রাখুন।',
        'গম রোপণের ১৭–২১ দিনে প্রথম সেচ ও ইউরিয়া উপরি সার দেওয়া নিশ্চিত করুন।',
      ],
      hi: [
        'बोरो धान रोपाई से पहले खेत समतल कर फास्फोरस, पोटाश, जिप्सम व जिंक खाद डालें।',
        'कोहरे में आलू व टमाटर में सुबह सिंचाई न करें; झुलसा रोकथाम के लिए तैयार रहें।',
        'गेहूं में 17-21 दिन की अवस्था पर पहली सिंचाई व यूरिया देना सुनिश्चित करें।',
      ],
      en: [
        'Level Boro paddies cleanly and incorporate basal TSP, MoP, Gypsum & Zinc before transplanting.',
        'Avoid morning watering in potato/tomato during dense fog to curb late blight.',
        'Deliver wheat’s first 17–21d CRI irrigation and urea top-dress strictly on schedule.',
      ],
    },
  },
  {
    month: 2,
    banglaSeason: { bn: 'মাঘ–ফাল্গুন (বসন্ত শুরু)', hi: 'माघ-फाल्गुन (बसंत आरंभ)', en: 'Magh–Falgun (Early Spring)' },
    headline: {
      bn: 'আমের মুকুল ব্যবস্থাপনা, ভুট্টা ও মুগডাল প্রস্তুতি এবং আগাম আলু উত্তোলন',
      hi: 'आम के बौर की सुरक्षा, मक्का व मूंग तैयारी और आलू खुदाई',
      en: 'Mango Panicle Care, Boro Weed/AWD Irrigation & Early Potato Harvest',
    },
    keyCropsFocus: {
      bn: 'আম · বোরো ধান · আলু · সরিষা সংগ্রহ · গ্রীষ্মকালীন মুগ',
      hi: 'आम · बोरो धान · आलू खुदाई · सरसों कटाई · ग्रीष्म मूंग',
      en: 'Mango · Boro Rice · Potato · Mustard Harvest · Mungbean',
    },
    actionItems: {
      bn: [
        'বোরো ধানে রোপণের ১৫–২৫ দিনে আগাছা দমন ও প্রথম কিস্তি ইউরিয়া এবং AWD পাইপ সেচ পদ্ধতি চালু করুন।',
        'সরিষার ৭৫–৮০% শুঁটি হলুদ হলে সকালে শিশিরে কাটুন যাতে দানা ঝরে না যায়।',
        'আমের মুকুল ফোটার আগে একবার ও মটরদানার মতো গুটি হলে বোরন+হপার দমন স্প্রে দিন (ফোটার সময় নয়)।',
      ],
      hi: [
        'बोरो धान में 15-25 दिन पर निराई व पहली किस्त यूरिया दें।',
        'सरसों की 75-80% फलियां पीली होने पर सुबह ओस के समय कटाई करें ताकि दाने न झड़ें।',
        'आम का पूरा बौर खिलने पर छिड़काव बंद रखें; फल मटर बराबर होने पर ही स्प्रे करें।',
      ],
      en: [
        'Weed Boro rice at 15–25d, apply first urea split, and adopt Alternate Wetting & Drying (AWD) irrigation.',
        'Harvest mustard at dawn when 75–80% pods turn yellow to prevent pod shattering.',
        'Pause mango sprays during full bloom; resume only after pea-size fruit set.',
      ],
    },
  },
  {
    month: 3,
    banglaSeason: { bn: 'ফাল্গুন–চৈত্র (বসন্ত)', hi: 'फाल्गुन-चैत्र (बसंत)', en: 'Falgun–Chaitra (Spring)' },
    headline: {
      bn: 'গ্রীষ্মকালীন শাকসবজি, পাট বপনের প্রস্তুতি ও পেঁয়াজ সংগ্রহ',
      hi: 'गर्मी की सब्जियां, जूट बुवाई तैयारी व प्याज खुदाई',
      en: 'Jute Land Prep, Summer Cucurbits, Onion Curing & Boro Panicle Stage',
    },
    keyCropsFocus: {
      bn: 'বোরো ধান (কাইচথোড়) · পাট · পেঁয়াজ · গম কাটা · চালকুমড়া/করলা',
      hi: 'बोरो धान · जूट · प्याज · गेहूं कटाई · लौकी/करेला',
      en: 'Boro Booting · Tossa Jute · Onion · Wheat Harvest · Cucurbits',
    },
    actionItems: {
      bn: [
        'বোরো ধানে কাইচথোড় বের হওয়ার সময় ইউরিয়ার শেষ কিস্তি+পটাশ দিন এবং খোলপোড়া ও মাজরা নজরদারি করুন।',
        'তোষা পাট (জেআরও-৫২৪/রবি-১) বপনের আগে বীজ শোধন করে শেষ চাষে জৈব সার মেশান।',
        'পেঁয়াজ ৭০–৮০% গলা ভাঙলে সেচ বন্ধ করুন ও ছায়ায় শুকিয়ে সংরক্ষণ করুন।',
      ],
      hi: [
        'बोरो धान में गभोट अवस्था पर अंतिम यूरिया व पोटाश डालें और तना छेदक पर नजर रखें।',
        'पटसन की बुवाई से पहले बीज उपचार कर गोबर खाद मिलाएं।',
        'प्याज की गर्दन 70-80% झुकने पर सिंचाई रोकें और छाया में सुखाएं।',
      ],
      en: [
        'Apply final urea+potash split at Boro panicle initiation and monitor stem borers & sheath blight.',
        'Treat Tossa jute seeds cleanly before mid-to-late March sowing.',
        'Stop irrigating onions once 70–80% of necks fall over and cure bulbs in airy shade.',
      ],
    },
  },
  {
    month: 4,
    banglaSeason: { bn: 'চৈত্র–বৈশাখ (গ্রীষ্ম শুরু)', hi: 'चैत्र-वैशाख (गर्मी)', en: 'Chaitra–Boishakh (Pre-Monsoon)' },
    headline: {
      bn: 'কালবৈশাখী সতর্কতা, হাওরের বোরো কাটা ও আউশ-পাট পরিচর্যা',
      hi: 'आंधी-बारिश चेतावनी, बोरो कटाई व औस धान-जूट देखभाल',
      en: 'Kalboishakhi Storm Readiness, Haor Boro Harvest & Aus/Jute Sowing',
    },
    keyCropsFocus: {
      bn: 'বোরো ধান (হাওর) · আউশ ধান · তোষা পাট · গ্রীষ্মকালীন তিল ও সবজি',
      hi: 'बोरो कटाई · औस धान · जूट · ग्रीष्म तिल व सब्जियां',
      en: 'Haor Boro Harvest · Aus Rice · Tossa Jute · Summer Vegetables',
    },
    actionItems: {
      bn: [
        'হাওর ও নিচু এলাকায় ধান ৮০% পাকা মাত্রই দ্রুত কেটে শুষ্ক উঁচু স্থানে তুলুন।',
        'তাপমাত্রা ৩৫°সে.+ থাকলে দুধ-আসা বোরো ধানে অবশ্যই ২–৩ ইঞ্চি পানি রাখুন যাতে চিটা না হয়।',
        'আউশ ধান ও পাট ক্ষেতে চারা গজানোর পর নিড়ানি ও নালা পরিষ্কার রাখুন।',
      ],
      hi: [
        'नीचे क्षेत्रों में धान 80% पकते ही तुरंत काटकर सुरक्षित जगह रखें।',
        'तापमान 35°C+ रहने पर दूधिया धान के खेत में 2-3 इंच पानी बनाए रखें।',
        'जूट व औस धान में समय से निराई और जल निकासी नालियां साफ रखें।',
      ],
      en: [
        'Harvest Haor Boro paddy promptly at 80% golden grain maturity ahead of flash-floods.',
        'Keep 2–3 inches of water in flowering paddy during 35°C+ heat spikes to prevent sterility.',
        'Thin jute seedlings early and open field surface drains ahead of squalls.',
      ],
    },
  },
  {
    month: 5,
    banglaSeason: { bn: 'বৈশাখ–জ্যৈষ্ঠ (গ্রীষ্ম)', hi: 'वैशाख-ज्येष्ठ (गर्मी)', en: 'Boishakh–Jyoishtho (Peak Summer)' },
    headline: {
      bn: 'বোরো ধান শুকানো-সংরক্ষণ, আম সংগ্রহ ও পাটের পরিচর্যা',
      hi: 'बोरो धान भंडारण, आम तुड़ाई और जूट खाद-निराई',
      en: 'Grain Safe Storage, Mango Harvest, Jute Top-Dress & Amon Seedbed Prep',
    },
    keyCropsFocus: {
      bn: 'বোরো সংরক্ষণ · আম/লিচু · পাট · আউশ · গ্রীষ্ম সবজি',
      hi: 'धान भंडारण · आम/लीची · जूट · औस धान',
      en: 'Grain Storage · Mango/Litchi · Jute · Aus Paddy',
    },
    actionItems: {
      bn: [
        'সংরক্ষণের আগে ধান ১২% আর্দ্রতায় শুকিয়ে পরিষ্কার প্লাস্টিক ড্রাম বা মুখ-বন্ধ বস্তায় নিমপাতা দিয়ে রাখুন।',
        'তোষা পাটে ৩৫–৪০ দিনে নিড়ানি দিয়ে ইউরিয়ার ২য় কিস্তি উপরি প্রয়োগ করুন।',
        'ফলন্ত আমে ঝড়ো বাতাসের আগে পরিপক্ব ফল সংগ্রহ করুন।',
      ],
      hi: [
        'भंडारण से पहले धान को 12% नमी तक सुखाकर एयरटाइट ड्रम में नीम पत्तियों के साथ रखें।',
        'जूट में 35-40 दिन पर निराई करके यूरिया की दूसरी किस्त डालें।',
        'आंधी की चेतावनी से पहले पके आम व लीची की तुड़ाई करें।',
      ],
      en: [
        'Dry Boro paddy below 12% moisture before sealing in airtight drums or lined sacks.',
        'Weed jute at 35–40 days and apply remaining urea top-dress.',
        'Harvest mature mangoes before afternoon squalls damage orchard limbs.',
      ],
    },
  },
  {
    month: 6,
    banglaSeason: { bn: 'জ্যৈষ্ঠ–আষাঢ় (বর্ষা শুরু)', hi: 'ज्येष्ठ-आषाढ़ (मानसून आरंभ)', en: 'Jyoishtho–Asharh (Early Monsoon)' },
    headline: {
      bn: 'রোপা আমন বীজতলা তৈরি ও জলাবদ্ধতা থেকে সবজি রক্ষা',
      hi: 'रोपा अमन धान की नर्सरी तैयारी व जल निकासी प्रबंधन',
      en: 'T. Aman Rice Nursery Preparation & Monsoon Vegetable Drainage',
    },
    keyCropsFocus: {
      bn: 'রোপা আমন বীজতলা · পাট · গ্রীষ্মকালীন মরিচ-টমেটো · পেঁপে/কলা',
      hi: 'अमन धान नर्सरी · जूट · बरसाती सब्जियां',
      en: 'T. Aman Nursery · Jute · Monsoon Vegetables · Banana',
    },
    actionItems: {
      bn: [
        'উঁচু, রোদেলা ও জলাবদ্ধতামুক্ত জমিতে ব্রি ধান-৪৯, ৮৭, ১০৩ বা স্বর্ণা ধানের আদর্শ বীজতলা তৈরি করুন।',
        'শিম, করলা ও শসার মাচা শক্ত করুন এবং জমির চারদিকে নালা কেটে পানি নিষ্কাশন নিশ্চিত করুন।',
        'ফলদ গাছ (আম, পেয়ারা, লেবু) রোপণের জন্য এটি শ্রেষ্ঠ মাস—গর্তে জৈব সার ভরে চারা লাগান।',
      ],
      hi: [
        'ऊंची और जल निकासी वाली जमीन पर अमन धान की आदर्श नर्सरी तैयार करें।',
        'लता वाली सब्जियों का मचान मजबूत करें और खेत के चारों तरफ जल निकासी नाली बनाएं।',
        'आम, अमरूद और नींबू जैसे फलदार पौधे लगाने के लिए यह सबसे उपयुक्त समय है।',
      ],
      en: [
        'Sow T. Aman nursery beds (BRRI dhan-49/87/103) on sunny, well-drained high ground.',
        'Reinforce vegetable trellises and clear perimeter monsoon drainage trenches.',
        'Plant perennial fruit saplings (mango, guava, lemon) in compost-enriched pits.',
      ],
    },
  },
  {
    month: 7,
    banglaSeason: { bn: 'আষাঢ়–শ্রাবণ (বর্ষা)', hi: 'आषाढ़-श्रावण (मानसून)', en: 'Asharh–Srabon (Peak Monsoon)' },
    headline: {
      bn: 'রোপা আমন চারা রোপণ ও পাট কাটা-জাগ দেওয়া',
      hi: 'अमन धान रोपाई व जूट कटाई-सड़ाई प्रबंधन',
      en: 'T. Aman Transplanting & Clean-Water Jute Harvest/Retting',
    },
    keyCropsFocus: {
      bn: 'রোপা আমন ধান · পাট সংগ্রহ ও পচানো · বর্ষা সবজি',
      hi: 'अमन धान रोपाई · जूट कटाई · बरसाती सब्जियां',
      en: 'T. Aman Transplanting · Jute Retting · Monsoon Crops',
    },
    actionItems: {
      bn: [
        '২৫–৩০ দিন বয়সী আমন চারা প্রতি গোছায় ২–৩টি করে ২০×২০ বা ২০×১৫ সে.মি. দূরত্বে রোপণ করুন।',
        'তোষা পাট ১২০ দিনে পাতা হলুদ হলে কেটে ৩–৪ দিন ক্ষেতে পাতা ঝরিয়ে পরিষ্কার পানিতে বা রিবন রেটিংয়ে পচান।',
        'বন্যার ঝুঁকি থাকলে নিচু জমিতে লম্বা চারা বা স্বল্পমেয়াদি বীনা-৭/ব্রি ধান-৭৫ প্রস্তুত রাখুন।',
      ],
      hi: [
        '25-30 दिन के अमन धान के पौधे 20×20 सेमी दूरी पर प्रति स्थान 2-3 पौधे लगाएं।',
        'जूट 120 दिन में तैयार होने पर काटकर 3-4 दिन खेत में पत्ते गिराने के बाद साफ पानी में सड़ाएं।',
        'बाढ़ की स्थिति में जल सहनशील या कम अवधि वाली धान की नर्सरी तैयार रखें।',
      ],
      en: [
        'Transplant 25–30 day T. Aman seedlings (2–3/hill) at 20×20 cm spacing.',
        'Harvest jute near 120 days, shed leaves in field for 3–4 days, and ret cleanly without mud weights.',
        'Keep submergence-tolerant or short-duration seedlings ready in flood-prone lowlands.',
      ],
    },
  },
  {
    month: 8,
    banglaSeason: { bn: 'শ্রাবণ–ভাদ্র (ভরা বর্ষা)', hi: 'श्रावण-भाद्रपद (वर्षा)', en: 'Srabon–Bhadro (Late Monsoon)' },
    headline: {
      bn: 'আমন ধানে পার্চিং ও পাতা মোড়ানো-মাজরা পোকা দমন এবং আগাম শীত সবজি প্রস্তুতি',
      hi: 'धान में कीट नियंत्रण व अगेती सर्दी सब्जियों की नर्सरी',
      en: 'Aman Stem-Borer & Sheath-Blight Care + Early Winter Seedbeds',
    },
    keyCropsFocus: {
      bn: 'রোপা আমন (কুশি ও গাঢ় সবুজ) · আগাম ফুলকপি/টমেটো বীজতলা',
      hi: 'अमन धान · अगेती फूलगोभी/टमाटर नर्सरी',
      en: 'T. Aman Tillering · Early Cauliflower & Tomato Nursery',
    },
    actionItems: {
      bn: [
        'রোপণের ১৫–২০ দিনের মাথায় বিঘাপ্রতি ৩–৪টি পাখি বসার ডাল (পার্চিং) পুঁতে দিন।',
        'জমিতে খোলপোড়া বা পাতায় মাজরা দেখা দিলে পানি বের করে পটাশ/অনুমোদিত ব্যবস্থা নিন।',
        'আগাম শীতকালীন ফুলকপি, বাঁধাকপি ও টমেটোর বীজতলা পলিথিন ছাউনিতে শুরু করা যায়।',
      ],
      hi: [
        'रोपाई के 15-20 दिन बाद खेत में प्रति बीघा 3-4 बांस की खूंटियां (बर्ड पर्च) लगाएं।',
        'पत्ती लपेटक या शीथ ब्लाइट दिखने पर अतिरिक्त पानी निकालें और पोटाश का संतुलन रखें।',
        'पॉलीथीन शेड में अगेती गोभी व टमाटर की नर्सरी शुरू की जा सकती है।',
      ],
      en: [
        'Place 3–4 bamboo bird perches per Bigha 15–20 days after T. Aman transplanting.',
        'Drain excess standing water if sheath blight or leaf folder pressure rises.',
        'Start early winter cauliflower, cabbage, and tomato nurseries under rain shelters.',
      ],
    },
  },
  {
    month: 9,
    banglaSeason: { bn: 'ভাদ্র–আশ্বিন (শরৎ)', hi: 'भाद्रपद-आश्विन (शरद)', en: 'Bhadro–Ashwin (Early Autumn)' },
    headline: {
      bn: 'আমন ধানের শীষ পর্যায় ও বাদামি গাছফড়িং দমন এবং আগাম রবি জমি তৈরি',
      hi: 'धान में बाली अवस्था देखभाल व रबी फसल तैयारी',
      en: 'Aman Heading Protection (BPH Watch) & Early Rabi Crop Sowing',
    },
    keyCropsFocus: {
      bn: 'আমন ধান (শীষ) · আগাম আলু ও শিম · মাসকলাই · মরিচ',
      hi: 'अमन धान (बाली) · अगेती आलू · उड़द · मिर्च',
      en: 'Aman Panicle Stage · Early Potato · Blackgram · Chili',
    },
    actionItems: {
      bn: [
        'আমনের শীষ বের হওয়ার সময় গোছার গোড়া ফাঁক করে দেখুন—বাদামি গাছফড়িং (কারেন্ট পোকা) থাকলে পানি শুকিয়ে দিন।',
        'নদী তীর ও উঁচু বেলে-দোআঁশ জমিতে আগাম শিম, মুলা ও মাসকলাই বপন করুন।',
        'গাছে অতিরিক্ত ইউরিয়া দেওয়া এ সময় সম্পূর্ণ বন্ধ রাখুন।',
      ],
      hi: [
        'धान की जड़ों के पास भूरा माहू (BPH) जांचें—दिखने पर पानी निकालकर जड़ों के पास हवा लगने दें।',
        'नदी किनारे की बलुई दोमट जमीन पर मूली, सेम व उड़द की बुवाई करें।',
        'फूल या बाली आने पर यूरिया डालना पूरी तरह बंद करें।',
      ],
      en: [
        'Part paddy tillers weekly at the base to scout Brown Planthopper (BPH); drain water if spotted.',
        'Sow blackgram, early radish, and country beans on well-drained uplands.',
        'Cease all nitrogen/urea top-dressing once heading begins.',
      ],
    },
  },
  {
    month: 10,
    banglaSeason: { bn: 'আশ্বিন–কার্তিক (হেমন্ত)', hi: 'आश्विन-कार्तिक (हेमंत)', en: 'Ashwin–Kartik (Late Autumn)' },
    headline: {
      bn: 'রবি মৌসুমের শুরু: সরিষা, আগাম আলু, টমেটো ও পেঁয়াজের বীজতলা',
      hi: 'रबी सीजन की शुरुआत: सरसों, अगेती आलू व प्याज नर्सरी',
      en: 'Rabi Kickoff: Mustard Sowing, Early Potato, Tomato & Onion Seedbeds',
    },
    keyCropsFocus: {
      bn: 'আমন পাকা শুরু · সরিষা · আলু · টমেটো · পেঁয়াজ বীজতলা · মসুর',
      hi: 'अमन कटाई शुरू · सरसों · आलू · टमाटर · मसूर',
      en: 'Early Aman Harvest · Mustard · Potato · Tomato · Lentil',
    },
    actionItems: {
      bn: [
        'আমন কাটার ১৫ দিন আগে রিলে পদ্ধতিতে খেসারি বা জমিতে জো আসলে সরিষা (বারি-১৪/১৭) ও মসুর বপন করুন।',
        'পাকা আমন ধানে নেক ব্লাস্ট ও ইঁদুর দমনে নিয়মিত আইল পর্যবেক্ষণ করুন।',
        'পেঁয়াজ, টমেটো ও মরিচের রবি বীজতলায় পরিমিত জৈব সার ও ড্যাম্পিং-অফ সুরক্ষা দিন।',
      ],
      hi: [
        'नमी रहते ही सरसों, मसूर और अगेती आलू की बुवाई शुरू करें।',
        'पकती अमन फसल में चूहा व गर्दन तोड़ (ब्लास्ट) रोग की जांच करें।',
        'प्याज व टमाटर की रबी नर्सरी में जलभराव न होने दें।',
      ],
      en: [
        'Sow relay Khesari/Lentil or quick-maturing Mustard (BARI-14/17) as monsoon soil drains.',
        'Monitor ripening Aman fields for neck blast and rodent damage.',
        'Raise Onion and Winter Tomato seedbeds with Trichoderma-enriched compost.',
      ],
    },
  },
  {
    month: 11,
    banglaSeason: { bn: 'কার্তিক–অগ্রহায়ণ (নবান্ন)', hi: 'कार्तिक-अगहन (नवान्न)', en: 'Kartik–Agrahayan (Prime Rabi)' },
    headline: {
      bn: 'অগ্রহায়ণ নবান্ন: আমন ধান কাটা, বোরো বীজতলা শুরু ও মূল আলু-গম-সরিষা-পেঁয়াজ বপন',
      hi: 'अमन धान कटाई, बोरो नर्सरी व आलू-गेहूं-सरसों की मुख्य बुवाई',
      en: 'Aman Harvest Season, Boro Nursery Prep & Peak Potato/Wheat/Mustard Sowing',
    },
    keyCropsFocus: {
      bn: 'আমন কাটা · বোরো বীজতলা · আলু · গম (১৫–৩০ নভে.) · সরিষা · টমেটো · রসুন',
      hi: 'अमन कटाई · बोरो नर्सरी · आलू · गेहूं (15-30 नव.) · सरसों · लहसुन',
      en: 'Aman Harvest · Boro Seedbed · Potato · Wheat · Mustard · Garlic · Tomato',
    },
    actionItems: {
      bn: [
        '১৫–৩০ নভেম্বরের মধ্যে বারি গম-৩৩/৩৫ এবং সব মূল জমির ডায়মন্ড আলু ও রসুন রোপণ শেষ করুন।',
        'বোরো ধানের বীজ ২৪ ঘণ্টা ভিজিয়ে জাগ দিয়ে অঙ্কুরিত বীজ পরিষ্কার কাদা বীজতলায় ফেলুন।',
        '৮০% শীষ সোনালি হলে আমন ধান কেটে নবান্নের ফসল নিরাপদে রোদে শুকান।',
      ],
      hi: [
        '15-30 नवंबर के भीतर गेहूं, मुख्य आलू और लहसुन की बुवाई पूरी करें।',
        'बोरो धान के बीज 24 घंटे भिगोकर अंकुरित करने के बाद साफ नर्सरी में डालें।',
        '80% बालियां सुनहरी होने पर अमन धान की कटाई कर साफ धूप में सुखाएं।',
      ],
      en: [
        'Finish sowing blast-resistant Wheat (BARI Gom-33/35), Potato tubers & Garlic before Nov 30.',
        'Soak Boro rice seed for 24h, sprout for 48–72h, and sow thinly on puddled seedbeds.',
        'Harvest T. Aman once 80% of panicles turn golden straw and sun-dry below 12% moisture.',
      ],
    },
  },
  {
    month: 12,
    banglaSeason: { bn: 'অগ্রহায়ণ–পৌষ (শীত)', hi: 'अगहन-पौष (सर्दी)', en: 'Agrahayan–Poush (Winter)' },
    headline: {
      bn: 'বোরো বীজতলায় শৈত্য সুরক্ষা, পেঁয়াজ চারা রোপণ ও আলুতে মাটি তোলা',
      hi: 'बोरो नर्सरी की ठंड से रक्षा, प्याज रोपाई व आलू में मिट्टी चढ़ाना',
      en: 'Boro Seedbed Cold Cover, Onion Transplanting & Potato Earthing-Up',
    },
    keyCropsFocus: {
      bn: 'বোরো বীজতলা · পেঁয়াজ চারা · আলু মাটি তোলা · গম প্রথম সেচ · টমেটো খুঁটি',
      hi: 'बोरो नर्सरी · प्याज रोपाई · आलू मिट्टी चढ़ाई · गेहूं सीआरआई सिंचाई',
      en: 'Boro Seedbed · Onion · Potato Earthing-Up · Wheat CRI · Tomato Staking',
    },
    actionItems: {
      bn: [
        'আলু রোপণের ২৫–৩০ দিন পর গোড়ায় মাটি তুলে দিন এবং বাকি অর্ধেক ইউরিয়া সার প্রয়োগ করুন।',
        'নভেম্বরে বপন করা গমে ১৭–২১ দিনে প্রথম সেচ ও পেঁয়াজের ৪০–৪৫ দিনের চারা রোপণ করুন।',
        'রাতে বোরো বীজতলা পলিথিনে ঢেকে রাখুন এবং সকালে ঠান্ডা পানি বের করে তাজা পানি দিন।',
      ],
      hi: [
        'आलू बुवाई के 25-30 दिन पर मिट्टी चढ़ाकर बची हुई यूरिया डालें।',
        'नवंबर में बोए गेहूं में 17-21 दिन पर पहली सिंचाई व प्याज के 40-45 दिन के पौधे रोपें।',
        'रात में बोरो नर्सरी को पॉलिथीन से ढकें और सुबह पुराना ठंडा पानी बदल दें।',
      ],
      en: [
        'Earth up November-planted potato ridges at 25–30 days with the remaining urea split.',
        'Irrigate wheat at 17–21d CRI stage and transplant 40–45 day Onion seedlings cleanly.',
        'Shield Boro nurseries overnight with clear polythene if night lows drop near 10–12°C.',
      ],
    },
  },
];

export function getMonthlyAgroBrief(monthOneBased: number): MonthlyAgroAdvisory {
  const safeMonth = ((Math.round(monthOneBased) - 1 + 12) % 12) + 1;
  return MONTHLY_AGRO_BRIEFS.find((m) => m.month === safeMonth) ?? MONTHLY_AGRO_BRIEFS[0];
}

export const IRRIGATION_CRITICAL_STAGES: IrrigationCriticalStage[] = [
  {
    id: 'irr-wheat',
    crop: { bn: 'গম', hi: 'गेहूं', en: 'Wheat' },
    stages: {
      bn: '১. ১৭–২১ দিন (সিআরআই/তিন পাতা) · ২. ৫০–৫৫ দিন (শীষ থোড়) · ৩. ৭৫–৮০ দিন (দানা গঠন)',
      hi: '1. 17-21 दिन (सीआरआई) · 2. 50-55 दिन (बाली) · 3. 75-80 दिन (दाना भरना)',
      en: '1. 17–21d (CRI) · 2. 50–55d (Booting/Heading) · 3. 75–80d (Milk Stage)',
    },
    note: {
      bn: '১৭–২১ দিনের প্রথম সেচ বাদ পড়লে কুঁশি ও ফলন ৩০% পর্যন্ত কমে যেতে পারে।',
      hi: '17-21 दिन की पहली सिंचाई चूकने पर उपज में 30% तक गिरावट आ सकती है।',
      en: 'Missing the 17–21d Crown Root Initiation irrigation can reduce grain yield by up to 30%.',
    },
  },
  {
    id: 'irr-boro',
    crop: { bn: 'বোরো ধান (AWD সেচ)', hi: 'बोरो धान (AWD विधि)', en: 'Boro Rice (AWD Saving)' },
    stages: {
      bn: 'কাইচথোড় থেকে ফুল ফোটা (রোপণের ৪৫–৭৫ দিন) — জমিতে অবশ্যই ২–৩ ইঞ্চি পানি রাখুন',
      hi: 'गभोट से फूल आने तक (45-75 दिन) — खेत में 2-3 इंच पानी जरूर रखें',
      en: 'Panicle Initiation to Flowering (45–75 DAT) — Keep continuous 2–3 in water',
    },
    note: {
      bn: 'প্রাথমিক কুঁশি পর্যায়ে AWD পাইপ পদ্ধতিতে সেচ দিলে ২৫% পানি ও ডিজেল খরচ বাঁচে।',
      hi: 'शुरुआती कल्ले अवस्था में AWD पाइप सिंचाई से 25% पानी व लागत बचती है।',
      en: 'Alternate Wetting & Drying (AWD) during early tillering saves ~25% water & fuel.',
    },
  },
  {
    id: 'irr-potato',
    crop: { bn: 'আলু', hi: 'आलू', en: 'Potato' },
    stages: {
      bn: '১. ২৫–৩০ দিন (স্টোলন গজানো) · ২. ৪৫–৫০ দিন (টিউবার বড় হওয়া) · ৩. ৬০–৬৫ দিন (দানাপুষ্ট)',
      hi: '1. 25-30 दिन (कंद शुरुआत) · 2. 45-50 दिन (कंद विकास) · 3. 60-65 दिन',
      en: '1. 25–30d (Stolonizing) · 2. 45–50d (Tuber Bulking) · 3. 60–65d (Maturation)',
    },
    note: {
      bn: 'কখনো ভেলা ভাসিয়ে সেচ দেবেন না—নালার ২/৩ অংশ পর্যন্ত হালকা সেচ দিন এবং তোলার ১০ দিন আগে সেচ বন্ধ করুন।',
      hi: 'मेड़ों की केवल 2/3 ऊंचाई तक हल्की सिंचाई करें व खुदाई से 10 दिन पहले सिंचाई रोकें।',
      en: 'Fill furrows only 2/3 deep; never submerge ridges, and stop watering 10 days pre-harvest.',
    },
  },
  {
    id: 'irr-mustard',
    crop: { bn: 'সরিষা', hi: 'सरसों', en: 'Mustard' },
    stages: {
      bn: '১. ২৫–৩০ দিন (ফুল আসার আগে) · ২. ৫০–৫৫ দিন (শুঁটি বা দানা গঠন)',
      hi: '1. 25-30 दिन (फूल से पहले) · 2. 50-55 दिन (फली भरते समय)',
      en: '1. 25–30d (Pre-Flowering) · 2. 50–55d (Pod Filling)',
    },
    note: {
      bn: 'জলাবদ্ধতায় সরিষা শিকড় পচে—হালকা সেচ দিয়ে বাড়তি পানি দ্রুত বের করে দিন।',
      hi: 'जलभराव से जड़ें सड़ती हैं; हल्की सिंचाई के बाद अतिरिक्त पानी तुरंत निकालें।',
      en: 'Mustard tolerates zero waterlogging—give light irrigation and drain excess immediately.',
    },
  },
];

export const SOIL_AND_SPRAY_RULES: SoilAndSprayRule[] = [
  {
    id: 'rule-spray-mix',
    title: {
      bn: 'রাসায়নিক মিশ্রণ সতর্কতা (জার টেস্ট)',
      hi: 'दवा व खाद मिलाने का नियम',
      en: 'Tank-Mix Compatibility & Ph Warning',
    },
    detail: {
      bn: 'ক্ষারীয় বোর্দো মিক্সচার/চুন/সালফার জাতীয় ওষুধের সাথে ইউরিয়া বা অর্গানোফসফেট কীটনাশক কখনো একত্রে মেশাবেন না।',
      hi: 'चूना, सल्फर या बोर्डो मिश्रण के साथ यूरिया या कीटनाशक कभी न मिलाएं।',
      en: 'Never mix alkaline Bordeaux/lime/sulphur sprays with Urea or organophosphate insecticides.',
    },
  },
  {
    id: 'rule-soil-ph',
    title: {
      bn: 'অম্লীয় মাটি (pH < ৫.৫) সংশোধন',
      hi: 'अम्लीय मिट्टी (pH < 5.5) सुधार',
      en: 'Acidic Soil pH Correction (Dolomite)',
    },
    detail: {
      bn: 'বরেন্দ্র, লালমাটি ও সিলেট/উত্তরের অম্লীয় জমিতে বপনের ১৫ দিন আগে বিঘাপ্রতি ১৩০ কেজি ডলোমাইট চুন মিশিয়ে নিলে ফসফরাস ও বোরনের কার্যকারিতা দ্বিগুণ হয়।',
      hi: 'अम्लीय मिट्टी में बुवाई से 15 दिन पहले डोलोमाइट चूना मिलाने से फास्फोरस व बोरॉन का असर दोगुना होता है।',
      en: 'Incorporating ~130 kg Dolomite lime per 33-dec Bigha 15 days pre-sowing boosts P & B uptake.',
    },
  },
  {
    id: 'rule-urea-saving',
    title: {
      bn: 'এলসিসি (LCC) বা সবুজ পাতা চার্ট ব্যবহার',
      hi: 'पत्ती रंग चार्ट (LCC) से यूरिया बचत',
      en: 'Leaf Color Chart (LCC) Urea Discipline',
    },
    detail: {
      bn: 'ধানের পাতা গাঢ় সবুজ থাকলে অতিরিক্ত ইউরিয়া না দিয়ে পটাশ ভারসাম্য রাখলে ব্লাস্ট ও গাছফড়িং আক্রমণ ৪০% পর্যন্ত কমে।',
      hi: 'पत्ते गहरे हरे होने पर अतिरिक्त यूरिया रोक दें; इससे रोग व कीट 40% तक कम होते हैं।',
      en: 'Skip top-dress urea when leaves are already dark green; cuts blast & BPH pest risk by up to 40%.',
    },
  },
  {
    id: 'rule-phi',
    title: {
      bn: 'ফসল তোলার নিরাপদ অপেক্ষমাণ কাল (PHI)',
      hi: 'दवा छिड़काव के बाद तुड़ाई अंतराल (PHI)',
      en: 'Pre-Harvest Safety Interval (PHI)',
    },
    detail: {
      bn: 'সবজি বা ফলে রাসায়নিক স্প্রের পর ওষুধ ভেদে অন্তত ৭–১৪ দিন অপেক্ষা করে তবেই ফসল তুলুন ও বাজারে বিক্রি করুন।',
      hi: 'सब्जियों व फलों में रासायनिक छिड़काव के 7-14 दिन बाद ही तुड़ाई करें।',
      en: 'Always observe 7–14 day Pre-Harvest Interval after synthetic sprays before picking food crops.',
    },
  },
];

export const FARMER_HELPLINES: FarmerHelplineItem[] = [
  {
    id: 'help-krishi-bd',
    number: '16123',
    title: {
      bn: 'কৃষি কল সেন্টার (কৃষি ও মৎস্য-প্রাণিসম্পদ)',
      hi: 'कृषि कॉल सेंटर (बांग्लादेश कृषि सेवा)',
      en: 'Krishi Call Center (AIS / DAE)',
    },
    hours: {
      bn: 'সকাল ৯:০০ – বিকেল ৫:০০ (রবি–বৃহঃ)',
      hi: 'सुबह 9:00 – शाम 5:00 बजे',
      en: '9:00 AM – 5:00 PM (Sun–Thu)',
    },
    regionNote: {
      bn: 'বাংলাদেশ · সরাসরি কৃষিবিদ পরামর্শ',
      hi: 'बांग्लादेश · सीधा कृषि विशेषज्ञ परामर्श',
      en: 'Bangladesh · Direct Agronomist Desk',
    },
  },
  {
    id: 'help-weather-bd',
    number: '1090',
    title: {
      bn: 'আবহাওয়া ও দুর্যোগ পূর্বাভাস বার্তা (বিনা খরচায়)',
      hi: 'मौसम व आपदा चेतावनी हेल्पलाइन (निःशुल्क)',
      en: 'Toll-Free Weather & Disaster IVR',
    },
    hours: {
      bn: '২৪ ঘণ্টা স্বয়ংক্রিয় বার্তা',
      hi: '24 घंटे उपलब्ध',
      en: '24/7 Automated Forecast',
    },
    regionNote: {
      bn: 'বাংলাদেশ দুর্যোগ ব্যবস্থাপনা ও আবহাওয়া',
      hi: 'बांग्लादेश मौसम व आपदा प्रबंधन',
      en: 'Bangladesh BMD / DDM',
    },
  },
  {
    id: 'help-kisan-in',
    number: '1800-180-1551',
    title: {
      bn: 'কিসান কল সেন্টার (পশ্চিমবঙ্গ ও ভারত — টোল ফ্রি)',
      hi: 'किसान कॉल सेंटर (भारत / पश्चिम बंगाल — टोल फ्री)',
      en: 'Kisan Call Center (West Bengal / India Toll-Free)',
    },
    hours: {
      bn: 'সকাল ৬:০০ – রাত ১০:০০ (সপ্তাহে ৭ দিন)',
      hi: 'सुबह 6:00 – रात 10:00 (सभी 7 दिन)',
      en: '6:00 AM – 10:00 PM Daily',
    },
    regionNote: {
      bn: 'পশ্চিমবঙ্গ / ভারত · বাংলা ও হিন্দিতে সহায়তা',
      hi: 'पश्चिम बंगाल / भारत · बंगाली व हिंदी सहायता',
      en: 'India · Bengali, Hindi & English Support',
    },
  },
];

export function formatMinutesRemaining(ms: number, lang: AppLanguage): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  if (totalSec <= 60) {
    return lang === 'bn'
      ? `${totalSec} সেকেন্ড`
      : lang === 'hi'
      ? `${totalSec} सेकंड`
      : `${totalSec}s`;
  }
  const mins = Math.ceil(totalSec / 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const remM = mins % 60;
    if (lang === 'bn') return remM > 0 ? `${h} ঘণ্টা ${remM} মি.` : `${h} ঘণ্টা`;
    if (lang === 'hi') return remM > 0 ? `${h} घंटे ${remM} मि.` : `${h} घंटे`;
    return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
  }
  return lang === 'bn' ? `${mins} মিনিট` : lang === 'hi' ? `${mins} मिनट` : `${mins} min`;
}
